import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import type { OAuth2Namespace } from "@fastify/oauth2";
import fp from "fastify-plugin";
import {
  register,
  login,
  rotateRefreshToken,
  logout,
  googleOAuthUpsert,
} from "./auth.service";
import { RegisterSchema, LoginSchema } from "./auth.schema";
import { authMiddleware } from "./auth.middleware";
import { db } from "../../db/index";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";

// Augment FastifyInstance with the registered OAuth2 namespace
declare module "fastify" {
  interface FastifyInstance {
    googleOAuth2: OAuth2Namespace;
  }
}

const COOKIE_NAME = "refreshToken";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
};

async function authRoutes(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
): Promise<void> {
  // -------------------------------------------------------------------------
  // POST /auth/register
  // -------------------------------------------------------------------------
  fastify.post(
    "/auth/register",
    {
      config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
    },
    async (request, reply) => {
      const result = RegisterSchema.safeParse(request.body);
      if (!result.success) {
        return reply.code(400).send({
          error: "Validation error",
          code: "VALIDATION_ERROR",
          statusCode: 400,
          details: result.error.flatten().fieldErrors,
        });
      }

      try {
        const { accessToken, refreshToken, user } = await register(
          fastify,
          result.data,
        );
        reply.setCookie(COOKIE_NAME, refreshToken, COOKIE_OPTIONS);
        return reply.code(201).send({
          accessToken,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            plan: user.plan,
            onboardingCompleted: user.onboardingCompleted,
            avatarUrl: null,
          },
        });
      } catch (err: unknown) {
        const e = err as {
          code?: string;
          statusCode?: number;
          message?: string;
        };
        return reply.code(e.statusCode ?? 500).send({
          error: e.message ?? "Internal server error",
          code: e.code ?? "INTERNAL_ERROR",
          statusCode: e.statusCode ?? 500,
        });
      }
    },
  );

  // -------------------------------------------------------------------------
  // POST /auth/login
  // -------------------------------------------------------------------------
  fastify.post(
    "/auth/login",
    {
      config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
    },
    async (request, reply) => {
      const result = LoginSchema.safeParse(request.body);
      if (!result.success) {
        return reply.code(400).send({
          error: "Validation error",
          code: "VALIDATION_ERROR",
          statusCode: 400,
          details: result.error.flatten().fieldErrors,
        });
      }

      try {
        const { accessToken, refreshToken, user } = await login(
          fastify,
          result.data,
        );
        reply.setCookie(COOKIE_NAME, refreshToken, COOKIE_OPTIONS);
        return reply.send({
          accessToken,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            plan: user.plan,
            onboardingCompleted: user.onboardingCompleted,
            avatarUrl: null,
          },
        });
      } catch (err: unknown) {
        const e = err as {
          code?: string;
          statusCode?: number;
          message?: string;
        };
        return reply.code(e.statusCode ?? 500).send({
          error: e.message ?? "Internal server error",
          code: e.code ?? "INTERNAL_ERROR",
          statusCode: e.statusCode ?? 500,
        });
      }
    },
  );

  // -------------------------------------------------------------------------
  // POST /auth/logout
  // -------------------------------------------------------------------------
  fastify.post(
    "/auth/logout",
    { preHandler: authMiddleware },
    async (request, reply) => {
      const token = request.cookies[COOKIE_NAME];
      if (token) {
        await logout(request.user.id, token);
      }
      reply.clearCookie(COOKIE_NAME, { path: "/" });
      return reply.send({ ok: true });
    },
  );

  // -------------------------------------------------------------------------
  // POST /auth/refresh
  // -------------------------------------------------------------------------
  fastify.post("/auth/refresh", async (request, reply) => {
    const token = request.cookies[COOKIE_NAME];
    if (!token) {
      return reply.code(401).send({
        error: "No refresh token",
        code: "MISSING_TOKEN",
        statusCode: 401,
      });
    }

    try {
      const { accessToken, refreshToken: newRefresh } =
        await rotateRefreshToken(fastify, token);
      reply.setCookie(COOKIE_NAME, newRefresh, COOKIE_OPTIONS);
      return reply.send({ accessToken });
    } catch (err: unknown) {
      const e = err as { code?: string; statusCode?: number; message?: string };
      reply.clearCookie(COOKIE_NAME, { path: "/" });
      return reply.code(e.statusCode ?? 401).send({
        error: e.message ?? "Unauthorized",
        code: e.code ?? "UNAUTHORIZED",
        statusCode: e.statusCode ?? 401,
      });
    }
  });

  // -------------------------------------------------------------------------
  // GET /auth/me
  // -------------------------------------------------------------------------
  fastify.get(
    "/auth/me",
    { preHandler: authMiddleware },
    async (request, reply) => {
      const [user] = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          plan: users.plan,
          onboardingCompleted: users.onboardingCompleted,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, request.user.id))
        .limit(1);

      if (!user) {
        return reply.code(404).send({
          error: "User not found",
          code: "USER_NOT_FOUND",
          statusCode: 404,
        });
      }

      return reply.send({ user: { ...user, avatarUrl: null } });
    },
  );

  // -------------------------------------------------------------------------
  // GET /auth/google  — redirect to Google
  // Note: @fastify/oauth2 auto-registers startRedirectPath (/auth/google)
  // but we add our own handler here for custom state/scope control.
  // -------------------------------------------------------------------------
  fastify.get("/auth/google", async (request, reply) => {
    const uri = await fastify.googleOAuth2.generateAuthorizationUri(
      request,
      reply,
    );
    return reply.redirect(uri);
  });

  // -------------------------------------------------------------------------
  // GET /auth/google/callback
  // -------------------------------------------------------------------------
  fastify.get("/auth/google/callback", async (request, reply) => {
    try {
      const tokenResponse =
        await fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(
          request,
        );
      const accessToken = tokenResponse.token.access_token as string;

      // Fetch Google profile
      const profileRes = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      const profile = (await profileRes.json()) as {
        id: string;
        email: string;
        name: string;
        picture?: string;
      };

      const {
        accessToken: jwtAccess,
        refreshToken,
        user,
        isNew,
      } = await googleOAuthUpsert(fastify, {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        picture: profile.picture,
      });

      reply.setCookie(COOKIE_NAME, refreshToken, COOKIE_OPTIONS);

      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      const locale = "pt-BR";
      const redirect =
        isNew || !user.onboardingCompleted
          ? `${appUrl}/${locale}/onboarding`
          : user.role === "student"
            ? `${appUrl}/${locale}`
            : `${appUrl}/${locale}/admin`;

      return reply.redirect(`${redirect}?access_token=${jwtAccess}`);
    } catch (err) {
      fastify.log.error(err);
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      return reply.redirect(`${appUrl}/pt-BR/login?error=oauth_failed`);
    }
  });
}

export default fp(authRoutes, { name: "auth-routes" });

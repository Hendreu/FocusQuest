import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import cookie from "@fastify/cookie";
import rateLimit from "@fastify/rate-limit";
import oauth2 from "@fastify/oauth2";
import { authRoutes } from "./modules/auth/index";
import { gamificationRoutes } from "./modules/gamification/gamification.routes";
import { feedRoutes } from "./modules/gamification/feed.routes";
import { contentRoutes } from "./modules/content/content.routes";
import { avatarRoutes } from "./modules/avatar/avatar.routes";
import { institutionRoutes } from "./modules/institutions/institution.routes";
import { usersRoutes } from "./modules/users/users.routes";
import { sandboxRoutes } from "./modules/sandbox/sandbox.routes";
import { spacedRepetitionRoutes } from "./modules/spaced-repetition/spaced-repetition.routes";
import { billingRoutes } from "./modules/billing/billing.routes";
import { notificationsRoutes } from "./modules/notifications/notifications.routes";
import { runStreakReminder } from "./jobs/streakReminder";

// ---------------------------------------------------------------------------
// JWT type augmentation
// ---------------------------------------------------------------------------
declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { id: string; email: string; role: string; plan: string };
    user: { id: string; email: string; role: string; plan: string };
  }
}

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------
const server = Fastify({ logger: true });

// CORS
await server.register(cors, {
  origin: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  credentials: true,
});

// Cookie (must be before JWT so cookies are parsed)
await server.register(cookie, {
  secret:
    process.env.COOKIE_SECRET ??
    process.env.JWT_SECRET ??
    "fallback-cookie-secret-change-me",
});

// JWT
await server.register(jwt, {
  secret: {
    private: process.env.JWT_SECRET ?? "jwt-secret-change-in-production",
    public: process.env.JWT_SECRET ?? "jwt-secret-change-in-production",
  },
});

// Rate limiting (global; individual routes can override via config.rateLimit)
await server.register(rateLimit, {
  global: false, // only apply on routes that opt in
  max: 100,
  timeWindow: "1 minute",
});

// Google OAuth2
await server.register(oauth2, {
  name: "googleOAuth2",
  scope: ["openid", "email", "profile"],
  credentials: {
    client: {
      id: process.env.GOOGLE_CLIENT_ID ?? "",
      secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
    auth: (oauth2 as typeof oauth2 & { GOOGLE_CONFIGURATION: object })
      .GOOGLE_CONFIGURATION,
  },
  callbackUri:
    process.env.GOOGLE_CALLBACK_URL ??
    "http://localhost:3001/auth/google/callback",
});

// Auth routes
await server.register(authRoutes);

// Gamification routes
await server.register(gamificationRoutes);
await server.register(feedRoutes);

// Content routes
await server.register(contentRoutes);

// Avatar routes
await server.register(avatarRoutes);

// Institution routes
await server.register(institutionRoutes);

// Users routes
await server.register(usersRoutes);

// Sandbox routes
await server.register(sandboxRoutes);

// Spaced repetition routes
await server.register(spacedRepetitionRoutes);

// Billing routes
await server.register(billingRoutes);

// Notifications routes
await server.register(notificationsRoutes, { prefix: "/notifications" });

// Health check
server.get("/health", async () => {
  return { status: "ok" };
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
const port = Number(process.env.PORT ?? 3001);
const host = process.env.HOST ?? "0.0.0.0";

try {
  await server.listen({ port, host });
  console.log(`API running at http://localhost:${port}`);

  // Start cron jobs
  setInterval(runStreakReminder, 60 * 60 * 1000);
} catch (err) {
  server.log.error(err);
  process.exit(1);
}

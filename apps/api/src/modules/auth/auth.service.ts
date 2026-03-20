import bcrypt from 'bcryptjs'
import { eq, and } from 'drizzle-orm'
import { db } from '../../db/index'
import {
  users,
  refreshTokens,
  oauthAccounts,
  userPreferences,
  userCoins,
  streaks,
  avatars,
  userLevels,
} from '../../db/schema'
import type { RegisterInput, LoginInput } from './auth.schema'
import type { FastifyInstance } from 'fastify'

// ---------------------------------------------------------------------------
// Helper: generate token pair
// ---------------------------------------------------------------------------

export function generateTokens(
  fastify: FastifyInstance,
  payload: { id: string; email: string; role: string; plan: string },
) {
  const accessToken = fastify.jwt.sign(payload, {
    expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
  })
  // Refresh token carries extra `type` discriminator; cast to any to bypass strict overload check
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const refreshToken = (fastify.jwt.sign as any)(
    { id: payload.id, type: 'refresh' },
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d' },
  ) as string
  return { accessToken, refreshToken }
}

// ---------------------------------------------------------------------------
// register
// ---------------------------------------------------------------------------

export async function register(
  fastify: FastifyInstance,
  dto: RegisterInput,
): Promise<{ accessToken: string; refreshToken: string; user: typeof users.$inferSelect }> {
  // Check email uniqueness
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, dto.email))
    .limit(1)

  if (existing.length > 0) {
    throw Object.assign(new Error('Este e-mail já está em uso'), { code: 'EMAIL_TAKEN', statusCode: 400 })
  }

  const passwordHash = await bcrypt.hash(dto.password, 12)

  const [user] = await db
    .insert(users)
    .values({
      email: dto.email,
      name: dto.name,
      passwordHash,
    })
    .returning()

  if (!user) throw new Error('Failed to create user')

  // Create companion records
  await Promise.all([
    db.insert(userPreferences).values({ userId: user.id }),
    db.insert(userCoins).values({ userId: user.id }),
    db.insert(streaks).values({ userId: user.id }),
    db.insert(avatars).values({ userId: user.id, baseCharacter: 'default' }),
    db.insert(userLevels).values({ userId: user.id }),
  ])

  const { accessToken, refreshToken } = generateTokens(fastify, {
    id: user.id,
    email: user.email,
    role: user.role,
    plan: user.plan,
  })

  // Persist refresh token (30 days)
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  await db.insert(refreshTokens).values({
    userId: user.id,
    token: refreshToken,
    expiresAt,
  })

  return { accessToken, refreshToken, user }
}

// ---------------------------------------------------------------------------
// login
// ---------------------------------------------------------------------------

export async function login(
  fastify: FastifyInstance,
  dto: LoginInput,
): Promise<{ accessToken: string; refreshToken: string; user: typeof users.$inferSelect }> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, dto.email))
    .limit(1)

  if (!user || !user.passwordHash) {
    throw Object.assign(new Error('Credenciais inválidas'), { code: 'INVALID_CREDENTIALS', statusCode: 401 })
  }

  const valid = await bcrypt.compare(dto.password, user.passwordHash)
  if (!valid) {
    throw Object.assign(new Error('Credenciais inválidas'), { code: 'INVALID_CREDENTIALS', statusCode: 401 })
  }

  const { accessToken, refreshToken } = generateTokens(fastify, {
    id: user.id,
    email: user.email,
    role: user.role,
    plan: user.plan,
  })

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  await db.insert(refreshTokens).values({
    userId: user.id,
    token: refreshToken,
    expiresAt,
  })

  return { accessToken, refreshToken, user }
}

// ---------------------------------------------------------------------------
// refreshToken
// ---------------------------------------------------------------------------

export async function rotateRefreshToken(
  fastify: FastifyInstance,
  oldToken: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  // Verify the old token signature
  let payload: { id: string; type: string }
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload = (fastify.jwt.verify as any)(oldToken) as { id: string; type: string }
  } catch {
    throw Object.assign(new Error('Token inválido'), { code: 'INVALID_TOKEN', statusCode: 401 })
  }

  if (payload.type !== 'refresh') {
    throw Object.assign(new Error('Token inválido'), { code: 'INVALID_TOKEN', statusCode: 401 })
  }

  // Check token exists in DB and is not expired
  const [storedToken] = await db
    .select()
    .from(refreshTokens)
    .where(and(eq(refreshTokens.token, oldToken), eq(refreshTokens.userId, payload.id)))
    .limit(1)

  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw Object.assign(new Error('Token expirado ou inválido'), { code: 'TOKEN_EXPIRED', statusCode: 401 })
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, payload.id))
    .limit(1)

  if (!user) {
    throw Object.assign(new Error('Usuário não encontrado'), { code: 'USER_NOT_FOUND', statusCode: 401 })
  }

  // Rotate: delete old, issue new
  await db.delete(refreshTokens).where(eq(refreshTokens.id, storedToken.id))

  const { accessToken, refreshToken: newRefresh } = generateTokens(fastify, {
    id: user.id,
    email: user.email,
    role: user.role,
    plan: user.plan,
  })

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  await db.insert(refreshTokens).values({
    userId: user.id,
    token: newRefresh,
    expiresAt,
  })

  return { accessToken, refreshToken: newRefresh }
}

// ---------------------------------------------------------------------------
// logout
// ---------------------------------------------------------------------------

export async function logout(userId: string, token: string): Promise<void> {
  await db
    .delete(refreshTokens)
    .where(and(eq(refreshTokens.userId, userId), eq(refreshTokens.token, token)))
}

// ---------------------------------------------------------------------------
// Google OAuth upsert
// ---------------------------------------------------------------------------

interface GoogleProfile {
  id: string
  email: string
  name: string
  picture?: string
}

export async function googleOAuthUpsert(
  fastify: FastifyInstance,
  profile: GoogleProfile,
): Promise<{ accessToken: string; refreshToken: string; user: typeof users.$inferSelect; isNew: boolean }> {
  // Check for existing OAuth account
  const [existingOAuth] = await db
    .select({ userId: oauthAccounts.userId })
    .from(oauthAccounts)
    .where(
      and(
        eq(oauthAccounts.provider, 'google'),
        eq(oauthAccounts.providerAccountId, profile.id),
      ),
    )
    .limit(1)

  let user: typeof users.$inferSelect
  let isNew = false

  if (existingOAuth) {
    const [found] = await db
      .select()
      .from(users)
      .where(eq(users.id, existingOAuth.userId))
      .limit(1)
    if (!found) throw new Error('User not found')
    user = found
  } else {
    // Check if email already exists (link account)
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, profile.email))
      .limit(1)

    if (existingUser) {
      user = existingUser
    } else {
      // Create new user
      const [created] = await db
        .insert(users)
        .values({
          email: profile.email,
          name: profile.name,
          passwordHash: null,
        })
        .returning()

      if (!created) throw new Error('Failed to create user')
      user = created
      isNew = true

      // Companion records
      await Promise.all([
        db.insert(userPreferences).values({ userId: user.id }),
        db.insert(userCoins).values({ userId: user.id }),
        db.insert(streaks).values({ userId: user.id }),
        db.insert(avatars).values({ userId: user.id, baseCharacter: 'default' }),
        db.insert(userLevels).values({ userId: user.id }),
      ])
    }

    // Create OAuth account link
    await db.insert(oauthAccounts).values({
      userId: user.id,
      provider: 'google',
      providerAccountId: profile.id,
    })
  }

  const { accessToken, refreshToken } = generateTokens(fastify, {
    id: user.id,
    email: user.email,
    role: user.role,
    plan: user.plan,
  })

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  await db.insert(refreshTokens).values({
    userId: user.id,
    token: refreshToken,
    expiresAt,
  })

  return { accessToken, refreshToken, user, isNew }
}

import { FastifyInstance } from 'fastify'
import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'
import { RegisterInput, LoginInput } from '@flowzap/shared'

const SALT_ROUNDS = 12
const ACCESS_TOKEN_EXPIRY = '15m'
const REFRESH_TOKEN_EXPIRY = '7d'

export class AuthService {
  private prisma: PrismaClient
  private fastify: FastifyInstance

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify
    this.prisma = fastify.prisma
  }

  async register(input: RegisterInput) {
    const existing = await this.prisma.user.findUnique({
      where: { email: input.email },
    })

    if (existing) {
      throw { statusCode: 409, message: 'Email already in use' }
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS)

    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
      },
    })

    const tokens = await this.generateTokens(user.id, user.email)

    return { user, ...tokens }
  }

  async login(input: LoginInput) {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email },
    })

    if (!user) {
      throw { statusCode: 401, message: 'Invalid email or password' }
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash)
    if (!isValid) {
      throw { statusCode: 401, message: 'Invalid email or password' }
    }

    const tokens = await this.generateTokens(user.id, user.email)

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
      ...tokens,
    }
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.fastify.jwt.verify<{
        sub: string
        email: string
        type: string
      }>(refreshToken)

      if (payload.type !== 'refresh') {
        throw { statusCode: 401, message: 'Invalid token type' }
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, name: true, avatarUrl: true, createdAt: true },
      })

      if (!user) {
        throw { statusCode: 401, message: 'User not found' }
      }

      const tokens = await this.generateTokens(user.id, user.email)
      return { user, ...tokens }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'statusCode' in err) throw err
      throw { statusCode: 401, message: 'Invalid or expired refresh token' }
    }
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, avatarUrl: true, createdAt: true, updatedAt: true },
    })

    if (!user) {
      throw { statusCode: 404, message: 'User not found' }
    }

    return user
  }

  async updateProfile(userId: string, data: { name?: string; avatarUrl?: string | null }) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, name: true, avatarUrl: true, updatedAt: true },
    })
    return user
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw { statusCode: 404, message: 'User not found' }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isValid) throw { statusCode: 400, message: 'Current password is incorrect' }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS)
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } })

    return { message: 'Password changed successfully' }
  }

  private async generateTokens(userId: string, email: string) {
    const accessToken = this.fastify.jwt.sign(
      { sub: userId, email, type: 'access' },
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    )

    const refreshToken = this.fastify.jwt.sign(
      { sub: userId, email, type: 'refresh' },
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    )

    return { accessToken, refreshToken }
  }
}

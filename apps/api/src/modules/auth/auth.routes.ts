import { FastifyInstance } from 'fastify'
import { AuthService } from './auth.service'
import { registerSchema, loginSchema, refreshTokenSchema, changePasswordSchema, updateProfileSchema } from '@flowzap/shared'

export async function authRoutes(fastify: FastifyInstance) {
  const authService = new AuthService(fastify)

  fastify.post('/register', async (request, reply) => {
    const input = registerSchema.parse(request.body)
    try {
      const result = await authService.register(input)
      return reply.status(201).send(result)
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message?: string }
      return reply.status(e.statusCode ?? 500).send({ error: e.message ?? 'Internal server error' })
    }
  })

  fastify.post('/login', async (request, reply) => {
    const input = loginSchema.parse(request.body)
    try {
      const result = await authService.login(input)
      return reply.status(200).send(result)
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message?: string }
      return reply.status(e.statusCode ?? 500).send({ error: e.message ?? 'Internal server error' })
    }
  })

  fastify.post('/refresh', async (request, reply) => {
    const { refreshToken } = refreshTokenSchema.parse(request.body)
    try {
      const result = await authService.refresh(refreshToken)
      return reply.status(200).send(result)
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message?: string }
      return reply.status(e.statusCode ?? 500).send({ error: e.message ?? 'Internal server error' })
    }
  })

  fastify.post('/logout', async (_request, reply) => {
    return reply.status(200).send({ message: 'Logged out successfully' })
  })

  fastify.get('/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    try {
      const user = await authService.getMe(request.user.sub)
      return reply.status(200).send(user)
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message?: string }
      return reply.status(e.statusCode ?? 500).send({ error: e.message ?? 'Internal server error' })
    }
  })

  fastify.put('/profile', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const input = updateProfileSchema.parse(request.body)
    try {
      const user = await authService.updateProfile(request.user.sub, input)
      return reply.status(200).send(user)
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message?: string }
      return reply.status(e.statusCode ?? 500).send({ error: e.message ?? 'Internal server error' })
    }
  })

  fastify.put('/change-password', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const input = changePasswordSchema.parse(request.body)
    try {
      const result = await authService.changePassword(
        request.user.sub,
        input.currentPassword,
        input.newPassword
      )
      return reply.status(200).send(result)
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message?: string }
      return reply.status(e.statusCode ?? 500).send({ error: e.message ?? 'Internal server error' })
    }
  })
}

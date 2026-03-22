import { FastifyInstance } from 'fastify'
import { PrismaClient, Prisma } from '@prisma/client'
import { CreateContactInput, UpdateContactInput } from '@flowzap/shared'

export class ContactsService {
  private prisma: PrismaClient

  constructor(fastify: FastifyInstance) {
    this.prisma = fastify.prisma
  }

  async getContacts(
    userId: string,
    opts: { search?: string; tags?: string[]; optOut?: boolean; page?: number; limit?: number }
  ) {
    const page = opts.page ?? 1
    const limit = opts.limit ?? 20
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = { userId }

    if (opts.search) {
      where.OR = [
        { name: { contains: opts.search, mode: 'insensitive' } },
        { phone: { contains: opts.search } },
        { email: { contains: opts.search, mode: 'insensitive' } },
      ]
    }

    if (opts.tags && opts.tags.length > 0) {
      where.tags = { hasSome: opts.tags }
    }

    if (opts.optOut !== undefined) {
      where.optOut = opts.optOut
    }

    const [contacts, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.contact.count({ where }),
    ])

    return {
      contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  async getContact(userId: string, contactId: string) {
    const contact = await this.prisma.contact.findFirst({
      where: { id: contactId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        executions: {
          orderBy: { startedAt: 'desc' },
          take: 20,
          include: { flow: { select: { id: true, name: true } } },
        },
      },
    })

    if (!contact) throw { statusCode: 404, message: 'Contact not found' }
    return contact
  }

  async createContact(userId: string, input: CreateContactInput) {
    const existing = await this.prisma.contact.findUnique({
      where: { userId_phone: { userId, phone: input.phone } },
    })

    if (existing) throw { statusCode: 409, message: 'Contact with this phone already exists' }

    const contact = await this.prisma.contact.create({
      data: {
        userId,
        phone: input.phone,
        name: input.name ?? null,
        email: input.email ?? null,
        tags: input.tags ?? [],
        variables: (input.variables ?? {}) as Prisma.InputJsonValue,
      },
    })

    return contact
  }

  async updateContact(userId: string, contactId: string, input: UpdateContactInput) {
    const existing = await this.prisma.contact.findFirst({ where: { id: contactId, userId } })
    if (!existing) throw { statusCode: 404, message: 'Contact not found' }

    const updated = await this.prisma.contact.update({
      where: { id: contactId },
      data: {
        ...(input.name !== undefined && { name: input.name ?? null }),
        ...(input.email !== undefined && { email: input.email ?? null }),
        ...(input.tags !== undefined && { tags: input.tags }),
        ...(input.variables !== undefined && { variables: input.variables as Prisma.InputJsonValue }),
      },
    })

    return updated
  }

  async deleteContact(userId: string, contactId: string) {
    const existing = await this.prisma.contact.findFirst({ where: { id: contactId, userId } })
    if (!existing) throw { statusCode: 404, message: 'Contact not found' }

    await this.prisma.contact.delete({ where: { id: contactId } })
    return { message: 'Contact deleted successfully' }
  }

  async optOutContact(userId: string, contactId: string, optOut: boolean) {
    const existing = await this.prisma.contact.findFirst({ where: { id: contactId, userId } })
    if (!existing) throw { statusCode: 404, message: 'Contact not found' }

    const updated = await this.prisma.contact.update({
      where: { id: contactId },
      data: { optOut },
    })

    return updated
  }

  async bulkTagContacts(
    userId: string,
    contactIds: string[],
    tags: string[],
    action: 'add' | 'remove'
  ) {
    const contacts = await this.prisma.contact.findMany({
      where: { id: { in: contactIds }, userId },
    })

    const updates = contacts.map((contact) => {
      const currentTags = contact.tags as string[]
      const newTags = action === 'add'
        ? Array.from(new Set([...currentTags, ...tags]))
        : currentTags.filter((t) => !tags.includes(t))

      return this.prisma.contact.update({
        where: { id: contact.id },
        data: { tags: newTags },
      })
    })

    await Promise.all(updates)
    return { message: `Tags ${action === 'add' ? 'added to' : 'removed from'} ${contacts.length} contacts` }
  }

  async exportContacts(userId: string): Promise<string> {
    const contacts = await this.prisma.contact.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    const headers = ['phone', 'name', 'email', 'tags', 'optOut', 'createdAt']
    const rows = contacts.map((c) =>
      [
        c.phone,
        c.name ?? '',
        c.email ?? '',
        (c.tags as string[]).join('|'),
        c.optOut ? 'true' : 'false',
        c.createdAt.toISOString(),
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')
    )

    return [headers.join(','), ...rows].join('\n')
  }

  async importContacts(userId: string, csvData: string) {
    const lines = csvData.trim().split('\n')
    if (lines.length < 2) throw { statusCode: 400, message: 'CSV has no data rows' }

    const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, '').toLowerCase())
    const phoneIdx = headers.indexOf('phone')
    const nameIdx = headers.indexOf('name')
    const emailIdx = headers.indexOf('email')
    const tagsIdx = headers.indexOf('tags')

    if (phoneIdx === -1) throw { statusCode: 400, message: 'CSV must have a phone column' }

    let created = 0
    let skipped = 0

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim().replace(/^"|"$/g, ''))
      const phone = parts[phoneIdx]
      if (!phone) { skipped++; continue }

      const existing = await this.prisma.contact.findUnique({
        where: { userId_phone: { userId, phone } },
      })

      if (existing) { skipped++; continue }

      await this.prisma.contact.create({
        data: {
          userId,
          phone,
          name: nameIdx !== -1 ? parts[nameIdx] || null : null,
          email: emailIdx !== -1 ? parts[emailIdx] || null : null,
          tags: tagsIdx !== -1 && parts[tagsIdx] ? parts[tagsIdx].split('|') : [],
        },
      })
      created++
    }

    return { created, skipped, message: `Imported ${created} contacts, skipped ${skipped}` }
  }
}

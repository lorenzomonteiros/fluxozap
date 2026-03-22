# FlowZap — WhatsApp Automation SaaS

A premium WhatsApp automation platform built with modern full-stack TypeScript.

## Stack

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + React Flow + Zustand
- **Backend:** Fastify + TypeScript + Prisma + PostgreSQL + BullMQ + Redis + Socket.io
- **WhatsApp:** Baileys (multi-device)

## Quick Start

### 1. Prerequisites

- Node.js 20+
- Docker + Docker Compose
- npm 10+

### 2. Start Infrastructure

```bash
docker-compose up -d
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment

```bash
cp .env.example .env
# Edit .env with your values
```

### 5. Run Database Migrations

```bash
npm run db:generate
npm run db:migrate
```

### 6. Start Development Servers

```bash
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3000
- Prisma Studio: `npm run db:studio`

## Features

- **Multi-instance WhatsApp** — Connect multiple WhatsApp numbers
- **Visual Flow Builder** — Drag-and-drop automation builder
- **Real-time Updates** — Socket.io for live status changes
- **Contact Management** — Full CRM with tags, variables, import/export
- **Webhooks** — Send events to external systems
- **Message History** — Complete conversation log

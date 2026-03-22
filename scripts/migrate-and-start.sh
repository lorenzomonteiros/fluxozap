#!/bin/bash

echo "Generating Prisma Client..."
npm run db:generate

echo "Running database migrations..."
npm run db:migrate || true

echo "Starting the application..."
npm run start

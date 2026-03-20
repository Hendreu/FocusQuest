#!/usr/bin/env bash
set -e

echo "→ Subindo infraestrutura (postgres, redis, minio)..."
docker compose up -d postgres redis minio

echo "→ Aguardando PostgreSQL..."
for i in $(seq 1 20); do
  docker compose exec postgres pg_isready -U focusquest > /dev/null 2>&1 && break
  sleep 1
done

echo "✓ Infraestrutura pronta — iniciando dev..."
bun run dev

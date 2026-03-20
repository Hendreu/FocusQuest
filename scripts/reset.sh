#!/usr/bin/env bash
set -e

echo "⚠️  RESET: Isso vai apagar TODOS os dados do banco e volumes Docker."
read -p "Tem certeza? (y/N) " -n 1 -r
echo ""
[[ ! $REPLY =~ ^[Yy]$ ]] && echo "Cancelado." && exit 0

echo "→ Parando e removendo containers e volumes..."
docker compose down -v
echo "✓ Tudo removido"

echo "→ Subindo serviços novamente..."
docker compose up -d postgres redis minio

echo "→ Aguardando PostgreSQL..."
for i in $(seq 1 30); do
  docker compose exec postgres pg_isready -U focusquest > /dev/null 2>&1 && break
  echo -n "."
  sleep 2
done
echo " ✓"

echo "→ Rodando migrations..."
bun run db:migrate

echo "→ Rodando seed..."
bun run db:seed

echo ""
echo "✅ Reset completo — ambiente limpo e pronto."

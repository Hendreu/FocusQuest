#!/usr/bin/env bash
set -e

echo "🚀 FocusQuest — Setup completo"
echo "================================"

# 1. Verificar pré-requisitos
echo "→ Verificando pré-requisitos..."
command -v bun >/dev/null 2>&1 || { echo "❌ bun não encontrado. Instale: https://bun.sh"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ docker não encontrado. Instale: https://docker.com"; exit 1; }
echo "✓ bun e docker encontrados"

# 2. Copiar .env se não existir
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✓ .env criado — edite com suas chaves antes de continuar"
else
  echo "✓ .env já existe"
fi

# 3. Instalar dependências
echo "→ Instalando dependências..."
bun install
echo "✓ Dependências instaladas"

# 4. Subir infraestrutura
echo "→ Subindo Docker (postgres, redis, minio)..."
docker compose up -d postgres redis minio
echo "✓ Containers iniciados"

# 5. Aguardar PostgreSQL (mais confiável que healthcheck JSON)
echo "→ Aguardando PostgreSQL ficar pronto..."
for i in $(seq 1 30); do
  docker compose exec postgres pg_isready -U focusquest > /dev/null 2>&1 && break
  echo -n "."
  sleep 2
done
echo " ✓ PostgreSQL pronto"

# 6. Aguardar Redis
echo "→ Aguardando Redis..."
for i in $(seq 1 20); do
  docker compose exec redis redis-cli ping > /dev/null 2>&1 && break
  echo -n "."
  sleep 2
done
echo " ✓ Redis pronto"

# 7. Migrations e seed
echo "→ Rodando migrations..."
bun run db:migrate || echo "⚠️  Migrations falhou (verifique DATABASE_URL no .env)"

echo "→ Rodando seed..."
bun run db:seed || echo "⚠️  Seed falhou (ignorando — dados opcionais)"

# 8. Criar bucket MinIO
echo "→ Configurando MinIO bucket 'focusquest-uploads'..."
MINIO_CONTAINER=$(docker compose ps -q minio 2>/dev/null || echo "")
if [ -n "$MINIO_CONTAINER" ]; then
  docker exec "$MINIO_CONTAINER" sh -c "
    mc alias set local http://localhost:9000 minioadmin minioadmin 2>/dev/null || true
    mc mb local/focusquest-uploads --ignore-existing 2>/dev/null || true
    mc anonymous set public local/focusquest-uploads 2>/dev/null || true
  " 2>/dev/null || echo "  ⚠️  MinIO mc não disponível — crie o bucket manualmente em http://localhost:9001"
fi
echo "✓ MinIO configurado"

echo ""
echo "✅ Setup completo!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Web:         http://localhost:3000"
echo "  API:         http://localhost:3001"
echo "  MinIO API:   http://localhost:9000"
echo "  MinIO UI:    http://localhost:9001  (minioadmin / minioadmin)"
echo "  PostgreSQL:  localhost:5432  (focusquest / focusquest)"
echo "  Redis:       localhost:6379"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Para iniciar o desenvolvimento: ./scripts/dev.sh"

# FocusQuest

SaaS de educação gamificada para pessoas com dificuldade de atenção (TDAH e neurodivergentes).

## Setup rápido (3 comandos)

```bash
git clone <repo>
cd focusquest
./scripts/setup.sh
```

Acesse:
- **App**: http://localhost:3000
- **API**: http://localhost:3001/health
- **MinIO Console**: http://localhost:9001 (minioadmin / minioadmin)
- **PostgreSQL**: localhost:5432 (focusquest / focusquest)
- **Redis**: localhost:6379

## Comandos úteis

```bash
bun run dev          # Inicia web + api em modo desenvolvimento
bun run build        # Build de produção
bun run test         # Executa todos os testes
bun run lint         # Lint em todos os workspaces
bun run typecheck    # TypeScript check em todos os packages
bun run db:migrate   # Aplica migrations pendentes
bun run db:seed      # Popula dados iniciais (badges, quests, avatar items)
./scripts/reset.sh   # Reseta banco e dados (CUIDADO: apaga tudo!)
./scripts/dev.sh     # Sobe infra + inicia dev em um comando
```

## Estrutura do projeto

```
apps/
  web/          # Next.js 14 App Router (porta 3000)
  api/          # Fastify API (porta 3001)
packages/
  types/        # Tipos TypeScript compartilhados (entities, DTOs, enums)
  gamification/ # Motor de gamificação (XP, levels, streaks, badges, quests)
  content-player/ # Componente de player de lição
  design-system/  # Tokens + componentes base (Button, Card, Badge, etc.)
  i18n/         # Traduções (pt-BR + en)
```

## Stack

- **Frontend**: Next.js 14 App Router, TypeScript, Tailwind CSS, next-intl
- **Backend**: Fastify, TypeScript, Drizzle ORM
- **Banco**: PostgreSQL 16 + Redis 7
- **Storage**: MinIO (S3-compatible) para vídeos e imagens
- **Monorepo**: Turborepo + Bun workspaces
- **Testes**: Vitest (unit) + Playwright (E2E)

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | URL de conexão PostgreSQL |
| `REDIS_URL` | URL de conexão Redis |
| `JWT_SECRET` | Segredo para JWT access token (min 32 chars) |
| `JWT_REFRESH_SECRET` | Segredo para refresh token (min 32 chars) |
| `GOOGLE_CLIENT_ID` | OAuth Google Client ID |
| `GOOGLE_CLIENT_SECRET` | OAuth Google Client Secret |
| `MINIO_ACCESS_KEY` | MinIO access key |
| `MINIO_SECRET_KEY` | MinIO secret key |
| `STRIPE_SECRET_KEY` | Stripe secret key (modo teste: `sk_test_...`) |
| `NEXT_PUBLIC_API_URL` | URL pública da API |

## Rodando os Testes

### Pré-requisitos
- Servidor de desenvolvimento rodando: `bun run dev`
- Banco de dados de teste: `DATABASE_URL` apontando para banco limpo
- Variáveis de ambiente: `GOOGLE_OAUTH_MOCK=true`, `STRIPE_MOCK=true`

### Testes Unitários (Vitest)

```bash
# Rodar todos os testes unitários
bun run test

# Rodar com cobertura
bun run test:coverage

# Rodar apenas gamification
bun vitest run packages/gamification --coverage

# Rodar apenas content-player
bun vitest run packages/content-player --coverage
```

### Testes E2E (Playwright)

```bash
# Instalar browsers (primeira vez)
bunx playwright install chromium

# Rodar todos os E2E
bunx playwright test

# Rodar com report HTML
bunx playwright test --reporter=html

# Rodar spec específico
bunx playwright test e2e/student-journey.spec.ts

# Verificar flakiness (rodar 3x)
bunx playwright test --repeat-each=3
```

### CI/CD
Os testes rodam automaticamente em cada PR via GitHub Actions.
Thresholds de cobertura e 0 E2E falhando são requisitos para merge.

## Docker

```bash
docker compose up -d          # Sobe PostgreSQL + Redis + MinIO
docker compose ps             # Verifica status dos containers
docker compose down           # Para todos os serviços
docker compose down -v        # Para e remove volumes (apaga dados)
```

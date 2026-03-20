# Como rodar o FocusQuest

## Pré-requisitos

- [Bun](https://bun.sh) instalado (`bun --version` deve funcionar)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e **rodando**

---

## Primeira vez (setup completo)

Siga os passos **em ordem**. Cada um depende do anterior.

### 1. Instalar dependências

```bash
bun install
```

---

### 2. Criar o arquivo de variáveis de ambiente

```bash
cp .env.example .env
cp .env apps/api/.env
```

> O arquivo `.env` já vem com valores prontos para desenvolvimento local.
> Você só precisa preencher `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` se quiser usar login com Google.
> Stripe funciona sem configuração em modo de testes.

---

### 3. Subir o banco de dados, Redis e MinIO (Docker)

```bash
docker compose up -d
```

Aguarde uns 10–15 segundos para os containers ficarem prontos. Verifique com:

```bash
docker compose ps
```

Todos os serviços devem aparecer como `healthy` ou `running`.

---

### 4. Gerar as migrations do banco

```bash
bun run --cwd apps/api db:generate
```

> Isso lê o schema do Drizzle e cria os arquivos SQL de migration em `apps/api/drizzle/`.

---

### 5. Aplicar as migrations no banco

```bash
bun run db:migrate
```

> Isso cria todas as tabelas no PostgreSQL.

---

### 6. Popular dados iniciais (badges, quests, itens do avatar)

```bash
bun run db:seed
```

> Insere 10 badges, 5 quests e 25 itens de avatar no banco.

---

### 7. Iniciar o projeto

```bash
bun run dev
```

Acesse:

| Serviço | URL |
|---|---|
| **App (web)** | http://localhost:3000 |
| **API** | http://localhost:3001 |
| **MinIO (painel de arquivos)** | http://localhost:9001 — usuário: `minioadmin` / senha: `minioadmin` |
| **PostgreSQL** | `localhost:5432` — usuário: `focusquest` / senha: `focusquest` |
| **Redis** | `localhost:6379` |

---

## Da segunda vez em diante

Basta rodar:

```bash
docker compose up -d
bun run dev
```

---

## Parar tudo

```bash
# Para o servidor de desenvolvimento
Ctrl+C

# Para os containers Docker
docker compose down
```

Para **apagar todos os dados** e começar do zero:

```bash
docker compose down -v
```

---

## Solução de problemas comuns

### `DATABASE_URL environment variable is required`

Você esqueceu de copiar o `.env` para dentro de `apps/api/`:

```bash
cp .env apps/api/.env
```

### `Error: Your custom PostCSS configuration must export a plugins key`

O arquivo `apps/web/postcss.config.js` deve usar `module.exports`, não `export default`. Já foi corrigido — se acontecer, verifique se o arquivo está correto.

### `docker compose up` falha / containers não sobem

Certifique-se de que o **Docker Desktop está aberto e rodando** antes de executar o comando.

### Porta 3000 ou 3001 já em uso

Encerre o processo que está usando a porta:

```bash
# Windows (PowerShell)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### `db:generate` falha com erro de schema

Verifique se o `.env` foi copiado para `apps/api/.env` e se o Docker está rodando com o PostgreSQL acessível.

# Vercel Cron Setup

## O que foi alterado?

Migração de `node-cron` (não funciona em serverless) para **Vercel Cron Jobs**.

### Alterações:

1. **`vercel.json`** - Configuração do cron (executa a cada minuto)
2. **`src/app/api/cron/create-post/route.ts`** - Endpoint API que cria posts
3. **`src/payload.config.ts`** - node-cron agora só roda em desenvolvimento

## Setup na Vercel

### 1. Adicionar variável de ambiente

No dashboard da Vercel:

**Settings → Environment Variables**

```
CRON_SECRET=seu_token_secreto_aleatorio
```

**Gerar token seguro:**
```bash
openssl rand -base64 32
```

### 2. Deploy

```bash
git add .
git commit -m "feat: migrar para Vercel Cron Jobs"
git push
```

O cron será ativado automaticamente após o deploy.

### 3. Verificar execução

**Vercel Dashboard → Logs** - procurar por chamadas ao `/api/cron/create-post`

## Desenvolvimento Local

Em dev, o `node-cron` continua funcionando normalmente:

```bash
pnpm dev
```

## Configuração do Cron

Editar `vercel.json` para mudar a frequência:

```json
{
  "crons": [
    {
      "path": "/api/cron/create-post",
      "schedule": "0 */12 * * *"  // A cada 12 horas
    }
  ]
}
```

### Exemplos de schedules:

- `* * * * *` - A cada minuto
- `*/5 * * * *` - A cada 5 minutos
- `0 * * * *` - A cada hora
- `0 */12 * * *` - A cada 12 horas
- `0 0 * * *` - Diariamente à meia-noite
- `0 9 * * 1` - Toda segunda-feira às 9h

## Testar endpoint manualmente

```bash
curl -X GET https://teu-projeto.vercel.app/api/cron/create-post \
  -H "Authorization: Bearer seu_token_secreto"
```

## Limites Vercel

- **Hobby**: 2 cron jobs
- **Pro**: 100 cron jobs
- Frequência mínima: 1 minuto

## Segurança

O endpoint está protegido com `CRON_SECRET`. Sem o token correto, retorna `401 Unauthorized`.
# Deploy no Railway

Vue e Django usam o mesmo dom?nio na imagem web; o worker tem uma imagem pr?pria. A raiz de build ? a raiz do
reposit?rio, pois o Dockerfile precisa de `apps/app` e `apps/api`.

## Servi?os

Crie `web`, `worker`, PostgreSQL, Redis e um bucket privado S3 `flowwi-media`.
A partir da raiz do reposit?rio, com a CLI Railway autenticada:

```powershell
railway login
railway init --name flowwi
# Ou railway link para reutilizar projeto existente.
railway add --database postgres
railway add --database redis
railway bucket create flowwi-media --region iad
railway add --service web
railway add --service worker
```

Na configura??o dos dois servi?os, mantenha Root Directory na raiz `/`.
O servi?o web usa `/railway.toml`. No worker, selecione `/railway.worker.toml`
como Config File em Settings. Cada servi?o usa seu Dockerfile em `docker/web/` ou `docker/worker/`.

O web executa migrations em pre-deploy e inicia Daphne na porta `PORT` fornecida
pelo Railway. O worker inicia `rqworker default --with-scheduler`, sem servidor
HTTP, dom?nio p?blico ou healthcheck HTTP. Publique o web antes do worker no
primeiro deploy, para concluir as migrations.

## Vari?veis

Configure em ambos os servi?os, ajustando os nomes das refer?ncias se necess?rio:

```dotenv
DJANGO_DEBUG=False
DJANGO_SECRET_KEY=<mesma chave aleat?ria forte nos dois servi?os>
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
FRONTEND_URL=https://<dominio-publico-web>
DJANGO_ALLOWED_HOSTS=<dominio-publico-web>,healthcheck.railway.app
DJANGO_CSRF_TRUSTED_ORIGINS=https://<dominio-publico-web>
DJANGO_SECURE_SSL_REDIRECT=True
DJANGO_SESSION_COOKIE_SECURE=True
DJANGO_CSRF_COOKIE_SECURE=True
SYSTEM_STORAGE_PROVIDER=s3
AWS_ACCESS_KEY_ID=${{flowwi-media.ACCESS_KEY_ID}}
AWS_SECRET_ACCESS_KEY=${{flowwi-media.SECRET_ACCESS_KEY}}
AWS_STORAGE_BUCKET_NAME=${{flowwi-media.BUCKET}}
AWS_ENDPOINT_URL=${{flowwi-media.ENDPOINT}}
AWS_S3_REGION_NAME=${{flowwi-media.REGION}}
AWS_S3_ADDRESSING_STYLE=virtual
EMAIL_HOST=<SMTP de produ??o>
EMAIL_PORT=587
EMAIL_HOST_USER=<usuario>
EMAIL_HOST_PASSWORD=<senha>
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=<remetente verificado>
PAYMENT_HOST=<dominio-publico-web>
PAYMENT_USES_SSL=True
```

N?o copie o `.env` usado na valida??o local: ele cont?m configura??o HTTP local e
storage em filesystem. O Dockerfile n?o inclui arquivos `.env` na imagem. Use
vari?veis Railway. `VITE_API_URL` ? apenas para o Vite local e n?o ? necess?ria
no deploy. Sess?o e CSRF continuam via cookies no mesmo dom?nio.

O bucket ? compartilhado: web recebe uploads e worker grava previews/thumbnails.
Django-storages gera URLs assinadas para os objetos privados. N?o use filesystem
local em produ??o, pois web e worker t?m discos separados e ef?meros. Configure
CORS no bucket para a origem do web caso utilize fetch/canvas sobre as imagens.

Refer?ncias devem permanecer literais no PowerShell:

```powershell
railway variable set --service web --skip-deploys 'DATABASE_URL=${{Postgres.DATABASE_URL}}' 'REDIS_URL=${{Redis.REDIS_URL}}'
railway variable set --service worker --skip-deploys 'DATABASE_URL=${{Postgres.DATABASE_URL}}' 'REDIS_URL=${{Redis.REDIS_URL}}'
```

Configure tamb?m GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET e as chaves do gateway de
pagamento escolhido. Atualize callbacks OAuth para `/api/allauth/...` e webhooks
de pagamento para `/api/payments/...` no dom?nio p?blico do web.

## Publicar

Execute da raiz do reposit?rio para enviar frontend e backend:

```powershell
railway domain --service web
# Preencha FRONTEND_URL, DJANGO_ALLOWED_HOSTS, CSRF e PAYMENT_HOST com o dom?nio.
railway up . --path-as-root --service web --ci
railway up . --path-as-root --service worker --ci
railway service status --all
railway logs --service web --lines 100
railway logs --service worker --lines 100
```

Confirme `/api/health/` com status 200, a p?gina `/`, o painel Vue `/admin` e o
Django Admin `/api/admin/`. Valide login, upload e processamento de fotos.
O healthcheck verifica PostgreSQL e Redis. O backend de tarefas RQ ? selecionado
quando DEBUG=False. PostgreSQL e Redis usam rede privada, sem dom?nio p?blico.

Fontes: [Railway CLI](https://docs.railway.com/cli) e
[bucket S3 e refer?ncias](https://docs.railway.com/storage-buckets).

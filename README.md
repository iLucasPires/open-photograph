# OPEN-PHOTOGRAPH

Aplica??o de galerias de fotografia com Vue 3 e Django, publicada no Railway.

O `docker/web/Dockerfile` compila o frontend e o inclui na imagem Django. A aplica??o
serve frontend, API, autentica??o e WebSockets no mesmo dom?nio. WhiteNoise serve
os assets e o bucket S3 do Railway armazena uploads, previews e thumbnails.

## Deploy

Consulte o [guia Docker](docs/DOCKER.md) para build e execu??o local e o
[guia Railway](apps/api/docs/RAILWAY.md) para deploy.

- `railway.toml`: servi?o web, migrations e healthcheck.
- `railway.worker.toml`: worker RQ, com imagem pr?pria sem frontend.
- PostgreSQL, Redis e bucket privado S3 compartilhados entre os servi?os.

A raiz de build dos dois servi?os ? a raiz deste reposit?rio.

## Desenvolvimento

Backend em `apps/api` (`uv sync`, `uv run python manage.py runserver`) e frontend
em `apps/app` (`pnpm install`, `pnpm dev`). Para executar a imagem localmente,
consulte o [guia Docker](docs/DOCKER.md).
Configure os ambientes com `apps/api/.env.sample` e `VITE_API_URL` no frontend.

## Rotas

- `/admin`, `/setup`, `/g/...`: Vue.
- `/api/admin/`: Django Admin.
- `/api/browser/v1/...`: autentica??o headless.
- `/api/allauth/...` e `/api/payments/...`: callbacks OAuth e pagamentos.
- `/api/docs`, `/api/schema`, `/api/redoc`: documenta??o da API.
- `/api/health/`: PostgreSQL e Redis.
- `/api/static/`, `/api/media/`, `/api/ws/`: recursos Django.

Conven??es em [backend](apps/api/AGENTS.md) e [frontend](apps/app/AGENTS.md).

## Licen?a

[MIT](LICENSE)

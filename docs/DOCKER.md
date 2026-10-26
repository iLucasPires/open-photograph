# Docker

Execute os comandos a partir da raiz do reposit?rio, que ? o contexto de build.

## Arquivos

```text
docker/
  web/
    Dockerfile       # Build Vue + depend?ncias Python + runtime Django
    start.sh         # collectstatic e Daphne
  worker/
    Dockerfile       # Depend?ncias Python + runtime RQ, sem frontend
    start.sh         # rqworker com scheduler
```

Os Dockerfiles s?o independentes para permitir builds diretos no Railway, sem
publicar uma imagem base separadamente. Mantenha as vers?es Python/uv e as etapas
de instala??o do backend alinhadas entre ambos. Cada build usa os lockfiles e
executa como `flowwi` (UID/GID 10001). Node, pnpm e uv ficam nas etapas de build.

O `.dockerignore` da raiz limita o contexto aos fontes necess?rios e exclui `.env`,
ambientes virtuais e depend?ncias locais. Os caches de pnpm/uv ficam no BuildKit.

## Build

```sh
docker build -f docker/web/Dockerfile -t flowwi-web:local .
docker build -f docker/worker/Dockerfile -t flowwi-worker:local .
```

O web aceita `NODE_VERSION`, `PYTHON_VERSION`, `PNPM_VERSION` e `UV_VERSION` via
`--build-arg`. O worker aceita `PYTHON_VERSION` e `UV_VERSION`.

## Execu??o

Crie `apps/api/.env` a partir de `apps/api/.env.sample`. Configure PostgreSQL e
Redis com endere?os acess?veis pelos containers: `localhost` se refere ao pr?prio
container. Web e worker devem usar o mesmo banco, Redis e storage.

Aplique migrations antes de iniciar uma nova vers?o:

```sh
docker run --rm --env-file apps/api/.env flowwi-web:local python manage.py migrate --noinput
```

Inicie cada servi?o em um terminal:

```sh
docker run --rm --env-file apps/api/.env -p 8000:8000 flowwi-web:local
docker run --rm --env-file apps/api/.env flowwi-worker:local
```

O web coleta est?ticos e inicia Daphne na porta `${PORT:-8000}`. O worker inicia
`rqworker default --with-scheduler`. Ambos encaminham sinais ao processo principal
com `exec`. As migrations s?o uma etapa expl?cita, separada da inicializa??o.

Para storage local persistente, compartilhe um volume em `/app/media` grav?vel pelo
UID 10001. Em produ??o no Railway, use o bucket S3 compartilhado.

## Railway

- `railway.toml`: usa `docker/web/Dockerfile`, com migrations e healthcheck.
- `railway.worker.toml`: usa `docker/worker/Dockerfile`, sem servidor HTTP.

Os comandos de inicializa??o v?m do `CMD` de cada Dockerfile. A raiz de build dos
dois servi?os continua sendo `/`. Credenciais s?o fornecidas em runtime.

Consulte o [guia de deploy](../apps/api/docs/RAILWAY.md).

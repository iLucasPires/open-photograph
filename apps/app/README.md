# FlowWi frontend

Vue 3 + Vite. Em produ??o, o build ? inclu?do na imagem Django e servido no mesmo
dom?nio pelo Railway. Configura??o: [guia Railway](../api/docs/RAILWAY.md).

```sh
pnpm install
pnpm dev
pnpm build
pnpm test:unit
```

`VITE_API_URL` no `.env` ? usado apenas pelo proxy `/api` do Vite em desenvolvimento,
incluindo WebSockets. Em produ??o, as chamadas s?o relativas ao mesmo dom?nio;
n?o ? necess?rio configurar essa vari?vel no Railway.

Conven??es: [AGENTS.md](AGENTS.md).

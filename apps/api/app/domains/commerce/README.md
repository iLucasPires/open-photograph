# Compra de fotos

1. Configure Stripe ou Mercado Pago em `/admin/settings/payment`. As chaves sao armazenadas criptografadas com uma chave derivada de `SECRET_KEY`; preserve essa chave nos deploys.
2. Publique a galeria, habilite vendas e defina preco de pacote e/ou precos individuais.
3. O comprador entra/cria conta, confirma a selecao e abre o checkout hospedado pelo gateway.
4. `/api/commerce/orders/{id}/refresh/` verifica referencia, valor, moeda e status diretamente no gateway. A tela `/g/:slug/purchases` consulta pedidos pendentes a cada 30 segundos. Nao ha aprovacao automatica por parametro de retorno.
5. Apos pagamento, `/api/commerce/orders/{id}/download/{photo_id}/` confere proprietario, pagamento e a foto incluida no pedido; retorna o JPEG original do Drive conectado do fotografo, sem recompressao e sem URL publica de origem.

Use credenciais de teste dos gateways para validar sem cobranca real. Mercado Pago requer URLs HTTPS publicas para retorno automatico; em localhost o usuario pode voltar manualmente a Minhas compras. A confirmacao ocorre por consulta autenticada ao gateway, sem depender de webhook.

O proxy atual usa Google Drive, que e o storage implementado na sincronizacao. Outros providers ainda precisam implementar acesso aos originais. Pedidos pagos nao perdem acesso quando a galeria sai do ar. Reembolso/contestacao revoga download quando detectado pela consulta ao gateway.

`POST /orders/{id}/mark_paid/` e restrito ao admin e permite confirmacao manual de pagamento offline. Nao use para simular pagamento real em producao.

Referencias oficiais: https://docs.stripe.com/api/checkout/sessions e https://www.mercadopago.com.br/developers/pt/reference/online-payments/checkout-pro-preferences/overview.


Payment orchestration is in `services.py`: create/reuse the order's Payment,
call its native get_form(), handle RedirectNeeded and map backend status to Order.
Payment inherits BasePayment; no integration-level payment service is needed.

<script setup lang="ts">
// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
defineOptions({ name: 'AdminPaymentSettingsPage' })

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------
const accordionItems = [
  {
    label: 'O que acontece ao trocar o provedor?',
    content:
      'Os pedidos guardam o provedor utilizado na criação. Trocar a configuração não altera esse histórico.',
  },
  {
    label: 'Como configurar as credenciais?',
    content:
      'As chaves são configuradas no ambiente do servidor. Este painel salva a seleção de provedor e não armazena chaves de pagamento.',
  },
  {
    label: 'Selecionar o provedor já ativa vendas nas galerias?',
    content:
      'Não. Cada galeria possui sua própria configuração de vendas e preços. Revise essas opções antes de compartilhar com os clientes.',
  },
]
</script>

<template>
  <CAdminPageFrame
    title="Pagamentos"
    eyebrow="Configurações"
    description="Configure como você recebe pelas vendas das suas galerias."
  >
    <template #actions>
      <UButton
        label="Ver vendas"
        icon="i-lucide-chart-no-axes-combined"
        to="/admin/sales"
        color="neutral"
        variant="outline"
        class="rounded-full"
      />
    </template>
    <div class="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <CPaymentStep mode="settings" />

      <UCard
        :ui="{
          root: 'rounded-2xl shadow-none ring-default/60',
          body: 'space-y-5',
        }"
      >
        <template #header>
          <h2 class="text-sm font-medium text-highlighted">Da galeria à venda</h2>
        </template>

        <div class="flex gap-3">
          <UIcon name="i-lucide-images" class="mt-0.5 size-5 shrink-0 text-muted" />
          <p class="text-sm leading-relaxed text-muted">
            Ative as vendas e defina os preços de cada galeria ou foto nas configurações da galeria.
          </p>
        </div>

        <div class="flex gap-3">
          <UIcon name="i-lucide-credit-card" class="mt-0.5 size-5 shrink-0 text-muted" />
          <p class="text-sm leading-relaxed text-muted">
            O cliente conclui a compra no provedor. A seleção aqui não confirma que as credenciais
            do servidor estão prontas.
          </p>
        </div>

        <div class="flex gap-3">
          <UIcon name="i-lucide-download" class="mt-0.5 size-5 shrink-0 text-muted" />
          <p class="text-sm leading-relaxed text-muted">
            Após a aprovação, os originais ficam disponíveis em Minhas compras.
          </p>
        </div>

        <UButton
          label="Gerenciar galerias"
          to="/admin/galleries"
          color="neutral"
          variant="link"
          trailing-icon="i-lucide-arrow-right"
        />
      </UCard>
    </div>

    <UCard :ui="{ root: 'rounded-2xl shadow-none ring-default/60' }">
      <UAccordion :items="accordionItems" />
    </UCard>
  </CAdminPageFrame>
</template>

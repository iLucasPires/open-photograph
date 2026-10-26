<script setup lang="ts">
// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
defineOptions({ name: 'SetupDonePage' })
</script>
<template>
  <CSetupPage
    title="Tudo pronto para começar"
    description="Sua configuração inicial foi concluída. Agora é hora de criar sua primeira galeria."
  >
    <div class="flex flex-col items-center gap-6 py-2 text-center">
      <div class="rounded-full bg-success/10 p-5 ring-8 ring-success/5 animate-pulse">
        <UIcon name="i-lucide-check-circle-2" class="text-5xl text-success" />
      </div>

      <div class="flex flex-col gap-2">
        <h2 class="text-lg font-bold text-default">Sua plataforma está pronta!</h2>
        <p class="text-sm text-muted max-w-sm">
          Você já pode criar sua primeira galeria, importar fotos e compartilhar links públicos com
          seus clientes.
        </p>
      </div>

      <!-- Checklist de status -->
      <div class="w-full rounded-xl bg-subtle p-4 flex flex-col gap-2.5 text-left text-xs">
        <div class="flex items-center gap-2 text-default font-medium">
          <UIcon name="i-lucide-check" class="text-success text-base" />
          <span>Conta de administrador ativa</span>
        </div>
        <div class="flex items-center gap-2 text-default font-medium">
          <UIcon name="i-lucide-check" class="text-success text-base" />
          <span>Armazenamento de fotos conectado</span>
        </div>
        <div class="flex items-center gap-2 text-default font-medium">
          <UIcon name="i-lucide-check" class="text-success text-base" />
          <span>Configuração de pagamentos registrada</span>
        </div>
      </div>

      <UButton
        label="Acessar meu painel"
        trailing-icon="i-lucide-arrow-right"
        size="xl"
        block
        to="/admin/galleries"
      />
    </div>
  </CSetupPage>
</template>

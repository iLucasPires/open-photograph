<script setup lang="ts">
// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
defineOptions({ name: 'AdminStorageSettingsPage' })

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------
const accordionItems = [
  {
    label: 'Trocar a origem move minhas fotos?',
    content:
      'Não. A seleção de armazenamento não migra os arquivos existentes. Revise as pastas e os acessos antes de importar de uma nova origem.',
  },
  {
    label: 'Preciso conectar uma conta para cada origem?',
    content:
      'Google Drive utiliza autorização da conta Google. Disco local e S3 / R2 dependem da configuração de armazenamento no servidor.',
  },
  {
    label: 'A sincronização não consegue acessar a pasta. O que verificar?',
    content:
      'Confirme que a pasta continua disponível e que a conta conectada tem acesso. Se necessário, reconecte o Google Drive e tente sincronizar novamente pela galeria.',
  },
]
</script>

<template>
  <CAdminPageFrame
    title="Armazenamento"
    eyebrow="Configurações"
    description="Suas fotos, no lugar certo. Conecte sua conta para importar fotos."
  >
    <template #actions>
      <UButton
        label="Ver galerias"
        icon="i-lucide-images"
        to="/admin/galleries"
        color="neutral"
        variant="outline"
        class="rounded-full"
      />
    </template>
    <div class="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <CDriveStep mode="settings" />
      <UCard
        :ui="{
          root: 'rounded-2xl shadow-none ring-default/60',
          body: 'space-y-5',
        }"
      >
        <template #header>
          <h2 class="text-sm font-medium text-highlighted">Organize seus originais</h2>
        </template>

        <div class="flex gap-3">
          <UIcon name="i-lucide-folder-open" class="mt-0.5 size-5 shrink-0 text-muted" />
          <p class="text-sm leading-relaxed text-muted">
            Selecione a origem e salve. Para usar Google Drive, conecte também a conta com acesso às
            pastas de fotos.
          </p>
        </div>

        <div class="flex gap-3">
          <UIcon name="i-lucide-refresh-cw" class="mt-0.5 size-5 shrink-0 text-muted" />
          <p class="text-sm leading-relaxed text-muted">
            Na galeria, escolha a pasta de origem e inicie a sincronização para importar as fotos.
          </p>
        </div>

        <div class="flex gap-3">
          <UIcon name="i-lucide-image" class="mt-0.5 size-5 shrink-0 text-muted" />
          <p class="text-sm leading-relaxed text-muted">
            As prévias são processadas para a galeria. Mantenha os originais disponíveis para os
            downloads dos clientes.
          </p>
        </div>
      </UCard>
    </div>

    <UCard :ui="{ root: 'rounded-2xl shadow-none ring-default/60' }">
      <UAccordion :items="accordionItems" />
    </UCard>
  </CAdminPageFrame>
</template>

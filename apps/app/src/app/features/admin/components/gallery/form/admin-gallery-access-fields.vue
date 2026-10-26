<script setup lang="ts">
import type { GalleryEditorState } from '@/app/features/admin/types/gallery/form'
import { galleryAccessOptions } from '@/app/features/gallery/constants'

// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
defineProps<{ editing: boolean }>()
const state = defineModel<GalleryEditorState>({ required: true })
</script>

<template>
  <div class="space-y-6">
    <UFormField name="access_type" label="Quem pode acessar">
      <URadioGroup v-model="state.access_type" variant="card" :items="[...galleryAccessOptions]" />
    </UFormField>

    <UFormField
      v-if="state.access_type === 'private'"
      name="access_code"
      label="Código de acesso"
      :description="
        editing
          ? 'Deixe vazio para manter o código atual, se já existir.'
          : 'Use pelo menos 6 caracteres.'
      "
    >
      <UInput
        v-model="state.access_code"
        type="password"
        autocomplete="new-password"
        class="w-full"
      />
    </UFormField>
    <USwitch
      v-model="state.is_published"
      label="Publicar galeria"
      description="Disponibiliza a galeria conforme o tipo de acesso escolhido."
    />
    <USeparator size="xs" label="Interação e downloads" />

    <div class="space-y-5">
      <USwitch
        v-model="state.allow_likes"
        label="Curtidas"
        description="Usuários logados podem curtir cada foto."
      />
      <USwitch
        v-model="state.allow_comments"
        label="Comentários"
        description="Usuários logados podem comentar. Os comentários aparecem na galeria."
      />
      <USwitch
        v-model="state.allow_selection"
        label="Seleção de fotos"
        description="Clientes podem escolher fotos e enviar a seleção."
      />
      <USwitch
        v-model="state.allow_downloads"
        label="Download das prévias"
        description="Define o padrão. Cada foto pode ter uma permissão diferente."
      />
    </div>
  </div>
</template>

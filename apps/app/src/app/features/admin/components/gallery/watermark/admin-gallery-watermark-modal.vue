<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { apiFetch } from '@/app/core/clients/api'
import { watermarkSchema } from '../../../schemas/gallery/watermark'
import type {
  WatermarkAsset,
  WatermarkFormState,
} from '@/app/features/admin/types/gallery/watermark'

// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
const props = defineProps<{ asset?: WatermarkAsset }>()
const emit = defineEmits<{ close: [saved: boolean] }>()

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------
const styles = [
  { label: 'Texto diagonal repetido', value: 'text_diagonal' },
  { label: 'Logo', value: 'image_overlay' },
  { label: 'Texto e logo', value: 'combined' },
]
const positions = [
  { label: 'Superior esquerdo', value: 'top_left' },
  { label: 'Superior direito', value: 'top_right' },
  { label: 'Inferior esquerdo', value: 'bottom_left' },
  { label: 'Inferior direito', value: 'bottom_right' },
  { label: 'Centro', value: 'center' },
]

// ---------------------------------------------------------------------------
// Composables
// ---------------------------------------------------------------------------
const formId = useId()
const queryClient = useQueryClient()
const toast = useToast()

// ---------------------------------------------------------------------------
// Estado
// ---------------------------------------------------------------------------
const errorMessage = ref('')
const logoFile = ref<File | null>(null)
const removeLogo = ref(false)
const assetId = ref<string | null>(props.asset?.id ?? null)
const isDefault = ref(props.asset?.is_default ?? false)
const savedLogo = ref<string | null>(props.asset?.logo ?? null)
const state = reactive<WatermarkFormState>({
  name: '',
  style: 'text_diagonal',
  text: '',
  text_color: '#FFFFFF',
  text_opacity: 0.35,
  font_size_ratio: 0.03,
  rotation_angle: -30,
  tile_spacing: 200,
  logo_opacity: 0.5,
  logo_size_ratio: 0.15,
  logo_position: 'bottom_right',
  ...props.asset,
})

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------
const { data: previewSettings } = useQuery({
  queryKey: ['preview-settings'],
  queryFn: fetchPreviewSettings,
})

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------
const save = useMutation({
  mutationFn: submitSave,
  onMutate: handleSaveMutate,
  onSuccess: handleSaveSuccess,
  onError: handleSaveError,
})

// ---------------------------------------------------------------------------
// Funções: mutations
// ---------------------------------------------------------------------------

async function submitSave() {
  const values = watermarkSchema.parse(state)
  if (values.style !== 'image_overlay' && !values.text) throw new Error('Informe o texto da marca.')
  if (values.style !== 'text_diagonal' && !logoFile.value && (!savedLogo.value || removeLogo.value))
    throw new Error('Selecione um logo.')
  const body = new FormData()
  for (const [key, value] of Object.entries(values)) body.append(key, String(value))
  body.append('is_default', String(isDefault.value))
  if (logoFile.value) body.append('logo', logoFile.value)
  else if (removeLogo.value) body.append('logo', '')
  return apiFetch<WatermarkAsset>(
    assetId.value ? `/api/commerce/watermarks/${assetId.value}/` : '/api/commerce/watermarks/',
    {
      method: assetId.value ? 'PATCH' : 'POST',
      body,
    },
  )
}

function handleSaveMutate() {
  errorMessage.value = ''
}

async function handleSaveSuccess(asset: WatermarkAsset) {
  assetId.value = asset.id
  savedLogo.value = asset.logo
  logoFile.value = null
  removeLogo.value = false
  toast.add({ title: "Marca d'água salva", color: 'success' })
  await queryClient.invalidateQueries({ queryKey: ['watermarks'] })
  emit('close', true)
}

function handleSaveError(error: Error) {
  const response = (
    error as {
      data?: {
        errors?: {
          detail: string
        }[]
      }
    }
  ).data
  errorMessage.value =
    response?.errors?.map((item) => item.detail).join(' ') ||
    error.message ||
    'Não foi possível salvar.'
}

// ---------------------------------------------------------------------------
// Funções: queries
// ---------------------------------------------------------------------------

function fetchPreviewSettings() {
  return apiFetch<{
    quality: number
    max_size: number
  }>('/api/gallery-preview-settings/')
}
</script>

<template>
  <UModal
    :title="asset ? 'Editar marca d’água' : 'Nova marca d’água'"
    description="Crie uma assinatura e escolha em quais galerias usar."
    :dismissible="!save.isPending.value"
    :close="{ disabled: save.isPending.value }"
    :ui="{
      content: 'max-w-6xl lg:h-[min(820px,calc(100dvh-2rem))]',
      body: 'flex-1 p-0 sm:p-0 min-h-0 lg:overflow-hidden',
      footer: 'justify-end',
    }"
  >
    <template #body>
      <div class="grid min-h-0 lg:h-full lg:grid-cols-[360px_minmax(0,1fr)]">
        <UForm
          :id="formId"
          :schema="watermarkSchema"
          :state="state"
          :disabled="save.isPending.value"
          class="min-h-0 space-y-6 p-5 sm:p-6 lg:overflow-y-auto lg:border-r lg:border-default/60"
          @submit="save.mutate()"
        >
          <UAlert v-if="errorMessage" :title="errorMessage" color="error" />
          <section class="space-y-4">
            <h2 class="text-xs font-medium text-muted">Identificação</h2>
            <USwitch
              v-model="isDefault"
              label="Usar como padrão"
              description="Usada quando a galeria não tem uma marca específica."
            />
            <UFormField label="Nome" name="name" required
              ><UInput v-model="state.name" class="w-full"
            /></UFormField>
            <UFormField label="Estilo" name="style"
              ><USelect v-model="state.style" :items="styles" class="w-full"
            /></UFormField>
          </section>
          <section
            v-if="state.style !== 'image_overlay'"
            class="grid grid-cols-2 gap-4 border-t border-default/60 pt-6"
          >
            <h2 class="col-span-2 text-xs font-medium text-muted">Texto</h2>
            <UFormField label="Texto da marca" name="text" required class="col-span-2"
              ><UInput v-model="state.text" class="w-full" placeholder="Seu nome ou estudio"
            /></UFormField>
            <UFormField label="Cor (hex)" name="text_color"
              ><UInput v-model="state.text_color" class="w-full"
            /></UFormField>
            <UFormField label="Opacidade" name="text_opacity"
              ><UInputNumber
                v-model="state.text_opacity"
                :min="0"
                :max="1"
                :step="0.05"
                class="w-full"
            /></UFormField>
            <UFormField
              label="Tamanho do texto"
              description="Proporção da largura da foto."
              name="font_size_ratio"
              ><UInputNumber
                v-model="state.font_size_ratio"
                :min="0.001"
                :max="1"
                :step="0.005"
                class="w-full"
            /></UFormField>
            <UFormField label="Rotação em graus" name="rotation_angle"
              ><UInputNumber
                v-model="state.rotation_angle"
                :min="-360"
                :max="360"
                :step="1"
                class="w-full"
            /></UFormField>
            <UFormField label="Espaçamento (px)" name="tile_spacing"
              ><UInputNumber
                v-model="state.tile_spacing"
                :min="10"
                :max="2000"
                :step="10"
                class="w-full"
            /></UFormField>
          </section>
          <section
            v-if="state.style !== 'text_diagonal'"
            class="space-y-4 border-t border-default/60 pt-6"
          >
            <h2 class="text-xs font-medium text-muted">Logo</h2>
            <UFormField label="Arquivo do logo" description="PNG com transparência recomendado.">
              <UFileUpload
                v-model="logoFile"
                accept="image/png,image/jpeg,image/webp"
                label="Selecionar logo"
              />
            </UFormField>
            <img
              v-if="savedLogo && !removeLogo && !logoFile"
              :src="savedLogo"
              alt="Logo atual"
              class="max-h-40 max-w-full rounded-lg bg-elevated object-contain"
            />
            <USwitch v-if="savedLogo" v-model="removeLogo" label="Remover logo atual" />
            <div class="space-y-4">
              <UFormField label="Posição" name="logo_position"
                ><USelect v-model="state.logo_position" :items="positions" class="w-full"
              /></UFormField>
              <UFormField label="Opacidade" name="logo_opacity"
                ><UInputNumber v-model="state.logo_opacity" :min="0" :max="1" :step="0.05"
              /></UFormField>
              <UFormField label="Tamanho relativo (0.15 = 15%)" name="logo_size_ratio"
                ><UInputNumber v-model="state.logo_size_ratio" :min="0.001" :max="1" :step="0.01"
              /></UFormField>
            </div>
          </section>
        </UForm>
        <CAdminImagePreview
          :watermark="state"
          :quality="previewSettings?.quality"
          :max-size="previewSettings?.max_size"
          :logo="logoFile"
          :asset-id="assetId"
          :remove-logo="removeLogo"
          class="min-h-0 border-t border-default/60 bg-muted/20 p-5 sm:p-6 lg:overflow-y-auto lg:border-t-0"
        />
      </div>
    </template>
    <template #footer>
      <UButton
        label="Cancelar"
        color="neutral"
        variant="ghost"
        :disabled="save.isPending.value"
        @click="emit('close', false)"
      />
      <UButton
        type="submit"
        :form="formId"
        label="Salvar marca d'água"
        icon="i-lucide-save"
        :loading="save.isPending.value"
      />
    </template>
  </UModal>
</template>

<script setup lang="ts">
// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
defineOptions({ name: 'SetupPaymentPage' })

// ---------------------------------------------------------------------------
// Composables
// ---------------------------------------------------------------------------
const router = useRouter()

// ---------------------------------------------------------------------------
// Funções
// ---------------------------------------------------------------------------

function onSaved() {
  router.push('/setup/done')
}
</script>

<template>
  <CSetupPage
    title="Seus pagamentos"
    description="Escolha um gateway com as chaves configuradas ou continue com galerias gratuitas."
  >
    <CPaymentStep @saved="onSaved" />
  </CSetupPage>
</template>

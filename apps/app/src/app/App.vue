<script setup lang="ts">
const toaster = { expand: false }
</script>

<template>
  <UApp :toaster="toaster">
    <router-view />
  </UApp>
</template>

<template>
  <div
    class="min-h-screen w-full flex flex-col justify-between bg-gradient-to-br from-primary-600 to-primary-400"
  >
    <!-- Centered Form Container -->
    <main class="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center">
      <RouterView />
    </main>

    <!-- Footer info -->
    <footer class="mx-auto flex w-full max-w-lg items-center justify-center text-xs text-muted">
      <span>Open Photograph &mdash; Plataforma de galerias para fotógrafos</span>
    </footer>
  </div>
</template>

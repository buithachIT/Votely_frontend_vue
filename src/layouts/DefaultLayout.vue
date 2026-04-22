<script setup lang="ts">
import { RouterView } from 'vue-router';
import DefaultHeader from '@/components/DefaultHeader.vue';
import DefaultFooter from '@/components/DefaultFooter.vue';
</script>

<template>
  <div class="min-h-screen flex flex-col bg-[#f9f8f4] relative">
    <div
      class="fixed inset-0 opacity-[0.06] pointer-events-none z-0"
      style="
        background-image: url('/assets/layout/bg-pattern-pages.svg');
        background-repeat: repeat;
      "
    ></div>

    <DefaultHeader />

    <main class="relative z-10 mx-auto p-4 md:p-8 flex-1 w-full">
      <div class="max-w-7xl mx-auto"><RouterView /></div>
    </main>

    <DefaultFooter />
  </div>
</template>
<style scoped>
.router-link-active {
  background: rgba(16, 185, 129, 0.05);
}
</style>

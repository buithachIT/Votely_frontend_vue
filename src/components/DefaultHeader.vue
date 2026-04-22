<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { ref } from 'vue';
import Menu from 'primevue/menu';
import { ROUTES } from '@/configs/routes';
import JoinPollInput from '@/components/JoinPollInput.vue';

const menu = ref();
const authStore = useAuthStore();

const handleLogout = () => {
  authStore.logout();
};
const toggleMenu = (event: Event) => {
  menu.value.toggle(event);
};
const items = ref([
  {
    label: 'Tài khoản',
    items: [
      {
        label: 'Thông tin cá nhân',
        icon: 'pi pi-user',
        command: () => {
          /* Chuyển hướng đến profile */
        },
      },
      {
        label: 'Đăng xuất',
        icon: 'pi pi-power-off',
        class: 'text-red-500',
        command: () => {
          handleLogout();
        },
      },
    ],
  },
]);
</script>

<template>
  <header
    class="sticky top-0 z-50 w-full bg-white border-b-2 border-black/5 shadow-sm overflow-hidden"
  >
    <div class="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
      <!-- Left: Logo + Nav -->
      <div class="flex items-center gap-6 h-full shrink-0">
        <RouterLink
          :to="ROUTES.MY_POLLS"
          class="text-4xl font-black text-emerald-600 tracking-tighter hover:opacity-80 transition-opacity"
        >
          VOTELY
        </RouterLink>

        <nav class="hidden md:flex items-center gap-1 h-full pt-1">
          <RouterLink
            to="/dashboard"
            active-class="border-emerald-500 !text-emerald-600 bg-emerald-50/30"
            class="flex items-center gap-2 px-4 h-full border-b-4 border-transparent text-slate-600 font-black transition-all hover:text-emerald-500"
          >
            Tổng quan
          </RouterLink>
          <RouterLink
            :to="ROUTES.MY_POLLS"
            active-class="border-emerald-500 !text-emerald-600 bg-emerald-50/30"
            class="flex items-center gap-2 px-4 h-full border-b-4 border-transparent text-slate-600 font-black transition-all hover:text-emerald-500"
          >
            Poll của tôi
          </RouterLink>
        </nav>
      </div>

      <!-- Center: Join Poll -->
      <div class="flex-1 md:flex hidden justify-center">
        <JoinPollInput v-if="authStore.isAuthenticated" />
      </div>

      <!-- Right: User -->
      <div class="flex items-center gap-3 shrink-0">
        <!-- Chưa đăng nhập -->
        <template v-if="!authStore.isAuthenticated">
          <RouterLink
            to="/login"
            class="px-4 py-2 btn-press text-sm border rounded-2xl bg-[#f9f8f4] font-black text-slate-600 hover:text-emerald-600 transition-colors"
          >
            Tham gia votely
          </RouterLink>
        </template>

        <!-- Đã đăng nhập -->
        <template v-else>
          <div class="hidden sm:flex flex-col items-end leading-tight mr-1">
            <span class="text-[10px] text-slate-400 font-black uppercase tracking-wider"
              >Thành viên</span
            >
            <span class="text-sm font-black text-slate-800">{{ authStore.userFullName }}</span>
          </div>

          <div
            @click="toggleMenu"
            aria-haspopup="true"
            aria-controls="overlay_menu"
            class="w-10 h-10 rounded-full bg-emerald-100 border-2 border-black flex items-center justify-center text-emerald-700 font-black btn-press"
          >
            {{ authStore.user?.firstName?.[0] }}{{ authStore.user?.lastName?.[0] }}
          </div>

          <Menu ref="menu" id="overlay_menu" :model="items" :popup="true">
            <template #item="{ item, props }">
              <a v-ripple class="flex items-center p-3 gap-2" v-bind="props.action">
                <span :class="[item.icon, item.class]" />
                <span :class="item.class" class="font-bold">{{ item.label }}</span>
              </a>
            </template>
          </Menu>
        </template>
      </div>
    </div>

    <!-- Mobile Join Poll bar (shown only on small screens when authenticated) -->
    <div
      v-if="authStore.isAuthenticated"
      class="md:hidden border-t border-slate-100 px-4 py-2 flex justify-center bg-white"
    >
      <JoinPollInput />
    </div>
  </header>
</template>

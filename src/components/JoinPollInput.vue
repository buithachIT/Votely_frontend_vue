<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { getPollByCodeAPI } from '@/lib/api/poll';
import { ROUTES } from '@/configs/routes';
import type { IBackendError } from '@/types/global';

const router = useRouter();
const toast = useToast();

const accessCode = ref('');
const isJoining = ref(false);
const isValidCode = computed(() => accessCode.value.trim().length === 6);

const handleJoinPoll = async () => {
  if (!isValidCode.value) return;
  try {
    isJoining.value = true;
    const code = accessCode.value.trim().toUpperCase();
    await getPollByCodeAPI(code);
    accessCode.value = '';
    router.push(ROUTES.POLL_DETAIL(code));
  } catch (error) {
    const err = error as IBackendError;
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: err?.message || 'Mã phòng không tồn tại',
      life: 4000,
    });
  } finally {
    isJoining.value = false;
  }
};
</script>

<template>
  <div class="flex items-center gap-2">
    <input
      v-model="accessCode"
      type="text"
      maxlength="6"
      placeholder="Nhập mã..."
      :disabled="isJoining"
      @keyup.enter="handleJoinPoll"
      class="w-40 sm:w-44 border-2 border-slate-200 rounded-xl px-3 py-2 text-center text-base font-bold tracking-[0.35em] uppercase focus:outline-none focus:border-emerald-500 transition disabled:opacity-50"
    />
    <button
      :disabled="!isValidCode || isJoining"
      @click="handleJoinPoll"
      class="btn-press bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold px-4 py-2 rounded-xl transition whitespace-nowrap"
    >
      {{ isJoining ? '...' : 'Vào phòng' }}
    </button>
  </div>
</template>

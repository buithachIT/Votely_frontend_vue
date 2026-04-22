<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue';
import type { IChatMessage } from '@/types/global';

const props = defineProps<{
  messages: IChatMessage[];
  chatEnabled: boolean;
  currentUserId: string;
  isSending: boolean;
}>();

const emit = defineEmits<{
  (e: 'send', message: string): void;
}>();

const input = ref('');
const messagesEl = ref<HTMLElement | null>(null);

const handleSend = () => {
  const msg = input.value.trim();
  if (!msg || !props.chatEnabled || props.isSending) return;
  emit('send', msg);
  input.value = '';
};

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const scrollToBottom = async (behavior: 'auto' | 'smooth' = 'smooth') => {
  await nextTick();
  if (messagesEl.value) {
    messagesEl.value.scrollTo({
      top: messagesEl.value.scrollHeight,
      behavior: behavior,
    });
  }
};

onMounted(() => {
  scrollToBottom('auto');
});

watch(
  () => props.messages.length,
  () => {
    scrollToBottom('smooth');
  },
);
</script>

<template>
  <div class="bg-white rounded-2xl shadow border border-slate-100 flex flex-col h-120! sm:h-96">
    <!-- Header -->
    <div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
      <h3 class="font-bold text-slate-700 text-sm flex items-center gap-2">💬 Trò chuyện</h3>
      <span
        v-if="!chatEnabled"
        class="text-xs bg-red-100 text-red-500 font-semibold px-2 py-0.5 rounded-full"
      >
        Đã tắt
      </span>
      <span
        v-else
        class="text-xs bg-green-100 text-green-600 font-semibold px-2 py-0.5 rounded-full"
      >
        Đang mở
      </span>
    </div>

    <!-- Messages -->
    <div ref="messagesEl" class="flex-1 overflow-y-auto px-4 py-3 space-y-2 scroll-smooth">
      <div v-if="messages.length === 0" class="flex items-center justify-center h-full">
        <p class="text-slate-400 text-sm">Chưa có tin nhắn nào</p>
      </div>

      <div
        v-for="(msg, i) in messages"
        :key="msg._id ?? i"
        :class="['flex gap-2', msg.userId === currentUserId ? 'flex-row-reverse' : 'flex-row']"
      >
        <!-- Avatar -->
        <div
          class="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center shrink-0"
        >
          {{ msg.username.charAt(0).toUpperCase() }}
        </div>

        <!-- Bubble -->
        <div
          :class="[
            'max-w-[70%]',
            msg.userId === currentUserId ? 'items-end' : 'items-start',
            'flex flex-col gap-0.5',
          ]"
        >
          <span class="text-[10px] text-slate-400 font-medium px-1">
            {{ msg.userId === currentUserId ? 'Bạn' : msg.username }}
            · {{ formatTime(msg.createdAt) }}
          </span>
          <div
            :class="[
              'px-3 py-2 rounded-2xl text-sm leading-snug wrap-break-word',
              msg.userId === currentUserId
                ? 'bg-emerald-600 text-white rounded-tr-sm'
                : 'bg-slate-100 text-slate-800 rounded-tl-sm',
            ]"
          >
            {{ msg.message }}
          </div>
        </div>
      </div>
    </div>

    <!-- Input -->
    <div class="px-4 py-3 border-t border-slate-100">
      <div v-if="!chatEnabled" class="text-center text-slate-400 text-xs py-1">
        Chat đã bị tắt bởi chủ phòng
      </div>
      <div v-else class="flex gap-2">
        <input
          v-model="input"
          type="text"
          maxlength="300"
          placeholder="Nhập tin nhắn..."
          :disabled="isSending"
          autofocus
          @keyup.enter="handleSend"
          class="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition disabled:opacity-50"
        />
        <button
          :disabled="!input.trim() || isSending"
          @click="handleSend"
          class="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold px-4 py-2 rounded-xl transition"
        >
          Gửi
        </button>
      </div>
    </div>
  </div>
</template>

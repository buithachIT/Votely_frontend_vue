<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  getPollByCodeAPI,
  votePollAPI,
  closePollAPI,
  deletePollAPI,
  getChatHistoryAPI,
  updatePollAPI,
} from '@/lib/api/poll';
import type { IBackendError, IChatMessage, IPoll } from '@/types/global';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/stores/auth';
import io, { Socket } from 'socket.io-client';
import ChatBox from './ChatBox.vue';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();

const poll = ref<IPoll | null>(null);
const isLoading = ref(true);
const fetchError = ref<string | null>(null);
const isVoting = ref(false);
const isClosing = ref(false);
const isDeleting = ref(false);
const showDeleteConfirm = ref(false);
const selectedOptions = ref<string[]>([]);
const votedLocally = ref(false);

const socket = ref<Socket | null>(null);

// --- Chat ---
const chatMessages = ref<IChatMessage[]>([]);
const isSendingMessage = ref(false);
const isTogglingChat = ref(false);

const currentUserId = computed(() => authStore.user?._id ?? '');

const pollCode = computed(() => route.params.code as string);

const totalVotes = computed(
  () => poll.value?.options.reduce((sum, opt) => sum + opt.votes, 0) ?? 0,
);

const getPercent = (votes: number) =>
  totalVotes.value === 0 ? 0 : Math.round((votes / totalVotes.value) * 100);

// Check if current user already voted
const hasVoted = computed(
  () => votedLocally.value || (poll.value?.votedUsers.includes(authStore.user?._id ?? '') ?? false),
);

const isOwner = computed(() => poll.value?.createdBy._id === authStore.user?._id);

const isOptionSelected = (text: string) => selectedOptions.value.includes(text);

const toggleOption = (text: string) => {
  if (hasVoted.value || !poll.value?.isActive) return;

  if (poll.value.multipleSelection) {
    const idx = selectedOptions.value.indexOf(text);
    if (idx === -1) {
      if (selectedOptions.value.length < poll.value.maxSelections) {
        selectedOptions.value.push(text);
      }
    } else {
      selectedOptions.value.splice(idx, 1);
    }
  } else {
    selectedOptions.value = [text];
  }
};

const handleVote = async () => {
  if (!poll.value || selectedOptions.value.length === 0 || isVoting.value) return;
  try {
    isVoting.value = true;
    const res = await votePollAPI(poll.value._id, selectedOptions.value);
    if (res.data) poll.value = res.data;
    votedLocally.value = true;
    selectedOptions.value = [];
    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: 'Bình chọn thành công!',
      life: 3000,
    });
  } catch (error) {
    const err = error as IBackendError;
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: err?.message || 'Bình chọn thất bại',
      life: 4000,
    });
  } finally {
    isVoting.value = false;
  }
};

const handleClosePoll = async () => {
  if (!poll.value) return;
  try {
    isClosing.value = true;
    const res = await closePollAPI(poll.value._id);
    if (res.data) poll.value = res.data;
    toast.add({
      severity: 'info',
      summary: 'Đã đóng',
      detail: 'Poll đã ngừng nhận vote',
      life: 3000,
    });
  } catch (error) {
    const err = error as IBackendError;
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: err?.message || 'Không thể đóng poll',
      life: 4000,
    });
  } finally {
    isClosing.value = false;
  }
};

const handleDeletePoll = async () => {
  if (!poll.value) return;
  try {
    isDeleting.value = true;
    await deletePollAPI(poll.value._id);
    toast.add({ severity: 'success', summary: 'Đã xóa', detail: 'Poll đã được xóa', life: 2000 });
    setTimeout(() => router.push('/'), 1500);
  } catch (error) {
    const err = error as IBackendError;
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: err?.message || 'Không thể xóa poll',
      life: 4000,
    });
    isDeleting.value = false;
  }
};

const handleSendMessage = (message: string) => {
  if (!socket.value || !poll.value || !authStore.user) return;
  isSendingMessage.value = true;
  socket.value.emit(
    'send-message',
    {
      pollCode: poll.value.code,
      userId: authStore.user._id,
      username: authStore.user.firstName + ' ' + authStore.user.lastName,
      message,
    },
    () => {
      isSendingMessage.value = false;
    },
  );
  // reset after brief delay in case no ack
  setTimeout(() => {
    isSendingMessage.value = false;
  }, 1000);
};

const handleToggleChat = async () => {
  if (!poll.value) return;
  try {
    isTogglingChat.value = true;
    const res = await updatePollAPI(poll.value._id, { chatEnabled: !poll.value.chatEnabled });
    if (res.data) poll.value = res.data;
  } catch (error) {
    const err = error as IBackendError;
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: err?.message || 'Không thể thay đổi trạng thái chat',
      life: 4000,
    });
  } finally {
    isTogglingChat.value = false;
  }
};

const fetchPollData = async () => {
  try {
    isLoading.value = true;
    fetchError.value = null;
    const [pollRes, chatRes] = await Promise.all([
      getPollByCodeAPI(pollCode.value),
      getChatHistoryAPI(pollCode.value).catch(() => ({ data: [] as IChatMessage[] })),
    ]);
    poll.value = pollRes.data;
    chatMessages.value = chatRes.data ?? [];
  } catch (error) {
    const err = error as IBackendError;
    fetchError.value = err?.message || 'Mã phòng không tồn tại hoặc đã bị xóa';
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await fetchPollData();

  if (!poll.value) return;

  socket.value = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000', {
    withCredentials: true,
    transports: ['websocket'],
  });

  socket.value.on('connect', () => {
    socket.value?.emit('join-poll', poll.value?.code);
  });

  socket.value.on('poll-updated', (updatedPoll: IPoll) => {
    if (updatedPoll._id === poll.value?._id) {
      poll.value = updatedPoll;
    }
  });

  socket.value.on('poll-closed', (closedPollId: string) => {
    if (closedPollId === poll.value?._id) {
      if (poll.value) poll.value.isActive = false;
      toast.add({
        severity: 'info',
        summary: 'Poll đã đóng',
        detail: 'Poll này đã ngừng nhận vote',
        life: 3000,
      });
    }
  });
  socket.value.on('poll-closed', (updatedPoll: IPoll) => {
    if (updatedPoll._id === poll.value?._id) {
      poll.value = updatedPoll;
      toast.add({
        severity: 'warn',
        summary: 'Thông báo',
        detail: 'Chủ phòng đã ngừng nhận bình chọn!',
        life: 5000,
      });
    }
  });

  socket.value.on('poll-deleted', (deletedId: string) => {
    if (deletedId === poll.value?._id) {
      toast.add({
        severity: 'error',
        summary: 'Rất tiếc',
        detail: 'Cuộc bình chọn này đã bị xóa bởi chủ phòng!',
        life: 3000,
      });
      setTimeout(() => {
        router.push('/');
      }, 2000);
    }
  });

  socket.value.on('receive-message', (msg: IChatMessage) => {
    chatMessages.value.push(msg);
  });

  socket.value.on('chat-error', (err: { message: string }) => {
    toast.add({
      severity: 'warn',
      summary: 'Chat',
      detail: err.message || 'Không thể gửi tin nhắn',
      life: 3000,
    });
  });
});
onUnmounted(() => {
  if (socket.value) {
    socket.value.disconnect();
  }
});
</script>

<template>
  <!-- Loading skeleton -->
  <div v-if="isLoading" class="px-4 py-4">
    <div class="gap-6 mx-auto sm:flex-col lg:flex-row flex animate-pulse">
      <!-- Left col -->
      <div class="flex-2 space-y-4">
        <!-- Header card skeleton -->
        <div class="bg-white rounded-2xl shadow p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="h-5 bg-slate-200 rounded-full w-24" />
            <div class="h-5 bg-slate-200 rounded-full w-16" />
          </div>
          <div class="h-7 bg-slate-200 rounded w-3/4 mb-2" />
          <div class="h-4 bg-slate-100 rounded w-1/2 mb-2" />
          <div class="h-3 bg-slate-100 rounded w-1/3" />
        </div>
        <!-- Option skeletons -->
        <div
          v-for="i in 3"
          :key="i"
          class="bg-white rounded-2xl shadow p-5 border-2 border-transparent"
        >
          <div class="flex items-center justify-between mb-3">
            <div class="h-4 bg-slate-200 rounded w-1/2" />
            <div class="h-4 bg-slate-200 rounded w-10" />
          </div>
          <div class="w-full bg-slate-100 rounded-full h-3" />
          <div class="h-3 bg-slate-100 rounded w-16 mt-1" />
        </div>
        <!-- Button skeleton -->
        <div class="h-12 bg-slate-200 rounded-xl" />
      </div>
      <!-- Right col (chat) -->
      <div class="flex-1">
        <div class="bg-white rounded-2xl shadow h-96" />
      </div>
    </div>
  </div>

  <!-- Error state -->
  <div
    v-else-if="fetchError"
    class="flex flex-col items-center justify-center py-24 px-4 text-center"
  >
    <div class="text-5xl mb-4">⚠️</div>
    <h2 class="text-xl font-bold text-slate-700 mb-2">Không thể tải phòng</h2>
    <p class="text-slate-500 text-sm mb-6 max-w-sm">{{ fetchError }}</p>
    <div class="flex gap-3">
      <button
        @click="fetchPollData"
        class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl transition"
      >
        Thử lại
      </button>
      <button
        @click="router.push('/')"
        class="border-2 border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold px-5 py-2.5 rounded-xl transition"
      >
        Về trang chủ
      </button>
    </div>
  </div>

  <div v-else-if="poll" class="px-4 py-4">
    <div class="gap-6 mx-auto sm:flex-col lg:flex-row flex">
      <div class="flex-2">
        <!-- Header card -->
        <div class="bg-white rounded-2xl shadow p-6 mb-6">
          <div class="flex items-center justify-between mb-1">
            <span
              class="text-xs font-semibold bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full"
            >
              Mã: {{ poll.code }}
            </span>
            <span
              :class="poll.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'"
              class="text-xs font-semibold px-3 py-1 rounded-full"
            >
              {{ poll.isActive ? 'Đang mở' : 'Đã đóng' }}
            </span>
          </div>
          <h2 class="text-2xl font-bold text-gray-800 mt-3">{{ poll.title }}</h2>
          <p v-if="poll.description" class="text-gray-500 text-sm mt-1">{{ poll.description }}</p>
          <p class="text-gray-400 text-xs mt-2">
            Tạo bởi
            <span class="font-medium text-gray-600">
              {{ poll.createdBy?.firstName }} {{ poll.createdBy?.lastName }}
            </span>
            · {{ totalVotes }} lượt bình chọn
          </p>

          <!-- Hint -->
          <p v-if="!hasVoted && poll.isActive" class="text-indigo-500 text-xs mt-3 font-medium">
            {{
              poll.multipleSelection
                ? `Chọn tối đa ${poll.maxSelections} lựa chọn`
                : 'Chọn 1 lựa chọn'
            }}
          </p>
          <p v-else-if="hasVoted" class="text-emerald-600 text-xs mt-3 font-semibold">
            ✓ Bạn đã bình chọn
          </p>
          <p v-else class="text-red-400 text-xs mt-3 font-medium">Poll đã đóng</p>
        </div>

        <!-- Options -->
        <div class="space-y-4">
          <div
            v-for="(option, index) in poll.options"
            :key="index"
            :class="[
              'bg-white rounded-2xl shadow p-5 border-2 transition',
              !hasVoted && poll.isActive
                ? 'cursor-pointer hover:border-indigo-300'
                : 'cursor-default',
              isOptionSelected(option.text)
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-transparent',
            ]"
            @click="toggleOption(option.text)"
          >
            <!-- Image -->
            <img
              v-if="option.image"
              :src="option.image"
              :alt="option.text"
              class="w-full h-40 object-contain rounded-xl mb-3"
            />

            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <!-- Selection indicator -->
                <span
                  v-if="!hasVoted && poll.isActive"
                  :class="[
                    'w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition',
                    isOptionSelected(option.text)
                      ? 'border-indigo-500 bg-indigo-500'
                      : 'border-gray-300',
                  ]"
                >
                  <span
                    v-if="isOptionSelected(option.text)"
                    class="w-2 h-2 bg-white rounded-full"
                  />
                </span>
                <span class="font-medium text-gray-800">{{ option.text }}</span>
              </div>
              <span class="text-sm font-semibold text-indigo-600"
                >{{ getPercent(option.votes) }}%</span
              >
            </div>

            <div class="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                class="bg-indigo-500 h-3 rounded-full transition-all duration-700"
                :style="{ width: getPercent(option.votes) + '%' }"
              />
            </div>
            <p class="text-xs text-gray-400 mt-1">{{ option.votes }} phiếu</p>
          </div>
        </div>

        <!-- Vote button -->
        <button
          v-if="!hasVoted && poll.isActive"
          :disabled="selectedOptions.length === 0 || isVoting"
          @click="handleVote"
          class="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition"
        >
          {{
            isVoting
              ? 'Đang gửi...'
              : `Bình chọn${selectedOptions.length ? ` (${selectedOptions.length})` : ''}`
          }}
        </button>

        <!-- Owner actions -->
        <div v-if="isOwner" class="mt-4 flex gap-3">
          <button
            v-if="poll.isActive"
            :disabled="isClosing"
            @click="handleClosePoll"
            class="flex-1 border-2 btn-press border-amber-400 text-amber-600 hover:bg-amber-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold py-2.5 rounded-xl transition text-sm"
          >
            {{ isClosing ? 'Đang đóng...' : 'Ngừng nhận vote' }}
          </button>
          <button
            :disabled="isTogglingChat"
            @click="handleToggleChat"
            :class="[
              'flex-1 border-2 btn-press font-semibold py-2.5 rounded-xl transition text-sm disabled:opacity-40 disabled:cursor-not-allowed',
              poll.chatEnabled
                ? 'border-slate-300 text-slate-500 hover:bg-slate-50'
                : 'border-emerald-400 text-emerald-600 hover:bg-emerald-50',
            ]"
          >
            {{ isTogglingChat ? '...' : poll.chatEnabled ? '🔇 Tắt chat' : '💬 Bật chat' }}
          </button>
          <button
            :disabled="isDeleting"
            @click="showDeleteConfirm = true"
            class="flex-1 border-2 btn-press border-red-400 text-red-500 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold py-2.5 rounded-xl transition text-sm"
          >
            {{ isDeleting ? 'Đang xóa...' : 'Xóa Poll' }}
          </button>
        </div>

        <button
          @click="router.push('/')"
          class="mt-3 w-full border-2 btn-press border-gray-200 hover:border-indigo-400 text-gray-600 hover:text-indigo-600 font-semibold py-3 rounded-xl transition"
        >
          ← Thoát phòng
        </button>
      </div>
      <!-- Chat -->
      <div class="flex-1">
        <ChatBox
          :messages="chatMessages"
          :chat-enabled="poll.chatEnabled"
          :current-user-id="currentUserId"
          :is-sending="isSendingMessage"
          @send="handleSendMessage"
        />
      </div>
    </div>
  </div>

  <!-- Delete confirm dialog -->
  <Teleport to="body">
    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
    >
      <div class="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
        <h3 class="text-lg font-bold text-gray-800 mb-1">Xóa Poll?</h3>
        <p class="text-gray-500 text-sm mb-6">Hành động này không thể hoàn tác.</p>
        <div class="flex gap-3">
          <button
            class="flex-1 border-2 border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-2.5 rounded-xl transition"
            @click="showDeleteConfirm = false"
          >
            Huỷ
          </button>
          <button
            :disabled="isDeleting"
            class="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white font-semibold py-2.5 rounded-xl transition"
            @click="
              showDeleteConfirm = false;
              handleDeletePoll();
            "
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

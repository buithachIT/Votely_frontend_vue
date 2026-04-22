<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getMyPollsAPI } from '@/lib/api/poll';
import { ROUTES } from '@/configs/routes';
import { useRouter } from 'vue-router';
import type { IBackendError, IPoll } from '@/types/global';
import CreatePollModal from '@/views/poll-room/CreatePollModal.vue';

const router = useRouter();
const polls = ref<IPoll[]>([]);
const isLoading = ref(false);
const fetchError = ref<string | null>(null);
const showCreateModal = ref(false);
const fetchMyPolls = async () => {
  try {
    isLoading.value = true;
    fetchError.value = null;
    const res = await getMyPollsAPI();
    polls.value = res.data;
  } catch (error) {
    const err = error as IBackendError;
    fetchError.value = err?.message || 'Không thể tải danh sách poll';
  } finally {
    isLoading.value = false;
  }
};

const totalVotes = (poll: IPoll) => poll.options.reduce((s, o) => s + o.votes, 0);

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const handlePollCreated = () => {
  fetchMyPolls();
};

onMounted(fetchMyPolls);
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-black text-slate-800">Cuộc bình chọn của tôi</h1>
        <p class="text-slate-500 font-medium mt-1">Quản lý các poll bạn đã tạo</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl transition"
      >
        <span class="text-lg leading-none">+</span> Tạo Poll mới
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="i in 4"
        :key="i"
        class="bg-white rounded-2xl p-5 border border-slate-200 animate-pulse"
      >
        <div class="h-5 bg-slate-200 rounded w-3/4 mb-3" />
        <div class="h-3 bg-slate-100 rounded w-1/2 mb-4" />
        <div class="h-3 bg-slate-100 rounded w-full mb-2" />
        <div class="h-3 bg-slate-100 rounded w-5/6" />
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="fetchError" class="text-center py-20 text-slate-400">
      <p class="text-5xl mb-4">⚠️</p>
      <p class="text-lg font-semibold text-slate-600">Không thể tải danh sách poll</p>
      <p class="text-sm mt-1">{{ fetchError }}</p>
      <button
        @click="fetchMyPolls"
        class="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl transition"
      >
        Thử lại
      </button>
    </div>

    <!-- Empty -->
    <div v-else-if="!isLoading && polls.length === 0" class="text-center py-20 text-slate-400">
      <p class="text-5xl mb-4">🗳️</p>
      <p class="text-lg font-semibold">Bạn chưa có cuộc bình chọn nào</p>
      <p class="text-sm mt-1">Hãy tạo poll đầu tiên của bạn!</p>
      <button
        @click="showCreateModal = true"
        class="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-xl transition"
      >
        + Tạo Poll mới
      </button>
    </div>

    <!-- Poll list -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="poll in polls"
        :key="poll._id"
        class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition cursor-pointer group"
        @click="router.push(ROUTES.POLL_DETAIL(poll.code))"
      >
        <!-- Top row -->
        <div class="flex items-start justify-between gap-2">
          <h2
            class="font-bold text-slate-800 text-base leading-snug group-hover:text-emerald-600 transition line-clamp-2"
          >
            {{ poll.title }}
          </h2>
          <span
            :class="poll.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'"
            class="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
          >
            {{ poll.isActive ? 'Đang mở' : 'Đã đóng' }}
          </span>
        </div>

        <p v-if="poll.description" class="text-slate-500 text-sm line-clamp-1">
          {{ poll.description }}
        </p>

        <!-- Stats -->
        <div class="flex items-center gap-4 text-xs text-slate-400 font-medium">
          <span>🗳️ {{ totalVotes(poll) }} phiếu</span>
          <span>📋 {{ poll.options.length }} lựa chọn</span>
          <span>📅 {{ formatDate(poll.createdAt) }}</span>
        </div>

        <!-- Code badge -->
        <div class="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
          <span class="text-xs text-slate-400">Mã:</span>
          <span
            class="font-mono font-bold text-emerald-600 tracking-widest text-sm bg-emerald-50 px-3 py-1 rounded-lg"
          >
            {{ poll.code }}
          </span>
        </div>
      </div>
    </div>
  </div>

  <CreatePollModal v-model:visible="showCreateModal" @created="handlePollCreated" />
</template>

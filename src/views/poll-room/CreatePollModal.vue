<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { createPollAPI } from '@/lib/api/poll';
import type { IBackendError, ICreatePollOptionPayload } from '@/types/global';

const props = defineProps<{ visible: boolean }>();
const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void;
  (e: 'created'): void;
}>();

const toast = useToast();
const isLoading = ref(false);

const form = ref({
  title: '',
  description: '',
  multipleSelection: false,
  maxSelections: 1,
  options: [
    { text: '', image: '' },
    { text: '', image: '' },
  ] as ICreatePollOptionPayload[],
});

watch(
  () => props.visible,
  (val) => {
    if (val) {
      form.value = {
        title: '',
        description: '',
        multipleSelection: false,
        maxSelections: 1,
        options: [
          { text: '', image: '' },
          { text: '', image: '' },
        ],
      };
    }
  },
);

const isValid = computed(
  () =>
    form.value.title.trim().length > 0 &&
    form.value.options.filter((o) => o.text.trim()).length >= 2,
);

const addOption = () => {
  form.value.options.push({ text: '', image: '' });
};

const removeOption = (index: number) => {
  if (form.value.options.length <= 2) return;
  form.value.options.splice(index, 1);
};

const handleSubmit = async () => {
  if (!isValid.value) return;
  try {
    isLoading.value = true;
    const payload = {
      ...form.value,
      options: form.value.options
        .filter((o) => o.text.trim())
        .map((o) => ({ text: o.text.trim(), ...(o.image ? { image: o.image } : {}) })),
    };
    await createPollAPI(payload);
    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: 'Tạo poll thành công!',
      life: 3000,
    });
    emit('created');
    emit('update:visible', false);
  } catch (error) {
    const err = error as IBackendError;
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: err?.message || 'Tạo poll thất bại',
      life: 4000,
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
        @click.self="emit('update:visible', false)"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 class="text-xl font-bold text-gray-800">Tạo Poll mới</h2>
            <button
              class="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              @click="emit('update:visible', false)"
            >
              &times;
            </button>
          </div>

          <!-- Body -->
          <div class="overflow-y-auto px-6 py-5 space-y-5 flex-1">
            <!-- Title -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">
                Tiêu đề <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.title"
                type="text"
                placeholder="Nhập tiêu đề poll..."
                class="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Mô tả</label>
              <textarea
                v-model="form.description"
                placeholder="Mô tả thêm về poll..."
                rows="2"
                class="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition resize-none"
              />
            </div>

            <!-- Options -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Lựa chọn <span class="text-red-500">*</span>
                <span class="text-gray-400 font-normal ml-1">(tối thiểu 2)</span>
              </label>
              <div class="space-y-2">
                <div
                  v-for="(option, index) in form.options"
                  :key="index"
                  class="flex items-center gap-2"
                >
                  <span class="text-gray-400 text-sm w-5 text-center shrink-0">{{
                    index + 1
                  }}</span>
                  <input
                    v-model="option.text"
                    type="text"
                    :placeholder="`Lựa chọn ${index + 1}`"
                    class="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition"
                  />
                  <input
                    v-model="option.image"
                    type="text"
                    placeholder="URL ảnh (tuỳ chọn)"
                    class="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 transition"
                  />
                  <button
                    :disabled="form.options.length <= 2"
                    class="text-red-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed text-lg leading-none shrink-0"
                    @click="removeOption(index)"
                  >
                    &times;
                  </button>
                </div>
              </div>
              <button
                class="mt-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                @click="addOption"
              >
                <span class="text-lg leading-none">+</span> Thêm lựa chọn
              </button>
            </div>

            <!-- Multiple selection -->
            <div class="flex items-center gap-3">
              <input
                id="multipleSelection"
                v-model="form.multipleSelection"
                type="checkbox"
                class="w-4 h-4 accent-indigo-600"
              />
              <label
                for="multipleSelection"
                class="text-sm font-medium text-gray-700 cursor-pointer"
              >
                Cho phép chọn nhiều
              </label>
            </div>

            <div v-if="form.multipleSelection">
              <label class="block text-sm font-semibold text-gray-700 mb-1"
                >Số lựa chọn tối đa</label
              >
              <input
                v-model.number="form.maxSelections"
                type="number"
                min="2"
                :max="form.options.length"
                class="w-24 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              class="px-5 py-2.5 rounded-xl btn-press border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-semibold transition"
              @click="emit('update:visible', false)"
            >
              Huỷ
            </button>
            <button
              :disabled="!isValid || isLoading"
              class="btn-press px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition"
              @click="handleSubmit"
            >
              {{ isLoading ? 'Đang tạo...' : 'Tạo Poll' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>

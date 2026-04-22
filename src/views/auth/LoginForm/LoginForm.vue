<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Message from 'primevue/message';
import { loginSchema } from '@/views/auth/LoginForm/LoginFormSchema';
import { loginAPI } from '@/lib/api/auth';
import type { IBackendError } from '@/types/global';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'primevue/usetoast';
import { ROUTES } from '@/configs/routes';

const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();
const isLoading = ref(false);
const serverError = ref('');
const errors = ref<Record<string, string>>({});
const loginData = reactive({ email: '', password: '' });

function resetState() {
  serverError.value = '';
  errors.value = {};
}
defineExpose({ resetState });

const handleLogin = async () => {
  resetState();
  const result = loginSchema.safeParse(loginData);

  if (!result.success) {
    result.error.issues.forEach((issue) => {
      errors.value[issue.path[0] as string] = issue.message;
    });
    return;
  }

  isLoading.value = true;
  try {
    const res = await loginAPI(result.data);
    if (res.success) {
      authStore.setAuth(res.data.user, res.data.accessToken);
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Chào mừng bạn quay trở lại!',
        life: 1000,
      });
      router.push(ROUTES.DASHBOARD);
    } else {
      serverError.value = res.message || 'Đăng nhập thất bại';
    }
  } catch (err) {
    const error = err as IBackendError;
    serverError.value = error.message || 'Đăng nhập thất bại';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="h-full flex flex-col justify-center">
    <div class="text-center mb-8">
      <h2 class="text-3xl font-black text-emerald-600 tracking-tight">VOTELY</h2>
      <p class="text-slate-500 font-medium">Chào mừng bạn trở lại!</p>
    </div>

    <Message v-if="serverError" severity="error" variant="simple" class="mb-4">
      {{ serverError }}
    </Message>

    <form @submit.prevent="handleLogin" class="flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <InputText
          v-model="loginData.email"
          placeholder="Email"
          class="p-3"
          :class="{ 'p-invalid': errors.email }"
          :disabled="isLoading"
        />
        <small v-if="errors.email" class="text-red-500 text-xs ml-1">{{ errors.email }}</small>
      </div>

      <div class="flex flex-col gap-1">
        <Password
          v-model="loginData.password"
          placeholder="Mật khẩu"
          :feedback="false"
          toggleMask
          class="w-full"
          :inputClass="['w-full p-3', { 'p-invalid': errors.password }]"
          :disabled="isLoading"
        />
        <small v-if="errors.password" class="text-red-500 text-xs ml-1">{{
          errors.password
        }}</small>
      </div>

      <Button
        type="submit"
        label="Đăng nhập ngay"
        icon="pi pi-sign-in"
        class="btn-press w-full p-3 font-bold mt-2 btn-press bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors"
        severity="emerald"
        :loading="isLoading"
      />
    </form>
  </div>
</template>

<style scoped>
:deep(.p-password-input) {
  width: 100% !important;
}
</style>

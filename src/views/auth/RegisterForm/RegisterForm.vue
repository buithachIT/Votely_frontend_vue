<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Message from 'primevue/message';
import Checkbox from 'primevue/checkbox';
import { registerSchema, type RegisterInput } from '@/views/auth/RegisterForm/RegisterFormSchema';
import { registerAPI } from '@/lib/api/auth';
import type { IBackendError } from '@/types/global';

const emit = defineEmits<{ registered: [] }>();

const toast = useToast();
const isLoading = ref(false);
const serverError = ref('');
const errors = ref<Record<string, string>>({});
const registerData = reactive<RegisterInput>({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  terms: false,
  marketing_emails: false,
});

function resetState() {
  serverError.value = '';
  errors.value = {};
}
defineExpose({ resetState });

const handleRegister = async () => {
  resetState();
  const result = registerSchema.safeParse(registerData);

  if (!result.success) {
    result.error.issues.forEach((issue) => {
      errors.value[issue.path[0] as string] = issue.message;
    });
    return;
  }

  isLoading.value = true;
  try {
    const res = await registerAPI(result.data);
    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: res.message || 'Đăng ký thành công!',
      life: 3000,
    });
    emit('registered');
  } catch (err) {
    const error = err as IBackendError;
    serverError.value = error.message || 'Đăng ký thất bại';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="h-full flex flex-col justify-center">
    <div class="text-center mb-6">
      <h2 class="text-2xl font-black text-slate-800 uppercase tracking-tight">Tham gia Votely</h2>
      <p class="text-sm text-slate-500 font-medium">Tạo tài khoản để bắt đầu bình chọn</p>
    </div>

    <Message v-if="serverError" severity="error" variant="simple" class="mb-4">
      {{ serverError }}
    </Message>

    <form @submit.prevent="handleRegister" class="space-y-3">
      <div class="grid grid-cols-2 gap-3">
        <div class="flex flex-col gap-1">
          <InputText
            v-model="registerData.firstName"
            placeholder="Họ"
            :class="{ 'p-invalid': errors.firstName }"
          />
          <small v-if="errors.firstName" class="text-red-500 text-xs ml-1">{{
            errors.firstName
          }}</small>
        </div>
        <div class="flex flex-col gap-1">
          <InputText
            v-model="registerData.lastName"
            placeholder="Tên"
            :class="{ 'p-invalid': errors.lastName }"
          />
          <small v-if="errors.lastName" class="text-red-500 text-xs ml-1">{{
            errors.lastName
          }}</small>
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <InputText
          v-model="registerData.email"
          placeholder="Email"
          class="w-full"
          :class="{ 'p-invalid': errors.email }"
        />
        <small v-if="errors.email" class="text-red-500 text-xs ml-1">{{ errors.email }}</small>
      </div>

      <div class="flex flex-col gap-1">
        <InputText
          v-model="registerData.phone"
          placeholder="Số điện thoại (0912345678)"
          class="w-full"
          :class="{ 'p-invalid': errors.phone }"
        />
        <small v-if="errors.phone" class="text-red-500 text-xs ml-1">{{ errors.phone }}</small>
      </div>

      <div class="flex flex-col gap-1">
        <Password
          v-model="registerData.password"
          placeholder="Mật khẩu"
          :feedback="false"
          toggleMask
          class="w-full"
          :inputClass="['w-full', { 'p-invalid': errors.password }]"
        />
        <small v-if="errors.password" class="text-red-500 text-xs ml-1">{{
          errors.password
        }}</small>
      </div>

      <div class="flex flex-col gap-1">
        <Password
          v-model="registerData.confirmPassword"
          placeholder="Xác nhận mật khẩu"
          :feedback="false"
          toggleMask
          class="w-full"
          :inputClass="['w-full', { 'p-invalid': errors.confirmPassword }]"
        />
        <small v-if="errors.confirmPassword" class="text-red-500 text-xs ml-1">{{
          errors.confirmPassword
        }}</small>
      </div>

      <div class="flex flex-col gap-1">
        <div class="flex items-start gap-2">
          <Checkbox
            v-model="registerData.terms"
            :binary="true"
            inputId="terms"
            :class="{ 'p-invalid': errors.terms }"
          />
          <label for="terms" class="text-xs text-slate-600 cursor-pointer">
            Tôi đồng ý với
            <a href="#" class="text-emerald-600 font-bold hover:underline"
              >Điều khoản & Điều kiện</a
            >
          </label>
        </div>
        <small v-if="errors.terms" class="text-red-500 text-xs ml-1">{{ errors.terms }}</small>
      </div>

      <Button
        type="submit"
        label="Đăng ký ngay"
        icon="pi pi-user-plus"
        class="w-full mt-2 font-bold p-3 btn-press"
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

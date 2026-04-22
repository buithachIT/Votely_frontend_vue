<script setup lang="ts">
import { ref } from 'vue';
import LoginForm from './LoginForm/LoginForm.vue';
import RegisterForm from './RegisterForm/RegisterForm.vue';

const isLogin = ref(true);
const loginForm = ref<InstanceType<typeof LoginForm>>();
const registerForm = ref<InstanceType<typeof RegisterForm>>();

const switchPanel = (toLogin: boolean) => {
  isLogin.value = toLogin;
  if (toLogin) loginForm.value?.resetState();
  else registerForm.value?.resetState();
};
</script>

<template>
  <div class="flex items-center max-w-5xl mx-auto justify-center p-4 overflow-hidden">
    <div class="relative w-full h-162.5 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-row">
      <div
        class="w-1/2 h-full px-12 transition-all duration-700 ease-in-out"
        :class="isLogin ? 'opacity-100' : 'opacity-0 pointer-events-none -translate-x-5'"
      >
        <LoginForm ref="loginForm" />
      </div>

      <div
        class="w-1/2 h-full px-12 transition-all duration-700 ease-in-out"
        :class="!isLogin ? 'opacity-100' : 'opacity-0 pointer-events-none translate-x-5'"
      >
        <RegisterForm ref="registerForm" @registered="switchPanel(true)" />
      </div>

      <div
        class="absolute top-0 left-0 h-full w-1/2 bg-emerald-600 flex flex-col items-center justify-center p-12 text-white transition-all duration-700 ease-in-out z-20"
        :style="{ transform: isLogin ? 'translateX(100%)' : 'translateX(0)' }"
      >
        <h2 class="text-4xl font-black mb-4">{{ isLogin ? 'CHÀO BẠN MỚI!' : 'MỪNG TRỞ LẠI!' }}</h2>
        <p class="text-center mb-10 font-medium leading-relaxed">
          {{
            isLogin
              ? 'Đăng ký tài khoản để khám phá các tính năng bình chọn tuyệt vời của Votely.'
              : 'Đăng nhập để tiếp tục quản lý các cuộc bình chọn của bạn.'
          }}
        </p>
        <button
          @click="switchPanel(!isLogin)"
          class="border-2 btn-press border-white px-12 py-3 rounded-full font-black uppercase tracking-widest hover:bg-white hover:text-emerald-600 transition-all active:scale-95"
        >
          {{ isLogin ? 'Đăng ký' : 'Đăng nhập' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.p-inputtext) {
  padding: 0.75rem 1rem;
  border-radius: 12px;
}
.transition-all {
  transition-timing-function: cubic-bezier(0.645, 0.045, 0.355, 1);
}
</style>

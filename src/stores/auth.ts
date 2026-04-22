import { ROUTES } from '@/configs/routes';
import { KEY_STORAGE } from '@/consts/storage';
import { fetchProfileAPI, logoutAPI } from '@/lib/api/auth';
import type { IBackendError, IUser } from '@/types/global';
import { defineStore } from 'pinia';
import { useToast } from 'primevue/usetoast';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

export const useAuthStore = defineStore('auth', () => {
  const toast = useToast();
  const router = useRouter();
  const user = ref<IUser | null>(null);
  const accessToken = ref<string | null>(
    localStorage.getItem(KEY_STORAGE.ACCESS_TOKEN)
  );
  const isLoading = ref(false);
  const isAuthenticated = computed(() => !!accessToken.value);
  const userFullName = computed(() =>
    user.value ? `${user.value.lastName} ${user.value.firstName}` : 'Guest'
  );
  const isInitialized = ref(false);

  function setAuth(userData: IUser, token: string) {
    user.value = userData;
    accessToken.value = token;
    localStorage.setItem(KEY_STORAGE.ACCESS_TOKEN, token);
  }

  function logout() {
    logoutAPI().catch((err) => {
      console.error('Logout API error:', err);
    });
    if (toast) {
      toast.add({
        severity: 'info',
        summary: 'Đã đăng xuất',
        detail: 'Hẹn gặp lại bạn nhé!',
        life: 3000,
      });
    }
    user.value = null;
    accessToken.value = null;
    isInitialized.value = false;
    localStorage.removeItem(KEY_STORAGE.ACCESS_TOKEN);

    router.push(ROUTES.LOGIN);
  }

  async function fetchUser() {
    if (!accessToken.value) return false;

    isLoading.value = true;
    try {
      const res = await fetchProfileAPI();
      user.value = res.data;
      return true;
    } catch (err) {
      const error = err as IBackendError;
      console.error('Fetch user failed:', error);
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function initialize() {
    if (isInitialized.value) return true;

    let success = true;
    if (accessToken.value) {
      success = await fetchUser();
    }
    isInitialized.value = true;
    return success;
  }

  return {
    user,
    accessToken,
    isAuthenticated,
    isInitialized,
    userFullName,
    setAuth,
    logout,
    initialize,
  };
});

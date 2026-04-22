import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { ROUTES } from '@/configs/routes';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: DefaultLayout,
      redirect: ROUTES.DASHBOARD,
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/dashboard/DashboardView.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: ROUTES.LOGIN,
          name: 'login',
          component: () => import('@/views/auth/AuthView.vue'),
        },
        {
          path: ROUTES.MY_POLLS,
          name: 'my-polls',
          component: () => import('@/views/poll-room/MyPollsView.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: `${ROUTES.POLLROOM}/:code`,
          name: 'pollroom-detail',
          component: () =>
            import('@/views/poll-room/PollRoomDetail/PollRoomDetail.vue'),
          meta: { requiresAuth: true },
        },
      ],
    },
  ],
});
NProgress.configure({ showSpinner: false, speed: 500 });
router.beforeEach(async (to) => {
  NProgress.start();
  const authStore = useAuthStore();

  const isLoginPage = to.path === ROUTES.LOGIN;
  const requiresAuth = to.meta.requiresAuth;

  if (authStore.isAuthenticated && isLoginPage) {
    return ROUTES.DASHBOARD;
  }

  if (requiresAuth && !authStore.isAuthenticated) {
    return ROUTES.LOGIN;
  }
});

router.afterEach(() => {
  NProgress.done();
});

export default router;

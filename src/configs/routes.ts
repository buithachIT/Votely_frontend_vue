export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  POLLROOM: '/pollroom',
  MY_POLLS: '/my-polls',
  POLL_DETAIL: (code: string) => `/pollroom/${code}`,
};

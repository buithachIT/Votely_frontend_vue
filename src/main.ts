import './assets/tailwind.css';
import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import { createPinia } from 'pinia';
import ToastService from 'primevue/toastservice';
import App from './App.vue';
import router from './router';
import Ripple from 'primevue/ripple'; // 1. Import Directive này
const app = createApp(App);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      primitive: {
        fontFamily: 'Nunito, sans-serif',
      },
    },
  },
});
app.use(createPinia());
app.use(router);
app.use(ToastService);
app.directive('ripple', Ripple);
app.mount('#app');

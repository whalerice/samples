import { boot } from 'quasar/wrappers';
import axios, { AxiosInstance } from 'axios';
import Antd from 'ant-design-vue';
import Vue3Lottie from 'vue3-lottie';
import vue3ExtendCalendar from 'vue3-extend-calendar';
import 'vue3-extend-calendar/dist/style.css';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
  }

  export interface GlobalComponents {
    LottieAnimation: typeof import('vue3-lottie')['Vue3Lottie'];
  }
}

const api = axios.create();

const getSiteIdx = () => {
  fetch('/config.json')
    .then((response) => response.json())
    .then((config) => {
      api.defaults.baseURL = config.URL;
    });
};

getSiteIdx();

// const api = axios.create({ baseURL: 'http://58.151.190.236:8077/' });
// const api = axios.create({ baseURL: process.env.API_URL });

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;

  app.use(Antd);
  app.use(vue3ExtendCalendar);
  app.use(Vue3Lottie, { name: 'LottieAnimation' });
});

export { api, axios };

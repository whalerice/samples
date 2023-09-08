import { boot } from 'quasar/wrappers';
import { Notify, QSpinnerRings } from 'quasar';
import { Modal, Carousel } from 'ant-design-vue';
import axios, { AxiosInstance } from 'axios';
import Vue3Lottie from 'vue3-lottie';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $BALANCE_LIST: { label: string; textColor: string; state: number }[];
  }

  export interface GlobalComponents {
    LottieAnimation: typeof import('vue3-lottie')['Vue3Lottie'];
  }
}

let siteIdx = 0;
const api = axios.create();

const getSiteIdx = () => {
  fetch('/config.json')
    .then((response) => response.json())
    .then((config) => {
      siteIdx = config.SITE_IDX;
      api.defaults.baseURL = config.URL;
    });
};

getSiteIdx();

const notify = (data: INotify) => {
  Notify.create({
    color: data.color,
    textColor: data.textColor,
    message: data.message,
    spinner: QSpinnerRings,
    spinnerSize: data.spinnerSize,
    position: data.position,
    badgeClass: 'display-test',
    timeout: data.timeout,
  });
};

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
  app.config.globalProperties.$BALANCE_LIST = [
    {
      label: 'cash',
      textColor: 'yellow-01',
      state: 0,
    },
    {
      label: 'point',
      textColor: 'blue-01',
      state: 0,
    },
    {
      label: 'rolling',
      textColor: 'pink-01',
      state: 1,
    },
    {
      label: 'losing',
      textColor: 'purple-03',
      state: 2,
    },
  ];

  app.use(Modal).use(Carousel);
  app.use(Vue3Lottie, { name: 'LottieAnimation' });
});

export { api, axios, siteIdx, notify };

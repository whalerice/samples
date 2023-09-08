import { createApp } from 'vue';
import Antd from 'ant-design-vue';
import i18n from '@/assets/i18n';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import vue3IntlInput from 'vue3-intl-input';
import vue3ImageView from 'vue3-image-view';
import $ from 'jquery';

import App from '@/App.vue';
import store from '@/store';
import router from '@/router';

import 'ant-design-vue/dist/antd.css';
import 'vue3-intl-input/dist/style.css';
import 'vue3-image-view/dist/style.css';
import '@/assets/scss/main.scss';

window.$ = window.jQuery = $;
library.add(fas);

const app = createApp(App);
app.component('fa-icon', FontAwesomeIcon);
app.config.productionTip = false;

app.use(i18n).use(Antd).use(store).use(router);
app.use(vue3ImageView);
app.use(vue3IntlInput);
app.mount('#app');

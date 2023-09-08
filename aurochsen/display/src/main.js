import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

Vue.config.productionTip = false;

import Fragment from 'vue-fragment';
// import axios from 'axios';
// import VueAxios from 'vue-axios';

import '@/filters';
import '@/App.scss';


Vue.use(Fragment.Plugin);
// Vue.use(VueAxios, axios);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

<template>
  <a-config-provider :locale="locale">
    <router-view />
  </a-config-provider>
</template>

<script setup>
import { computed, onBeforeMount, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
// import { partner } from '@/assets/js/global.js';

import i18n from '@/assets/i18n';
import enUS from 'ant-design-vue/es/locale/en_US';
import koKR from 'ant-design-vue/es/locale/ko_KR';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import jaJP from 'ant-design-vue/es/locale/ja_JP';

const router = useRouter();
const store = useStore();
const token = computed(() => store.state['sign'].token);
const setLocale = computed(() => store.state['common'].currentLocale);

const locale = ref(enUS);

const itemList = [
  'token',
  'signInfo',
  'subordinateUsersList',
  'chartFollowers',
  'userInfo',
  'followersSn',
  'allUsersList',
  'managers',
  'managerAlarmList',
  'partnerInfo',
  'coinList',
  'currencyList',
  'timezoneList',
  'shareSASQuery',
  'walletsInfo',
  'notification',
  'otpIsRegister',
  'csNoticeCategoryList',
  'partnerWallets',
];

const storageGetItem = (getList) => {
  return JSON.parse(sessionStorage.getItem(getList));
};

const browserLanguage = () => {
  const ko = navigator.language === 'ko' || navigator.language === 'ko-KR';
  const zh = navigator.language === 'zh' || navigator.language === 'zh-CN';
  const jp = navigator.language === 'ja' || navigator.language === 'ja-JP';

  let lang = ko ? 'ko' : zh ? 'zh' : jp ? 'jp' : 'en';
  return lang;
};

if (storageGetItem('_signInfo')) {
  for (let i = 0; i < itemList.length; i++) {
    store.state[itemList[i] === 'walletsInfo' ? 'trade' : itemList[i] === 'otpIsRegister' ? 'otp' : 'sign'][
      itemList[i]
    ] = storageGetItem('_' + itemList[i]);
  }

  store.state['common'].currentLocale = JSON.parse(sessionStorage.getItem('_lang'));
}

router.beforeEach((to, from) => {
  if (to.meta.needLogin && token.value === null) return { path: '/sign-in' };

  if (to.path !== from.path) {
    store.state['common'].isSidebar = false;
  }

  if (to.meta.grade?.indexOf(store.state['sign'].signInfo.grade) === -1) {
    return router.push('/');
  }

  window.scrollTo(0, 0);
});

const change = (item) => {
  i18n.global.locale.value = item;
  document.documentElement.lang = item;
  store.commit('common/CHANGE_LOCALE', item);
};

watch(setLocale, (item) => {
  locale.value = item === 'ko' ? koKR : item === 'zh' ? zhCN : item === 'jp' ? jaJP : enUS;
});

onBeforeMount(() => {
  store.state['common'].isDeviceMobile = window.innerWidth < 992 ? true : false;

  // document.title = 'CPASS BACKOFFICE';
  const saveLang = JSON.parse(sessionStorage.getItem('_lang'));
  let currentLang = saveLang === null ? browserLanguage() : saveLang;
  change(currentLang);

  // isPartner.value = [...partner].filter((e) => e === grade.value).length > 0;
});
</script>

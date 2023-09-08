<template>
  <q-layout view="lHh Lpr lff">
    <q-header>
      <Header />
    </q-header>
    <SideBar />

    <q-page-container>
      <div class="custom-container">
        <a-config-provider :locale="locale">
          <router-view />
        </a-config-provider>
      </div>
    </q-page-container>
  </q-layout>
  <a-statistic-countdown :value="deadline" @finish="onFinish" format="mm:ss" class="countdown" />
  <NotifySound v-if="isSound" />
</template>

<script setup lang="ts">
import Header from 'layouts/Header.vue';
import SideBar from 'layouts/SideBar.vue';
import NotifySound from 'src/components/NotifySound.vue';

import { storeToRefs } from 'pinia';
import { onBeforeMount, ref, watch } from 'vue';

import { userStore } from 'src/stores/user';
import { commonStore } from 'src/stores/common';

const { current } = storeToRefs(commonStore.locale());
const { siteStatistics } = userStore.summary();
const deadline = ref<any>(Date.now() + 1000 * 300); // 5분

const locale = ref();
const isSound = ref<boolean>(false);

// 알림 사운드 이벤트
// const notifySound = () => {
//   isSound.value = true;
//   setTimeout(() => {
//     isSound.value = false;
//   }, 3000);
// };
watch(current, (item) => {
  locale.value = item.pack;
});

const onFinish = () => {
  deadline.value = Date.now() + 1000 * 300;
  siteStatistics();
};

onBeforeMount(() => {
  siteStatistics();
  // notifySound();
});
</script>

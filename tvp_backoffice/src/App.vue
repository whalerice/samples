<template>
  <a-config-provider :locale="currentLocale" componentSize="small">
    <!-- <router-view v-slot="{ Component, route }">
      <component
        :is="Component"
        :key="route.path"
        :current-locale="currentLocale"
        @change-current-locale="changeCurrentLocale"
      />
    </router-view> -->

    <router-view />
  </a-config-provider>
</template>

<script setup lang="ts">
import 'dayjs/locale/ko';
import 'dayjs/locale/ja';
import 'dayjs/locale/zh-cn';
import { LocalStorage } from 'quasar';
import { computed, onMounted } from 'vue';
import { role } from '@/boot/global';
import { useCommonStore } from '@/stores/common-store';
import { roleNames } from '@/router/routes';
import { api } from '@/boot/axios';

const currentLocale = computed(() => useCommonStore().currentLocale);

if (LocalStorage.getItem<IAppLanguages>('lang')) {
  document.documentElement.lang =
    LocalStorage.getItem<IAppLanguages>('lang')?.isoName ?? '';
}

const load = async () => {
  const token = LocalStorage.getItem('token');
  if (!token) {
    return;
  }

  try {
    await loadSelf();
  } catch (ex) {
    LocalStorage.remove('token');
    location.reload();
  }
};

const loadSelf = async () => {
  switch (role) {
    case roleNames.master:
      await api.admin.auth.self();
      break;

    case roleNames.partner:
    case roleNames.agent:
      await api.operator.auth.self();
      break;

    default:
      throw '';
  }
};

onMounted(() => {
  load();
});
</script>

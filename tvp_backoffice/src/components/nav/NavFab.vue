<template>
  <a-dropdown placement="bottomRight" :trigger="['click']">
    <a-button type="text" class="btn-setting">
      <template #icon>
        <SettingOutlined />
      </template>
    </a-button>
    <template #overlay>
      <a-menu class="column">
        <TranslateLanguage />
        <ThemeSwitch />
      </a-menu>
    </template>
  </a-dropdown>
</template>

<script setup lang="ts">
import ThemeSwitch from '@/components/ThemeSwitch.vue';
import TranslateLanguage from '@/components/TranslateLanguage.vue';
import { useQuasar, LocalStorage } from 'quasar';
import { ref, watch, onBeforeMount } from 'vue';
import { SettingOutlined } from '@ant-design/icons-vue';

const $q = useQuasar();
const darkMode = ref(false);

watch(darkMode, (darkMode: boolean) => {
  $q.dark.set(darkMode);
  LocalStorage.set('dm', String(darkMode));
});

onBeforeMount(() => {
  LocalStorage.getItem('dm') === 'true'
    ? ((darkMode.value = true), $q.dark.set(true))
    : (darkMode.value = false);
});
</script>

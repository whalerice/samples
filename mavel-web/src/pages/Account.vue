<template>
  <h2 class="mb-30">{{ $t('nav.account') }}</h2>
  <q-tabs inline-label no-caps dense align="left" class="mb-60">
    <q-route-tab v-for="menu in tabs" :to="menu.path" :key="menu.meta.name" :label="$t(menu.meta.title)" exact />
  </q-tabs>

  <router-view />
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const tabs = ref();

onMounted(() => {
  tabs.value = router.options.routes.filter((e) => e.path === '/account')[0].children;
});
</script>

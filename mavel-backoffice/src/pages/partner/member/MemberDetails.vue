<template>
  <q-tabs no-caps align="left" class="q-mb-lg">
    <q-route-tab
      v-for="tab in tabs"
      :to="{ name: tab.name, ...params }"
      exact
      replace
      :label="$t(tab.meta?.title)"
      :key="tab.name" />
  </q-tabs>

  <router-view />
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { onBeforeMount, ref } from 'vue';

const route = useRoute();
const router = useRouter();

const tabs = ref<any[] | undefined>([]);

const params = { params: route.params, query: route.query };

onBeforeMount(() => {
  tabs.value = router.options.routes[1].children?.filter((e) => e.name === 'PartnerMemberDetails')[0].children;
});
</script>

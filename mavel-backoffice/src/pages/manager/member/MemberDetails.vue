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

import { RewardType } from 'src/components/models/enums';
import { userStore } from 'src/stores/user';

const route = useRoute();
const router = useRouter();

const { onUserDetail } = userStore.user();

const tabs = ref<any[] | undefined>([]);
const params = { params: route.params, query: route.query };

const getTabs = (rewardType: number) => {
  const child: any = router.options.routes[0].children?.filter((e) => e.name === 'MemberDetails')[0].children;

  let list: any[] = [];
  if (rewardType === RewardType.Rolling) {
    list = child.filter((e: any) => e.name !== 'LosingHistory');
  } else if (rewardType === RewardType.Losing) {
    list = child.filter((e: any) => e.name !== 'RollingHistory');
  } else {
    list = child.filter((e: any) => e.name !== 'RollingHistory' && e.name !== 'LosingHistory');
  }

  return list;
};

const onDetail = async (idx: number) => {
  await onUserDetail({ user_Idx: idx }).then((e) => {
    tabs.value = getTabs(e.rewardType);
  });
};

onBeforeMount(() => {
  onDetail(Number(route.params.idx));
});
</script>

<template>
  <a-page-header class="page-header">
    <template #title>
      <q-btn
        unelevated
        flat
        round
        dense
        icon="menu_open"
        @click="sideBarCollapse"
        class="sidebar-toggle"
        color="white" />
      <a-row :gutter="[5, 2]">
        <a-col v-for="item in topFunction" :key="item.key">
          <q-btn no-caps unelevated color="blue" :label="`${comma(item.value)}`" :icon="item.icon" :to="item.to">
            <!-- @click="showModal(item.component, item.title)" -->
            <q-tooltip anchor="bottom middle" self="top middle">{{ $t(item.title) }}</q-tooltip>
          </q-btn>
        </a-col>
      </a-row>
    </template>
    <template #extra>
      <a-row :gutter="[0, 2]" justify="end">
        <a-col v-for="(item, idx) in topSummary" :key="item.key">
          <a-divider type="vertical" class="bg-grey-7" v-if="idx !== 0" />
          <q-btn
            no-caps
            dense
            unelevated
            flat
            color="white"
            :to="item.to"
            :label="`${$t(item.title)} ${comma(item.value)}`" />
        </a-col>
      </a-row>
      <a-space :size="10" class="q-ml-md col-auto">
        <q-btn unelevated dense :icon="onSound ? 'volume_up' : 'volume_off'" @click="soundToggle" />
        <q-icon name="person" size="xs" />
        <span>{{ user }}</span>
        <!-- <q-btn no-caps unelevated dense icon="person" :label="user" disable /> -->
      </a-space>
    </template>
  </a-page-header>

  <a-page-header class="page-header inset">
    <template #title>
      <a-breadcrumb v-if="!currentPageName?.meta.queryPage">
        <a-breadcrumb-item v-if="currentPageName.matched.length > 2">
          {{ $t(currentPageName.matched[1].meta.title) }}
        </a-breadcrumb-item>
        <a-breadcrumb-item>
          <component :is="currentPageName.meta.icon" />
          {{ $t(currentPageName?.meta.title) }}
        </a-breadcrumb-item>
      </a-breadcrumb>

      <a-breadcrumb v-else>
        <a-breadcrumb-item>
          <component :is="currentPageName.meta.icon" />
          {{ route.query.user }}
        </a-breadcrumb-item>
      </a-breadcrumb>
    </template>
    <template #extra>
      <Translate />
    </template>
  </a-page-header>
</template>
<script setup lang="ts">
import Translate from 'components/Translate.vue';

import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import { onBeforeMount, ref, watch } from 'vue';

import { commonStore } from 'src/stores/common';
import { userStore } from 'src/stores/user';
import { comma } from 'src/boot/global';
import { UserType, RewardType } from 'src/components/models/enums';

const { sideBarCollapse } = commonStore.ui();
const { onSound } = storeToRefs(commonStore.ui());
const { summaryData } = storeToRefs(userStore.summary());
const { memberType } = storeToRefs(userStore.sign());
const { userInfo } = storeToRefs(userStore.user());
const user = ref<string | undefined>('');

interface IMenu {
  key: number | string;
  to?: string;
  title: string;
  value: number;
  component?: object;
  icon?: string;
}

const router = useRouter();
const route = useRoute();

const currentPageName = ref<any>('');

const topFunction = ref<IMenu[]>([]);

const topSummary = ref<IMenu[]>([]);

const soundToggle = () => {
  onSound.value = !onSound.value;
};

watch(router.currentRoute, (v) => {
  currentPageName.value = v;
});

watch(summaryData, (item) => {
  if (item !== null) {
    for (let i = 0; i < topSummary.value.length; i++) {
      const el = topSummary.value[i];
      el.value = item[el.key];
    }

    for (let i = 0; i < topFunction.value.length; i++) {
      const el = topFunction.value[i];
      el.value = item[el.key];
    }
  }
});

onBeforeMount(() => {
  currentPageName.value = router.currentRoute.value;
  user.value = userInfo.value?.user_Id;

  if (memberType.value === UserType.Manager) {
    topFunction.value = [
      {
        key: 'applyAffiliate',
        title: 'common.button.application_office',
        value: 0,
        to: '/member/application',
        icon: 'domain',
      },
      {
        key: 'applyUser',
        title: 'common.button.application_user',
        value: 0,
        to: '/member',
        icon: 'person',
      },
      {
        key: 'customerDepoist',
        title: 'common.button.deposit_no_bankbook',
        value: 0,
        to: '/charging',
        // component: Charging,
        icon: 'add',
      },
      {
        key: 'customerWithdraw',
        title: 'common.button.withdrawal_no_bankbook',
        value: 0,
        to: '/exchange',
        // component: Charging,
        icon: 'remove',
      },
      {
        key: 'rollingApplyCnt',
        title: 'common.button.rolling_change',
        value: 0,
        to: '/settlement/rolling',
        // component: Charging,
        icon: 'svguse:/img/icons.svg#custom-rolling',
      },
      {
        key: 'lossingApplyCnt',
        title: 'common.button.losing_change',
        value: 0,
        to: '/settlement/losing',
        // component: Charging,
        icon: 'svguse:/img/icons.svg#custom-losing',
      },
      {
        key: 'unread',
        title: 'common.button.inquiries_member',
        value: 0,
        to: '/support/inquiry-note',
        // component: Note,
        icon: 'sticky_note_2',
      },
    ];
    topSummary.value = [
      { key: 'completionUser', to: '/member', title: 'common.button.subscribers_today', value: 0 },
      { key: 'chargeCompletion', to: '/charging', title: 'common.button.depositors_today', value: 0 },
      { key: 'exchangeCompletion', to: '/exchange', title: 'common.button.withdrawals_today', value: 0 },
    ];
  } else {
    topFunction.value = [
      {
        key: 'applyUserCnt',
        title: 'common.button.application_user',
        value: 0,
        to: '/p/member/management',
        icon: 'person',
      },
      {
        key: 'rewardApplyCnt',
        title: 'common.button.reward_switching',
        value: 0,
        to: `/p/settlement/${userInfo.value?.rewardType === RewardType.Rolling ? 'rolling' : 'losing'}`,
        icon: 'stars',
      },
    ];

    topSummary.value = [
      { key: 'completionUserCnt', to: '/member', title: 'common.button.subscribers_today', value: 0 },
      { key: 'chargeCompletionCnt', to: '/charging', title: 'common.button.depositors_today', value: 0 },
      { key: 'exchangeCompletionCnt', to: '/exchange', title: 'common.button.withdrawals_today', value: 0 },
    ];
  }
});
</script>

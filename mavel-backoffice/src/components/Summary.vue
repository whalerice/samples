<template>
  <div>
    <q-btn
      flat
      unelevated
      round
      color="white"
      icon="refresh"
      class="q-ml-sm"
      :class="{ 'fa-spin': isRefreshStatistics }"
      @click="onRefresh" />
  </div>
  <ul v-if="!isMiniMode" class="side-info-area">
    <li class="side-info-item">
      <div class="name">{{ $t('summary.today') }}</div>
      <div class="side">
        {{ date ? dayjs(date).format('YYYY-MM-DD') : date }}
      </div>
    </li>
    <li v-for="item in summary" :key="item.key" class="side-info-item" :class="item.color ? `text-${item.color}` : ''">
      <div class="name">{{ item.label() }}</div>
      <div class="side">
        {{ comma(item.value) }}
        <span v-if="item.unit" class="unit">{{ item.unit() }}</span>
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { storeToRefs } from 'pinia';
import { onBeforeMount, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { comma } from 'src/boot/global';
import { SiteGrade, UserType } from 'src/components/models/enums';
import { commonStore } from 'src/stores/common';
import { userStore } from 'src/stores/user';

dayjs.extend(relativeTime);

const { t } = useI18n();
const { isMiniMode } = storeToRefs(commonStore.ui());
const { siteIdx } = storeToRefs(userStore.user());
const { memberType } = storeToRefs(userStore.sign());
const { siteStatistics } = userStore.summary();
const { summaryData, isRefreshStatistics } = storeToRefs(userStore.summary());

const date = ref<string | undefined>('');
const summary = ref<ISummary[]>([
  {
    key: 'cash',
    label: () => t('summary.cash'),
    value: 0,
    color: 'amber',
  },
  {
    key: 'point',
    label: () => t('summary.point'),
    value: 0,
    color: 'blue',
  },
  {
    key: 'charge',
    label: () => t('summary.charge'),
    value: 0,
    color: 'light-green',
  },
  {
    key: 'exchange',
    label: () => t('summary.exchange'),
    value: 0,
    color: 'red-5',
  },
]);

const onRefresh = () => {
  siteStatistics();
};

watch(summaryData, (item: any) => {
  if (item !== null) {
    date.value = item.inputDate;

    for (let i = 0; i < summary.value.length; i++) {
      const el = summary.value[i];
      el.value = item[el.key];
    }
  }
});

onBeforeMount(() => {
  // memberType.value === UserType.Manager && siteIdx.value === SiteGrade.Admin

  if (memberType.value === UserType.Manager && siteIdx.value === SiteGrade.Admin) {
    summary.value = [
      {
        key: 'remainingEgg',
        label: () => t('summary.remaining_egg'),
        value: 0,
        unit: () => t('common.game_amount_unit'),
        color: 'cyan',
      },
      ...summary.value,
      {
        key: 'betting',
        label: () => t('summary.batting'),
        value: 0,
        color: 'light-green',
      },
      {
        key: 'win',
        label: () => t('summary.win'),
        value: 0,
        color: 'red-5',
      },
      {
        key: 'chargeRequest',
        label: () => t('summary.charge_request'),
        value: 0,
        color: 'light-green',
      },
      {
        key: 'exchangeRequest',
        label: () => t('summary.exchange_request'),
        value: 0,
        color: 'red-5',
      },
      {
        key: 'unread',
        label: () => t('summary.unread'),
        value: 0,
        color: 'grey',
      },
      {
        key: 'applyUser',
        label: () => t('summary.apply_user'),
        value: 0,
        color: 'deep-purple-5',
      },
      {
        key: 'completionUser',
        label: () => t('summary.completion_user'),
        value: 0,
        color: 'indigo-11',
      },
      {
        key: 'applyAffiliate',
        label: () => t('summary.apply_affiliate'),
        value: 0,
        color: 'lime',
      },
    ];
  } else if (memberType.value === UserType.Manager && siteIdx.value !== SiteGrade.Admin) {
    summary.value = [
      ...summary.value,
      {
        key: 'betting',
        label: () => t('summary.batting'),
        value: 0,
        color: 'light-green',
      },
      {
        key: 'win',
        label: () => t('summary.win'),
        value: 0,
        color: 'red-5',
      },
      {
        key: 'chargeRequest',
        label: () => t('summary.charge_request'),
        value: 0,
        color: 'light-green',
      },
      {
        key: 'exchangeRequest',
        label: () => t('summary.exchange_request'),
        value: 0,
        color: 'red-5',
      },
      {
        key: 'unread',
        label: () => t('summary.unread'),
        value: 0,
        color: 'grey',
      },
      {
        key: 'applyUser',
        label: () => t('summary.apply_user'),
        value: 0,
        color: 'deep-purple-5',
      },
      {
        key: 'completionUser',
        label: () => t('summary.completion_user'),
        value: 0,
        color: 'indigo-11',
      },
      {
        key: 'applyAffiliate',
        label: () => t('summary.apply_affiliate'),
        value: 0,
        color: 'lime',
      },
    ];
  } else {
    summary.value = [
      ...summary.value,
      {
        key: 'bettingPrice',
        label: () => t('summary.batting'),
        value: 0,
        color: 'light-green',
      },
      {
        key: 'bettingWinPrice',
        label: () => t('summary.win'),
        value: 0,
        color: 'red-5',
      },

      {
        key: 'applyUserCnt',
        label: () => t('summary.apply_user'),
        value: 0,
        color: 'deep-purple-5',
      },
      {
        key: 'completionUserCnt',
        label: () => t('summary.completion_user'),
        value: 0,
        color: 'indigo-11',
      },
    ];
  }
});
</script>

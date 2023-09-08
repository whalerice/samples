<template>
  <a-row :gutter="[15, 15]">
    <a-col :span="24">
      <a-card :title="$t('dashboard.title.today_statistics')" size="small">
        <a-row type="flex">
          <a-col flex="1 auto" v-for="item in todayStats" :key="item.key" class="today-stats">
            <strong class="title">{{ item.label() }}</strong>
            <span class="value">{{ comma(item.value) }}</span>
          </a-col>
        </a-row>
      </a-card>
    </a-col>
    <a-col :span="24">
      <a-row :gutter="[15, 15]">
        <a-col :span="8">
          <div class="chart-space">
            <a-card :title="$t('dashboard.title.deposit_withdrawal')" size="small">
              <DashboardPaymentChart />
            </a-card>
            <a-card :title="$t('dashboard.title.betting_win')" size="small">
              <DashboardBettingChart />
            </a-card>
          </div>
        </a-col>
        <a-col :span="16">
          <a-row :gutter="[10, 0]" class="q-mb-md">
            <a-col v-for="item in holdList" :key="item.key" :span="24 / holdList.length">
              <a-card :title="item.label()" size="small" class="text-center">
                {{ comma(item.value) }}
              </a-card>
            </a-col>
          </a-row>
          <a-card
            :title="$t('dashboard.title.recent_user_d_w')"
            size="small"
            :bodyStyle="{ padding: 0, 'min-height': '24rem' }">
            <RecentCashReport />
          </a-card>
        </a-col>
      </a-row>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import RecentCashReport from 'components/RecentCashReport.vue';
import DashboardPaymentChart from 'components/charts/DashboardPaymentChart.vue';
import DashboardBettingChart from 'components/charts/DashboardBettingChart.vue';

import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { comma } from 'src/boot/global';
import { userStore } from 'src/stores/user';
// import { UserType } from 'src/components/models/enums';

const { t } = useI18n();

const { summaryData } = storeToRefs(userStore.summary());
// const { memberType } = storeToRefs(userStore.sign());

const todayStats = ref<any[]>([
  { key: 'charge', value: 0, label: () => t('table.thead.deposit_amount') },
  { key: 'exchange', value: 0, label: () => t('table.thead.withdrawal_amount') },
  { key: 'rewardAmount', value: 0, label: () => t('table.thead.settlement_amount') },
  { key: 'bettingPrice', value: 0, label: () => t('table.thead.betting_amount') },
  { key: 'bettingWinPrice', value: 0, label: () => t('table.thead.win_amount') },
  { key: 'bettingUserCnt', value: 0, label: () => t('table.thead.betting_user') },
  { key: 'completionUserCnt', value: 0, label: () => t('table.thead.subscribed_users') },
]);

const holdList = ref<any[]>([
  { key: 'cash', value: 0, label: () => t('table.thead.member_holding_amount') },
  { key: 'point', value: 0, label: () => t('table.thead.member_holding_point') },
  { key: 'losing', value: 0, label: () => t('table.thead.total_losing') },
  { key: 'rolling', value: 0, label: () => t('table.thead.total_rolling') },
  { key: 'totalBetting', value: 0, label: () => t('table.thead.total_betting_amount') },
  { key: 'totalWin', value: 0, label: () => t('table.thead.total_win_amount') },
]);

const dataBinding = () => {
  for (let i = 0; i < todayStats.value.length; i++) {
    const el = todayStats.value[i];
    el.value = summaryData.value[el.key];
  }
};

watch(summaryData, (item: any) => {
  if (item.inputDate) {
    dataBinding();
  }
});
</script>

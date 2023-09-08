<template>
  <a-card :title="$t('route.title.investment_status')">
    <a-row :gutter="[20, 20]">
      <a-col
        :span="24"
        v-if="[roleNames.master, roleNames.partner].indexOf(role) > -1"
      >
        <a-row :gutter="[20, 20]">
          <a-col
            :xs="24"
            :md="[roleNames.partner].indexOf(role) > -1 ? 24 : 12"
          >
            <InvestmentStatus @update="updateInvestmentStatus" :step="true" />
          </a-col>
          <a-col :xs="24" :md="12" v-if="[roleNames.master].indexOf(role) > -1">
            <a-card>
              <template #title>
                {{ $t('common.word.partner') }} :
                {{ investmentStatusData.partnerTotalCount }}
              </template>

              <a-row
                :gutter="[8, 8]"
                justify="start"
                style="flex-direction: row-reverse"
              >
                <a-col
                  flex="auto"
                  v-for="data in options.steps"
                  :key="data.value"
                >
                  <router-link
                    :to="{
                      name: 'partner-status',
                      query: { step: data.value },
                    }"
                  >
                    {{ data.label() }} :
                    {{
                      $comma(
                        Object.values(investmentStatusData.stepCounts)[
                          data.value
                        ]
                      )
                    }}
                  </router-link>
                </a-col>
              </a-row>
            </a-card>
          </a-col>
        </a-row>
      </a-col>
      <a-col :span="24">
        <a-tabs v-model:activeKey="activeKey" @change="loadInvestmentDetail">
          <a-tab-pane :key="1" :tab="$t('common.word.today')">
            <StatisticAction
              :list="investmentDetailList"
              :data="investmentDetailData"
              :unit="coinLabel"
              :grid="[12, 6, 4]"
              :precision="2"
            />
          </a-tab-pane>
          <a-tab-pane :key="0" :tab="$t('common.word.all')" force-render>
            <StatisticAction
              :list="investmentDetailList"
              :data="investmentDetailData"
              :unit="coinLabel"
              :grid="[12, 6, 4]"
              :precision="2"
            />
          </a-tab-pane>
        </a-tabs>
      </a-col>
    </a-row>
  </a-card>
  <div class="q-mb-md"></div>
  <a-card :title="$t('common.word.member_status')">
    <StatisticAction
      :list="memberStatusList"
      :data="memberStatusData"
      :unit="$t('common.word.people')"
    />
  </a-card>
  <div class="q-mb-md"></div>
  <a-card :title="$t('common.word.results_by_round')">
    <template #extra>
      <a-radio-group v-model:value="chartDay" @change="loadGamePrediction">
        <a-radio-button :value="1">
          {{ $t('common.word.1day') }}
        </a-radio-button>
        <a-radio-button :value="7">
          {{ $t('common.word.7day') }}
        </a-radio-button>
        <a-radio-button :value="30">
          {{ $t('common.word.1month') }}
        </a-radio-button>
      </a-radio-group>
    </template>

    <a-row :gutter="[0, 0]" v-if="gamePredictionData" align="middle">
      <a-col :xs="24" :lg="18">
        <ProgressCircle
          :amount-data="gamePredictionData"
          :coin-code="coinCode"
        />
      </a-col>
      <a-col :xs="24" :lg="6">
        <a-list
          :grid="{
            gutter: 10,
            column: 1,
          }"
          :data-source="gamePredictionList"
        >
          <template #renderItem="{ item }">
            <a-list-item>
              <a-card class="game-prediction-card" :bordered="false">
                <a-badge :color="item.color" />
                {{ item.label() }}
                <span class="value q-ml-sm">{{
                  $comma(gamePredictionData[item.value])
                }}</span>
              </a-card>
            </a-list-item>
          </template>
        </a-list>
      </a-col>
    </a-row>
  </a-card>
</template>

<script setup lang="ts">
import ProgressCircle from '@/components/ProgressCircle.vue';
import InvestmentStatus from '@/components/InvestmentStatus.vue';
import StatisticAction from '@/components/StatisticAction.vue';

import { ref, onBeforeMount, computed } from 'vue';

import { role } from '@/boot/global';
import { roleNames } from '@/router/routes';
import { options } from '@/boot/global';
import { api } from '@/boot/axios';
import { useI18n } from 'vue-i18n';
import { CoinCode } from '@/utils/enums';
import { coinList } from '@/utils/constants';

const { t } = useI18n();
const activeKey = ref(1);
const chartDay = ref(1);
const coinCode = ref(CoinCode.USDT);

const coinLabel = computed(() => coinList[coinCode.value].label);

const investmentStatusData = ref<ISummaryInvestmentResponse>({
  stepCounts: {
    four: 0,
    three: 0,
    two: 0,
    one: 0,
    zero: 0,
  },
  originalBalance: 0,
  balance: 0,
  partnerTotalCount: 0,
});

const gamePredictionList = ref([
  {
    label: () => t('common.word.predict_member'),
    value: 'predictedCount',
    color: 'yellow',
  },
  {
    label: () => t('common.word.predict_amount'),
    value: 'predictionAmount',
    color: 'pink',
  },
  {
    label: () => t('common.word.winning_amount'),
    value: 'winningAmount',
    color: 'orange',
  },
  {
    label: () => t('common.word.profit'),
    value: 'profitAmount',
    color: 'green',
  },
  { label: () => t('common.word.fee'), value: 'feeAmount', color: 'purple' },
]);

const gamePredictionData = ref<IGamePredictionResponse>();

const investmentDetailList = [
  {
    label: () => t('common.word.net_profit'),
    value: 'netProfitAmount',
  },
  {
    label: () => t('common.word.predict_amount'),
    value: 'predictionAmount',
  },
  {
    label: () => t('common.word.profit'),
    value: 'profitAmount',
  },
  {
    label: () => t('common.word.settlement_amount'),
    value: 'settlementAmount',
  },
  {
    label: () => t('common.word.deposit'),
    value: 'depositAmount',
  },
  {
    label: () => t('common.word.withdrawal'),
    value: 'withdrawalAmount',
  },
];

const investmentDetailData = ref<ISummaryInvestmentDetailResponse>({
  netProfitAmount: 0,
  predictionAmount: 0,
  profitAmount: 0,
  settlementAmount: 0,
  depositAmount: 0,
  withdrawalAmount: 0,
});

const memberStatusList = ref<{ label: any; value: string; path?: string }[]>(
  []
);

const memberStatusData = ref<ISummaryMemberResponse>({
  investorCount: 0,
  agentCount: 0,
  userCount: 0,
  newOfMonthCount: 0,
  newOfTodayCount: 0,
  visitedTodayCount: 0,
  onlineCount: 0,
  predictedTodayCount: 0,
  disconnectedForTwoWeeksCount: 0,
});

const loadGamePrediction = async () => {
  gamePredictionData.value = await api.auto.summary.gamePrediction(
    chartDay.value
  );
};

const loadInvestmentDetail = async () => {
  investmentDetailData.value = await api.auto.summary.investmentDetail(
    activeKey.value
  );
};

const loadMemberStatus = async () => {
  memberStatusData.value = await api.auto.summary.member();
};

const updateInvestmentStatus = (item: ISummaryInvestmentResponse) => {
  investmentStatusData.value = item;
};

const masterMemberStatusList = [
  {
    label: () => t('common.word.partner'),
    value: 'investorCount',
    path: 'member-management-operator',
  },
  {
    label: () => t('common.word.agent'),
    value: 'agentCount',
    path: 'member-management-operator',
  },
  {
    label: () => t('common.word.user'),
    value: 'userCount',
    path: 'member-management-user',
  },
  {
    label: () => t('common.word.current_access_user'),
    value: 'onlineCount',
    path: '',
  },
  {
    label: () => t('common.word.today_visitor'),
    value: 'visitedTodayCount',
    path: '',
  },
  {
    label: () => t('common.word.today_predict_member'),
    value: 'predictedTodayCount',
    path: '',
  },
  {
    label: () => t('common.word.today_new_member'),
    value: 'newOfTodayCount',
    path: '',
  },
  {
    label: () => t('common.word.new_member_this_month'),
    value: 'newOfMonthCount',
    path: '',
  },
];

const partnerMemberStatusList = [
  {
    label: () => t('common.word.agent'),
    value: 'agentCount',
  },
  {
    label: () => t('common.word.user'),
    value: 'userCount',
  },
  {
    label: () => t('common.word.current_access_user'),
    value: 'onlineCount',
  },
  {
    label: () => t('common.word.today_visitor'),
    value: 'visitedTodayCount',
  },
  {
    label: () => t('common.word.today_predict_member'),
    value: 'predictedTodayCount',
  },
  {
    label: () => t('common.word.today_new_member'),
    value: 'newOfTodayCount',
  },
  {
    label: () => t('common.word.new_member_this_month'),
    value: 'newOfMonthCount',
  },
  {
    label: () => t('common.word.two_weeks_without_access'),
    value: 'disconnectedForTwoWeeksCount',
  },
];

onBeforeMount(async () => {
  await Promise.all([
    loadGamePrediction(),
    loadInvestmentDetail(),
    loadMemberStatus(),
  ]);

  if (role === roleNames.agent) {
    gamePredictionList.value.splice(4, 1);
  }

  memberStatusList.value =
    role === roleNames.master
      ? masterMemberStatusList
      : partnerMemberStatusList;
});
</script>

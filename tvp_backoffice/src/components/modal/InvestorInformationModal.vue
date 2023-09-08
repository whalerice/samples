<template>
  <a-modal
    centered
    :footer="null"
    :width="1200"
    :title="$t('common.word.investor_information')"
    :destroyOnClose="true"
    :afterClose="afterClose"
    :bodyStyle="{ padding: 0 }"
  >
    <a-tabs
      v-model:activeKey="activeKey"
      :destroyInactiveTabPane="true"
      :tabBarGutter="20"
      :tabBarStyle="{
        paddingLeft: '2.4rem',
        paddingRight: '2.4rem',
        marginBottom: 0,
      }"
    >
      <a-tab-pane
        :key="item.key"
        :tab="item.label()"
        :class="{ 'q-pa-lg': item.key === 'investorInfo' }"
        v-for="item in tabs"
      >
        <component :is="item.component" :id="props.operatorId" />
      </a-tab-pane>
    </a-tabs>
  </a-modal>
</template>

<script setup lang="ts">
import InvestorInformation from '@/components/modal/InvestorInformation.vue';
import GameManagementPartnerPage from '@/pages/GameManagementPartnerPage.vue';
import PartnerTransactionStatusPage from '@/pages/PartnerTransactionStatusPage.vue';

import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const activeKey = ref<string>('investorInfo');

const props = defineProps({
  operatorId: { type: String, required: true },
});

const tabs = [
  {
    key: 'investorInfo',
    label: () => t('common.word.investor_information'),
    component: InvestorInformation,
  },
  {
    key: 'gameManagement',
    label: () => t('route.title.game_management'),
    component: GameManagementPartnerPage,
  },
  {
    key: 'transactionManagement',
    label: () => t('common.word.deposit_withdrawal_management'),
    component: PartnerTransactionStatusPage,
  },
];

const afterClose = () => {
  activeKey.value = 'investorInfo';
};
</script>

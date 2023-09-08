<template>
  <a-tabs class="header-tab" type="card" :mobile="false">
    <a-tab-pane v-for="(item, index) in tabList" :key="index">
      <template #tab>
        <span @click="openShortModal(item)"> {{ item.label() }} {{ alarmData[item.data] }}</span>
      </template>
    </a-tab-pane>
    <template #renderTabBar="{ DefaultTabBar, ...props }">
      <component :is="DefaultTabBar" v-bind="props" :mobile="false" />
    </template>
  </a-tabs>
  <a-modal
    class="manager-top-menu"
    :visible="visible"
    :footer="false"
    @cancel="closeShortModal"
    :destroyOnClose="true"
    :title="isTitle"
  >
    <component :is="currentComponent" :type="'topMenu'" />
  </a-modal>
  <vue3-autocounter
    class="txt-hide"
    :startAmount="20"
    :endAmount="0"
    :duration="20"
    @finished="alarmAction"
    ref="$timer"
  />
</template>

<script setup>
import Vue3Autocounter from 'vue3-autocounter';
import Kyc from '@/views/manager/member/KYC.vue';
import CpesoDeposit from '@/views/manager/wallet/CpesoDeposit.vue';
import CpesoWithdrawal from '@/views/manager/wallet/CpesoWithdrawal.vue';
import ExternalTransaction from '@/views/manager/wallet/ExternalTransaction.vue';
import Partners from '@/views/manager/member/Partners.vue';
import Dispute from '@/views/manager/wallet/Dispute.vue';
import Customer from '@/views/manager/Customer.vue';

import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { apis } from '@/store/api';
import { notification } from 'ant-design-vue';
import { watch, ref, onMounted, computed } from 'vue';

const { t } = useI18n();
const store = useStore();
const alarmData = ref({
  exTransacion: 0,
  kyc: 0,
  partner: 0,
  dispute: 0,
  cpesoBuy: 0,
  cpesoSell: 0,
  inquiry: 0,
});
const $timer = ref(null);
const isTitle = ref(null);
const visible = ref(false);
const tabList = ref([
  {
    label: () => t('nav.external_transaction'),
    component: ExternalTransaction,
    data: 'exTransacion',
  },
  {
    label: () => t('nav.kyc'),
    component: Kyc,
    data: 'kyc',
  },
  {
    label: () => t('nav.partners'),
    component: Partners,
    data: 'partner',
  },
  {
    label: () => t('nav.dispute_adjustment'),
    component: Dispute,
    data: 'dispute',
  },
  {
    label: () => t('nav.cpeso_deposit'),
    component: CpesoDeposit,
    data: 'cpesoBuy',
  },
  {
    label: () => t('nav.cpeso_withdraw'),
    component: CpesoWithdrawal,
    data: 'cpesoSell',
  },
  {
    label: () => t('nav.customer_inquiries'),
    component: Customer,
    data: 'inquiry',
  },
]);
const currentComponent = ref();
const isRefresh = computed(() => store.state['manager'].managerTopMenuRefresh);

const openShortModal = (item) => {
  currentComponent.value = item.component;
  isTitle.value = item.label();
  visible.value = true;
};
const closeShortModal = () => {
  visible.value = false;
};
const objectComparison = (before, after) => {
  const isFirst = Object.values(before).reduce((result, val) => result + val, 0) === 0;

  if (isFirst) {
    return [];
  } else {
    const key1 = Object.keys(before);
    const output = [];
    key1.forEach((e) => {
      if (before[e] < after[e]) {
        output.push(e);
      }
    });
    return output;
  }
};
const alarmAction = async () => {
  try {
    const response = await apis.ManagerTopMenuCount();
    const getData = response.data;

    if (getData.errCode === 0) {
      if (alarmData.value !== undefined && alarmData.value !== null) {
        const result = objectComparison(alarmData.value, getData.returnData);

        alarmData.value = getData.returnData;
        if (result.length > 0) {
          await store.dispatch('manager/setTopMenuTrigger', result);
          setNotification(result);
        }
        $timer.value.start();
      }
    }
  } catch (error) {
    console.error(error);
  }
};
const setNotification = (target) => {
  target.forEach((e) => {
    const description =
      e === 'exTransacion'
        ? t('alarm.text.external_transaction')
        : e === 'kyc'
        ? t('alarm.text.kyc')
        : e === 'partner'
        ? t('alarm.text.partner_approval')
        : e === 'dispute'
        ? t('alarm.text.dispute')
        : e === 'cpesoBuy'
        ? t('alarm.text.cpeso_deposit')
        : e === 'cpesoSell'
        ? t('alarm.text.cpeso_withdrawal')
        : t('alarm.text.customer_inquiries');

    notification['info']({
      message: t('search.select.notification'),
      description: description,
    });
  });
};
watch(isRefresh, (val) => {
  if (val) {
    alarmAction();
  }
});

onMounted(() => {
  alarmAction();
});
</script>

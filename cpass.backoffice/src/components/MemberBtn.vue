<template>
  <a-typography-link @click="showModal()" :class="{ default: userSn === 0 }" :type="isRefusal ? 'danger' : ''">{{
    userId
  }}</a-typography-link>
  <a-modal v-model:visible="visible" :footer="null" :destroyOnClose="true" width="160rem" class="user-info-modal">
    <template #title>
      <span>{{ userId }}</span>
      <a-tag v-if="!props.type" class="ml-5">
        {{ accessList.filter((e) => e.idx === props.data?.grade)[0].name }}
      </a-tag>
    </template>

    <a-tabs v-model:activeKey="activeKey" :destroyInactiveTabPane="true">
      <a-tab-pane v-for="(item, idx) in tabList" :key="idx" :tab="item.label()" class="user-info-pane">
        <component :is="item.component" :sn="userSn" :type="props.type" v-bind="item?.props" />
      </a-tab-pane>
    </a-tabs>
  </a-modal>
</template>

<script setup>
import Kyc from '@/components/MemberUserKycInfo.vue';
import Customer from '@/views/manager/Customer.vue';
import Dispute from '@/views/manager/wallet/Dispute.vue';
import Deposit from '@/views/manager/partner/Deposit.vue';
import MemberUserInfo from '@/components/MemberUserInfo.vue';
import MemberPartnerInfo from '@/components/MemberPartnerInfo.vue';
import CpesoDeposit from '@/views/manager/wallet/CpesoDeposit.vue';
import Withdrawal from '@/views/manager/partner/Withdrawal.vue';
import CpesoWithdrawal from '@/views/manager/wallet/CpesoWithdrawal.vue';
import TransactionHistory from '@/views/manager/wallet/TransactionHistory.vue';
import ExternalTransaction from '@/views/manager/wallet/ExternalTransaction.vue';

import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Enum } from '@/assets/js/enum.js';
import { onMounted, onBeforeMount, computed } from 'vue';
import { accessList } from '@/assets/js/global.js';

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  type: {
    type: String,
    required: false,
  },
  open: {
    type: Object,
  },
});
const { t } = useI18n();
const emits = defineEmits(['update']);
const userId = ref(props.data?.user_Id);
const userSn = ref(props.data?.user_Sn);
const visible = ref(false);
const activeKey = ref(0);
const isRefusal = ref(false);
const tabList = ref([]);
const externalVisible = computed(() => props.open);

const showModal = () => {
  if (props.data.user_Sn !== 0 && props.data.state !== Enum.userStateType.Refusal) {
    visible.value = true;
  }
};

watch(externalVisible, (val) => {
  if (
    userId.value === val.user_Id &&
    val.state !== Enum.userStateType.Refusal &&
    props.data.state !== Enum.userStateType.Refusal
  ) {
    visible.value = true;
  }
});
watch(visible, (val) => {
  if (!val) {
    activeKey.value = 0;
    setTimeout(() => {
      emits('update');
    }, 300);
  }
});

onBeforeMount(() => {
  if (props.type === 'wallet') {
    tabList.value = [
      { component: MemberUserInfo, label: () => t('tab.label.member_info') },
      { component: TransactionHistory, label: () => t('tab.label.transaction_history') },
      { component: ExternalTransaction, label: () => t('tab.label.external_transaction') },
      { component: CpesoDeposit, label: () => t('tab.label.cpeso_deposit') },
      { component: CpesoWithdrawal, label: () => t('tab.label.cpeso_withdrawal') },
      { component: Dispute, label: () => t('tab.label.dispute_adjustment') },
      { component: Kyc, label: () => t('tab.label.kyc'), props: { info: props.data } },
      { component: Customer, label: () => t('tab.label.customer') },
    ];
  } else if (props.type === 'partner') {
    tabList.value = [
      { component: MemberPartnerInfo, label: () => t('tab.label.member_info'), props: { data: props.data } },
      { component: TransactionHistory, label: () => t('tab.label.transaction_history') },
      { component: ExternalTransaction, label: () => t('tab.label.external_transaction') },
      { component: Deposit, label: () => t('tab.label.deposit') },
      { component: Withdrawal, label: () => t('tab.label.withdrawal') },
      { component: Customer, label: () => t('tab.label.customer') },
    ];
  }
});
onMounted(() => {
  isRefusal.value = props.data.state === Enum.userStateType.Refusal ? true : false;
});
</script>
<style lang="scss" scoped>
.default {
  cursor: default;
}
</style>

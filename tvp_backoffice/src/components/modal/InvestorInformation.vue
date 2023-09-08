<template>
  <a-descriptions
    bordered
    size="small"
    :column="2"
    :labelStyle="{ width: '16rem' }"
  >
    <a-descriptions-item :label="$t('common.word.id')">
      {{ investorData.email }}
    </a-descriptions-item>

    <a-descriptions-item :label="$t('common.word.invest_coin')">
      <CoinIcon :coin-code="investorData.coinCode" size="24" no-width />
    </a-descriptions-item>

    <a-descriptions-item :label="$t('common.word.partner_name')">
      {{ investorData.nickName }}
    </a-descriptions-item>

    <a-descriptions-item :label="$t('common.word.investment_amount')">
      {{ $comma(investorData.originalBalance) }}
    </a-descriptions-item>

    <a-descriptions-item :label="$t('common.word.password')">
      <span class="q-mr-xs">********</span>
      <a-popconfirm
        :title="$t('modal.warning.modify_password_warning')"
        @confirm="onEdit(true)"
      >
        <a-button type="primary">
          {{ $t('common.word.modify') }}
        </a-button>
      </a-popconfirm>
    </a-descriptions-item>

    <a-descriptions-item :label="$t('common.word.step')">
      {{ $t('common.word.step_number', { number: investorData.step }) }}
    </a-descriptions-item>

    <a-descriptions-item :label="$t('common.word.signup_date')">
      {{
        investorData.createdTime === null
          ? ''
          : $dayjs(investorData.createdTime).format('YYYY-MM-DD HH:mm:ss')
      }}
    </a-descriptions-item>
  </a-descriptions>

  <ChangePasswordModal
    :show="isChangePasswordModal"
    @update:show="onEdit"
    :data="sendData"
  />
</template>

<script setup lang="ts">
import ChangePasswordModal from '@/components/modal/ChangePasswordModal.vue';
import CoinIcon from '@/components/CoinIcon.vue';

import { onMounted, ref } from 'vue';
import { api } from '@/boot/axios';

const props = defineProps({
  id: { type: String, required: true },
});

const investorData = ref<IInvestmentInfoResponse>({
  operatorId: '',
  email: '',
  nickName: '',
  password: 0,
  coinCode: 1,
  originalBalance: 0,
  step: 0,
  createdTime: '',
});

const isChangePasswordModal = ref<boolean>(false);
const sendData = ref<{ id: string; role: number | null }>({
  id: '',
  role: null,
});

const onEdit = (value: boolean) => {
  isChangePasswordModal.value = value;
  sendData.value = {
    id: investorData.value.operatorId,
    role: 0,
  };
};

onMounted(async () => {
  investorData.value = await api.auto.member.investmentInfo(props.id);
});
</script>

<template>
  <a-input-group compact>
    <a-input-number
      size="default"
      :min="0"
      v-model:value="amount"
      :formatter="(value:number) => $comma(value)"
      :placeholder="
        props.type === TransactionType.Deposit
          ? $t('common.word.deposit')
          : $t('common.word.withdrawal')
      "
    >
      <template #prefix>
        <CoinIcon :coin-code="currentCoin.value" />
      </template>
    </a-input-number>
    <a-button
      size="default"
      @click="amount = maxAmount"
      v-if="props.type === TransactionType.Withdrawal"
    >
      {{ $t('common.word.max') }}
    </a-button>
  </a-input-group>
  <div class="text-right q-mt-md">
    <a-button
      size="default"
      type="primary"
      @click="transaction"
      :disabled="amount === null || amount === 0"
    >
      {{ $t('common.word.request') }}
    </a-button>
  </div>
</template>

<script setup lang="ts">
import CoinIcon from '@/components/CoinIcon.vue';

import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Modal } from 'ant-design-vue';
import { TransactionType, CoinCode } from '@/utils/enums';
import { coinList } from '@/utils/constants';
import { api } from '@/boot/axios';

const props = defineProps({
  type: {
    type: Number,
    required: true,
  },
  // data: {
  //   type: Object,
  //   required: false,
  // },
  // coin: {
  //   type: Number,
  //   required: false,
  // },
});

const currentCoin = ref(coinList[CoinCode.USDT]);
const maxAmount = ref<number>(0);
const amount = ref<number>(0);

const { t } = useI18n();
const emits = defineEmits(['update']);

const transaction = async () => {
  try {
    await api.auto.investment.transaction(
      props.type,
      Number(amount.value),
      currentCoin.value.value
    );
    emits('update', true);
    amount.value = 0;
  } catch (error: any) {
    if (error.response.status === 409) {
      Modal.error({
        okButtonProps: { size: 'middle' },
        title: 'Error',
        content: t('modal.error.have_withdrawal'),
      });
    }
    amount.value = 0;
  }
};

onBeforeMount(async () => {
  const response = await api.auto.summary.investment();
  if (props.type === TransactionType.Withdrawal)
    maxAmount.value = response.balance;
});
</script>

<template>
  <a-modal
    v-model:visible="visible"
    :footer="null"
    :title="$t('route.title.investment_status')"
    :destroyOnClose="true"
  >
    <InvestmentStatus @update="updateInvestmentStatus" />
    <a-row align="center" justify="space-between" class="q-my-md">
      <a-col>
        {{ $t('common.word.investment_step') }}
      </a-col>
      <a-col>
        <a-row align="middle" :gutter="[5, 0]">
          <a-col>
            {{ $t('common.word.step_number', { number: step }) }}
          </a-col>
          <a-col>
            <a-button @click="showModal(TransactionType.Deposit)">
              {{ $t('common.word.deposit') }}
            </a-button>
          </a-col>
        </a-row>
      </a-col>
    </a-row>

    <a-row align="center" justify="space-between">
      <a-col>
        {{ $t('common.word.withdrawal_status') }}
      </a-col>
      <a-col>
        <a-row align="middle" :gutter="[5, 0]">
          <a-col>
            {{
              investmentData.balance > 0
                ? $t('common.word.possible')
                : $t('common.word.impossible')
            }}
          </a-col>
          <a-col>
            <a-button
              type="primary"
              @click="showModal(TransactionType.Withdrawal)"
            >
              {{ $t('common.word.withdrawal') }}
            </a-button>
          </a-col>
        </a-row>
      </a-col>
    </a-row>
  </a-modal>
  <a-modal
    :visible="isTransactionModal"
    @update:visible="(value:boolean) => (isTransactionModal = value)"
    centered
    :title="
      transactionType === TransactionType.Deposit
        ? $t('common.word.deposit')
        : $t('common.word.withdrawal')
    "
    :destroyOnClose="true"
    :footer="false"
  >
    <TransactionForm :type="transactionType" v-if="isTransactionModal" />
  </a-modal>
</template>
<script setup lang="ts">
import TransactionForm from '@/components/TransactionForm.vue';
import InvestmentStatus from '@/components/InvestmentStatus.vue';

import { computed, ref } from 'vue';
import { TransactionType } from '@/utils/enums';

const props = defineProps({
  show: { type: Boolean },
});

const emits = defineEmits(['update:show']);

const visible = computed({
  get() {
    return props.show;
  },
  set(val) {
    emits('update:show', val);
  },
});
const transactionType = ref<number>(TransactionType.Deposit);
const isTransactionModal = ref<boolean>(false);

const investmentData = ref<ISummaryInvestmentResponse>({
  balance: 0,
  originalBalance: 0,
  partnerTotalCount: 0,
  stepCounts: {
    zero: 0,
    one: 0,
    three: 0,
    four: 0,
    two: 0,
  },
});

const step = ref(0);

const updateInvestmentStatus = (
  item: ISummaryInvestmentResponse,
  stepNumber: number
) => {
  investmentData.value = item;
  step.value = stepNumber;
};

const showModal = (type: number) => {
  transactionType.value = type;
  isTransactionModal.value = true;
};
</script>

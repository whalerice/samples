<template>
  <a-card size="small">
    <a-form layout="vertical" class="withdrawal-apply">
      <a-form-item :label="$t('datatable.thead.coin')">
        <a-select
          label-in-value
          :placeholder="$t('common.placeholder.select')"
          :options="coinList"
          v-model:value="selectCoin"
          @change="handleChangeCoin"
        />
      </a-form-item>
      <a-form-item :label="$t('component.label.withdrawable_balance')" class="balance-item">
        <strong>{{ withdrawableBalance }}</strong>
        <span>{{ coinUnit }}</span>
      </a-form-item>
      <a-form-item :label="$t('component.label.minimum_quantity')" class="balance-item">
        <strong>{{ minimumQuantity }}</strong>
        <span>{{ coinUnit }}</span>
      </a-form-item>
      <a-form-item :label="$t('component.label.withdrawal_amount')">
        <a-input-group compact>
          <a-input v-model:value="withdrawalInfoData.amount" :suffix="coinUnit" ref="focusAmount" />
          <a-button @click="getMaxAmount">{{ $t('common.button.max') }}</a-button>
        </a-input-group>
        <a-typography-text type="danger">{{ amountErr }}</a-typography-text>
      </a-form-item>
    </a-form>
    <a-button type="primary" @click="openModal" style="float: right" :disabled="requestDisabled">{{
      $t('common.button.request')
    }}</a-button>
  </a-card>
  <PaymentModal @close="closeModal" :show="visible" :data="withdrawalInfoData" />
</template>
<script setup>
import PaymentModal from '@/components/modals/PaymentModal.vue';

import { ref, computed, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import { decimal, comma, decimalNumber } from '@/assets/js/global.js';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const store = useStore();
const emit = defineEmits(['refresh']);
const wallet = computed(() => store.state['sign'].partnerWallets);
const coinList = computed(() => store.state['sign'].partnerCoinList);

const focusAmount = ref(null);

const visible = ref(false);
const requestDisabled = ref(true);
const withdrawableBalance = ref(0);
const selectCoin = ref(undefined);

const withdrawalInfoData = ref({
  coin: '',
  type: 0,
  amount: 0,
});

const minimumQuantity = ref(0);
const coinUnit = ref('');
const amountErr = ref('');

const handleChangeCoin = (e) => {
  amountErr.value = '';
  coinUnit.value = e.label.toLocaleUpperCase();
  withdrawalInfoData.value.amount = '';
  withdrawalInfoData.value.coin = e.label;
  withdrawalInfoData.value.type = e.value;

  let selectWallet = wallet.value.filter((w) => w.coin_Cd === e.value)[0];
  withdrawableBalance.value = comma(selectWallet.withdrawable_Balance);
  minimumQuantity.value = selectWallet.minimum_Quantity;
  setTimeout(() => {
    focusAmount.value.focus();
  }, 10);
};

const getMaxAmount = () => {
  withdrawalInfoData.value.amount = withdrawableBalance.value;
};

const openModal = () => {
  visible.value = true;
};

const closeModal = async () => {
  visible.value = false;
  await store.dispatch('sign/partnerWalletInfo');
  emit('refresh');
  init();
};

const init = () => {
  coinUnit.value = '';
  selectCoin.value = undefined;
  withdrawableBalance.value = 0;
  withdrawalInfoData.value.coin = '';
  withdrawalInfoData.value.type = 0;
  withdrawalInfoData.value.amount = 0;
};

watch(withdrawalInfoData.value, (val) => {
  let amount = decimal(val.amount);
  if (amount !== '0') {
    if (amount.indexOf('.') === -1) {
      if (amount.slice(0, 1) === '0' && amount.length > 1) {
        amount = amount.slice(0, 1);
      }
    }

    if (amount.slice(0, 1) === '.') {
      amount = '0' + amount;
    }
  }
  withdrawalInfoData.value.amount = decimalNumber(decimal(amount), 8);
  const amountCheck = Number(val.amount.replace(/,/g, ''));
  const max =
    typeof withdrawableBalance.value === 'string'
      ? Number(withdrawableBalance.value.split(',').join(''))
      : withdrawableBalance.value;

  if (amountCheck === 0) {
    requestDisabled.value = true;
  } else if (amountCheck < minimumQuantity.value) {
    amountErr.value = t('component.error_msg.minimum_quantity');
    requestDisabled.value = true;
  } else if (amountCheck > max) {
    amountErr.value = t('component.error.no_withdrawal');
    requestDisabled.value = true;
  } else {
    amountErr.value = '';
    requestDisabled.value = false;
  }
});

onMounted(async () => {
  await store.dispatch('sign/partnerWalletInfo');
});
</script>

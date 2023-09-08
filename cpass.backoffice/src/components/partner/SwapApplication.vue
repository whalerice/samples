<template>
  <a-card size="small">
    <a-form layout="vertical" class="swap-area">
      <a-form-item :label="$t('component.label.swap_from')">
        <a-input-group compact>
          <a-select
            label-in-value
            :placeholder="$t('common.placeholder.select')"
            :options="coinList"
            v-model:value="fromCoin"
            @change="changeFromCoin"
          />
          <a-input v-model:value="fromAmount" :suffix="coinUnit" ref="focusAmount" />
          <a-button @click="getMaxAmount" :disabled="swapWallet.max === 0">
            {{ $t('common.button.max') }}
          </a-button>
        </a-input-group>
        <a-typography-text type="danger">{{ amountErr }}</a-typography-text>
        <ul class="swap-from-list">
          <li>
            <label>{{ $t('common.text.max') }}</label>
            <span> {{ comma(swapWallet.max) }} {{ coinUnit }} </span>
          </li>
          <li>
            <label>{{ $t('common.text.min') }}</label>
            <span> {{ comma(swapWallet.min) }} {{ coinUnit }} </span>
          </li>
        </ul>
      </a-form-item>
      <a-form-item :label="$t('component.label.swap_to')">
        <a-select
          label-in-value
          :placeholder="$t('common.placeholder.select')"
          :options="toCoinList"
          v-model:value="toCoin"
          @change="changeToCoin"
          :disabled="toCoinList.length === 0"
        />
      </a-form-item>
    </a-form>
    <a-button type="primary" @click="openModal" style="float: right" :disabled="requestDisabled">
      {{ $t('common.button.request') }}
    </a-button>
  </a-card>
  <SwapModal @close="closeModal" :show="visible" :data="swapValue" />
</template>
<script setup>
import SwapModal from '@/components/modals/SwapModal.vue';

import { ref, computed, watch, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import { decimal, comma, decimalNumber } from '@/assets/js/global.js';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const store = useStore();
const coinList = computed(() => store.state['sign'].swapCoinList);
const swapWalletInfo = computed(() => store.state['partner'].swapWalletInfo);

const focusAmount = ref(null);

const visible = ref(false);
const requestDisabled = ref(true);

const fromCoin = ref(undefined);
const fromAmount = ref(0);
const toCoin = ref(undefined);
const toCoinList = ref([]);

const swapValue = ref({
  from: undefined,
  fromAmount: 0,
  to: undefined,
});
const swapWallet = ref({
  min: 0,
  max: 0,
  fee: 0,
});

const coinUnit = ref('');
const amountErr = ref('');

const changeFromCoin = async (e) => {
  coinUnit.value = e.label.toLocaleUpperCase();
  toCoinList.value = coinList.value.filter((c) => c.label !== e.label);
  swapValue.value.from = { label: e.label, value: e.value };
  toCoin.value = undefined;

  await store.dispatch('partner/paymentSwapWalletInfo', {
    Original_Coin: e.label,
  });
  fromAmount.value = '';
  setTimeout(() => {
    focusAmount.value.focus();
    amountErr.value = '';
  }, 10);
};

const changeToCoin = (e) => {
  swapValue.value.to = { label: e.label, value: e.value };
};

const getMaxAmount = () => {
  fromAmount.value = swapWallet.value.max;
};

const openModal = () => {
  visible.value = true;
};

const emits = defineEmits(['refresh']);

const closeModal = async () => {
  visible.value = false;
  await store.dispatch('sign/partnerWalletInfo');
  emits('refresh');
  init();
};

const init = () => {
  requestDisabled.value = true;
  fromCoin.value = undefined;
  fromAmount.value = 0;
  toCoin.value = undefined;
  toCoinList.value = [];
  swapWallet.value.min = 0;
  swapWallet.value.max = 0;
  swapWallet.value.fee = 0;
  coinUnit.value = '';
};

watch(fromAmount, (val) => {
  let num = String(val).replaceAll(',', '');

  if (Number(num) >= 1000000) {
    amountErr.value = t('component.error_msg.below_amount');
  } else if (val === '' || Number(num) < 1000000) {
    amountErr.value = '';
  }

  if (Number(num) < swapWallet.value.min) {
    amountErr.value = t('component.error_msg.minimum_swap_amount');
  } else if (num === '') {
    amountErr.value = '';
  } else {
    amountErr.value = '';
  }

  if (val !== 0 && typeof val === 'string') swapValue.value.fromAmount = val.replace(/,/g, '');
  else swapValue.value.fromAmount = val;

  if (fromCoin.value !== undefined) {
    switch (fromCoin.value.value) {
      case 1:
        fromAmount.value = decimalNumber(decimal(val), 5);
        break;
      case 2:
        fromAmount.value = decimalNumber(decimal(val), 4);
        break;
      case 3:
        fromAmount.value = decimalNumber(decimal(val), 2);
        break;
      case 5:
        fromAmount.value = decimalNumber(decimal(val), 2);
        break;
      case 6:
        fromAmount.value = decimalNumber(decimal(val), 2);
        break;
      default:
        fromAmount.value = decimalNumber(decimal(val), 0);
        break;
    }
  }

  if (val !== '0' && typeof val !== 'number') {
    if (val.slice(0, 1) === '0' && val.length > 1) {
      if (val.indexOf('.') === -1 && val.indexOf('.') !== 1) {
        let tempArr = [];
        let pointIdx = '';
        tempArr = val.split('').filter((each) => each !== ',');
        tempArr.forEach((each, index) => {
          pointIdx = each !== '0' ? (pointIdx + index).slice(0, 1) : '';
        });
        tempArr = tempArr.filter((each, index) => index >= pointIdx).join('');
        fromAmount.value = pointIdx === '' ? '' : comma(decimal(tempArr));
      }
    } else if (val.slice(0, 1) === '.' && val.length > 1) {
      fromAmount.value = fromAmount.value.replace('.', '0.');
    }
  }
});

watch(swapValue.value, (val) => {
  if (amountErr.value === '') {
    if (val.fromAmount > 0 && toCoin.value !== undefined) {
      requestDisabled.value = Number(val.fromAmount) > swapWallet.value.max ? true : false;
    } else if (val.fromAmount > 0 && toCoin.value === undefined) {
      requestDisabled.value = true;
    } else {
      requestDisabled.value = true;
    }
  } else {
    requestDisabled.value = true;
  }
});
watch(swapWalletInfo, (val) => {
  swapWallet.value.min = val.possible_Bal.min;
  swapWallet.value.max = val.possible_Bal.max;
  swapWallet.value.fee = val.possible_Bal.fee_Rate;
});

onBeforeMount(() => {
  store.dispatch('sign/coinList');
});
</script>

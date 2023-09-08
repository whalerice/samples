<template>
  <a-modal v-model:visible="isShow" :title="$t('modal.title.swap')" class="swap-modal">
    <div class="swap-box swap-from-box">
      <dl class="swap-list">
        <dt>
          -->
          <i :class="`coin coin-${props.data.from.value}`" />
          <span class="">{{ props.data.from.label }}</span>
        </dt>
        <dd>
          <ul class="values">
            <li>{{ comma(swapPriceInfo.originAmount) }} {{ props.data.from.label }}</li>
            <li class="dollar">{{ currency }} {{ comma(swapPriceInfo.origin_CurrencyPrice) }}</li>
          </ul>
        </dd>
      </dl>
      <dl class="swap-list">
        <dt>{{ $t('modal.label.transaction_fee') }}</dt>
        <dd>
          <ul class="values">
            <li class="">{{ comma(swapPriceInfo.originFee) }} {{ props.data.from.label }}</li>
          </ul>
        </dd>
      </dl>
    </div>

    <div class="swap-box swap-to-box">
      <dl class="swap-list">
        <dt>
          <i :class="`coin  coin-${props.data.to.value}`" />
          <span class="">{{ props.data.to.label }}</span>
        </dt>
        <dd>
          <ul class="values" :class="{ disabled: isImpossible }">
            <li>{{ comma(swapPriceInfo.swapAmount) }} {{ props.data.to.label }}</li>
            <li class="dollar">{{ currency }} {{ comma(swapPriceInfo.change_CurrencyPrice) }}</li>
          </ul>
          <CountDown
            :isTriggered="countDownTrigger"
            :countDownSet="countDownSet"
            @refresh="refreshDispatch"
            @trigger="triggerCountDown"
            @finish="finishCountDown"
          />
        </dd>
      </dl>
    </div>
    <template #footer>
      <a-button type="primary" :loading="loading" @click="swap()" :disabled="isImpossible">
        {{ $t('common.button.swap') }}
      </a-button>
    </template>
  </a-modal>
</template>
<script setup>
import CountDown from '@/components/common/CountDown.vue';
import { Modal } from 'ant-design-vue';
import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { comma, matchingCoinImg, lottieModal } from '@/assets/js/global.js';

const { t } = useI18n();
const store = useStore();
const swapPriceInfo = computed(() => store.state['partner'].swapPriceInfo);
const swapTransactionMsg = computed(() => store.state['partner'].swapTransactionMsg);
const currencyList = computed(() => store.state['sign'].currencyList);
const userSn = computed(() => store.state['sign'].signInfo.sn);
const currency = ref('$');

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  data: {
    type: Object,
    required: true,
  },
});

const isShow = computed({
  get() {
    return props.show;
  },
  set(val) {
    emit('close', val);
  },
});

const emit = defineEmits(['close']);

const loading = ref(false);
const isImpossible = ref(false);

const countDownSet = ref({
  timeLimit: 20,
  countDownTime: 1000,
  circleControlerTime: 200,
});

const countDownTrigger = ref(false);
const triggerCountDown = () => {
  isImpossible.value = false;
  countDownTrigger.value = true;
};

const finishCountDown = (val) => {
  if (val === true) {
    isImpossible.value = true;
  }
};

const handleCancel = () => {
  isShow.value = false;
};

const refreshDispatch = async () => {
  isImpossible.value = false;
  countDownTrigger.value = true;

  if (props.data.fromAmount > 0) {
    await store.dispatch('partner/paymentSwapPrice', {
      input_Type: 1,
      Original_Coin: props.data.from.label,
      input_Money: Number(props.data.fromAmount),
      Change_Coin: props.data.to.label,
    });
    currency.value = currencyList.value.filter((e) => e.value === swapPriceInfo.value?.currency_Cd)[0].type;
  }
};

const successModal = (msg) => {
  Modal.success({
    title: t('confirm.title.swap_completed'),
    okText: t('common.button.confirm'),
    content: msg,
    onOk() {
      isShow.value = false;
    },
  });
};

const errorModal = (msg) => {
  Modal.error({
    title: t('confirm.title.swap_failed'),
    okText: t('common.button.confirm'),
    content: msg,
  });
};

const swap = async () => {
  await store.dispatch('partner/paymentSwapTransaction', {
    user_Sn: userSn.value,
    originSymbol: props.data.from.label,
    changeSymbol: props.data.to.label,
    swapAmount: swapPriceInfo.value.swapAmount,
    originActual: swapPriceInfo.value.originActual,
    originAmount: swapPriceInfo.value.originAmount,
    originFee: swapPriceInfo.value.originFee,
    perBidPrice: swapPriceInfo.value.perBidPrice,
    perAskPrice: swapPriceInfo.value.perAskPrice,
  });
};

watch(isShow, (val) => {
  if (val) {
    countDownTrigger.value = true;
  } else {
    countDownTrigger.value = false;
  }
});

watch(swapTransactionMsg, (val) => {
  if (val.errCode < 0) {
    errorModal(val.errMessage);
  } else {
    successModal();
  }
});

watch(countDownTrigger, (val) => {
  if (val) {
    triggerCountDown();
  } else {
    finishCountDown();
  }
});
</script>

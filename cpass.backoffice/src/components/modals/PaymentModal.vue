<template>
  <a-modal v-model:visible="isShow" :title="$t('common.button.send')" class="payment-modal">
    <ul class="coin-list flex mb-10">
      <li class="coin-item mr-10">
        <a-button class="btn-coin flex active" @click="changeCoin(data.type, data.coin)">
          <i :class="`coin small mr-5 coin-${data.type}`" />
          <span class="">{{ data.coin }}</span>
        </a-button>
      </li>
      <!-- <li class="coin-item"> 
        <a-button
          class="btn-coin flex"
          @click="changeCoin(3, 'USDT')"
          v-if="data.type !== 3"
          :class="{ active: sendData.currency_Type === 3 }"
        >
          <i class="coin coin-usdt mr-5"></i>
          <span>USDT</span>
        </a-button>
        <a-button class="btn-coin active flex" v-else>
          <i class="coin coin-usdt mr-5"></i>
          <span>USDT</span>
        </a-button>
      </li> -->
    </ul>
    <div class="amount-row mb-10">
      <label>{{ $t('modal.label.withdrawal_fee') }}</label>
      <div class="amount-box">
        <a-input :suffix="currentCoin" :value="comma(sendData.fee)" readonly :disabled="isTransAmount"></a-input>
      </div>
    </div>
    <div class="amount-row mb-10">
      <label>{{ $t('datatable.text.send') + ' ' + $t('component.label.amount') }}</label>
      <div class="amount-box">
        <a-input :suffix="currentCoin" :value="comma(sendData.amount)" readonly :disabled="isTransAmount"></a-input>
      </div>
    </div>
    <div class="amount-row mb-10">
      <label>{{ $t('modal.label.total') }}</label>
      <div class="amount-box mb-10 flex pos-rel">
        <a-input
          :class="{ 'mr-50': isShow && countDownTrigger }"
          :suffix="currentCoin"
          :value="comma(getWithdrawPrice.transAmount)"
          readonly
          :disabled="isTransAmount"
        ></a-input>
        <CountDown
          v-if="isShow && countDownTrigger"
          :isTriggered="countDownTrigger"
          :countDownSet="{ timeLimit: 20, countDownTime: 1000, circleControlerTime: 200 }"
          @refresh="sendPrice"
          @trigger="triggerCountDown"
          @finish="finishCountDown"
          class="pos-right"
        />
      </div>
    </div>

    <div class="addr-row">
      <label>{{ $t('modal.label.my_wallet_link') }}</label>
      <ul class="wallet-addr">
        <li class="addr-item">
          <a-input v-model:value="addrToBePasted" ref="$addrToBePasted">
            <template #prefix>
              <fa-icon icon="wallet"></fa-icon>
            </template>
            <template #suffix>
              <a-tooltip title="Extra information">
                <fa-icon icon="copy" @click="pasteFnAddr()"></fa-icon>
              </a-tooltip>
            </template>
          </a-input>
        </li>
        <li class="addr-item" v-if="sendData.currency_Type === 4">
          <a-input v-model:value="tagToBePasted">
            <template #prefix> Tag </template>
            <template #suffix>
              <a-tooltip title="Extra information">
                <fa-icon icon="copy" @click="pasteFnTag()"></fa-icon>
              </a-tooltip>
            </template>
          </a-input>
        </li>
      </ul>
    </div>

    <template #footer>
      <a-button key="approval" type="primary" :loading="loading" @click="toggleOtp()" :disabled="isLinksNotPasted">
        {{ $t('common.button.approval_request') }}
      </a-button>
    </template>
  </a-modal>
  <OTP v-if="activeOtp" :type="'registerAndCertificate'" @returnOtp="returnOtp" @closeOtp="toggleOtp()" />
</template>

<script setup>
import CountDown from '@/components/common/CountDown.vue';
import OTP from '@/components/modals/OTP.vue';
import { Modal } from 'ant-design-vue';
import { ref, computed, watch, onUpdated, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import { comma, matchingCoinImg, lottieModal } from '@/assets/js/global.js';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const store = useStore();
const withdrawPrice = computed(() => store.state['partner'].withdrawPrice);
const partnerInfo = computed(() => store.state['sign'].partnerInfo);
const finishMsg = computed(() => store.state['partner'].partnerWithdrawMsg);
const otpSignatureCode = computed(() => store.state['otp'].otpSignatureCode);
const activeOtp = ref(false);
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

const addrToBePasted = ref('');
const tagToBePasted = ref('');
const loading = ref(false);
const getWithdrawPrice = ref({});
const isTransAmount = ref(false);
const isLinksNotPasted = ref(true);
const currentCoin = ref('');

const sendData = ref({
  partner_Code: '',
  partner_Member_Id: '',
  walletName: '',
  currency_Type: 0,
  currency_Money: 0,
  amount: 0,
  fee: 0,
  toAddress: '',
  toMemo: '',
  encryptionString: '',
});

const returnOtp = () => {
  request();
};

const toggleOtp = () => {
  activeOtp.value = !activeOtp.value;
};

const countDownTrigger = ref(false);
const countDownFinished = ref(false);

const triggerCountDown = () => {
  if (sendData.value.currency_Type !== 3) {
    countDownTrigger.value = false;
  } else {
    if (props.data.type !== 3) {
      countDownTrigger.value = true;
    }
  }
};

const finishCountDown = (val) => {
  countDownFinished.value = val;
  if (val) {
    isTransAmount.value = false;
    isLinksNotPasted.value = true;
  } else if (val === true && currentCoin.value === 'USDT') {
    isTransAmount.value = true;
    isLinksNotPasted.value = false;
  }
};

const changeCoin = (type, name) => {
  addrToBePasted.value = '';
  tagToBePasted.value = '';
  if (type !== 3 && name !== 'USDT') {
    countDownTrigger.value = false;
  }

  sendData.value.currency_Type = type;
  currentCoin.value = name;
  if (type !== 3) {
    countDownTrigger.value = false;
    sendPrice();
  } else {
    countDownTrigger.value = true;
    sendPrice();
  }
};

const pasteFnAddr = () => {
  navigator.permissions.query({ name: 'clipboard-read' }).then((result) => {
    if (result.state == 'granted' || result.state == 'prompt') {
      navigator.clipboard.readText().then((text) => {
        addrToBePasted.value = text;
      });
    } else {
      alert(t('common.label.clipboard_access'));
    }
  });
};

const pasteFnTag = async () => {
  navigator.permissions.query({ name: 'clipboard-read' }).then((result) => {
    if (result.state == 'granted' || result.state == 'prompt') {
      navigator.clipboard.readText().then((text) => {
        tagToBePasted.value = text;
      });
    } else {
      alert('Please enable browser clipboard access.');
    }
  });
};

const sendPrice = async () => {
  if (sendData.value.currency_Type === 4) {
    if (addrToBePasted.value === '' && tagToBePasted.value === '') {
      isLinksNotPasted.value = true;
    } else if (addrToBePasted.value === '' && tagToBePasted.value !== '') {
      isLinksNotPasted.value = true;
    } else if (addrToBePasted.value !== '' && tagToBePasted.value === '') {
      isLinksNotPasted.value = true;
    } else {
      isLinksNotPasted.value = coinType(sendData.value.currency_Type, addrToBePasted.value);
    }
  } else {
    if (addrToBePasted.value === '') {
      isLinksNotPasted.value = true;
    } else {
      isLinksNotPasted.value = coinType(sendData.value.currency_Type, addrToBePasted.value);
    }
  }

  let money = props.data.amount ? props.data.amount.replace(/,/g, '') : 0;
  const send = {
    walletName: props.data.coin,
    currency_Type: sendData.value.currency_Type,
    currency_Money: parseFloat(money),
  };
  await store.dispatch('partner/withdrawPrice', send);
};

const request = async () => {
  sendData.value.toAddress = addrToBePasted.value;
  sendData.value.toMemo = tagToBePasted.value;
  sendData.value.signature = [`${otpSignatureCode.value.returnData.signature}`];

  await store.dispatch('partner/partnerWithdraw', sendData.value);
};

const successModal = async () => {
  isShow.value = false;
  store.state['partner'].partnerWithdrawMsg = '';
  await lottieModal(t('confirm.title.success_sended'), 'send', 1.5);
};

const errorModal = (msg) => {
  Modal.error({
    title: t('confirm.title.request_failed'),
    okText: t('common.button.confirm'),
    content: msg,
    onOk() {
      store.state['partner'].partnerWithdrawMsg = '';
    },
  });
};

watch(props.data, (val) => {
  let money = val.amount ? val.amount.split(',').join('') : 0;
  sendData.value.walletName = val.coin;
  sendData.value.currency_Money = parseFloat(money);
  sendData.value.currency_Type = val.type;
  sendData.value.partner_Code = partnerInfo.value.partner_Code;
  currentCoin.value = val.coin;
});

watch(withdrawPrice, (val) => {
  getWithdrawPrice.value = val;
  sendData.value.amount = val.fromAmount;
  sendData.value.fee = val.fee;
  sendData.value.encryptionString = val.encryptionString;
});

watch(finishMsg, (val) => {
  if (val !== '') {
    if (val.errCode === 0) {
      successModal();
    } else {
      errorModal(val.errMessage);
    }
  }
});

function coinType(type, val) {
  if (type === 1 || type === 6 || type === 7) {
    if (addrToBePasted.value.length > 0) {
      return false;
    } else {
      return true;
    }
  }

  if (type === 2 || type === 3) {
    if (addrToBePasted.value.slice(0, 2) === '0x') return false;
    else return true;
  }

  if (type === 4 && tagToBePasted.value.length > 0 && addrToBePasted.value.length > 0) {
    return false;
  } else {
    return true;
  }
}

watch(addrToBePasted, (val) => {
  if (val !== '' && countDownFinished.value === false) {
    isLinksNotPasted.value = coinType(sendData.value.currency_Type);
  } else {
    isLinksNotPasted.value = true;
  }
});

watch(tagToBePasted, () => {
  isLinksNotPasted.value = coinType(sendData.value.currency_Type);
});

onUpdated(() => {
  store.state['partner'].partnerWithdrawMsg = '';
  isLinksNotPasted.value = true;
  isTransAmount.value = false;
  countDownTrigger.value = false;
  if (!activeOtp.value) {
    addrToBePasted.value = '';
    tagToBePasted.value = '';
  }
  if (isShow.value) {
    sendPrice();
  }
});
</script>

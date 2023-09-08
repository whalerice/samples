<template>
  <FavoritesModal
    :modalIsActive="favoritesModalIsActive"
    @closeFavoritesModal="closeFavoritesModal"
    @returnToPush="returnToPush"
  />
  <a-tabs v-model:activeKey="activeTab">
    <a-tab-pane
      class="send-push-wrap"
      v-if="propType === 'all' ? true : propType === 'payment' ? true : false"
      key="payment"
      :tab="t('component.title.payment')"
    >
      <a-card size="small" class="send-push-wrap">
        <a-form layout="vertical">
          <a-form-item>
            <div class="ant-col ant-form-item-label">
              <strong>{{ t('component.label.user_cpass_id') }}({{ t('common.label.mandatory') }})</strong>
              <a-button type="link" @click="favoritesModalIsActive = true" class="pd-0 ml-10 favorite-btn"
                >{{ t('common.button.favorites') }}
              </a-button>
            </div>
            <a-input-group compact>
              <a-input
                v-model:value="previewData.userCpassID"
                placeholder="Name@Example.com"
                :readonly="readonlyCpassIdInput"
                @pressEnter="getConfirmUserID()"
              >
                <template #suffix>
                  <button
                    class="close-btn"
                    type="button"
                    v-if="previewData.userCpassID.length"
                    tabindex="-1"
                    @click="removeInput()"
                  >
                    <svg
                      focusable="false"
                      data-icon="close-circle"
                      width="12px"
                      height="12px"
                      fill="currentColor"
                      color="rgba(0, 0, 0, 0.25)"
                      aria-hidden="true"
                      viewBox="64 64 896 896"
                    >
                      <path
                        d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm165.4 618.2l-66-.3L512 563.4l-99.3 118.4-66.1.3c-4.4 0-8-3.5-8-8 0-1.9.7-3.7 1.9-5.2l130.1-155L340.5 359a8.32 8.32 0 01-1.9-5.2c0-4.4 3.6-8 8-8l66.1.3L512 464.6l99.3-118.4 66-.3c4.4 0 8 3.5 8 8 0 1.9-.7 3.7-1.9 5.2L553.5 514l130 155c1.2 1.5 1.9 3.3 1.9 5.2 0 4.4-3.6 8-8 8z"
                      ></path>
                    </svg>
                  </button>
                  <fa-icon v-if="idValid" icon="check" class="ico-check"></fa-icon>
                </template>
              </a-input>
              <a-button
                type="primary"
                @click="getConfirmUserID()"
                :disabled="confirmBtnHide"
                :loading="confirmBtnLoading"
                >{{ t('common.button.confirm') }}
              </a-button>
            </a-input-group>
            <p class="feed">
              {{ feed }}
            </p>
          </a-form-item>
          <a-form-item>
            <template #label>
              <span>{{ t('component.label.user_store_id') }} ({{ t('common.label.optional') }})</span>
            </template>
            <a-input v-model:value="previewData.userStoreID" allow-clear :maxLength="30" />
          </a-form-item>
          <a-form-item v-if="activeTab === 'payment'">
            <template #label>
              <span>{{ t('component.label.order_name') }} ({{ t('common.label.optional') }})</span>
            </template>
            <a-input v-model:value="previewData.orderName" allow-clear :maxLength="30" />
          </a-form-item>
          <a-form-item>
            <template #label>
              <strong>{{ t('component.label.price') }}({{ t('common.label.mandatory') }})</strong>
            </template>
            <a-input-group compact>
              <a-input v-model:value="previewData.price" @change="setAmount()" :maxLength="15" />
              <a-select
                v-model:value="selectCurrencyType"
                label-in-value
                :options="currencyList"
                @change="resetPrice"
              />
            </a-input-group>
          </a-form-item>
          <a-button class="save-btn" type="primary" :disabled="saveBtnHide" @click="toggleInvoice()">{{
            t('common.button.next')
          }}</a-button>
        </a-form>
      </a-card>
    </a-tab-pane>
    <a-tab-pane
      v-if="propType === 'all' ? true : propType === 'withdraw' ? true : false"
      key="withdraw"
      :tab="t('common.button.withdrawal')"
    >
      <a-card size="small" class="send-push-wrap">
        <a-form layout="vertical">
          <a-form-item>
            <div class="ant-col ant-form-item-label">
              <strong>{{ t('component.label.user_cpass_id') }}({{ t('common.label.mandatory') }})</strong>
              <a-button type="link" @click="favoritesModalIsActive = true" class="pd-0 ml-10 favorite-btn"
                >{{ t('common.button.favorites') }}
              </a-button>
            </div>
            <a-input-group compact>
              <a-input
                v-model:value="previewData.userCpassID"
                placeholder="Name@Example.com"
                :readonly="readonlyCpassIdInput"
                @pressEnter="getConfirmUserID()"
              >
                <template #suffix>
                  <button
                    class="close-btn"
                    type="button"
                    v-if="previewData.userCpassID.length"
                    tabindex="-1"
                    @click="removeInput()"
                  >
                    <svg
                      focusable="false"
                      data-icon="close-circle"
                      width="12px"
                      height="12px"
                      fill="currentColor"
                      color="rgba(0, 0, 0, 0.25)"
                      aria-hidden="true"
                      viewBox="64 64 896 896"
                    >
                      <path
                        d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm165.4 618.2l-66-.3L512 563.4l-99.3 118.4-66.1.3c-4.4 0-8-3.5-8-8 0-1.9.7-3.7 1.9-5.2l130.1-155L340.5 359a8.32 8.32 0 01-1.9-5.2c0-4.4 3.6-8 8-8l66.1.3L512 464.6l99.3-118.4 66-.3c4.4 0 8 3.5 8 8 0 1.9-.7 3.7-1.9 5.2L553.5 514l130 155c1.2 1.5 1.9 3.3 1.9 5.2 0 4.4-3.6 8-8 8z"
                      ></path>
                    </svg>
                  </button>
                  <fa-icon v-if="idValid" icon="check" class="ico-check"></fa-icon>
                </template>
              </a-input>
              <a-button
                type="primary"
                @click="getConfirmUserID()"
                :disabled="confirmBtnHide"
                :loading="confirmBtnLoading"
                >{{ t('common.button.confirm') }}
              </a-button>
            </a-input-group>
            <p class="feed">
              {{ feed }}
            </p>
          </a-form-item>
          <a-form-item>
            <template #label>
              <span>{{ t('component.label.user_store_id') }} ({{ t('common.label.optional') }})</span>
            </template>
            <a-input v-model:value="previewData.userStoreID" allow-clear :maxLength="30" />
          </a-form-item>
          <a-form-item>
            <template #label>
              <strong>{{ t('component.label.price') }}({{ t('common.label.mandatory') }})</strong>
            </template>
            <a-input-group compact>
              <a-input v-model:value="previewData.price" @change="setAmount()" :maxLength="15" :disabled="!idValid" />
              <a-select
                v-model:value="selectCurrencyType"
                label-in-value
                :options="currencyList"
                @change="resetPrice"
              />
            </a-input-group>
          </a-form-item>
          <a-form-item v-if="activeTab === 'withdraw'">
            <template #label>
              <strong>{{ t('component.label.amount') }}</strong>
            </template>
            <a-input v-model:value="amount" :readonly="true" :suffix="'USDT'" :disabled="amountTime !== 0" />
            <p class="feed">
              {{ amountFeed }}
            </p>
          </a-form-item>
          <a-button class="save-btn" type="primary" :disabled="saveBtnHide" @click="toggleInvoice()">{{
            t('common.button.next')
          }}</a-button>
        </a-form>
      </a-card>
    </a-tab-pane>
  </a-tabs>

  <InvoicePreview :active="invoiceActive" :data="propData" @returnInvoice="returnInvoice()" @close="toggleInvoice()" />
</template>

<script setup>
import InvoicePreview from '@/components/modals/InvoicePreview.vue';
import FavoritesModal from '@/components/modals/FavoritesModal.vue';
import { ref, computed, watch, onBeforeMount, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import { comma, decimalNumber, decimal } from '@/assets/js/global.js';
import { lottieModal } from '@/assets/js/global.js';
import { useI18n } from 'vue-i18n';
import { notification } from 'ant-design-vue';
import { apis } from '@/store/api';

const { t } = useI18n();
const store = useStore();
const props = defineProps({
  type: { type: String, default: 'all' },
  purpose: { type: String },
});
const emit = defineEmits(['returnDashboard', 'page']);
const errCode = computed(() => store.state['common'].errCode);
const partnerInfo = computed(() => store.state['sign'].partnerInfo);
const partnerWithdrawalPrice = computed(() => store.state['partner'].partnerWithdrawalPrice);
const paymentVerifyAccount = computed(() => store.state['partner'].paymentVerifyAccount);
const paymentOrderSign = computed(() => store.state['partner'].paymentOrderSign);
const paymentRequestPay = computed(() => store.state['partner'].paymentRequestPay);
const paymentWithdrawal = computed(() => store.state['partner'].paymentWithdrawal);
const errMessage = computed(() => store.state['common'].errMessage);
const currencyList = computed(() => store.state['sign'].currencyList);
const propType = computed(() => props.type);
const propPurpose = computed(() => props.purpose);
const numPrice = computed(() => Number(previewData.value.price.replaceAll(',', '')));
const cpassID = computed(() => previewData.value.userCpassID);
const price = computed(() => previewData.value.price);
const maxUsdt = computed(() =>
  store.state['sign'].partnerWallets.filter((e) => {
    if (e.symbol === 'USDT') {
      return e.balance;
    }
  }),
);
const otpResult = computed(() => store.state['otp'].otpSignatureCode);

const activeTab = ref('payment');
const saveBtnHide = ref(true);
const selectCurrencyType = ref({
  label: '',
  value: '',
  type: '',
});
const previewData = ref({
  userCpassID: ref(''),
  userStoreID: ref(''),
  orderName: ref(''),
  price: ref(''),
});
const propData = ref({});
const idValid = ref(false);
const readonlyCpassIdInput = ref(false);
const confirmBtnLoading = ref(false);
const confirmBtnHide = ref(true);
const feed = ref('');
const amountFeed = ref('');
const amount = ref('');
const amountTime = ref(0);
const amountTimer = ref();
const minimumPrice = ref({
  minimumPrice: 0,
  options: [{ value: 0.01 }, { value: 1 }, { value: 0.01 }, { value: 1 }, { value: 0.01 }, { value: 1 }],
});
const invoiceActive = ref(false);
const favoritesModalIsActive = ref(false);

const openNotification = (val, state) => {
  notification[`${state}`]({
    message: `${val}`,
  });
};
const init = () => {
  previewData.value = {
    userCpassID: ref(''),
    userStoreID: ref(''),
    orderName: ref(''),
    price: ref(''),
  };
  amount.value = '';
  idValid.value = false;
  store.state['partner'].paymentOrderSign = {};
  store.commit('partner/RESET_PAYMENT_VERIFY_ACCOUNT');

  store.state['otp'].otpSignatureCode = '';
  setTimeout(() => {
    feed.value = '';
    amountFeed.value = '';
  }, 1);
  removeInput();
};
const toggleInvoice = () => {
  propData.value = {
    price: numPrice.value,
    order_Name: previewData.value.orderName,
    partner_Member_Id: previewData.value.userStoreID,
    currency: selectCurrencyType.value.type,
    store_Id: partnerInfo.value.partner_Name,
  };
  invoiceActive.value = !invoiceActive.value;
};
const resetPrice = (val) => {
  previewData.value.price = '';
  amount.value = '';
  clearInterval(amountTimer.value);
  const arr = {
    label: val.label,
    value: val.value,
    type: val.option.type,
  };
  selectCurrencyType.value = arr;
};
const setAmount = () => {
  if (activeTab.value === 'withdraw') {
    setAmountTimer();
    amountTime.value = 5;
  }
};
const setAmountTimer = () => {
  if (amountTime.value === 0) {
    amountTimer.value = setInterval(() => {
      amountTime.value -= 1;
      if (amountTime.value === 0) {
        clearInterval(amountTimer.value);
      }
    }, 100);
  }
};
const removeInput = () => {
  previewData.value.userCpassID = '';
  readonlyCpassIdInput.value = false;
  saveBtnHide.value = true;
  idValid.value = false;
  store.commit('partner/RESET_PAYMENT_VERIFY_ACCOUNT');
};
const sendBtnValid = () => {
  if (idValid.value && previewData.value.price.length > 0) {
    saveBtnHide.value = false;
  } else {
    saveBtnHide.value = true;
  }
};
const sendBtnAmountValid = () => {
  if (
    idValid.value &&
    previewData.value.price.length > 0 &&
    minimumPrice.value.minimumPrice <= numPrice.value &&
    amount.value <= maxUsdt.value[0].balance
  ) {
    saveBtnHide.value = false;
  } else {
    saveBtnHide.value = true;
  }
};
const getConfirmUserID = async () => {
  confirmBtnLoading.value = true;
  readonlyCpassIdInput.value = true;
  await store.dispatch('partner/PaymentVerifyAccount', {
    userId: previewData.value.userCpassID,
    partnerCode: partnerInfo.value.partner_Code,
  });
  confirmBtnLoading.value = false;

  const errCode = paymentVerifyAccount.value.errCode;
  const errMessage = paymentVerifyAccount.value.errCode;

  if (errCode === 0 && paymentVerifyAccount.value.returnData.paymentToken !== null) {
    confirmBtnHide.value = true;
    idValid.value = true;
    openNotification(t('notification.title.success'), 'success');

    if (activeTab.value === 'withdraw') {
      sendBtnAmountValid();
    } else {
      sendBtnValid();
    }
  } else {
    readonlyCpassIdInput.value = false;
    feed.value = t('component.error_msg.unregistered_member');
    confirmBtnHide.value = false;
    idValid.value = false;
  }
};
const verifyOtp = async () => {
  const response = await apis.SignatureValidation({
    signature: [otpResult.value.returnData.signature],
  });
  const data = response.data;
  return data;
};
const returnInvoice = async () => {
  toggleInvoice();

  const verifiedOtp = await verifyOtp();

  if (verifiedOtp.errCode === 0) {
    const randomNum = Math.floor(Math.random() * 1000000);
    if (activeTab.value === 'withdraw') {
      await store.dispatch('partner/PaymentWithdrawal', {
        signature: partnerWithdrawalPrice.value?.signature,
        paymentKey: paymentVerifyAccount.value.returnData.userKey,
        partnerCode: partnerInfo.value.partner_Code,
        partnerMemberId: previewData.value.userStoreID,
        walletName: 'USDT',
        currencyType: selectCurrencyType.value.value,
        currencyMoney: numPrice.value,
        amount: partnerWithdrawalPrice.value.fromAmount,
        fee: partnerWithdrawalPrice.value.fee,
      });

      const errCode = paymentWithdrawal.value.errCode;
      const errMessage = paymentWithdrawal.value.errMessage;

      setTimeout(async () => {
        if (errCode !== 0) {
          openNotification(errMessage, 'error');
        } else if (errCode === 0) {
          init();
          lottieModal(t('confirm.title.success_sended'), 'send', 1.5);
          if (propPurpose.value === 'dashboard') {
            emit('returnDashboard');
          }
          emit('page');
          await store.dispatch('sign/partnerWalletInfo');
        }
      }, 10);
    } else if (activeTab.value === 'payment') {
      await store.dispatch('partner/PaymentOrderSign', {
        userKey: paymentVerifyAccount.value.returnData.userKey,
        paymentType: activeTab.value === 'payment' ? 1 : 2,
        partnerCode: partnerInfo.value.partner_Code,
        partnerMemberId: previewData.value.userStoreID,
        orderName: previewData.value.orderName,
        orderNumber: `${randomNum}`,
        currencyType: selectCurrencyType.value.value,
        price: numPrice.value,
      });
      const errCode = paymentOrderSign.value.errCode;

      if (errCode === 0 && paymentOrderSign.value.returnData.signature !== null) {
        await store.dispatch('partner/PaymentRequestPay', {
          signature: paymentOrderSign.value.returnData.signature,
          userKey: paymentVerifyAccount.value.returnData.userKey,
          paymentType: activeTab.value === 'payment' ? 1 : 2,
          partnerCode: partnerInfo.value.partner_Code,
          partnerMemberId: previewData.value.userStoreID,
          orderName: previewData.value.orderName,
          orderNumber: `${randomNum}`,
          currencyType: selectCurrencyType.value.value,
          price: numPrice.value,
          timeStamp: paymentOrderSign.value.returnData.timeStamp,
        });

        const errCode = paymentRequestPay.value.errCode;
        const errMessage = paymentRequestPay.value.errMessage;

        setTimeout(async () => {
          if (errCode === 0) {
            init();
            lottieModal(t('confirm.title.success_sended'), 'send', 1.5);
            if (propPurpose.value === 'dashboard') {
              emit('returnDashboard');
            }
            emit('page');
            await store.dispatch('sign/partnerWalletInfo');
          } else {
            openNotification(errMessage, 'error');
          }
        }, 10);
      }

      store.commit('otp/RESET_STATE');
    } else {
      openNotification(errMessage, 'error');
    }
  } else {
    init();
    openNotification(verifiedOtp.errMessage, 'error');
  }
};

const closeFavoritesModal = (e) => {
  favoritesModalIsActive.value = e;
};
const returnToPush = async (e) => {
  store.commit('partner/RESET_PAYMENT_VERIFY_ACCOUNT');
  previewData.value.userCpassID = e;
  favoritesModalIsActive.value = false;
  idValid.value = false;
  readonlyCpassIdInput.value = false;
  await getConfirmUserID();
};

watch(activeTab, () => {
  init();
});
watch(price, () => {
  amount.value = '';
  previewData.value.price = decimal(previewData.value.price);
  previewData.value.price = decimalNumber(previewData.value.price);
  previewData.value.price = comma(previewData.value.price);
  if (activeTab.value === 'payment') {
    sendBtnValid();
  } else if (activeTab.value === 'withdraw') {
    if (minimumPrice.value.minimumPrice > numPrice.value) {
      amountFeed.value = t('component.error_msg.minimum_quantity');
    } else if (minimumPrice.value.minimumPrice <= numPrice.value) {
      amountFeed.value = '';
    }
  }
});
watch(amount, () => {
  sendBtnAmountValid();
  if (activeTab.value === 'withdraw') {
    if (amount.value > maxUsdt.value[0].balance) {
      amountFeed.value = t('component.error_msg.not_enough_usdt');
    }
    if (minimumPrice.value.minimumPrice <= numPrice.value && amount.value <= maxUsdt.value[0].balance) {
      amountFeed.value = '';
    }
  }
});
watch(cpassID, (value) => {
  if (
    value.match(/^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i) &&
    value.length > 0
  ) {
    feed.value = '';
    confirmBtnHide.value = false;
  } else {
    feed.value = t('component.error_msg.not_match_email_type');
    confirmBtnHide.value = true;
  }
  sendBtnValid();
});
watch(amountTime, async (time) => {
  saveBtnHide.value = true;
  if (time === 0) {
    await store.dispatch('partner/PartnerWithdrawalPrice', {
      walletName: 'USDT',
      currencyType: selectCurrencyType.value.value,
      currencyMoney: numPrice.value,
    });

    if (errCode.value === 0) {
      if (partnerWithdrawalPrice.value.fromAmount === 0) {
        amount.value = '';
      } else {
        amount.value = partnerWithdrawalPrice.value.fromAmount;
      }
    } else {
      openNotification(errMessage, 'error');
    }
  }
});
watch(selectCurrencyType, (val) => {
  minimumPrice.value.minimumPrice = minimumPrice.value.options[val.value - 1].value;
  setTimeout(() => {
    amountFeed.value = '';
  }, 1);
});

onBeforeMount(async () => {
  store.commit('partner/RESET_PAYMENT_VERIFY_ACCOUNT');
  const partnerCurrencyInfo = currencyList.value.filter((e) => e.label === partnerInfo.value.currency_Type)[0];
  selectCurrencyType.value = {
    value: partnerCurrencyInfo.value,
    label: partnerCurrencyInfo.label,
    type: partnerCurrencyInfo.type,
  };
  propType.value === 'withdraw' ? (activeTab.value = 'withdraw') : '';
});

onBeforeUnmount(() => {
  store.commit('partner/RESET_PAYMENT_VERIFY_ACCOUNT');
});
</script>

<style scoped lang="scss">
.favorite-btn {
  height: 2.2rem;
}
</style>

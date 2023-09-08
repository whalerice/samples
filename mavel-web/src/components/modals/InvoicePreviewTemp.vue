<template>
  <div class="invoice-preview-container q-pa-xs">
    <q-img
      src="images/label_cpass.png"
      width="12.6rem"
      height="12.6rem"
      class="absolute-top-left"
      style="top: -2.4rem; left: -2.4rem" />
    <div class="text-center mb-60">
      <h3>
        {{ props.data?.type === PaymentType.Deposit ? $t('modal.title.deposit') : $t('modal.title.withdrawal') }}
      </h3>
    </div>

    <div class="mb-15 q-gutter-y-sm">
      <div class="row justify-between">
        <label>{{ $t('modal.label.price') }}</label>
        <span>{{ comma(props.data.paymentValue) }}</span>
      </div>

      <div class="row justify-between" v-if="props.data?.type === PaymentType.Deposit">
        <label>{{ $t('modal.label.order name') }}</label>
        <span>{{ props.data.paymentValue }} {{ $t('common.button.cash_charging') }}</span>
      </div>

      <div class="row justify-between">
        <label>{{ $t('modal.label.payment') }}</label>
        <span>{{ props.data.paymentSelect.label }}</span>
      </div>

      <div class="row justify-between">
        <label>{{ $t('modal.label.payment_id') }}</label>
        <span>{{ props.data.paymentId }}</span>
      </div>
    </div>

    <q-separator class="mb-20" />

    <p class="column mb-40">
      <template v-if="props.data?.type === PaymentType.Deposit">
        <span>{{ $t('modal.description.deposit_proceed').split('.')[0] }}.</span>
        <span>{{ $t('modal.description.deposit_proceed').split('.')[1] }}</span>
      </template>

      <template v-else>
        <span>{{ $t('modal.description.withdrawal_proceed').split('.')[0] }}.</span>
        <span>{{ $t('modal.description.withdrawal_proceed').split('.')[1] }}.</span>
        <span>{{ $t('modal.description.withdrawal_proceed').split('.')[2] }}</span>
      </template>
    </p>

    <div class="preview-footer row justify-between relative-position">
      <div class="preview-logo-area col-12 col-sm-6">
        <q-img src="images/logo_cpass.png" width="9.1rem" height="3.5rem" />
      </div>
      <div class="row col-12 col-sm-6">
        <q-btn
          no-caps
          class="flex-1"
          color="custom-purple-gradient-01"
          :label="$t('common.button.ok')"
          @click="handleOk"
          :loading="loading" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { commonStore } from 'src/stores/common';
import { apis } from 'src/stores/apis';
import { userStore } from 'src/stores/user';
import { CurrencyType, PaymentType } from 'src/components/models/enums';

const { t } = useI18n();
const $q = useQuasar();
const { comma } = commonStore.common();
const { userPayInfo } = userStore.user();

const loading = ref<boolean>(false);
const props = defineProps({
  data: {
    type: Object as () => IPaymentDefault,
    required: true,
  },
  paymentList: {
    type: Array as () => Array<IPaymentGatewayList>,
    default: () => {
      return [
        { value: 1, label: 'Cpass' },
        { value: 2, label: 'NoBank' },
      ];
    },
  },
  progress: Number,
});

const emit = defineEmits(['update:progress', 'close']);

const withdrawal = async (data: any) => {
  try {
    const res = await apis.Withdrawal(data);

    if (res.data.returnData === null) {
      //cpass
      if (res.data.errCode === 0) {
        await userPayInfo();
        $q.notify({
          type: 'positive',
          message: t('modal.notify.deposit_completed'),
          timeout: 10000,
        });
      }
      // else {
      //   $q.notify({
      //     type: 'negative',
      //     message: res.data.errMessage,
      //     timeout: 10000,
      //   });
      // }
      emit('close', false);
    } else {
      const callback = await apis.CallbackPayment(res.data.returnData);
      if (callback.data.errCode === 0) {
        await userPayInfo();
        $q.notify({
          type: 'positive',
          message: t('modal.notify.deposit_completed'),
          timeout: 10000,
        });
      }
      emit('close', false);
    }

    loading.value = false;
  } catch (error) {
    console.error(error);
  }
};

const deposit = async () => {
  try {
    const send = {
      pg_Idx: props.data.paymentSelect.value,
      signature: props.data.signature.signature,
      payment_Type: PaymentType.Deposit,
      order_Name: props.data.orderName,
      order_Number: props.data.orderNumber,
      currency_Type: CurrencyType.KRW,
      price: Number(String(props.data.paymentValue).replaceAll(',', '')),
      timeStamp: props.data.signature.timeStamp,
    };
    const res = await apis.PaymentRequest(send);

    if (res.data.errCode === 0) {
      $q.notify({
        type: 'positive',
        message: t('modal.notify.deposit_completed'),
        timeout: 10000,
      });
      emit('close', false);
    } else {
      $q.notify({
        type: 'negative',
        message: res.data.errMessage,
        timeout: 10000,
      });
    }

    loading.value = false;
  } catch (error) {
    console.error(error);
  }
};

const onWithdrawal = async () => {
  let send = {
    user_Key: props.data.paymentSelect.desc,
    pg_Idx: props.data.paymentSelect.value,
    currency_Type: CurrencyType.KRW,
    price: Number(String(props.data.paymentValue).replaceAll(',', '')),
  };

  if (props.data.paymentSelect.label === 'Cpass') {
    try {
      const res = await apis.PaymentGatewayUser({
        User_Key: props.data.paymentId,
        Pg_Idx: props.data.paymentSelect.value,
        Payment_Type: 2,
      });

      if (res.data.errCode === 0) {
        send.user_Key = res.data.returnData.user_Sn;
        withdrawal(send);
      }
    } catch (error) {
      console.error(error);
    }
  } else {
    withdrawal(send);
  }
};

const handleOk = async () => {
  loading.value = true;

  if (props.data?.type === PaymentType.Deposit) {
    if (props.data.paymentSelect.label === 'Cpass') {
      emit('update:progress', 2);
    } else {
      deposit();
    }
  } else {
    onWithdrawal();
  }
};
</script>

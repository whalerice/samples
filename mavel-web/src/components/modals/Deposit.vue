<template>
  <a-modal
    v-model:visible="visible"
    :title="$t('modal.title.deposit')"
    centered
    :forceRender="true"
    :destroyOnClose="true"
    :maskClosable="progress === PaymentProgressType.Ready ? true : false"
    :footer="null"
    :afterClose="afterClose"
    @cancel="onClose">
    <template #closeIcon>
      <q-icon name="close" />
    </template>

    <div class="payment-area relative-position">
      <template v-if="progress === PaymentProgressType.Ready">
        <div class="products">
          <q-btn
            v-for="item in products"
            unelevated
            stack
            :key="item.idx"
            :color="isProductActive === item.idx ? 'blue' : 'product'"
            :class="['btn-product', { active: isProductActive === item.idx }]"
            :label="comma(item.price)"
            @click="checkProduct(item)" />
        </div>

        <div class="row justify-between items-center mb-10">
          <div class="col-12 col-sm-4">{{ $t('common.button.deposit') }}</div>
          <div class="col-12 col-sm-8">
            <InputComma
              v-model:value="data.paymentValue"
              placeholder="Please enter your deposit amount."
              :errMsg="errorPaymentValueMsg" />
          </div>
        </div>

        <PaymentSelect
          v-model:payment-id-model-value="data.paymentId"
          v-model:payment-select="data.paymentSelect"
          :errMsg="errorPaymentIdMsg"
          :payment-list="depositPayList" />

        <DownloadApp class="q-mt-lg" v-if="data.paymentSelect.label === 'Cpass'" />

        <div class="row mt-20">
          <q-btn
            unelevated
            color="green-6"
            :label="$t('common.button.ok')"
            padding="1rem"
            class="flex-1"
            @click="onDeposit"
            :loading="loading" />
        </div>
      </template>

      <template v-if="progress === PaymentProgressType.Invoice">
        <InvoicePreviewTemp
          :payment-list="depositPayList"
          :data="data"
          v-model:progress="progress"
          @close="(e) => (visible = e)" />
      </template>
      <template v-if="progress === PaymentProgressType.Pay">
        <PayInProgressTemp v-model:data="payData" @update="payUpdate" @close="(e) => (visible = e)" />
      </template>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import DownloadApp from 'components/DownloadApp.vue';
import InvoicePreviewTemp from 'src/components/modals/InvoicePreviewTemp.vue';
import PayInProgressTemp from 'src/components/modals/PayInProgressTemp.vue';
import PaymentSelect from 'src/components/PaymentSelect.vue';
import InputComma from 'src/components/InputComma.vue';

import { useQuasar } from 'quasar';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { commonStore } from 'src/stores/common';
import { userStore } from 'src/stores/user';
import { paymentStore } from 'src/stores/payment';
import { apis } from 'src/stores/apis';
import { CurrencyType, PaymentType, PaymentProgressType } from 'src/components/models/enums';
import { storeToRefs } from 'pinia';

// const progressType = { Ready: 0, Invoice: 1, Pay: 2 };
const { userInfo } = storeToRefs(userStore.user());
const { depositPayList } = storeToRefs(paymentStore.payment());
const { comma } = commonStore.common();
const { getDepositPayments, paymentDecline } = paymentStore.payment();

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
    required: true,
  },
  paymentList: Array as () => Array<IPaymentGatewayList>,
});

const emits = defineEmits(['close']);
const { t } = useI18n();
const $q = useQuasar();

const loading = ref<boolean>(false);
const products = ref<IProduct[]>([]);
const progress = ref<number>(PaymentProgressType.Ready);
const payData = ref<any>(null);
const payDeclineData = ref<IPaymentDecline | null>(null);
const isProductActive = ref<number>(0);

const dataInitialState = () => {
  return {
    type: PaymentType.Deposit,
    paymentValue: '',
    paymentSelect: { value: 1, label: 'Cpass' },
    paymentId: '',
    signature: { timeStamp: 0, signature: '' },
    orderNumber: '',
    orderName: '',
  };
};

const data = ref<IPaymentDefault>(dataInitialState());
const errorPaymentIdMsg = ref<string>('');
const errorPaymentValueMsg = ref<string>('');

const visible = computed({
  get() {
    return props.show;
  },
  set(value) {
    emits('close', value);
  },
});

const checkProduct = (item: IProduct) => {
  isProductActive.value = item.idx;
  data.value.paymentValue = comma(String(item.price));
};

const onDeposit = async () => {
  if (Number(data.value.paymentValue) === 0 || data.value.paymentValue === '0' || data.value.paymentValue === '') {
    errorPaymentValueMsg.value = t('dialog.error_msg.enter_deposit');
  } else if (data.value.paymentSelect.label === 'Cpass' && data.value.paymentId === '') {
    errorPaymentIdMsg.value = t('dialog.error_msg.enter_cpass');
  } else {
    const send = {
      price: Number(data.value.paymentValue.replaceAll(',', '')),
      category: 1, // category : 1(충전) 2(환전)
    };

    try {
      const res = await apis.PaymentCheckPosible(send);

      if (res.data.errCode === 0) {
        onPayment();
        $q.cookies.set('cpass_id', data.value.paymentId);
      } else {
        errorPaymentValueMsg.value = res.data.errMessage;
      }
    } catch (error) {
      console.error(error);
    }
  }
};

const onPayment = async () => {
  loading.value = true;

  let send: any = {
    pg_Idx: data.value.paymentSelect.value,
    payment_Type: data.value.type,
    order_Name: `${data.value.paymentValue} ${t('common.button.cash_charging')}`,
    order_Number: String(Math.floor(Math.random() * 10000)),
    currency_Type: CurrencyType.KRW,
    price: Number(data.value.paymentValue.replaceAll(',', '')),
  };

  if (data.value.paymentSelect.label === 'Cpass') {
    try {
      const res = await apis.PaymentGatewayUser({
        User_Key: data.value.paymentId,
        Pg_Idx: data.value.paymentSelect.value,
        Payment_Type: 1,
      });

      if (res.data.errCode === 0) {
        send = { ...send, sign_Key: res.data.returnData.user_Sn };
        paymentSignature(send);
      }
    } catch (error) {
      console.error(error);
    }
  } else {
    paymentSignature(send);
  }
};

const paymentSignature = async (e: any) => {
  try {
    const res = await apis.PaymentSignature(e);

    if (res.data.errCode === 0) {
      progress.value = PaymentProgressType.Invoice;
      data.value.orderName = e.order_Name;
      data.value.orderNumber = e.order_Number;
      data.value.signature = res.data.returnData;
      payData.value = { ...e, ...res.data.returnData };

      loading.value = false;
    }
  } catch (error) {
    console.error(error);
    loading.value = false;
  }
};

const productList = async () => {
  try {
    const res = await apis.ProductList();

    if (res.data.errCode === 0) {
      let items = [];
      for (let i = 0; i < res.data.returnData.length; i++) {
        const el = res.data.returnData[i];
        items.push(el);
      }
      products.value = items;
    }
  } catch (error) {
    console.error(error);
  }
};

const payUpdate = (value: IPaymentDecline) => {
  payDeclineData.value = value;
};

const onClose = () => {
  visible.value = false;
  if (payDeclineData.value !== null) {
    paymentDecline(payDeclineData.value);
  }
  afterClose();
};

const afterClose = () => {
  isProductActive.value = 0;
  progress.value = PaymentProgressType.Ready;
  data.value.paymentValue = '';
  data.value.paymentId = '';
  errorPaymentValueMsg.value = '';
  errorPaymentIdMsg.value = '';
};

watch(visible, (value) => {
  if (value) {
    productList();
    getDepositPayments(userInfo.value.site_Idx);

    if ($q.cookies.get('cpass_id') !== null) data.value.paymentId = $q.cookies.get('cpass_id');
  }
});

watch(depositPayList, (value) => {
  data.value.paymentSelect = value[0];
});

watch(data.value, (v) => {
  const currentValue = Number(String(v.paymentValue).replaceAll(',', ''));
  const match = products.value.filter((e) => e.price === currentValue)[0];

  if (match === undefined) {
    isProductActive.value = 0;
  } else {
    isProductActive.value = match.idx;
  }

  if (v.paymentValue.length > 0) {
    errorPaymentValueMsg.value = '';
  }

  if (v.paymentId.length > 0) {
    errorPaymentIdMsg.value = '';
  }
});
</script>

<template>
  <a-modal
    v-model:visible="visible"
    :title="$t('modal.title.withdrawal')"
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

    <div class="withdraw-container relative-position">
      <template v-if="progress === PaymentProgressType.Ready">
        <div class="row justify-between items-center mb-10">
          <div class="col-4">{{ $t('modal.label.cash') }}</div>
          <q-field class="col-8" rounded outlined v-model="cash" tabindex="0" dense>
            <template v-slot:control>
              <div class="self-center full-width no-outline text-right" tabindex="0">
                {{ comma(String(payInfo?.cash)) }}
              </div>
            </template>
          </q-field>
        </div>
        <div class="row justify-between items-center mb-10">
          <div class="col-4">{{ $t('common.button.withdrawal') }}</div>
          <div class="col-8">
            <InputComma v-model:value="data.paymentValue" :errMsg="errorPaymentValueMsg" />
          </div>
        </div>

        <PaymentSelect
          v-model:payment-id-model-value="data.paymentId"
          v-model:payment-select="data.paymentSelect"
          :errMsg="errorPaymentIdMsg"
          :payment-list="withdrawalPayList" />

        <DownloadApp class="q-mt-lg" v-if="data.paymentSelect.label === 'Cpass'" />

        <div class="row mt-20">
          <q-btn
            unelevated
            color="green-6"
            :label="$t('common.button.ok')"
            padding="1rem"
            class="flex-1"
            @click="onNext" />
        </div>
      </template>

      <template v-if="progress === 1">
        <InvoicePreviewTemp
          :payment-list="withdrawalPayList"
          :data="data"
          :progress="progress"
          @close="(e:boolean) => (visible = e)" />
      </template>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import DownloadApp from 'components/DownloadApp.vue';
import InputComma from 'components/InputComma.vue';
import InvoicePreviewTemp from 'components/modals/InvoicePreviewTemp.vue';
import PaymentSelect from 'components/PaymentSelect.vue';

import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { userStore } from 'src/stores/user';
import { commonStore } from 'src/stores/common';
import { paymentStore } from 'src/stores/payment';
import { PaymentType, PaymentProgressType } from 'src/components/models/enums';
import { apis } from 'src/stores/apis';

const { t } = useI18n();
const $q = useQuasar();

const { payInfo } = storeToRefs(userStore.user());
const { withdrawalPayList } = storeToRefs(paymentStore.payment());
const { getWithdrawPayments } = paymentStore.payment();
const { comma } = commonStore.common();

const dataInitialState = () => {
  return {
    type: PaymentType.Withdrawal,
    paymentValue: '',
    paymentSelect: { value: 1, label: 'Cpass' },
    paymentId: '',
    signature: { timeStamp: 0, signature: '' },
    orderNumber: '',
  };
};

const data = ref<IPaymentDefault>(dataInitialState());
const cash = ref<number>(0);
const progress = ref<number>(PaymentProgressType.Ready);
const errorPaymentValueMsg = ref<string>('');
const errorPaymentIdMsg = ref<string>('');

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
    required: true,
  },
  paymentList: Array as () => Array<IPaymentGatewayList>,
});

const visible = computed({
  get() {
    return props.show;
  },
  set(value) {
    emits('close', value);
  },
});

const emits = defineEmits(['close']);

const onNext = async () => {
  if (Number(data.value.paymentValue) === 0 || data.value.paymentValue === '0' || data.value.paymentValue === '') {
    errorPaymentValueMsg.value = t('dialog.error_msg.enter_withdraw');
  } else if (data.value.paymentSelect.label === 'Cpass' && data.value.paymentId === '') {
    errorPaymentIdMsg.value = t('dialog.error_msg.enter_cpass');
  } else {
    const send = {
      price: Number(data.value.paymentValue.replaceAll(',', '')),
      category: 2, // category : 1(충전) 2(환전)
    };

    try {
      const res = await apis.PaymentCheckPosible(send);

      if (res.data.errCode === 0) {
        progress.value = PaymentProgressType.Invoice;
        $q.cookies.set('cpass_id', data.value.paymentId);
      } else {
        errorPaymentValueMsg.value = res.data.errMessage;
      }
    } catch (error) {
      console.error(error);
    }
  }
};

const onClose = () => {
  visible.value = false;
  afterClose();
};

const afterClose = () => {
  progress.value = PaymentProgressType.Ready;
  data.value.paymentValue = '';
  data.value.paymentId = '';
  errorPaymentValueMsg.value = '';
  errorPaymentIdMsg.value = '';
};

watch(data.value, (v) => {
  if (v.paymentValue.length > 0) {
    errorPaymentValueMsg.value = '';
  }

  if (v.paymentId.length > 0) {
    errorPaymentIdMsg.value = '';
  }
});

watch(withdrawalPayList, (value) => {
  data.value.paymentSelect = value[0];
});

watch(visible, (value) => {
  if (value) {
    getWithdrawPayments();
    if ($q.cookies.get('cpass_id') !== null) data.value.paymentId = $q.cookies.get('cpass_id');
  }
});
</script>

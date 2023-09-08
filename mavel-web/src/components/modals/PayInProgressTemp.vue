<template>
  <div class="text-center q-pt-xl">
    <img src="/images/logo_cpass.png" alt="" />
    <Vue3Lottie :animationData="Lottie.paperplane" width="30rem" />
    <p class="column">
      <span class="text-h4">{{ $t('modal.description.payment_in_progress').split('.')[0] }}.</span>
      <span class="text-h4">{{ $t('modal.description.payment_in_progress').split('.')[1] }}.</span>
    </p>
    <StatisticCountdown :value="time" format="mm:ss" @finish="onFinish" class="text-custom-red-01" />
    <div class="mt-15 mb-10">
      <q-btn
        color="custom-purple-gradient-01"
        :label="$t('common.button.retry')"
        @click="handleRetry"
        padding="1rem 3rem" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { useQuasar } from 'quasar';
import { ref, onBeforeUnmount, onMounted } from 'vue';
import { StatisticCountdown } from 'ant-design-vue';
import { Vue3Lottie } from 'vue3-lottie';
import { useI18n } from 'vue-i18n';

import { Lottie } from 'src/assets/lottie';
import { userStore } from 'src/stores/user';
import { apis } from 'src/stores/apis';

const { t } = useI18n();
const $q = useQuasar();
const time = ref(Date.now() + 1000 * 0);
const { userPayInfo } = userStore.user();

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['close', 'update']);

const onFinish = () => {
  // console.log('로컬 타임 끝');
};

const isDesktop = ref<boolean>($q.platform.is.desktop ? $q.platform.is.desktop : false);
const updateData = ref<IPaymentDecline>({
  pg_Idx: props.data.pg_Idx,
  pg_Request_No: '',
  signature: [props.data.signature],
});

const getData = ref<any>({
  ...props.data,
  isWindow: isDesktop.value,
});

const deepLink = (paymentId: any) => {
  let url = `https://cpass.page.link/?link=https://apps.cpass.exchange/payment/${paymentId}&apn=com.digilab24.apps&ibi=com.digilab24.apps`;
  window.location.href = url;
};

const paymentRequest = async () => {
  try {
    const res = await apis.PaymentRequest(getData.value);
    const returnData = res.data.returnData;
    updateData.value['pg_Request_No'] = returnData.pg_Request_No;
    emit('update', updateData.value);
    if (res.data.errCode === 0) {
      if (returnData.signature !== null) {
        clearInterval(requestInterval);
      } else {
        time.value = Date.now() + 1000 * 300;
        if (isDesktop.value === false) {
          deepLink(returnData.pg_Request_No);
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
};

const handleRetry = async () => {
  try {
    const res = await apis.PaymentReOrder({
      signature: getData.value.signature,
      pg_Idx: getData.value.pg_Idx,
      order_Number: getData.value.order_Number,
      timeStamp: getData.value.timeStamp,
      isWindow: isDesktop.value,
    });

    const returnData = res.data.returnData;

    if (res.data.errCode === 0) {
      time.value = Date.now() + 1000 * 300;

      getData.value['signature'] = returnData.signature;
      getData.value['timeStamp'] = returnData.timeStamp;

      updateData.value['pg_Request_No'] = returnData.pg_Request_No;
      updateData.value['signature'] = [returnData.signature];
      emit('update', updateData.value);

      if (!isDesktop.value) {
        deepLink(returnData.pg_Request_No);
      }
    }
  } catch (e) {
    console.error(e);
  }
};

const paymentState = async () => {
  try {
    const res = await apis.PaymentState({
      pg_Idx: getData.value.pg_Idx,
      signature: getData.value.signature,
    });

    if (res.data.errCode === 0) {
      if (res.data.returnData.isComplete) {
        $q.notify({
          type: 'positive',
          message: t('modal.notify.deposit_completed'),
          timeout: 10000,
        });
        clearInterval(requestInterval);
        emit('close', false);
        emit('update', null);
      }
      // if (res.data.returnData.isExpired) {
      //   // $q.notify({
      //   //   type: 'warning',
      //   //   message: 'isExpired',
      //   //   timeout: 10000,
      //   // });
      //   // emit('close', false);
      // }
      if (res.data.returnData.isCancel) {
        $q.notify({
          type: 'negative',
          // spinner: QSpinnerGears,
          message: t('modal.notify.deposit_cancelled'),
          timeout: 10000,
        });
        clearInterval(requestInterval);
        emit('close', false);
        emit('update', null);
      }
    }
  } catch (error) {
    console.error(error);
  }
};

const requestInterval = setInterval(() => {
  paymentState();
}, 2000);

onMounted(() => {
  paymentRequest();
});

onBeforeUnmount(async () => {
  clearInterval(requestInterval);
  await userPayInfo();
});
</script>

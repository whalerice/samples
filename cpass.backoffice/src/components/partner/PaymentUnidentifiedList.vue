<template>
  <a-card class="unconfirmed-payment-detail mb-15" size="small">
    <template #title>
      <span>{{
        accessName === 'Personal'
          ? t('component.title.unconfirmed_payments')
          : t('component.title.unconfirmed_withdraw')
      }}</span>
    </template>
    <template #extra>
      <strong v-if="lists?.length !== 0" :class="{ hide: isLoading }">
        &nbsp;({{ currentCount + 1 }}/{{ lists?.length }})
      </strong>
    </template>
    <a-skeleton class="skeleton-ab" :class="{ hide: !isLoading }" active />
    <a-empty v-if="lists?.length === 0 && !isLoading" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
    <a-carousel
      v-if="lists.length !== 0"
      class="customer-request-list-container"
      arrows
      ref="carousel"
      :class="{ hide: isLoading }"
      :dots="false"
      :afterChange="changePage"
      :key="lists"
    >
      <template #prevArrow>
        <div class="custom-slick-arrow ar-l">
          <left-outlined />
        </div>
      </template>
      <template #nextArrow>
        <div class="custom-slick-arrow ar-r">
          <right-outlined />
        </div>
      </template>
      <a-card class="card" v-for="(item, index) in lists" :key="index">
        <ul class="customer-request-list">
          <li class="item">
            <h3>{{ item.user_Id.split('||')[1] }}</h3>
            <h3>{{ item.currency }} {{ item.currency_Amount }}</h3>
          </li>
          <li class="item" v-if="item.request_Date">
            <span>{{ t('datatable.thead.request_date') }}</span> <span>{{ item.request_Date }}</span>
          </li>
          <li class="item" v-if="item.processing_Date && accessName === 'Personal'">
            <span>{{ t('component.label.payment_date') }}</span> <span>{{ item.processing_Date }}</span>
          </li>
          <li class="item" v-if="item.store_Id">
            <span>{{ t('component.label.user_store_id') }}</span> <span>{{ item.store_Id }}</span>
          </li>
          <li class="item" v-if="item.order_Name">
            <span>{{ t('component.label.product_name') }}</span> <span>{{ item.order_Name }}</span>
          </li>
          <li class="item" v-if="accessName === 'Personal'">
            <span>{{ t('component.label.payment_amount') }}</span>
            <span>{{ item.payment_Amount }}</span>
          </li>
          <li class="item" v-if="accessName === 'Enterprise'">
            <span>{{ t('component.label.withdrawal_amount') }}</span> <span>{{ item.payment_Amount }}</span>
          </li>
          <li class="item" v-if="accessName === 'Enterprise'">
            <span>{{ t('common.button.commission') }}</span> <span>{{ item.payment_Fee }}</span>
          </li>
          <li class="item" v-if="accessName === 'Enterprise'">
            <span>{{ t('datatable.thead.total_amount') }}</span> <span>{{ item.payment_Actual }}</span>
          </li>
        </ul>
      </a-card>
    </a-carousel>
    <div v-if="lists?.length !== 0" class="customer-request-list-btn" :class="{ hide: isLoading }">
      <a-button
        v-if="accessName === 'Enterprise'"
        @click="clickConfirm('refusal', lists[currentCount])"
        class="refusal"
        danger
        size="small"
        shape="round"
        >{{ t('common.button.refusal') }}</a-button
      >
      <a-button
        class="ml-5"
        v-if="accessName === 'Enterprise'"
        @click="clickConfirm('approval', lists[currentCount])"
        type="primary"
        size="small"
        shape="round"
        >{{ t('common.button.approval') }}</a-button
      >
      <a-button
        v-if="accessName === 'Personal'"
        @click="clickConfirm('confirm', lists[currentCount])"
        type="primary"
        size="small"
        shape="round"
        >{{ t('common.button.confirm') }}</a-button
      >
    </div>
  </a-card>
  <OTP v-if="activeOtp" :type="'registerAndCertificate'" @returnOtp="returnOtp" @closeOtp="toggleOtp()" />
</template>
<script setup>
import { computed, ref, onBeforeMount, watch } from 'vue';
import { useStore } from 'vuex';
import { LeftOutlined, RightOutlined } from '@ant-design/icons-vue';
import OTP from '@/components/modals/OTP.vue';
import { useI18n } from 'vue-i18n';
import { accessList, lottieModal } from '@/assets/js/global.js';
import { Empty } from 'ant-design-vue';
import { notification } from 'ant-design-vue';

const { t } = useI18n();
const store = useStore();
const isLoading = computed(() => store.state['partner'].loading.paymentUnidentifiedList);
const lists = computed(() =>
  store.state['partner'].paymentUnidentifiedList?.returnData?.length > 0
    ? store.state['partner'].paymentUnidentifiedList?.returnData
    : [],
);
const grade = computed(() => store.state['sign'].signInfo.grade);
const signInfo = computed(() => store.state['sign'].signInfo);
const otpVerify = computed(() => store.state['otp'].otpVerify);
const errCode = computed(() => store.state['common'].errCode);
const paymentRequestConfirm = computed(() => store.state['partner'].paymentRequestConfirm);
const currentCount = ref(0);
const activeOtp = ref(false);
const btnInfo = ref({});
const accessName = ref('');
const carousel = ref(null);

const openNotification = (val, state) => {
  notification[`${state}`]({
    message: `${val}`,
  });
};

const changePage = (val) => {
  currentCount.value = val;
  store.commit('partner/SET_UNDEFINED_LIST_CURRENT_SN', val);
};
const clickConfirm = (type, data) => {
  toggleOtp(type, data);
  btnInfo.value = {
    data: data,
    type: type,
  };
};
const toggleOtp = async (type, data) => {
  if (type !== 'confirm') {
    activeOtp.value = !activeOtp.value;
  } else if (type === 'confirm') {
    confirm(data, type);
  }
};
const returnOtp = () => {
  confirm(btnInfo.value.data, btnInfo.value.type);
};
const confirm = async (data, type) => {
  if (type === 'confirm') {
    await store.dispatch('partner/PaymentRequestConfirm', {
      idx: data.request_Idx,
    });
    const errCode = paymentRequestConfirm.value.errCode;
    const errMessage = paymentRequestConfirm.value.errMessage;

    if (errCode === 0) {
      lottieModal(t('component.title.success_confirm'), 'setting', 1.5);
    } else {
      openNotification(errMessage, 'error');
    }
  } else if (type === 'approval' || type === 'refusal') {
    await store.dispatch('partner/PartnerWithdrawStateChange', {
      deal_Id: data.confirmation_Number,
      approve_YN: type === 'approval' ? 1 : 0,
      approver_Sn: signInfo.value.sn,
      approver_Grade: signInfo.value.grade,
      signature: [`${otpVerify.value.returnData.signature}`],
    });
    if (errCode.value === 0) {
      await lottieModal(t('confirm.description.success_saved'), 'setting', 1.5);
    }
  }
  getData();
};
const getData = async () => {
  await store.dispatch('partner/PartnerPaymentAcceptCount');
  await store.dispatch('partner/PartnerPaymentUnidentifiedList');
  store.commit('partner/SET_UNDEFINED_LIST_CURRENT_SN', 1);
};

watch(lists, () => {
  if (lists.value.length > 0)
    setTimeout(() => {
      carousel.value.goTo(currentCount.value, true);
    }, 1);
});

onBeforeMount(async () => {
  getData();
  accessName.value = accessList.filter((e) => e.idx === grade.value)[0].name;
});
</script>

<style lang="scss">
// .ar {
//   &-l {
//     left: 10px;
//     z-index: 1;
//   }
//   &-r {
//     right: 10px;
//   }
// }

.unconfirmed-payment-detail {
  .ant-card-head {
    padding: 0;
  }
  .ant-card-head-wrapper {
    padding: 0;
  }
}
</style>

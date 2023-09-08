<template>
  <SideBar />
  <section class="container">
    <Header />
    <div class="contents">
      <router-view />
    </div>
  </section>
  <vue3-autocounter
    class="txt-hide"
    :startAmount="20"
    :endAmount="0"
    :duration="20"
    @finished="alarmAction"
    ref="$timer"
  />
</template>

<script setup>
import Header from '@/components/layout/Header.vue';
import SideBar from '@/components/layout/SideBar.vue';

import Vue3Autocounter from 'vue3-autocounter';
import { Modal } from 'ant-design-vue';
import { useStore } from 'vuex';
import { computed, onBeforeMount, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { accessList, partner } from '@/assets/js/global.js';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const grade = computed(() => store.state['sign'].signInfo.grade);
const store = useStore();
const $timer = ref(null);
const accessName = ref('');
const isPartner = ref(false);
const isNotification = computed(() => store.state['sign'].notification);
const remoteRefresh = computed(() => store.state['partner'].remoteRefresh);

const personalHeaderRefresh = async () => {
  await store.dispatch('partner/PartnerPaymentAcceptCount');
  await store.dispatch('partner/PartnerPaymentSalesStatus');
  await store.dispatch('partner/PartnerPartnerWalletTotal');
  await store.dispatch('partner/PartnerPaymentRecentPaymentList', {
    user_Sn: 0,
    payment_Type: 0,
  });
};
const enterpriseHeaderRefresh = async () => {
  await store.dispatch('partner/PartnerPaymentAcceptCount');
  await store.dispatch('partner/PartnerPaymentSalesStatus');
  await store.dispatch('partner/PartnerPartnerWalletTotal');
  await store.dispatch('partner/PartnerPaymentRecentPaymentList', {
    user_Sn: 0,
    payment_Type: 0,
  });
};

const alarmAction = async () => {
  if (accessName.value === 'Personal') {
    await personalHeaderRefresh();
  } else if (accessName.value === 'Enterprise') {
    await enterpriseHeaderRefresh();
  }
  $timer.value.start();
};

const paymentAcceptCount = computed(() => store.state['partner'].isRefresh.paymentAcceptCount);
const paymentSalesStatus = computed(() => store.state['partner'].isRefresh.paymentSalesStatus);
const partnerWalletTotal = computed(() => store.state['partner'].isRefresh.partnerWalletTotal);

watch(paymentAcceptCount, (val) => {
  if (val && isNotification.value) {
    Notification.requestPermission().then(function (permission) {
      if (permission === 'granted') {
        new Notification('CPASS BACKOFFICE', {
          body: t('alarm.text.new_withdrawal'),
        });
      }
    });

    store.commit('partner/SET_REFRESH', {
      data: 'paymentAcceptCount',
      value: false,
    });
  }
});
// watch(paymentSalesStatus, (val) => {
//   if (val && isNotification.value) {
//     const body = new Notification('CPASS BACKOFFICE', {
//       body: 'New Currency Changing',
//     });

//     body.onclick = function () {
//       store.commit('partner/SET_REFRESH', {
//         data: 'paymentSalesStatus',
//         value: false,
//       });
//     };
//   }
// });
watch(partnerWalletTotal, (val) => {
  if (val && isNotification.value) {
    Notification.requestPermission().then(function (permission) {
      if (permission === 'granted') {
        new Notification('CPASS BACKOFFICE', {
          body: t('alarm.text.new_asset'),
        });
      }
    });

    store.commit('partner/SET_REFRESH', {
      data: 'partnerWalletTotal',
      value: false,
    });
  }
});

watch(remoteRefresh, async (val) => {
  if (val) {
    accessName.value === 'Personal' ? await personalHeaderRefresh() : await enterpriseHeaderRefresh();
  }
});

onMounted(async () => {
  if (isPartner.value) {
    accessName.value === 'Personal' ? await personalHeaderRefresh() : await enterpriseHeaderRefresh();
    $timer.value.start();
  }
});
onBeforeMount(async () => {
  store.commit('common/SET_STOP_REQUEST', false);

  accessName.value = accessList.filter((e) => grade.value === e.idx)[0].name;
  isPartner.value = [...partner].filter((e) => e === grade.value).length > 0;
  await store.dispatch('sign/currencyList');
  await store.dispatch('sign/coinList');
  if (isPartner.value) {
    await store.dispatch('otp/OtpRegisterUri');
    await store.dispatch('sign/partnerMyInfo');
    store.commit('sign/GET_PARTNER_WALLET_INFO', store.state['sign'].partnerWallets);
    store.commit('sign/SET_PARTNER_COIN_LIST', store.state['sign'].partnerWallets);
  }
});
onBeforeUnmount(() => {
  Modal.destroyAll();
});
</script>

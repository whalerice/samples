<template>
  <header
    class="header"
    :class="{
      partner: isPartner || isManager,
      'partner-mobile-rt': isPartner || isManager,
    }"
  >
    <ManagerTopMenu v-if="isManager" />
    <a-tabs v-if="isPartner" class="header-tab" type="card" :mobile="false">
      <a-tab-pane v-for="(item, index) in headerShortTabList" :key="index">
        <template #tab>
          <span @click="openShortModal(item.index)">
            {{ t(item.label) }}
            {{ item.index > 3 ? '' : currencyType }}
            {{ item.data === undefined ? '' : item.data === null ? 0 : comma(item.data) }}
          </span>
        </template>
      </a-tab-pane>
      <template #renderTabBar="{ DefaultTabBar, ...props }">
        <component :is="DefaultTabBar" v-bind="props" :mobile="false" />
      </template>
    </a-tabs>
    <a-modal
      class="header-modal-layout border-remove"
      :visible="shortTabModalVisible"
      @cancel="closeShortModal"
      :footer="false"
    >
      <component
        :is="isComponent?.component"
        :index="isComponent?.index"
        :purpose="isComponent?.purpose"
        :type="isComponent?.type"
        @returnDashboard="sendPushFormReturn"
      />
    </a-modal>

    <div class="rt" :class="{ between: isPartner }">
      <div v-if="isPartner" class="show">
        <router-link to="/" class="logo">sidebar</router-link>
      </div>

      <div class="rt-in">
        <GmailAlarm v-if="isAdministrator" />
        <GeneralAlarm />

        <a-dropdown :trigger="['click']">
          <a-button @click.prevent>
            <template #icon>
              <fa-icon icon="gear" />
            </template>
          </a-button>
          <template #overlay>
            <a-menu class="setting-layer">
              <a-menu-item
                ><fa-icon class="ico-header" icon="circle-user" /><span>{{ accessName }}</span></a-menu-item
              >
              <a-menu-item
                ><fa-icon class="ico-header" icon="envelope" /><span>{{ userInfo.user_Id }}</span></a-menu-item
              >
              <a-menu-item class="flex" v-if="isPartner">
                <div class="divider">
                  <fa-icon class="ico-header" icon="fa-sharp fa-percent" />{{ t('common.button.commission') }}
                </div>
              </a-menu-item>
              <a-menu-item class="flex" v-if="isPartner">
                <div class="divider sub">
                  {{ t('common.label.deposit_commission') }}
                </div>
                <span>{{ partnerInfo.partner_Rate }}%</span>
              </a-menu-item>
              <a-menu-item class="flex" v-if="isPartner">
                <div class="divider sub">
                  {{ t('common.label.withdrawal_commission') }}
                </div>
                <span>{{ partnerInfo.withdraw_Rate }}%</span>
              </a-menu-item>
              <a-menu-item class="flex" v-if="isPartner">
                <div class="divider">
                  <fa-icon class="ico-header" icon="fa-sharp fa-money-check" />{{ t('common.button.guarantee') }}
                </div>
                <span>{{ comma(partnerInfo.guarantee) }} USDT</span>
              </a-menu-item>
              <a-menu-item v-if="isPartner" class="flex">
                <div class="divider"><fa-icon class="ico-header" icon="fa-lock" />Google OTP</div>
                <a-switch class="pe-possible" :checked="otpIsRegister" @click="toggleEmail('otp')" />
              </a-menu-item>
              <a-sub-menu>
                <template #title> <Translate :header="true" /></template>
              </a-sub-menu>
              <a-menu-item v-if="isPartner || isAdministrator" class="flex">
                <div class="divider">
                  <fa-icon class="ico-header" icon="bell" />{{ t('common.label.notification') }}
                </div>
                <a-switch class="pe-possible" :checked="notification" @click="toggleNotification()" />
              </a-menu-item>
              <a-menu-item v-if="isPartner" class="flex">
                <div class="divider"><fa-icon class="ico-header" icon="fa-key" />{{ t('common.label.password') }}</div>
                <span class="clickChange pe-possible" @click="toggleEmail('changePassword')">{{
                  t('common.button.change')
                }}</span>
              </a-menu-item>
              <a-menu-item v-if="isPartner" class="flex">
                <div class="divider">
                  <fa-icon class="ico-header" icon="coins" />{{ t('common.label.possible_coin') }}
                </div>
                <span class="clickChange pe-possible" @click="openTradableCoin()">{{ t('common.button.change') }}</span>
              </a-menu-item>

              <a-menu-item>
                <a-button class="pe-possible wd100" @click="SignOut">
                  <fa-icon icon="right-from-bracket" /> {{ $t('common.button.logout') }}</a-button
                >
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>

        <button
          type="button"
          class="sidenav-toggler-inner"
          :class="{ on: store.state.common.isSidebar }"
          @click="ToggleSidebar"
        >
          <i class="sidenav-toggler-line"></i>
          <i class="sidenav-toggler-line"></i>
          <i class="sidenav-toggler-line"></i>
        </button>
      </div>
    </div>
  </header>
  <EmailVerification v-if="activeEmail" @returnEmail="returnEmail" @closeEmail="toggleEmail()" />
  <OTP v-if="activeOtp" :type="'register'" @returnOtp="returnOtp" @closeOtp="toggleOtp()" />
  <ChangePassword
    v-if="activeChangePassword"
    @closeChangePassword="toggleChangePassword()"
    @returnChangePassword="returnChangePassword"
  />
  <SetTradableCoinModal :show="activeTradableCoin" @close="closeTradableCoin" />
</template>
<script setup>
import Translate from '@/components/common/Translate.vue';
import GeneralAlarm from '@/components/common/GeneralAlarm.vue';
import GmailAlarm from '@/components/common/GmailAlarm.vue';
import OTP from '@/components/modals/OTP.vue';
import EmailVerification from '@/components/partner/EmailVerification.vue';
import ChangePassword from '@/components/modals/ChangePassword.vue';
import SetTradableCoinModal from '@/components/modals/SetTradableCoinModal.vue';
import RecentPaymentWithdrawalListEnterprise from '@/components/datatable/RecentPaymentWithdrawalListEnterprise.vue';

import RecentPaymentWithdrawalList from '@/components/datatable/RecentPaymentWithdrawalList.vue';
import PartnerMyWalletWidget from '@/components/dashboard/PartnerMyWalletWidget.vue';
import PartnerDepositWithdrawalWidget from '@/components/dashboard/PartnerDepositWithdrawalWidget.vue';
import SendPushForm from '@/components/partner/SendPushForm.vue';
import ManagerTopMenu from '@/components/header/ManagerTopMenu.vue';

import { ref, watch, computed, onBeforeMount, markRaw } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { admin, manager, accessList, comma, partner, authGroup } from '@/assets/js/global.js';
import { lottieModal } from '@/assets/js/global.js';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const store = useStore();
const router = useRouter();
const currencyType = computed(() => store.state['sign'].partnerInfo.type);
const grade = computed(() => store.state['sign'].signInfo.grade);
const userInfo = computed(() => store.state['sign'].userInfo);
const otpIsRegister = computed(() => store.state['otp'].otpIsRegister);
const notification = computed(() => store.state['sign'].notification);
const partnerInfo = computed(() => store.state['sign'].partnerInfo);
const currentPage = ref(router.currentRoute.value.meta.title);
const accessName = ref('');
const isAdministrator = ref(false);
const isPartner = ref(false);
const activeOtp = ref(false);
const activeEmail = ref(false);
const activeChangePassword = ref(false);
const returnDestination = ref('');

const isDeviceMobile = computed(() => store.state['common'].isDeviceMobile);
const isMobile = ref(isDeviceMobile.value);

const headerInfo = computed(() => store.state['partner'].headerInfo);
const headerShortTabList = ref([
  {
    label: 'common.label.deposit_24h',
    component:
      accessName.value === 'Personal'
        ? markRaw(RecentPaymentWithdrawalList)
        : markRaw(RecentPaymentWithdrawalListEnterprise),
    index: 1,
    data: computed(() => headerInfo.value?.paymentSalesStatus?.returnData?.deposit_Amount),
    value: 1,
  },
  {
    label: 'common.label.withdrawal_24h',
    component:
      accessName.value === 'Personal'
        ? markRaw(RecentPaymentWithdrawalList)
        : markRaw(RecentPaymentWithdrawalListEnterprise),
    index: 2,
    data: computed(() => headerInfo.value?.paymentSalesStatus?.returnData?.withdrawal_Amount),
    value: 2,
  },
  {
    label: 'common.label.total_asset',
    component: markRaw(PartnerMyWalletWidget),
    index: 3,
    data: computed(() => headerInfo.value?.partnerWalletTotal?.returnData?.total_Price),
    value: 3,
    type: 'modal',
  },
  {
    label: 'component.label.unconfirmed_withdraw',
    component: markRaw(PartnerDepositWithdrawalWidget),
    index: 4,
    data: computed(() => headerInfo.value?.paymentAcceptCount?.returnData?.unidentified_Count),
    value: 4,
  },
]);
const headerTabValue = ref([]);
const shortTabModalVisible = ref(false);
const isComponent = ref(null);

const isManager = authGroup(grade.value) === 'admin' || authGroup(grade.value) === 'manager';

const openShortModal = (index) => {
  isComponent.value = {
    component: headerShortTabList.value.filter((e) => e.index === index)[0].component,
    index: index,
    purpose: headerShortTabList.value.filter((e) => e.index === index)[0]?.purpose,
  };
  shortTabModalVisible.value = true;
};
const closeShortModal = () => {
  shortTabModalVisible.value = false;
  setTimeout(() => {
    isComponent.value = null;
  }, 300);
};
////
const activeTradableCoin = ref(false);

const openTradableCoin = () => {
  activeTradableCoin.value = true;
};
const closeTradableCoin = () => {
  activeTradableCoin.value = false;
};
///
const SignOut = async () => {
  await store.dispatch('sign/signOut');

  store.state['partner'].headerPreviousData = {
    partnerWalletTotal: {},
    paymentAcceptCount: {},
    paymentSalesStatus: {},
    recentPaymentList: {},
  };
  store.state['partner'].headerInfo = {
    partnerWalletTotal: undefined,
    paymentAcceptCount: {},
    paymentSalesStatus: {},
    recentPaymentList: {},
  };
};
const ToggleSidebar = () => {
  store.commit('common/TOGGLE_SIDEBAR');
};
const toggleEmail = (val) => {
  if (otpIsRegister.value && val === 'otp') {
    toggleOtp();
  } else {
    returnDestination.value = val;
    activeEmail.value = !activeEmail.value;
  }
};
const returnEmail = () => {
  if (returnDestination.value === 'otp') {
    toggleOtp();
  } else if (returnDestination.value === 'changePassword') {
    toggleChangePassword();
  }
  returnDestination.value = '';
};
const toggleOtp = () => {
  activeOtp.value = !activeOtp.value;
};
const returnOtp = () => {
  toggleOtp();
  lottieModal(t('confirm.description.success_saved'), 'setting', 2);
};
const toggleChangePassword = () => {
  activeChangePassword.value = !activeChangePassword.value;
};
const returnChangePassword = (msg) => {
  toggleChangePassword();
  lottieModal(t('confirm.description.success_saved'), 'setting', 2);
};
const toggleNotification = () => {
  Notification.requestPermission();
  store.commit('sign/SET_NOTIFICATION', 'toggle');
};
const sendPushFormReturn = () => {
  closeShortModal();
  store.commit('partner/SET_TOGGLE_REMOTE_REFRESH');
};

watch(router.currentRoute, (val) => {
  currentPage.value = val.name;
});

onBeforeMount(async () => {
  accessName.value = accessList.filter((e) => grade.value === e.idx)[0].name;
  isAdministrator.value = [...admin, ...manager].filter((e) => e === grade.value).length > 0;
  isPartner.value = [...partner].filter((e) => e === grade.value).length > 0;

  if (accessName.value === 'Personal') {
    headerShortTabList.value[0].component = markRaw(RecentPaymentWithdrawalList);
    headerShortTabList.value[1].component = markRaw(RecentPaymentWithdrawalList);
    headerShortTabList.value[3].label = 'common.label.undefined_deposit';
    headerShortTabList.value[4] = {
      label: 'common.label.send_payment',
      component: markRaw(SendPushForm),
      index: 5,
      value: 5,
      purpose: 'dashboard',
    };
  } else {
    headerShortTabList.value[0].component = markRaw(RecentPaymentWithdrawalListEnterprise);
    headerShortTabList.value[1].component = markRaw(RecentPaymentWithdrawalListEnterprise);
    headerShortTabList.value[3].label = 'component.label.unconfirmed_withdraw';
  }
  headerTabValue.value = headerShortTabList.value.map((e) => e.value);
});
</script>

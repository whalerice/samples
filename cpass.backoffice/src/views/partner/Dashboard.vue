<template>
  <a-row :gutter="[16, 16]" type="flex">
    <a-col :xs="24" :xl="12" class="dashboard-partner-col">
      <h4 class="title">
        <span class="text">{{ t('common.label.sales_status') }}</span>
      </h4>
      <PartnerSalesStatusWidget :type="'dashboard'" />
    </a-col>
    <a-col :xs="24" :xl="12" class="dashboard-partner-col">
      <h4 class="title">
        <span class="text">{{ t('common.label.my_wallet') }}</span>
      </h4>
      <PartnerMyWalletWidget :type="'dashboard'" />
    </a-col>
    <a-col :xs="24">
      <RecentPaymentWithdrawalList v-if="accessName === 'Personal'" />
      <RecentPaymentWithdrawalListEnterprise v-if="accessName === 'Enterprise'" />
    </a-col>
  </a-row>
</template>

<script setup>
import PartnerSalesStatusWidget from '@/components/dashboard/PartnerSalesStatusWidget.vue';
import PartnerMyWalletWidget from '@/components/dashboard/PartnerMyWalletWidget.vue';
import RecentPaymentWithdrawalList from '@/components/datatable/RecentPaymentWithdrawalList.vue';
import RecentPaymentWithdrawalListEnterprise from '@/components/datatable/RecentPaymentWithdrawalListEnterprise.vue';

import { accessList } from '@/assets/js/global.js';
import { ref, computed, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const store = useStore();
const accessName = ref('');
const grade = computed(() => store.state['sign'].signInfo.grade);

onBeforeMount(async () => {
  await store.dispatch('sign/partnerMyInfo');
  accessName.value = accessList.filter((e) => e.idx === grade.value)[0].name;
});
</script>

<style lang="scss">
.widget {
  .ant-card-body {
    padding: 0;
  }
}
.tab-controller {
  .ant-tabs-nav-list {
    width: 100%;
    justify-content: space-between;
    padding: 0 3rem;

    .ant-tabs-tab {
      margin: 0;
    }
  }
  .ant-tabs-nav {
    margin: 0;
  }
}
.tab-controller-mobile {
  .ant-tabs-nav-list {
    width: 100%;
    justify-content: space-between;
    padding: 0;

    .ant-tabs-tab {
      margin: 0;
    }
  }
  .ant-tabs-nav {
    margin: 0;
  }
}
.widget-card-padding {
  .ant-card-body {
    padding: 1.2rem 2.4rem;
  }
}
.widget-card-padding-send {
  .ant-card-body {
    padding: 0.6rem 2.4rem;
  }
  .send-push-wrap {
    border: 0;
    .ant-card-body {
      padding: 1.2rem 2.4rem;
    }
  }
}

@media (min-width: 992px) {
  .tab-controller-mobile {
    .ant-tabs-nav-list {
      padding: 0 3rem;
    }
  }
}
</style>

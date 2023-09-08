<template>
  <div class="widget-unidentified-list">
    <PaymentUnidentifiedList />

    <RecentPaymentWithdrawalListEnterpriseModal v-if="accessName === 'Enterprise'" :search="'cpass_Id'" />
  </div>
</template>

<script setup>
import PaymentUnidentifiedList from '@/components/partner/PaymentUnidentifiedList.vue';
import RecentPaymentWithdrawalListEnterpriseModal from '@/components/datatable/RecentPaymentWithdrawalListEnterpriseModal.vue';

import { accessList } from '@/assets/js/global.js';
import { ref, computed, onBeforeMount } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const accessName = ref('');
const grade = computed(() => store.state['sign'].signInfo.grade);

onBeforeMount(async () => {
  accessName.value = accessList.filter((e) => e.idx === grade.value)[0].name;
});
</script>

<style lang="scss">
.widget-unidentified-list {
  padding: 1rem 2rem 0 2rem;
  .ant-card-bordered {
    border: 0 !important;
  }
  .ant-card-body {
    padding: 0 !important;
  }
  .ant-card-head {
    border: 0;
  }
  .ar-l {
    left: 0;
  }
  .ar-r {
    right: 0;
  }
  .mb-15 {
    margin: 0;
  }
}
</style>

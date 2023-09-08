<template>
  <a-row>
    <a-col :span="24" class="mb-gap">
      <AdminCountCard />
    </a-col>
    <a-col :span="24" class="mb-gap">
      <InquiryCount />
    </a-col>
    <a-col :span="24" class="mb-gap">
      <PaymentTotalChart />
    </a-col>
    <a-col :span="24" class="mb-gap">
      <RecentExternalTransactionRequest />
    </a-col>
  </a-row>
</template>

<script setup>
import InquiryCount from '@/components/InquiryCount.vue';
import RecentExternalTransactionRequest from '@/components/datatable/RecentExternalTransactionRequest.vue';
import AdminCountCard from '@/components/AdminCountCard.vue';
import PaymentTotalChart from '@/components/PaymentTotalChart.vue';
</script>

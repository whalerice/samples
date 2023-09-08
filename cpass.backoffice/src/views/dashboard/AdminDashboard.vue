<template>
  <a-row>
    <a-col :span="24" class="mb-gap">
      <AdminCountCard />
    </a-col>
    <a-col :span="24" class="mb-gap">
      <InquiryCount />
    </a-col>
    <a-col :span="24" class="mb-gap">
      <UserFigures />
    </a-col>
    <a-col :span="24" class="mb-gap">
      <PaymentTotalChart />
    </a-col>
  </a-row>

  <a-row :gutter="[15, 15]">
    <a-col :xs="24" :xxl="24">
      <RecentExternalTransactionRequest />
    </a-col>
  </a-row>
</template>

<script setup>
import InquiryCount from '@/components/InquiryCount.vue';
import UserFigures from '@/components/UserFigures.vue';
import RecentExternalTransactionRequest from '@/components/datatable/RecentExternalTransactionRequest.vue';
import PaymentTotalChart from '@/components/PaymentTotalChart.vue';
import AdminCountCard from '@/components/AdminCountCard.vue';
</script>

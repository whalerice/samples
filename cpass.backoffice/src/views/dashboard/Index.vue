<template>
  <AdminDashboard v-if="isAuthGroup === 'admin'" />
  <PartnerDashboard v-else-if="isAuthGroup === 'partner'" />
  <SellerDashboard v-else-if="isAuthGroup === 'seller'" />
  <ManagerDashboard v-else-if="isAuthGroup === 'manager'" />
</template>

<script setup>
import AdminDashboard from '@/views/dashboard/AdminDashboard.vue';
import ManagerDashboard from '@/views/dashboard/ManagerDashboard.vue';
import PartnerDashboard from '@/views/partner/Dashboard.vue';
import SellerDashboard from '@/views/dashboard/SellerDashboard.vue';

import { ref, computed, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import { authGroup } from '@/assets/js/global.js';

const store = useStore();
const grade = computed(() => store.state['sign'].signInfo.grade);
const isAuthGroup = ref('');

onBeforeMount(() => {
  isAuthGroup.value = authGroup(grade.value);
});
</script>

<template>
  <ManagerHardWallets v-if="!isTopMenu" class="mb-gap-lg" />
</template>

<script setup>
import ManagerHardWallets from '@/components/ManagerHardWallets.vue';
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';
// import { GetManagerWithdrawList } from '@/store/api';

const store = useStore();
const props = defineProps({
  type: String,
});
const isTopMenu = computed(() => props.type === 'topMenu');

onMounted(async () => {
  await store.dispatch('trade/checkHardWallet');
});
</script>

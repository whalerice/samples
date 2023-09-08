<template>
  <a-card
    class="dashboard-sales-tab"
    :class="{ 'mb-card': type === 'dashboard' }"
    :tab-list="salesTabComponentList"
    :active-tab-key="salesTab"
    @tabChange="(key) => (salesTab = key)"
  >
    <template #customTab="item">
      {{ item.tab() }}
    </template>
    <template v-for="(item, index) in salesTabComponentList" :key="index" :tab="item.tab()">
      <Component :is="item.component" v-if="salesTab === item.key" />
    </template>
  </a-card>
</template>

<script setup>
import SalesStatusByCoin from '@/components/datatable/SalesStatusByCoin.vue';
import SalesStatusPieChart from '@/components/partner/SalesStatusPieChart.vue';
import { ref, markRaw, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const props = defineProps({
  type: String,
});
const type = computed(() => props.type);
const salesTab = ref('common.label.currency_exchange');
const salesTabComponentList = [
  {
    key: 'common.label.currency_exchange',
    tab: () => t('common.label.currency_exchange'),
    component: markRaw(SalesStatusPieChart),
  },
  {
    key: 'component.label.status_by_coin',
    tab: () => t('component.label.status_by_coin'),
    component: markRaw(SalesStatusByCoin),
  },
];
</script>

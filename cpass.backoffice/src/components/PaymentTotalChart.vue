<template>
  <a-card size="small chart-card">
    <template #title>{{ $t('component.title.wallet_history') }}</template>
    <template #extra>
      <router-link to="/manager/wallet/transaction-history" class="btn-shortcut mr-10">
        <span>{{ $t('common.button.shortcut') }}</span>
        <fa-icon icon="arrow-up-right-from-square" />
      </router-link>

      <a-radio-group v-model:value="clickedTab">
        <a-radio-button
          :value="item.value"
          v-for="(item, index) in csChartTabMenu"
          :key="index"
          @click="changeCsTab(item.value)"
        >
          {{ $t(item.ChartTabTitle) }}
        </a-radio-button>
      </a-radio-group>
    </template>
    <Echart :bindingOptions="bindingOptions" className="dashboard-chart" />
  </a-card>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import Echart from '@/components/common/Echart.vue';

const store = useStore();

const clickedTab = ref(0);
const csChartTabMenu = ref([
  { ChartTabTitle: 'common.button.all', value: 0 },
  { ChartTabTitle: 'common.button.withdrawal', value: 1 },
  { ChartTabTitle: 'common.button.settlement', value: 2 },
  { ChartTabTitle: 'common.button.partner', value: 3 },
  { ChartTabTitle: 'common.button.payment', value: 4 },
]);
const csMasterDashboardChart = computed(() => store.state['manager'].csMasterDashboardChart);
const errCode = computed(() => store.state['common'].errCode);

const bindingOptions = ref({
  title: {},
  tooltip: {
    trigger: 'axis',
  },
  legend: {
    data: ['Withdrawal', 'Settlement', 'Partner', 'Payment'],
    top: 25,
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true,
  },
  dataZoom: [
    {
      show: true,
      type: 'inside',
      filterMode: 'filter',
      xAxisIndex: [0],
    },
  ],
  toolbox: {
    show: true,
    feature: {
      dataZoom: {
        yAxisIndex: 'none',
      },
      dataView: { readOnly: false, buttonColor: '#1890ff' },
      magicType: { type: ['line', 'bar'] },
      myTool1: {
        show: true,
        title: 'Reload Chart',
        icon: 'path://M-6.9994 0.9083M4.5416 -2.9654L7.1597 -2.9654L7.1597 -5.6904M7.0261 -2.6448C5.9041 -5.6102 2.8051 -7.8543 -0.8549 -7.4536C-4.6485 -7.0261 -7.5872 -3.6867 -7.4536 0.1603M-4.5416 2.9654L-7.1864 2.9654L-7.1864 5.6904M-7.0261 2.6448C-5.9041 5.6102 -2.8051 7.8543 0.8549 7.4536C4.6485 7.0261 7.5872 3.6867 7.4536 -0.1603',
        onclick: async () => {
          await drawChart3();
        },
      },
      saveAsImage: {},
    },
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: [],
  },
  yAxis: {
    type: 'value',
  },
  series: [],
});

const changeCsTab = (val) => {
  clickedTab.value = val;
  drawChart3();
};

const drawChart3 = async () => {
  await store.dispatch('manager/CSmasterDashboardChart', { ChartTabTitle: clickedTab.value });
  if (errCode.value === 0) {
    bindingOptions.value.legend.data =
      clickedTab.value === 0
        ? ['Withdrawal', 'Settlement', 'Partner', 'Payment']
        : [csChartTabMenu.value[clickedTab.value].ChartTabTitle];

    const series = [];
    for (let i = 0; i < csMasterDashboardChart.value.length; i++) {
      const data = {
        name: csMasterDashboardChart.value[i].label,
        type: 'line',
        data: csMasterDashboardChart.value[i].data,
      };
      series.push(data);
    }

    bindingOptions.value.series = series;
    bindingOptions.value.xAxis.data =
      clickedTab.value === 0
        ? csMasterDashboardChart.value[clickedTab.value].labels
        : csMasterDashboardChart.value[clickedTab.value - 1].labels;
  }
};

onMounted(() => {
  drawChart3();
});
</script>

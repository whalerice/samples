<template>
  <a-card size="small">
    <template #title>
      <span>{{ $t('component.label.payment_amount_chart') }}</span>
      <router-link
        :to="
          grade === auth.Enterprise
            ? '/partner-e-payment-history'
            : grade === auth.Personal
            ? '/partner-p-payment-history'
            : ''
        "
        class="btn-shortcut"
      >
        <span>{{ $t('common.button.shortcut') }}</span>
        <fa-icon icon="arrow-up-right-from-square" />
      </router-link>
    </template>
    <template #extra>
      <a-radio-group v-model:value="currentTab">
        <a-radio-button
          :value="item.value"
          v-for="(item, index) in coinList"
          :key="index"
          @click="changeTab(item.value)"
        >
          {{ item.label }}
        </a-radio-button>
      </a-radio-group>
    </template>
    <Echart :bindingOptions="bindingOptions" className="dashboard-chart" />
  </a-card>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { PaymentAmountChart } from '@/store/api';
import Echart from '@/components/common/Echart.vue';
import { chartColor, auth } from '@/assets/js/global';

const store = useStore();
const coinList = computed(() => store.state['sign'].coinList);
const sn = computed(() => store.state['sign'].signInfo.sn);
const errCode = computed(() => store.state['common'].errCode);
const grade = computed(() => store.state['sign'].signInfo.grade);

const currentTab = ref(1);

const bindingOptions = ref({
  title: {},
  tooltip: {
    trigger: 'axis',
  },
  legend: {
    data: ['BTC'],
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
      dataView: { readOnly: true, buttonColor: '#1890ff' },
      magicType: { type: ['line', 'bar'] },
      myTool1: {
        show: true,
        title: 'Reload Chart',
        icon: 'path://M-6.9994 0.9083M4.5416 -2.9654L7.1597 -2.9654L7.1597 -5.6904M7.0261 -2.6448C5.9041 -5.6102 2.8051 -7.8543 -0.8549 -7.4536C-4.6485 -7.0261 -7.5872 -3.6867 -7.4536 0.1603M-4.5416 2.9654L-7.1864 2.9654L-7.1864 5.6904M-7.0261 2.6448C-5.9041 5.6102 -2.8051 7.8543 0.8549 7.4536C4.6485 7.0261 7.5872 3.6867 7.4536 -0.1603',
        onclick: async () => {
          await drawChart();
        },
      },
      saveAsImage: {},
    },
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['2022-10-24'],
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      name: 'BTC',
      type: 'line',
      data: [],
    },
  ],
});

const changeTab = (val) => {
  currentTab.value = val;
  drawChart();
};
const drawChart = async () => {
  try {
    const response = await PaymentAmountChart({ User_Sn: sn.value, Coin_Cd: currentTab.value });

    if (errCode.value === 0) {
      const getData = response.data.returnData;
      const data = {
        name: getData.label,
        type: 'line',
        data: getData.data.length === 0 ? [0] : getData.data,
        color: chartColor[currentTab.value - 1],
      };
      bindingOptions.value.legend.data = [
        coinList.value[currentTab.value > 4 ? currentTab.value - 2 : currentTab.value - 1].label,
      ];
      bindingOptions.value.series = data;
      bindingOptions.value.xAxis.data = getData.labels.length === 0 ? ['No Data'] : getData.labels;
    }
  } catch (error) {
    console.error(error);
  }
};

onMounted(() => {
  drawChart();
});
</script>

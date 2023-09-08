<template>
  <EChart :option="option" />
</template>

<script setup lang="ts">
import EChart from 'components/charts/EChart.vue';

import dayjs from 'dayjs';
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';

import { apis } from 'src/stores/apis';
import { userStore } from 'src/stores/user';
import { UserType } from 'src/components/models/enums';

const { memberType } = storeToRefs(userStore.sign());

const option = ref<any>({
  tooltip: {
    trigger: 'axis',
  },
  legend: {
    data: ['Betting', 'Win'],
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true,
  },
  toolbox: {
    show: true,
    feature: {
      dataView: { show: false, readOnly: false },
      magicType: { show: true, type: ['line', 'bar'] },
      saveAsImage: { show: true },
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

const onRequest = async () => {
  const to = dayjs().format('YYYY-MM-DD');
  const from = dayjs().add(-7, 'd').format('YYYY-MM-DD');
  const date = `${from}~${to}`;

  try {
    const response =
      memberType.value === UserType.Manager
        ? await apis.manager.DashboardBettingChart({ Date_Period: date })
        : await apis.partner.DashboardBettingChart({ Date_Period: date });

    if (response.data.errCode === 0) {
      option.value.xAxis.data = response.data.returnData.xAxis;
      option.value.series = [
        {
          name: 'Betting',
          type: 'bar',
          data: [...response.data.returnData.series['betting']],
          itemStyle: {
            color: '#37A2DA',
          },
        },
        {
          name: 'Win',
          type: 'bar',
          data: [...response.data.returnData.series['win']],
          itemStyle: {
            color: '#fb7293',
          },
        },
      ];
    }
  } catch (error) {
    console.error(error);
  }
};

// onBeforeMount(() => {});
onMounted(() => {
  onRequest();
});
</script>

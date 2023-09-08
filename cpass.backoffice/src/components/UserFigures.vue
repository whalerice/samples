<template>
  <a-card size="small chart-card">
    <template #title>
      <a-select label-in-value v-model:value="selectValue" @change="changeSelect">
        <a-select-option v-for="item in selectOptions" :key="item.value" :value="item.value">
          {{ item.value === 'all' ? $t(item.label) : item.label }}
        </a-select-option>
      </a-select>
    </template>
    <template #extra>
      <router-link to="/manager/member/wallet" class="btn-shortcut">
        <span>{{ $t('common.button.shortcut') }}</span>
        <fa-icon icon="arrow-up-right-from-square" />
      </router-link>
    </template>
    <a-row :gutter="[15, 15]">
      <a-col v-for="(item, idx) in usersFigureList" :key="idx" :xs="24" :lg="12" :xl="6" class="users-figure-item">
        <div class="text-box">
          <h4 class="title">{{ $t(item.title) }}</h4>
          <p class="figure">
            {{ comma(item.value) }}
          </p>
        </div>
        <div class="icon-box">
          <i class="ico" :class="`ico-${item.icon}`" />
        </div>
      </a-col>
    </a-row>
    <Echart :bindingOptions="bindingOptions" className="dashboard-chart" />
  </a-card>
</template>
<script setup>
import { ref, computed, onMounted, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import { comma } from '@/assets/js/global.js';
import Echart from '@/components/common/Echart.vue';

import { GetDashboardChart } from '@/store/api';

const store = useStore();
const allUsersList = computed(() => store.state['sign'].allUsersList);
const subordinateUsersList = computed(() => store.state['sign'].subordinateUsersList);
const usersFigureList = computed(() => store.state['sign'].usersFigureList);
const selectOptions = computed(() => store.state['sign'].managers);

const selectValue = ref({});

const sendFollowers = ref({});

const bindingOptions = ref({
  title: {},
  tooltip: {
    trigger: 'axis',
  },
  legend: {
    data: ['New', 'Active', 'Expired'],
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
      dataView: { readOnly: true, buttonColor: '#1890ff', height: '80%' },
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
    data: [],
  },
  yAxis: {
    type: 'value',
  },
  series: [],
});
const drawChart = async () => {
  try {
    const response = await GetDashboardChart(sendFollowers.value);
    if (response?.data.errCode === 0) {
      const getData = response.data.returnData;

      const series = [];
      for (let i = 0; i < getData.length; i++) {
        const data = {
          name: getData[i].label,
          type: 'line',
          data: getData[i].data,
        };
        series.push(data);
      }

      bindingOptions.value.series = series;
      bindingOptions.value.xAxis.data = getData[0].labels;
    }
  } catch (error) {
    console.error(error);
  }
};

const changeSelect = (item) => {
  store.commit('sign/SET_USERS_FIGURE', { type: item.value });
  const currentTarget = subordinateUsersList.value.filter((e) => e.user_Id === item.value)[0];

  sendFollowers.value = item.value === 'all' ? allUsersList.value : currentTarget.followers;
  selectValue.value = { value: item.value, label: item.label };

  drawChart();
};

onBeforeMount(() => {
  sendFollowers.value = allUsersList.value;
  store.commit('sign/SET_MANAGERS', subordinateUsersList.value);
  store.commit('sign/SET_USERS_FIGURE', { type: selectOptions.value[0].value });
  selectValue.value = { value: selectOptions.value[0].value };
});

onMounted(() => {
  drawChart();
});
</script>

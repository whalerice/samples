<template>
  <v-chart :option="option" class="test-1" autoresize :style="props.style" />
</template>

<script setup lang="ts">
import { use } from 'echarts/core';
import VChart from 'vue-echarts';
import { SVGRenderer } from 'echarts/renderers';
import { PieChart } from 'echarts/charts';
import { LegendComponent, TooltipComponent } from 'echarts/components';
import { ref, watch, computed } from 'vue';
import { LocalStorage } from 'quasar';
import { useCommonStore } from '@/stores/common-store';
import { comma } from '@/boot';

use([SVGRenderer, PieChart, LegendComponent, TooltipComponent]);

const props = defineProps({
  chartOption: Array,
  style: Object,
  showLegend: Boolean,
});

const option = computed(() => ({
  tooltip: {
    trigger: 'item',
    show: true,
    formatter: (series: any) => {
      return `${series.data.name} ${`${comma(series.data.value)}`}`;
    },
  },
  legend: {
    show: props.showLegend,
    orient: 'vertical',
    x: 'center',
    y: 'bottom',
    formatter: (name: string) => {
      const data = props.chartOption?.find((e: any) => e.name == name) as any;
      return `{coin|${name}} {balance|${`${comma(data?.value)}`}}`;
    },
    textStyle: {
      width: '0',
      rich: {
        coin: { fontFamily: '"Spoqa Han Sans Neo", sans-serif' },
        balance: {
          align: 'right',
          fontFamily: '"Spoqa Han Sans Neo", sans-serif',
        },
      },
      color: LocalStorage.getItem('dm')
        ? 'rgba(255,255,255, 0.9)'
        : 'rgba(0,0,0,0.9)',
    },
  },
  series: [
    {
      type: 'pie',
      radius: props.showLegend ? ['50%', '70%'] : ['90%', '75%'],
      center: props.showLegend ? ['50%', '38%'] : ['50%', '50%'],
      height: props.showLegend ? 450 : 'auto',
      label: {
        show: false,
      },
      labelLine: {
        show: false,
      },
      itemStyle: {
        color: (value: any) => value.data.color,
      },
      data: props.chartOption ?? [],
      clockwise: true,
    },
  ],
}));

const darkMode = computed(() => useCommonStore().darkMode);

watch(darkMode, (val) => {
  val
    ? (option.value.legend.textStyle.color = 'rgba(255,255,255, 0.9)')
    : (option.value.legend.textStyle.color = 'rgba(0,0,0,0.9)');
});
</script>

<template>
  <v-chart class="chart" :option="props.option" autoresize />
</template>

<script setup lang="ts">
import { use } from 'echarts/core';
import { SVGRenderer } from 'echarts/renderers';
import { LineChart, BarChart, PieChart } from 'echarts/charts';
import {
  GridComponent,
  PolarComponent,
  GeoComponent,
  SingleAxisComponent,
  ParallelComponent,
  CalendarComponent,
  GraphicComponent,
  ToolboxComponent,
  TooltipComponent,
  AxisPointerComponent,
  BrushComponent,
  TitleComponent,
  TimelineComponent,
  MarkPointComponent,
  MarkLineComponent,
  MarkAreaComponent,
  LegendComponent,
  DataZoomComponent,
  DataZoomInsideComponent,
  DataZoomSliderComponent,
  VisualMapComponent,
  VisualMapContinuousComponent,
  VisualMapPiecewiseComponent,
  AriaComponent,
  DatasetComponent,
  TransformComponent,
} from 'echarts/components';
import VChart, { THEME_KEY } from 'vue-echarts';
import { provide } from 'vue';

use([
  SVGRenderer,
  LineChart,
  BarChart,
  PieChart,
  GridComponent,
  PolarComponent,
  GeoComponent,
  SingleAxisComponent,
  ParallelComponent,
  CalendarComponent,
  GraphicComponent,
  ToolboxComponent,
  TooltipComponent,
  AxisPointerComponent,
  BrushComponent,
  TitleComponent,
  TimelineComponent,
  MarkPointComponent,
  MarkLineComponent,
  MarkAreaComponent,
  LegendComponent,
  DataZoomComponent,
  DataZoomInsideComponent,
  DataZoomSliderComponent,
  VisualMapComponent,
  VisualMapContinuousComponent,
  VisualMapPiecewiseComponent,
  AriaComponent,
  DatasetComponent,
  TransformComponent,
]);

provide(THEME_KEY, 'white'); //  dark

const props = defineProps({
  // themeKey: {
  //   type: String,
  //   default: 'white',
  // },
  // className: {
  //   type: String,
  // },
  option: {
    type: Object,
    required: true,
  },
});
</script>

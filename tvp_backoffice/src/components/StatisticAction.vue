<template>
  <a-row :gutter="[8, 8]">
    <a-col
      :xs="grid ? grid[0] : 12"
      :md="grid ? grid[1] : 6"
      :lg="grid ? grid[2] : 3"
      v-for="item in props.list"
      :key="item.label"
    >
      <template v-if="item.path">
        <RouterLink :to="item.path">
          <a-statistic
            :title="
              props.unit ? `${item.label()} (${props.unit})` : item.label()
            "
            :precision="props.precision ? props.precision : 0"
            :value="$comma(props.data[item.value])"
            :value-style="{
              color: props.data[item.value] < 0 ? '#cf1322' : '',
            }"
          />
        </RouterLink>
      </template>
      <template v-else>
        <a-statistic
          :title="props.unit ? `${item.label()} (${props.unit})` : item.label()"
          :precision="props.precision ? props.precision : 0"
          :value="$comma(props.data[item.value])"
          :value-style="{
            color: props.data[item.value] < 0 ? '#cf1322' : '',
          }"
        />
      </template>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import { PropType, onMounted } from 'vue';

const props = defineProps({
  grid: {
    type: Array as PropType<number[]>,
    required: false,
  },
  data: {
    type: Object as PropType<any>,
    required: true,
  },
  list: {
    type: Object as PropType<{ label: any; value: string; path?: string }[]>,
    required: true,
  },
  unit: {
    type: String,
    required: false,
  },
  precision: {
    type: Number,
    required: false,
  },
  // chartOption: Array as PropType<IPieChartOption[][]>,
  // amountData: {
  //   type: Object as PropType<IAmountData>,
  //   required: true,
  // },
});

// const list = ref<{ label: string; value: string }[]>([]);
// const data = ref([]);

onMounted(() => {
  // data.value = props.data;
});
</script>

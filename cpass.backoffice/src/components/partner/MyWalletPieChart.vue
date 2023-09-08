<template>
  <div class="box">
    <div class="chart-box-wallet">
      <Echart :bindingOptions="bindingOptions" className="chart chart-width" :key="bindingOptions" />
    </div>
    <ul class="info-wallet" :class="{ modal: propType.value === undefined }">
      <li>
        <span> {{ t('common.label.total_asset') }} </span>
        <span>
          {{ currencyType }}
          {{ chartData.total_Price ? comma(chartData.total_Price) : 0 }}
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed, ref, onBeforeMount, watch, onMounted, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { comma } from '@/assets/js/global.js';
import Echart from '@/components/common/Echart.vue';

const { t } = useI18n();
const store = useStore();
const props = defineProps({
  type: String,
});
const propType = computed(() => props.type);
const isDeviceMobile = computed(() => store.state['common'].isDeviceMobile);
const currencyType = computed(() => store.state['sign'].partnerInfo.type);
const isMobile = ref(isDeviceMobile.value);
const hasData = ref(false);
const headerInfo = computed(() => store.state['partner'].headerInfo.partnerWalletTotal);
const chartData = ref([]);

const picker = (val) => {
  return chartData.value.wallet.filter((e) => e.symbol === val)[0];
};
const bindingOptions = ref({
  tooltip: {
    trigger: 'item',
    show: true,
    formatter: (name) => {
      return `${name.data.name + ' ' + currencyType.value + ' ' + comma(picker(name.data.name).totalCurrencyPrice)}`;
    },
  },
  legend: {
    orient: 'vertical',
    x: 'center',
    y: 'bottom',
    formatter: function (name) {
      return `{divider|${name}} {price|${currencyType.value + ' ' + comma(picker(name).totalCurrencyPrice)}}`;
    },
    textStyle: {
      color: '#333',
      width: 0,
      rich: {
        divider: { fontSize: isMobile.value ? 12 : 14, fontFamily: '"Roboto", "Spoqa Han Sans Neo", sans-serif' },
        price: {
          align: 'right',
          fontSize: isMobile.value ? 12 : 14,
          fontFamily: '"Roboto", "Spoqa Han Sans Neo", sans-serif',
        },
      },
    },
    itemGap: 15,
  },
  series: [
    {
      type: 'pie',
      avoidLabelOverlap: true,
      radius: ['40%', '70%'],
      center: ['50%', '37%'],
      height: 450,
      label: {
        show: false,
        position: 'right',
      },
      emphasis: {
        disabled: false,
        label: {
          show: false,
          fontSize: 40,
          fontWeight: 'bold',
        },
      },
      labelLine: {
        show: false,
      },
      data: [],
      color: [],
    },
  ],
});
const process = (data) => {
  chartData.value = data;
  bindingOptions.value.series[0].data = data.wallet.map((e) => {
    return { value: e.totalCurrencyPrice, name: e.symbol };
  });
  hasData.value = !bindingOptions.value.series[0].data.includes(null);
  if (!hasData.value) {
    bindingOptions.value.series[0].series.emphasis.disabled = true;
    bindingOptions.value.series[0].series.color = ['#d3d3d3'];
    bindingOptions.value.tooltip.show = false;
  }
};
const onRequest = async () => {
  try {
    await store.dispatch('partner/PartnerPartnerWalletTotal');
    const getData = headerInfo.value;

    if (getData.errCode === 0) {
      process(getData.returnData);
    }
  } catch (error) {
    console.error(error);
  }
};
const resizeFunc = () => {
  if (propType.value.value !== undefined) {
    const width = document.querySelector('.info-wallet').children[0].offsetWidth;
    bindingOptions.value.legend.textStyle.width = width - 35;
  } else {
    setTimeout(() => {
      const width = document.querySelector('.modal').children[0].offsetWidth;
      bindingOptions.value.legend.textStyle.width = width - 35;
    }, 1);
  }
};
watch(headerInfo, (val) => {
  process(val?.returnData);
});
onMounted(() => {
  resizeFunc();
  window.addEventListener('resize', resizeFunc);
});
onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeFunc);
});
onBeforeMount(async () => {
  await onRequest();
});
</script>
<style lang="scss" scoped>
.box {
  // max-width: 60rem !important;
  margin: auto;
  margin-bottom: 3rem;
  .info-wallet {
    padding: 0 4rem;
    margin-top: 1rem;
    li {
      margin-bottom: 1rem;
      display: flex;
      flex-flow: row;
      align-items: center;
      justify-content: space-between;
      &:last-child {
        font-weight: bold;
      }
    }
  }
  .chart-box-wallet {
    width: 100%;
    height: 52.3rem;
  }
}
</style>

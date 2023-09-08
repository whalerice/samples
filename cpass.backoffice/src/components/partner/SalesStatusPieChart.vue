<template>
  <div class="box">
    <div class="cart-box">
      <Echart :bindingOptions="hasData ? bindingOptions : emptyOptions" className="chart" :key="bindingOptions" />
    </div>
    <ul class="info">
      <li v-for="(item, index) in infoList" :key="index">
        <span>{{ t(item.label) }}</span>
        <span>
          {{ currencyType }}
          {{ chartData[item.key] !== null && chartData[item.key] !== undefined ? comma(chartData[item.key]) : 0 }}
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed, ref, onBeforeMount, watch } from 'vue';
import { useStore } from 'vuex';
import { comma, matchingCurrencyType } from '@/assets/js/global.js';
import Echart from '@/components/common/Echart.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const store = useStore();
const isDeviceMobile = computed(() => store.state['common'].isDeviceMobile);
const headerInfo = computed(() => store.state['partner'].headerInfo.paymentSalesStatus);
const currencyType = computed(() => store.state['sign'].partnerInfo.type);
const isMobile = ref(isDeviceMobile.value);
const hasData = ref(false);

const chartData = ref({});
const infoList = ref([
  {
    label: 'common.label.total_deposit_amount',
    key: 'totalDeposit',
  },
  {
    label: 'common.label.deposit_fee',
    key: 'depositFee',
  },
  {
    label: 'common.label.total_withdrawal_amount',
    key: 'totalWithdrawal',
  },
  {
    label: 'common.label.withdrawal_fee',
    key: 'withdrawalFee',
  },
  {
    label: 'common.label.total_amount',
    key: 'totalAmount',
  },
]);

const bindingOptions = ref({
  tooltip: {
    trigger: 'item',
    formatter: function (name) {
      return `${t(name.name) + ' ' + currencyType.value + ' ' + comma(name.value)}`;
    },
  },
  legend: {
    bottom: '5%',
    orient: 'horizontal',
    textStyle: {
      fontSize: isMobile.value ? 12 : 14,
      fontFamily: '"Roboto", "Spoqa Han Sans Neo", sans-serif',
    },
    formatter: function (name) {
      if (name === 'component.label.deposit_amount') {
        return t(name) + ' ' + chartData.value.depositPer + '%';
      } else {
        return t(name) + ' ' + chartData.value.withdrawalPer + '%';
      }
    },
  },
  series: [
    {
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '37%'],
      height: 450,
      avoidLabelOverlap: false,
      label: {
        show: false,
        position: 'right',
      },
      emphasis: {
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
    },
  ],
});
const emptyOptions = ref({
  legend: {
    orient: 'vertical',
  },
  series: [
    {
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      label: {
        show: false,
      },
      labelLine: {
        show: false,
      },
      data: [],
    },
  ],
});

const dataProcess = (val) => {
  if (val.errCode === 0) {
    const data = val.returnData;

    chartData.value = {
      currencyType: data.currency_Type,
      totalDeposit: data.deposit_Amount,
      depositFee: data.deposit_Fee,
      totalWithdrawal: data.withdrawal_Amount,
      withdrawalFee: data.withdrawal_Fee,
      totalAmount: data.sum_Price,
      depositPer: data.deposit_Percent,
      withdrawalPer: data.withdrawal_Percent,
    };

    bindingOptions.value.series[0].data = [];

    if (chartData.value.depositPer !== null && chartData.value.depositPer != 0) {
      bindingOptions.value.series[0].data.push({
        value: chartData.value.totalDeposit,
        name: 'component.label.deposit_amount',
      });
    }

    if (chartData.value.withdrawalPer !== null && chartData.value.withdrawalPer != 0) {
      bindingOptions.value.series[0].data.push({
        value: chartData.value.totalWithdrawal,
        name: 'common.label.withdrawal_amount',
      });
    }

    hasData.value = Object.values(val.returnData)
      .map((val) => {
        if (val === null || val === 0) {
          return true;
        } else {
          return false;
        }
      })
      .includes(false);
  }
};

const onRequest = async () => {
  try {
    await store.dispatch('partner/PartnerPaymentSalesStatus');
    const getData = headerInfo.value;

    if (getData.errCode === 0) {
      dataProcess(getData);
    }

    // 전체
  } catch (error) {
    console.error(error);
  }
};

watch(headerInfo, (val) => {
  dataProcess(val);
});
onBeforeMount(async () => {
  await onRequest();
});
</script>
<style lang="scss" scoped>
.box {
  margin: auto;
  .info {
    padding: 0 3rem;
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
  .cart-box {
    width: 100%;
    height: 40rem;
    // background-color: red;
  }
}
</style>

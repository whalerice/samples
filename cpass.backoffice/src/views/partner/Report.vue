<template>
  <a-row
    type="flex"
    justify="space-between"
    :gutter="[
      { xs: 6, sm: 6, md: 16 },
      { xs: 6, sm: 6, md: 16 },
    ]"
  >
    <a-col :xs="24" :md="4">
      <a-select v-model:value="select" class="select-control" style="max-width: 100%">
        <a-select-option v-for="item in category" :value="item.value" :key="item.value">
          {{ $t(item.label) }}
        </a-select-option>
      </a-select>
    </a-col>
    <a-col :xs="0" :md="20" class="radio-btn-control">
      <a-radio-group v-model:value="radioTab" class="mb-15 report-date-picker-container">
        <DateRangePicker
          class="report-date-picker mr-10"
          @clickFn="datePicker"
          :isEmpty="true"
          :isCustom="{ active: true, focus: radioTab }"
          @click="radioTab = 4"
        />
        <a-radio-button :value="item.value" v-for="(item, index) in radio" :key="index">
          <span v-if="item.value !== 4">
            {{ $t(item.text, { num: item.num }) }}
          </span>
        </a-radio-button>
      </a-radio-group>
    </a-col>
    <a-col :xs="24" :md="0" class="radio-btn-control">
      <DateRangePicker
        class="report-date-picker"
        @clickFn="datePicker"
        :isEmpty="true"
        :isCustom="{ active: true, focus: radioTab }"
        @click="radioTab = 4"
      />
      <a-radio-group v-model:value="radioTab" class="radio-wrap mb-15">
        <a-radio-button :value="item.value" v-for="(item, index) in radio" :key="index">
          {{ item.shortTitle }}
        </a-radio-button>
      </a-radio-group>
    </a-col>
  </a-row>

  <a-card size="small chart-card" class="mb-15">
    <template #title>{{ t('component.title.recent_history') }}</template>
    <Echart :bindingOptions="bindingOptions" className="dashboard-chart" :key="bindingOptions" />
  </a-card>

  <a-row
    :gutter="[
      { xs: 8, sm: 16 },
      { xs: 8, sm: 16 },
    ]"
    class="mb-15"
  >
    <a-col
      v-for="(item, index) in card"
      :key="index"
      :xs="{ span: 12 }"
      :sm="{ span: 8 }"
      class="report-payment-col"
      :class="[`order-${item.order}`]"
    >
      <a-card size="small" class="t-right report-card">
        <p class="t-left">{{ t(item.title) }}</p>
        <p type="secondary">{{ item?.currency }} {{ comma(item.value) }}</p>
        <div v-if="item.value !== '-' && item.value != '0' && item.value != 0">
          <a-typography-text
            :class="item.per > 0 ? 'up' : item.per < 0 ? 'down' : ''"
            v-if="item.per != 0 && item.per && item.value !== '-' && item.value != 0"
          >
            <fa-icon :icon="item.per > 0 ? 'fa-solid fa-arrow-up-long' : 'fa-solid fa-arrow-down-long'" />
            {{ item.per }}%
          </a-typography-text>
        </div>
      </a-card>
    </a-col>
  </a-row>

  <a-card size="small" class="card-in-table" :bordered="false">
    <template #title>{{ t('component.label.status_by_coin') }} </template>
    <template #extra>
      <div class="control-container">
        <div class="control-box">
          <a-radio-group v-model:value="isMobile" button-style="solid" class="mr-5">
            <a-radio-button :value="true"><fa-icon icon="fa-solid fa-list" /></a-radio-button>
            <a-radio-button :value="false"><fa-icon icon="fa-solid fa-table" /></a-radio-button>
          </a-radio-group>
        </div>
        <a-radio-group v-model:value="tableTab">
          <a-radio-button :value="item.value" v-for="(item, i) in tableRadio" :key="i">
            {{ t(item.title) }}
          </a-radio-button>
        </a-radio-group>
      </div>
    </template>
    <a-table
      :class="['datatable', { 'is-mobile': isMobile }]"
      :columns="columns"
      :data-source="dataSource"
      :pagination="false"
      :scroll="{ x: 500 }"
      :loading="recentPaymentListsLoading"
    >
      <template #headerCell="{ title }">
        {{ t(title) }}
      </template>
      <template #bodyCell="{ column, record, text }">
        <template v-if="isMobile">
          {{ $t(column.title) }} :
          <span
            v-if="
              column.dataIndex !== 'coin_Cd' &&
              column.dataIndex !== 'amount_Percent' &&
              column.dataIndex !== 'count_Percent'
            "
          >
            {{ text }}
          </span>
        </template>
        <template v-if="column.dataIndex === 'coin_Cd'"> {{ matchingCoinLabel(record.coin_Cd) }}</template>
        <template v-if="column.dataIndex === 'amount_Percent'"> {{ comma(record.amount_Percent) }}%</template>
        <template v-if="column.dataIndex === 'count_Percent'"> {{ comma(record.count_Percent) }}%</template>
      </template>
    </a-table>
  </a-card>
</template>
<script setup>
import DateRangePicker from '@/components/common/DateRangePicker.vue';
import Echart from '@/components/common/Echart.vue';
import { ref, watch, onBeforeMount, computed } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { matchingCoinLabel, comma, matchingCurrencyType } from '@/assets/js/global.js';

const { t } = useI18n();
const store = useStore();
const category = [
  {
    value: 0,
    label: 'component.radio.total_sales',
  },
  {
    value: 1,
    label: 'component.radio.actual_sales',
  },
];
const select = ref(0);
const radioTab = ref(0);
const radio = ref([
  { fullTitle: '1Day', shortTitle: '1D', value: 0, num: 1, text: 'common.button.day' },
  { fullTitle: '1Week', shortTitle: '1W', value: 1, num: 7, text: 'common.button.day' },
  { fullTitle: '1Month', shortTitle: '1M', value: 2, num: 1, text: 'common.button.month' },
  { fullTitle: '3Month', shortTitle: '3M', value: 3, num: 3, text: 'common.button.month' },
]);
const isDeviceMobile = computed(() => store.state['common'].isDeviceMobile);
const isMobile = ref(isDeviceMobile.value);
const errCode = computed(() => store.state['common'].errCode);
const recentPaymentLists = computed(() => store.state['partner'].dealStatsByCoin.returnData);
const dealStatsByPayment = computed(() => store.state['partner'].dealStatsByPayment.returnData);
const salesStatsByDate = computed(() => store.state['partner'].salesStatsByDate.returnData);
const recentPaymentListsLoading = computed(() => store.state['partner'].loading.dealStatsByCoin);
const currentLocale = computed(() => store.state['common'].currentLocale);

const selectDate = ref('');
const card = ref([
  {
    title: 'component.label.total_deposit',
    value: '-',
    per: '-',
    currency: '',
    order: 1,
  },
  {
    title: 'component.label.number_of_deposits',
    value: '-',
    per: '-',
    order: 3,
  },
  {
    title: 'component.label.unit_price',
    value: '-',
    currency: '',
    order: 5,
  },
  {
    title: 'component.label.total_withdrawal',
    value: '-',
    per: '-',
    currency: '',
    order: 2,
  },
  {
    title: 'component.label.number_of_withdrawals',
    value: '-',
    per: '-',
    order: 4,
  },
  {
    title: 'component.label.unit_price',
    value: '-',
    currency: '',
    order: 6,
  },
]);
const bindingOptions = ref({
  title: {},
  tooltip: {
    trigger: 'axis',
  },
  legend: {
    data: [t('search.select.deposit'), t('search.select.withdraw')],
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
      dataView: {
        readOnly: true,
        buttonColor: '#1890ff',
        optionToContent: (opt) => {
          var axisData = opt.xAxis[0].data;
          var series = opt.series;
          var table =
            '<table style="margin:auto;text-align:center"><tbody><tr>' +
            `<td>${t('datatable.thead.date')}</td>` +
            '<td style="padding:0 20px">' +
            series[0].name +
            '</td>' +
            '<td style="padding:0 20px">' +
            series[1].name +
            '</td>' +
            '</tr>';
          for (var i = 0, l = axisData.length; i < l; i++) {
            table +=
              '<tr>' +
              '<td>' +
              axisData[i] +
              '</td>' +
              '<td style="padding:0 20px">' +
              comma(series[0].data[i]) +
              '</td>' +
              '<td style="padding:0 20px">' +
              comma(series[1].data[i]) +
              '</td>' +
              '</tr>';
          }
          table += '</tbody></table>';
          return table;
        },
      },
      magicType: { type: ['line', 'bar'] },
      myTool1: {
        show: true,
        title: 'Reload Chart',
        icon: 'path://M-6.9994 0.9083M4.5416 -2.9654L7.1597 -2.9654L7.1597 -5.6904M7.0261 -2.6448C5.9041 -5.6102 2.8051 -7.8543 -0.8549 -7.4536C-4.6485 -7.0261 -7.5872 -3.6867 -7.4536 0.1603M-4.5416 2.9654L-7.1864 2.9654L-7.1864 5.6904M-7.0261 2.6448C-5.9041 5.6102 -2.8051 7.8543 0.8549 7.4536C4.6485 7.0261 7.5872 3.6867 7.4536 -0.1603',
        onclick: async () => {
          await refresh();
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
  series: [
    {
      name: t('search.select.deposit'),
      type: 'line',
      data: [],
      color: '#28a745',
    },
    {
      name: t('search.select.withdraw'),
      type: 'line',
      data: [],
      color: '#dc3545',
    },
  ],
});
const tableRadio = [
  { title: 'search.select.deposit', value: 1 },
  { title: 'component.title.withdrawal', value: 2 },
];
const tableTab = ref(1);
const columns = [
  {
    title: 'datatable.thead.coin',
    dataIndex: 'coin_Cd',
  },
  {
    title: 'component.label.total_quantity',
    dataIndex: 'amount',
  },
  {
    title: 'component.label.compared_period',
    dataIndex: 'amount_Percent',
  },
  {
    title: 'component.label.number_of_cases',
    dataIndex: 'count',
  },
  {
    title: 'component.label.compared_period',
    dataIndex: 'count_Percent',
  },
  {
    title: 'component.label.average_quantity_case',
    dataIndex: 'avg_Quantity',
  },
];
let dataSource = ref([]);

const initData = () => {
  card.value = [
    {
      title: 'component.label.total_deposit',
      value: '-',
      per: '-',
      currency: '',
      order: 1,
    },
    {
      title: 'component.label.number_of_deposits',
      value: '-',
      per: '-',
      order: 3,
    },
    {
      title: 'component.label.unit_price',
      value: '-',
      currency: '',
      order: 5,
    },
    {
      title: 'component.label.total_withdrawal',
      value: '-',
      per: '-',
      currency: '',
      order: 2,
    },
    {
      title: 'component.label.number_of_withdrawals',
      value: '-',
      per: '-',
      order: 4,
    },
    {
      title: 'component.label.unit_price',
      value: '-',
      currency: '',
      order: 6,
    },
  ];
};
const refresh = async () => {
  initData();
  await PartnerSalesStatsByDate();
  await PartnerDealStatsByCoin();
  await PartnerDealStatsByPayment();
};
const PartnerDealStatsByCoin = async () => {
  await store.dispatch('partner/PartnerDealStatsByCoin', {
    sales_Period: radioTab.value === 4 ? selectDate.value : String(radioTab.value),
    deal_Type: tableTab.value,
    sales_Type: select.value,
  });
  if (errCode.value === 0) {
    let arr = [];
    recentPaymentLists.value.forEach((e) => {
      if (Number(e.amount) !== 0) arr.push(e);
    });
    dataSource.value = arr;
  }
};
const PartnerDealStatsByPayment = async () => {
  await store.dispatch('partner/PartnerDealStatsByPayment', {
    sales_Period: radioTab.value === 4 ? selectDate.value : String(radioTab.value),
    sales_Type: select.value,
  });
  if (errCode.value === 0) {
    dealStatsByPayment.value.forEach((e) => {
      const dealType = e.deal_Type;
      if (dealType === 1) {
        card.value[0].value = e.payment;
        card.value[0].per = e.payment_Percent;
        card.value[0].currency = matchingCurrencyType(e.currency_Type);
        card.value[1].value = e.payment_Count;
        card.value[1].per = e.payment_Count_Percent;
        card.value[2].value = e.payment_Unit;
        card.value[2].currency = matchingCurrencyType(e.currency_Type);
      } else if (dealType === 2) {
        card.value[3].value = e.payment;
        card.value[3].per = e.payment_Percent;
        card.value[3].currency = matchingCurrencyType(e.currency_Type);
        card.value[4].value = e.payment_Count;
        card.value[4].per = e.payment_Count_Percent;
        card.value[5].value = e.payment_Unit;
        card.value[5].currency = matchingCurrencyType(e.currency_Type);
      }
    });
  }
};
const PartnerSalesStatsByDate = async () => {
  await store.dispatch('partner/PartnerSalesStatsByDate', {
    sales_Type: select.value,
    sales_Period: radioTab.value === 4 ? selectDate.value : String(radioTab.value),
  });

  if (errCode.value === 0) {
    const depositActual = [];
    const withdrawActual = [];
    const time = [];

    salesStatsByDate.value.forEach((arr) => {
      const item = arr.salesStatsDateList;
      if (arr.deal_Type === 1) {
        item.forEach((data) => {
          depositActual.push(data.actual);
          radioTab.value === 0
            ? time.push(data?.imcome_Date?.split(' ')[1].split(':')[0])
            : time.push(data?.imcome_Date);
        });
      } else if (arr.deal_Type === 2) {
        item.forEach((data) => {
          withdrawActual.push(data.actual);
        });
      }
    });

    bindingOptions.value.series[0].data = depositActual;
    bindingOptions.value.series[1].data = withdrawActual;
    bindingOptions.value.xAxis.data = time;
  }
};
const datePicker = async (e) => {
  let date = '';
  date = e[0] + '~' + e[1];
  if (date !== '~') {
    selectDate.value = date;
    refresh();
  } else {
    radioTab.value = 0;
  }
};

watch(radioTab, (val) => {
  if (val !== 4) {
    refresh();
    selectDate.value = '';
  }
});
watch(select, () => {
  refresh();
});
watch(tableTab, async () => {
  await PartnerDealStatsByCoin();
});
watch(currentLocale, () => {
  bindingOptions.value.legend.data = [t('search.select.deposit'), t('search.select.withdraw')];
  bindingOptions.value.series[0].name = t('search.select.deposit');
  bindingOptions.value.series[1].name = t('search.select.withdraw');
});

onBeforeMount(async () => {
  await store.dispatch('sign/currencyList');
  refresh();
});
</script>

<style scoped lang="scss">
.flex {
  justify-content: space-between;
}

.t-right {
  text-align: right;
}

.t-left {
  text-align: left;
}

.up {
  color: red;
}

.down {
  color: blue;
}

.radio-btn-control {
  text-align: left;
}

.flex {
  display: flex;
  flex-direction: row;
}
.select-control {
  width: 100%;
}

.radio-wrap {
  display: flex;
  justify-content: space-between;

  > label {
    width: 100%;
    text-align: center;
  }
}

@media (min-width: 576px) {
  .select-control {
    max-width: 120px;
  }
  .radio-btn-control {
    text-align: right;
  }
}
</style>

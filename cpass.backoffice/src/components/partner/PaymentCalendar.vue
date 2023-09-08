<template>
  <div class="calendar">
    <div class="calendar-btn">
      <a-button @click="dateChange('minus')" :disabled="loading"><LeftOutlined /></a-button>
      <a-popover v-model:visible="popOverActive" trigger="click" placement="bottom">
        <template #title>
          <div class="select-title">
            <a-button @click="dateChange('minusYear')" :disabled="loading"><LeftOutlined /></a-button>
            <span>
              {{ currentDate.year }}
            </span>
            <a-button @click="dateChange('plusYear')" :disabled="loading"><RightOutlined /></a-button>
          </div>
        </template>
        <template #content>
          <div class="calendar-select">
            <div class="calendar-select-wrap">
              <span
                :class="{ selected: num === currentDate.month }"
                v-for="(num, index) in 12"
                :key="index"
                @click="clickSelectForm(num)"
                >{{ getNumToMonthString(num) }}</span
              >
            </div>
          </div>
        </template>
        <a-button type="text"
          ><h3>{{ currentDate.year }}-{{ setDoubleDigit(currentDate.month) }}</h3></a-button
        >
      </a-popover>
      <a-button @click="dateChange('plus')" :disabled="loading"><RightOutlined /></a-button>
    </div>
    <a-radio-group class="calendar-radio" v-model:value="selectValue" :disabled="loading" label-in-value>
      <a-radio-button :value="item.value" v-for="(item, index) in options" :key="index">
        {{ t(item.label) }}
      </a-radio-button>
    </a-radio-group>

    <a-table :data-source="dataSource" :columns="columns" :loading="loading" :pagination="false" :scroll="{ x: 10 }">
      <template #headerCell="{ title }"> {{ $t(title) }}</template>
      <template #bodyCell="{ column, record, text }">
        <template v-if="column.dataIndex !== 'total'">
          <div class="cell" @click="clickTable(text)">
            <span class="date" :class="{ today: todayCheck(text.date) }">{{ text.date }}</span>
            <div class="mobile" v-if="text.date !== ''">
              <br />
              <span>
                {{ t('search.select.deposit') }} :
                <span v-if="text.totalDeposit !== '-'">
                  {{ primaryCurrencyType + ' ' }}
                </span>
                {{ comma(text.totalDeposit) }}
              </span>
              <br />
              <span>
                {{ t('search.select.withdraw') }} :
                <span v-if="text.totalWithdraw !== '-'">
                  {{ primaryCurrencyType + ' ' }}
                </span>
                {{ comma(text.totalWithdraw) }}
              </span>
              <br />
              <span v-if="selectValue === 1">
                {{ t('datatable.thead.fee') }} :
                <span v-if="text.totalFee !== '-'">
                  {{ primaryCurrencyType + ' ' }}
                </span>
                {{ comma(text.totalFee) }}
              </span>
            </div>
            <div
              class="calendar-circle"
              v-if="text.date !== '' && (text.totalDeposit !== '-' || text.totalWithdraw !== '-')"
            ></div>
          </div>
        </template>

        <template v-if="column.dataIndex === 'total'">
          <div class="cell" @click="clickTable(record.total)">
            <div class="total" v-if="record.total.date === 'Week Total'">
              <span class="date mobile">{{ t('component.label.week_total') }}</span>
              <span class="date pc"><CalendarOutlined /></span>
              <div class="mobile">
                <br />
                <span>
                  {{ t('search.select.deposit') }} :
                  <span v-if="record.total.totalDeposit !== '-'">
                    {{ primaryCurrencyType + ' ' }}
                  </span>
                  {{ comma(record.total.totalDeposit) }}
                </span>
                <br />
                <span>
                  {{ t('search.select.withdraw') }} :
                  <span v-if="record.total.totalWithdraw !== '-'">
                    {{ primaryCurrencyType + ' ' }}
                  </span>
                  {{ comma(record.total.totalWithdraw) }}
                </span>
                <br />
                <span v-if="selectValue === 1">
                  {{ t('datatable.thead.fee') }} :
                  <span v-if="record.total.totalFee !== '-'">
                    {{ primaryCurrencyType + ' ' }}
                  </span>
                  {{ comma(record.total.totalFee) }}
                </span>
              </div>
              <div
                class="calendar-circle"
                v-if="record.total.totalDeposit !== '-' || record.total.totalWithdraw !== '-'"
              ></div>
            </div>

            <div class="total" v-if="record.total.date === 'Month Total'">
              <span class="date mobile">{{ t('component.label.month_total') }}</span>
              <span class="date pc"><CarryOutOutlined /></span>
              <div class="mobile">
                <br />
                <span>
                  {{ t('search.select.deposit') }} :
                  <span v-if="record.total.totalDeposit !== '-'">
                    {{ primaryCurrencyType + ' ' }}
                  </span>
                  {{ comma(record.total.totalDeposit) }}
                </span>
                <br />
                <span>
                  {{ t('search.select.withdraw') }} :
                  <span v-if="record.total.totalWithdraw !== '-'">
                    {{ primaryCurrencyType + ' ' }}
                  </span>
                  {{ comma(record.total.totalWithdraw) }}
                </span>
                <br />
                <span v-if="selectValue === 1">
                  {{ t('datatable.thead.fee') }} :
                  <span v-if="record.total.totalFee !== '-'">
                    {{ primaryCurrencyType + ' ' }}
                  </span>
                  {{ comma(record.total.totalFee) }}
                </span>
              </div>
              <div
                class="calendar-circle"
                v-if="record.total.totalDeposit !== '-' || record.total.totalWithdraw !== '-'"
              ></div>
            </div>
          </div>
        </template>
      </template>
    </a-table>
  </div>
</template>
<script setup>
import { useStore } from 'vuex';
import { onBeforeMount, ref, watch, computed } from 'vue';
import dayjs from 'dayjs';
import { RightOutlined, LeftOutlined, CalendarOutlined, CarryOutOutlined } from '@ant-design/icons-vue';
import { comma } from '@/assets/js/global.js';
import { useI18n } from 'vue-i18n';
import { apis } from '@/store/api';

const { t } = useI18n();
const store = useStore();
const emits = defineEmits(['openModal']);
const errCode = computed(() => store.state['common'].errCode);
const primaryCurrencyType = computed(() => store.state['sign'].partnerInfo.type);
const lists = computed(() => store.state['partner'].salesStatsByMonth?.returnData);
const loading = computed(() => store.state['partner'].loading.salesStatsByMonth);
const isColumns = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'total'];
const dataSource = ref([]);
const today = {
  year: dayjs().$y,
  month: dayjs().$M,
  day: dayjs().$D,
};
const selectValue = ref(0);
const options = [
  { label: 'component.radio.total_sales', value: 0 },
  { label: 'component.radio.actual_sales', value: 1 },
];
const columns = [
  {
    title: 'component.label.sun',
    dataIndex: 'sun',
    key: 'sun',
  },
  {
    title: 'component.label.mon',
    dataIndex: 'mon',
    key: 'mon',
  },
  {
    title: 'component.label.tue',
    dataIndex: 'tue',
    key: 'tue',
  },
  {
    title: 'component.label.wed',
    dataIndex: 'wed',
    key: 'wed',
  },
  {
    title: 'component.label.thu',
    dataIndex: 'thu',
    key: 'thu',
  },
  {
    title: 'component.label.fri',
    dataIndex: 'fri',
    key: 'fri',
  },
  {
    title: 'component.label.sat',
    dataIndex: 'sat',
    key: 'sat',
  },
  {
    title: 'modal.label.total',
    dataIndex: 'total',
    key: 'total',
  },
];
const currentDate = ref({
  year: dayjs().$y,
  month: dayjs().$M + 1,
});
const currentDateToString = computed(() => {
  return `${currentDate.value.year}` + '-' + `${currentDate.value.month}`;
});
const popOverActive = ref(false);

const dateChange = (val) => {
  if (val === 'plus') {
    currentDate.value.month += 1;
  } else if (val === 'minus') {
    currentDate.value.month -= 1;
  } else if (val === 'plusYear') {
    currentDate.value.year += 1;
  } else if (val === 'minusYear') {
    currentDate.value.year -= 1;
  }
};
const setCalendar = async (arr) => {
  let month = [];
  let week = {};
  const startPoint = dayjs(currentDateToString.value).startOf('month').day();
  for (let i = 0; i < startPoint; i++) {
    week[isColumns[i]] = { date: '' };
  }

  const daysInMonth = dayjs(currentDateToString.value).daysInMonth();
  const weeks = Math.ceil((startPoint + daysInMonth) / 7);
  const padding = 7 - ((startPoint + daysInMonth) % 7);
  for (let i = 0; i < daysInMonth + padding + weeks; i++) {
    const day = (startPoint + i) % 8;
    if (day === 7) {
      const duration = Object.values(week).filter((e) => e.date !== '');
      const response = await getTotal(`${duration[0].fullDate}~${duration[duration.length - 1].fullDate}`);

      week['total'] = {
        date: 'Week Total',
        num: 0,
        fullDate: t('component.label.week_total'),
        duration: `${duration[0].fullDate}~${duration[duration.length - 1].fullDate}`,
        totalDeposit: response.totalDeposit,
        totalWithdraw: response.totalWithdraw,
        totalFee: response.totalFee,
      };

      month.push(week);
      week = {};
    } else {
      const weekIndex = Math.floor((startPoint + i) / 8);
      const index = i - weekIndex;

      if (index >= arr.length) {
        week[isColumns[day]] = {
          date: '',
        };
        continue;
      }

      const item = arr[index];

      week[isColumns[day]] = {
        date: i + 1 - weekIndex,
        totalDeposit: item.totalDeposit !== 0 ? item.totalDeposit : '-',
        totalWithdraw: item.totalWithdraw !== 0 ? item.totalWithdraw : '-',
        totalFee: item.totalFee !== 0 ? item.totalFee : '-',
        fullDate: item.date,
      };
    }
  }

  let monthTotal = {};
  for (let i = 0; i < 7; i++) {
    monthTotal[isColumns[i]] = {
      date: '',
    };
  }

  const monthTotalValues = await getTotal(`${arr[0].date}~${arr[arr.length - 1].date}`);

  monthTotal['total'] = {
    date: 'Month Total',
    fullDate: t('component.label.month_total'),
    duration: `${arr[0].date}~${arr[arr.length - 1].date}`,
    totalDeposit: monthTotalValues.totalDeposit,
    totalWithdraw: monthTotalValues.totalWithdraw,
    totalFee: monthTotalValues.totalFee,
  };

  month.push(monthTotal);
  dataSource.value = month;

  setTimeout(() => {
    setBlockNullSell();
  }, 100);
};
const getTotal = async (period) => {
  const response = await apis
    .PartnerSalesStatsByCoin({
      sales_Type: selectValue.value,
      Sales_Period: period,
    })
    .then((res) => {
      return res.data.returnData.length > 0 ? res.data.returnData : '-';
    });

  if (response !== '-') {
    let deposit = {};
    let withdraw = {};

    response.filter((e) => {
      e.deal_Type === 1 ? (deposit = e) : (withdraw = e);
    });

    const fee = Number(
      (
        Number(Object.values(deposit).length > 0 ? deposit.total_Currency_Fee : 0) +
        Number(Object.values(withdraw).length > 0 ? withdraw.total_Currency_Fee : 0)
      ).toFixed(2),
    );

    return {
      totalDeposit:
        Object.values(deposit).length > 0
          ? selectValue.value === 0
            ? deposit.total_Currency_Amount
            : deposit.total_Currency_Actual
          : '-',
      totalWithdraw:
        Object.values(withdraw).length > 0
          ? selectValue.value === 0
            ? withdraw.total_Currency_Amount
            : withdraw.total_Currency_Actual
          : '-',
      totalFee: fee === 0 ? '-' : fee,
    };
  } else {
    return {
      totalDeposit: '-',
      totalWithdraw: '-',
      totalFee: '-',
    };
  }
};
const setDoubleDigit = (num) => {
  if (String(num).length < 2) {
    return '0' + String(num);
  } else {
    return String(num);
  }
};
const clickTable = (val) => {
  const total = Number(val.totalDeposit) + Number(val.totalWithdraw) + Number(val.totalFee);

  if (val.date !== '' && !isNaN(total)) {
    val.sales_Type = selectValue.value;
    emits('openModal', val);
  }
};
const clickSelectForm = async (val) => {
  currentDate.value.month = val;
  popOverActive.value = false;
  await store.dispatch('partner/PartnerSalesStatsByMonth', {
    sales_Type: selectValue.value,
    sales_Month: currentDate.value.year + '-' + setDoubleDigit(currentDate.value.month),
  });
  if (errCode.value === 0) {
    setCalendar(lists.value);
  }
};
const getNumToMonthString = (val) => {
  const date = new Date();
  date.setMonth(val - 1);
  const month = date
    .toLocaleString('en-US', {
      month: 'short',
    })
    .toLowerCase();

  return t(`${'component.label.' + month}`);
};
const todayCheck = (date) => {
  if (currentDate.value.year === today.year && currentDate.value.month === today.month + 1 && today.day === date) {
    return true;
  } else {
    return false;
  }
};
const setBlockNullSell = () => {
  const arr = document.querySelectorAll('td.ant-table-cell');
  arr.forEach((e) => {
    e.style.pointerEvents = 'auto';
  });
  arr.forEach((e) => {
    if (!e.querySelectorAll('.cell')[0].innerText) {
      e.querySelectorAll('.cell')[0].childNodes.forEach((x) => {
        if (x.classList !== undefined) {
          if (!x.classList.contains('total')) {
            e.style.pointerEvents = 'none';
          }
        }
      });
    }
  });
  store.state['partner'].loading.salesStatsByMonth = false;
};

watch(selectValue, async () => {
  await store.dispatch('partner/PartnerSalesStatsByMonth', {
    sales_Type: selectValue.value,
    sales_Month: currentDate.value.year + '-' + setDoubleDigit(currentDate.value.month),
  });

  if (errCode.value === 0) {
    setCalendar(lists.value);
  }
});

watch(currentDate.value, async (val) => {
  if (val.month >= 13) {
    currentDate.value.month = 1;
    currentDate.value.year += 1;
  } else if (val.month <= 0) {
    currentDate.value.month = 12;
    currentDate.value.year -= 1;
  }

  await store.dispatch('partner/PartnerSalesStatsByMonth', {
    sales_Type: selectValue.value,
    sales_Month: currentDate.value.year + '-' + setDoubleDigit(currentDate.value.month),
  });

  if (errCode.value === 0) {
    setCalendar(lists.value);
  }
});

onBeforeMount(async () => {
  await store.dispatch('partner/PartnerSalesStatsByMonth', {
    sales_Type: selectValue.value,
    sales_Month: currentDate.value.year + '-' + setDoubleDigit(currentDate.value.month),
  });
  if (errCode.value === 0) {
    setCalendar(lists.value);
  }
});
</script>

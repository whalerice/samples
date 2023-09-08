<template>
  <FilterCard :filters="filters" @search="search" />

  <a-card :body-style="{ position: 'relative', padding: 0 }">
    <div
      class="absolute-center full-width full-height text-center"
      style="background-color: rgba(32, 36, 48, 0.6); z-index: 1"
      v-if="loading"
    >
      <QSpinnerGears size="7rem" class="absolute-center" style="top: 20rem" />
    </div>

    <a-calendar
      ref="calendar"
      v-model:value="calendarValue"
      class="daily-status-calendar"
      @panel-change="pannelChanged"
      :disabledDate="disableDate"
    >
      <template #headerRender="{ value: current, onChange }">
        <div class="calendar-header">
          <a-button
            @click="
              onChange(current.month(Number(dayjs(current).format('MM')) - 2))
            "
          >
            <template #icon><LeftOutlined /></template>
          </a-button>

          <span class="title">
            {{ dayjs(current).format('YYYY-MM') }}
          </span>

          <a-button
            @click="
              onChange(current.month(Number(dayjs(current).format('MM'))))
            "
          >
            <template #icon><RightOutlined /></template>
          </a-button>
        </div>
      </template>

      <template #dateFullCellRender="{ current: day }">
        <div
          class="custom-calendar-tbody"
          @click="selectDate(dailyData[dayjs(day).format('YYYY-MM-DD')])"
          :class="{
            lock: !dailyData[dayjs(day).format('YYYY-MM-DD')]?.createdTime,
          }"
        >
          <p class="date">{{ dayjs(day).date() }}</p>

          <ul
            class="calendar-list"
            v-if="dailyData[dayjs(day).format('YYYY-MM-DD')]"
          >
            <li>
              <span>{{ $t('common.word.predict_amount') }} : </span>
              {{
                $comma(
                  dailyData[dayjs(day).format('YYYY-MM-DD')]?.predictionAmount
                )
              }}
            </li>
            <li>
              <span>{{ $t('common.word.winning_amount') }} : </span>
              {{
                $comma(
                  dailyData[dayjs(day).format('YYYY-MM-DD')]?.winningAmount
                )
              }}
            </li>
            <li v-if="role !== roleNames.agent">
              <span>{{ $t('common.word.profit') }} : </span>
              {{
                $comma(dailyData[dayjs(day).format('YYYY-MM-DD')]?.profitAmount)
              }}
            </li>
            <li v-if="role !== roleNames.agent">
              <span>{{ $t('common.word.fee') }} : </span>
              {{
                $comma(dailyData[dayjs(day).format('YYYY-MM-DD')]?.feeAmount)
              }}
            </li>
            <li>
              <span>{{ $t('common.word.net_profit') }} : </span>
              {{
                $comma(
                  dailyData[dayjs(day).format('YYYY-MM-DD')]?.netProfitAmount
                )
              }}
            </li>
          </ul>
          <ul
            class="calendar-list"
            v-if="dailyData[dayjs(day).format('YYYY-MM-DD')]"
          >
            <li>
              <span>{{ $t('common.word.number_of_visitor') }} : </span>
              {{
                $comma(dailyData[dayjs(day).format('YYYY-MM-DD')]?.visitedToday)
              }}
            </li>
            <li>
              <span>{{ $t('common.word.predict_member') }} : </span>
              {{
                $comma(
                  dailyData[dayjs(day).format('YYYY-MM-DD')]?.predictedToday
                )
              }}
            </li>
            <li>
              <span>{{ $t('common.word.number_of_subscribers') }} : </span>
              {{
                $comma(dailyData[dayjs(day).format('YYYY-MM-DD')]?.newOfToday)
              }}
            </li>
          </ul>
        </div>
      </template>
    </a-calendar>
  </a-card>

  <a-modal
    v-model:visible="modalVisible"
    centered
    :footer="null"
    :width="1000"
    v-if="selectedValue"
  >
    <template #title>
      <div class="text-h3 q-mt-md text-center">{{ selectedDate }}</div>
      <div class="row justify-around q-mt-xl q-mb-md">
        <span class="text-h3 text-weight-bold">{{
          $t('common.word.net_profit')
        }}</span>
        <span class="text-h3 text-weight-bolder text-prediction-odd">
          {{ $comma(selectedValue?.netProfitAmount) }} USDT
        </span>
      </div>
    </template>

    <ProgressCircle :amount-data="selectedValue" />

    <a-col :span="18" :offset="3" class="q-mt-xl">
      <a-row justify="space-between">
        <span class="text-weight-bold">{{
          $t('common.word.number_of_visitor')
        }}</span>
        <span>
          {{ $comma(selectedValue.visitedToday) }}
          {{ $t('common.word.people') }}
        </span>
      </a-row>
      <a-row justify="space-between">
        <span class="text-weight-bold">{{
          $t('common.word.number_of_predict')
        }}</span>
        <span>
          {{ $comma(selectedValue.predictedToday) }}
          {{ $t('common.word.people') }}
        </span>
      </a-row>
      <a-row justify="space-between">
        <span class="text-weight-bold">{{
          $t('common.word.number_of_subscribers')
        }}</span>
        <span>
          {{ $comma(selectedValue.newOfToday) }}
          {{ $t('common.word.people') }}
        </span>
      </a-row>
    </a-col>
  </a-modal>
</template>

<script setup lang="ts">
import ProgressCircle from '@/components/ProgressCircle.vue';
import FilterCard from '@/components/FilterCard.vue';

import dayjs, { Dayjs } from 'dayjs';
import { QSpinnerGears } from 'quasar';
import { useI18n } from 'vue-i18n';
import { ref, computed, watch, onBeforeMount } from 'vue';
import { LeftOutlined, RightOutlined } from '@ant-design/icons-vue';

import { comma } from '@/boot';
import { useCommonStore } from '@/stores/common-store';
import { role } from '@/boot/global';
import { roleNames } from '@/router/routes';
import { api } from '@/boot/axios';
import { useCustomPagination } from '@/utils/pagination';

const { t } = useI18n();
const currentLocale = computed(() => useCommonStore().currentLocale);

const calendarValue = ref<Dayjs>(dayjs());
const calendar = ref();
const modalVisible = ref<boolean>(false);

const selectedDate = ref<string>();
const selectedValue = ref<IGameSummariesResponse>();

const dailyData = ref<{ [key: string]: IGameSummariesResponse } | any>(false);
const weekTotal = ref<any[]>([]);
const monthTotal = ref<any>();
const loading = ref(false);

const maxWeek = computed(() => 5);

const filters = ref<IFilter[]>([
  {
    id: 'partners',
    label: 'common.word.partner',
    type: 'select',
    options: [],
  },
]);

const sendData = ref<IGameSummaries>({
  startTime: '',
  endTime: '',
});

const innerHTMLArr: { label: string }[] = [
  {
    label: 'common.word.total_predict_amount',
  },
  {
    label: 'common.word.total_winning_amount',
  },
  {
    label: 'common.word.total_profit',
  },
  {
    label: 'common.word.total_fee',
  },
  {
    label: 'common.word.total_net_profit',
  },
  {
    label: 'common.word.total_number_of_visitor',
  },
  {
    label: 'common.word.total_predict_member',
  },
  {
    label: 'common.word.total_number_of_subscribers',
  },
];

const singleValueKey = [
  'predictionAmount',
  'winningAmount',
  'profitAmount',
  'feeAmount',
  'netProfitAmount',
  'visitedToday',
  'predictedToday',
  'newOfToday',
];

const detailKey = [
  'profitPredictionAmountDetail',
  'predictionAmountDetail',
  'winningAmountDetail',
  'profitAmountDetail',
  'feeAmountDetail',
];

const resetTotal = (value?: boolean) => {
  const calendarElement = calendar.value.$el as HTMLDivElement;
  const thead = calendarElement
    .getElementsByClassName('ant-picker-content')[0]
    .getElementsByTagName('thead')[0]
    .getElementsByTagName('tr')[0];

  if (!thead.dataset.rendered) {
    const totalHeader = document.createElement('th');

    totalHeader.className = 'calendar-total-section';
    totalHeader.dataset.lang = 'common.word.total_quantity';
    totalHeader.innerText = t('common.word.total_quantity');

    thead.append(totalHeader);
    thead.dataset.rendered = 'TRUE';
  }

  const trs = calendarElement
    .getElementsByClassName('ant-picker-content')[0]
    .getElementsByTagName('tbody')[0]
    .getElementsByTagName('tr');

  const startDate = calendarValue.value.startOf('month').startOf('week');

  for (let i = 0; i < trs.length; i++) {
    const tr = trs[i];

    if (tr.dataset.rendered) {
      continue;
    }

    const label =
      i === trs.length - 1
        ? 'common.word.month_total'
        : 'common.word.week_total';

    const start = startDate.add(i, 'week');
    const end = start.endOf('week');

    const column = document.createElement('td');
    column.className = 'ant-picker-cell ant-picker-cell-sum';
    column.dataset.week = `${i}`;
    column.dataset.start = `${start.format('YYYY-MM-DD')}`;
    column.dataset.end = `${end.format('YYYY-MM-DD')}`;
    column.innerHTML = `<div class="custom-calendar-tbody">
            <div class="calendar-total calendar-total-label text-h5 q-pb-sm text-weight-bold" data-lang="${label}"></div>

            ${innerHTMLArr
              .map((data, j) => {
                return `
              <div class="ant-row ant-row-middle" style="${
                j === 4 ? 'margin-bottom: 12px' : ''
              }">
                <div class="ant-col calendar-label" data-lang="${
                  data.label
                }"></div>
                <span>: &nbsp; </span>
                <div class="ant-col calendar-value" data-value=""></div>
              </div>`;
              })
              .join('')}
          `;

    column.addEventListener('click', (e) => {
      const element = e.currentTarget as HTMLElement;
      const week = Number(element.getAttribute('data-week'));
      const start = element.getAttribute('data-start');
      const end = element.getAttribute('data-end');
      const data =
        week === maxWeek.value ? monthTotal.value : weekTotal.value[week];

      if (!data) {
        return;
      }

      const arr = [];
      for (let j = 0; j < element.children.length; j++) {
        arr.push(element.children[j]);
      }

      selectedDate.value =
        week < trs.length - 1
          ? `${start} ~ ${end}`
          : `${calendarValue.value
              .startOf('month')
              .format('YYYY-MM-DD')} ~ ${calendarValue.value
              .endOf('month')
              .format('YYYY-MM-DD')}`;
      selectedValue.value = data;
      modalVisible.value = true;
    });

    tr.append(column);

    tr.dataset.rendered = 'TRUE';
  }

  document.querySelectorAll('.calendar-total-label').forEach((v: any) => {
    v.innerText = t(v.getAttribute('data-lang'));
  });

  document.querySelectorAll('.calendar-label').forEach((v: any) => {
    v.innerText = t(v.getAttribute('data-lang'));
  });

  document.querySelectorAll('.calendar-total-section').forEach((v: any) => {
    v.innerText = t(v.getAttribute('data-lang'));
  });

  if (value) {
    document.querySelectorAll('.calendar-value').forEach((v: any, i) => {
      const week = Math.floor(i / 8);

      if (week < maxWeek.value) {
        v.dataset.value = weekTotal.value[week]
          ? weekTotal.value[week][singleValueKey[i % 8]]
          : '';
        v.innerText = comma(v.getAttribute('data-value'));
      } else {
        v.dataset.value = monthTotal.value
          ? monthTotal.value[singleValueKey[i % 8]]
          : {};
        v.innerText = comma(v.getAttribute('data-value'));
      }
    });
  }
};

const getStartEndTime = () => {
  sendData.value.startTime = calendarValue.value
    .startOf('month')
    .startOf('week')
    .format('YYYY-MM-DD');

  sendData.value.endTime = calendarValue.value
    .endOf('month')
    .endOf('week')
    .format('YYYY-MM-DD');
};

const getDailyStatus = async (params: any) => {
  loading.value = true;

  const res = await api.auto.game.summaries(params);

  const start = dayjs(sendData.value.startTime);
  const end = dayjs(sendData.value.endTime);
  const days = end.diff(start, 'day');

  weekTotal.value = [];
  monthTotal.value = {};

  let result = {};

  for (let i = 0; i < days; i++) {
    const currentDate = start.add(i, 'days');
    const inMonth = dayjs(calendarValue.value).isSame(currentDate, 'month');
    const item = res.find((e) =>
      dayjs(e.createdTime).isSame(currentDate, 'days')
    );

    if (!item) {
      result = {
        ...result,
        [currentDate.format('YYYY-MM-DD')]: null,
      };

      continue;
    }

    const week = Math.floor(i / 7);

    if (!weekTotal.value[week]) {
      weekTotal.value[week] = {};
    }

    for (const key in item) {
      if (singleValueKey.includes(key)) {
        if (weekTotal.value[week][key] === undefined) {
          weekTotal.value[week][key] = 0;
        }

        weekTotal.value[week][key] += item[key];

        if (monthTotal.value[key] === undefined) {
          monthTotal.value[key] = 0;
        }

        if (inMonth) {
          monthTotal.value[key] += item[key];
        }
      } else if (detailKey.includes(key)) {
        if (!weekTotal.value[week][key]) {
          weekTotal.value[week][key] = {
            UpDown: 0,
            EvenOdd: 0,
            BigSmall: 0,
          };
        }

        weekTotal.value[week][key].UpDown += item[key].UpDown;
        weekTotal.value[week][key].EvenOdd += item[key].EvenOdd;
        weekTotal.value[week][key].BigSmall += item[key].BigSmall;

        if (!monthTotal.value[key]) {
          monthTotal.value[key] = {
            UpDown: 0,
            EvenOdd: 0,
            BigSmall: 0,
          };
        }

        if (inMonth) {
          monthTotal.value[key].UpDown += item[key].UpDown;
          monthTotal.value[key].EvenOdd += item[key].EvenOdd;
          monthTotal.value[key].BigSmall += item[key].BigSmall;
        }
      }
    }

    result = {
      ...result,
      [currentDate.format('YYYY-MM-DD')]: item,
    };
  }

  dailyData.value = result;
  loading.value = false;

  resetTotal(true);
};

const selectDate = (data: IGameSummariesResponse) => {
  if (!data) {
    return;
  }

  selectedDate.value = dayjs(data.createdTime).format('YYYY-MM-DD');
  selectedValue.value = data;
  modalVisible.value = true;
};

watch(currentLocale, () => {
  resetTotal();
});

const pannelChanged = (value: Dayjs) => {
  calendarValue.value = value;

  search();
};

const simpleList = async () => {
  let items: any[] = [];
  const response = await api.admin.member.simple();

  response.forEach((el: IMemberPartnerSimple) => {
    const item = { value: el.id, label: el.email, ...el };
    items.push(item);
  });

  return items;
};

const { search } = useCustomPagination(
  async (params: any) => {
    const response = getDailyStatus(params);
    return response;
  },
  (params) => {
    getStartEndTime();

    return {
      ...params,
      filters: {
        ...params.filters,
        startTime: sendData.value.startTime,
        endTime: sendData.value.endTime,
      },
    };
  }
);

const disableDate = (currentDate: Dayjs) =>
  currentDate.isSame(calendarValue.value, 'month') ? false : true;

onBeforeMount(async () => {
  if (role === roleNames.master) {
    filters.value[0].options = await simpleList();
  }
});
</script>

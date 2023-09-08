<template>
  <vue3-extend-calendar
    class="status-daily main"
    :data="data"
    :weekData="weekData"
    :monthData="monthData"
    :nullRule="nullRule"
    @getCellData="openDetail"
    @getChangedDate="getData">
    <template #headerCell="{ data }">{{ $t(data) }}</template>
    <template #dateCellContent="{ data }">
      <ul>
        <template v-for="(value, key, index) in data?.data" :key="index">
          <li
            class="status-text"
            v-if="String(key) !== 'date'"
            :class="{ 'q-mb-sm': String(key) === 'diffAmount' || String(key) === 'rolling' }">
            <span class="key"> {{ translationPicker(String(key)) }} : </span>
            <span
              :class="{
                value,
                'text-blue-9': colorBlue.filter((e) => e === String(key)).length > 0,
                'text-red': colorRed.filter((e) => e === String(key)).length > 0,
                'text-amber-8': colorYellow.filter((e) => e === String(key)).length > 0,
                'text-green': colorGreen.filter((e) => e === String(key)).length > 0,
              }">
              {{ comma(value) }}
            </span>
          </li>
        </template>
      </ul>
    </template>
    <template #weekCellContent="{ data }">
      <ul>
        <template v-for="(value, key, index) in data?.data" :key="index">
          <li
            class="status-text"
            v-if="String(key) !== 'order'"
            :class="{ 'q-mb-sm': String(key) === 'diffAmount' || String(key) === 'rolling' }">
            <span class="key"> {{ translationPicker(String(key)) }} : </span>
            <span
              :class="{
                value,
                'text-blue-9': colorBlue.filter((e) => e === String(key)).length > 0,
                'text-red': colorRed.filter((e) => e === String(key)).length > 0,
                'text-amber-8': colorYellow.filter((e) => e === String(key)).length > 0,
                'text-green': colorGreen.filter((e) => e === String(key)).length > 0,
              }">
              {{ comma(value) }}
            </span>
          </li>
        </template>
      </ul>
    </template>
    <template #monthCellContent="{ data }">
      <ul>
        <template v-for="(value, key, index) in data?.data" :key="index">
          <li
            class="status-text"
            v-if="String(key) !== 'order'"
            :class="{ 'q-mb-sm': String(key) === 'diffAmount' || String(key) === 'rolling' }">
            <span class="key"> {{ translationPicker(String(key)) }} : </span>
            <span
              :class="{
                value,
                'text-blue-9': colorBlue.filter((e) => e === String(key)).length > 0,
                'text-red': colorRed.filter((e) => e === String(key)).length > 0,
                'text-amber-8': colorYellow.filter((e) => e === String(key)).length > 0,
                'text-green': colorGreen.filter((e) => e === String(key)).length > 0,
              }">
              {{ comma(value) }}
            </span>
          </li>
        </template>
      </ul>
    </template>
  </vue3-extend-calendar>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { useI18n } from 'vue-i18n';
import { ref, onBeforeMount } from 'vue';
import { comma } from 'src/boot/global';
import { apis } from 'src/stores/apis';

const { t } = useI18n();
const itemArr = [
  { value: 'charge', label: () => t('common.text.deposit_amount') },
  { value: 'exchange', label: () => t('common.text.withdrawal_amount') },
  { value: 'diffAmount', label: () => t('common.text.difference') },
  { value: 'betting', label: () => t('common.text.betting_amount') },
  { value: 'win', label: () => t('common.text.winning_amount') },
  { value: 'rolling', label: () => t('common.text.rolling_amount') },
  { value: 'cash', label: () => t('common.text.membership_amount') },
  { value: 'point', label: () => t('common.text.membership_point') },
  { value: 'totalAmount', label: () => t('common.text.membership_total_amount') },
];

const colorBlue = ['charge', 'point'];
const colorRed = ['diffAmount', 'win'];
const colorYellow = ['exchange', 'cash', 'totalAmount'];
const colorGreen = ['betting'];
const today = dayjs().format('YYYY-MM');
const data = ref<any>({});
const weekData = ref<any>([]);
const monthData = ref<any>([]);
const detailData = ref<any>(null);
const isDetail = ref<boolean>(false);

const openDetail = (value: any) => {
  if (!value.isEmpty && value.data?.info !== 'week' && value.data?.info !== 'month') {
    detailData.value = value.data;
    isDetail.value = true;
  }
};

const getData = async (val: string) => {
  data.value = [];
  weekData.value = [];
  monthData.value = [];

  try {
    const response = await apis.manager.DashboardCalendar({
      Month: val,
    });

    if (response.data.errCode === 0) {
      const getData = response.data.returnData;

      let main = getData.day.map((e: any) => {
        let { day, ...other } = e;
        other['date'] = day;
        return other;
      });
      let week = getData.week.map((e: any) => {
        let { week, ...other } = e;
        other['order'] = week;
        return other;
      });

      data.value = main;
      weekData.value = week;
      monthData.value = [getData.month];
    }
  } catch (error) {
    console.error(error);
  }
};
const translationPicker = (key: string) => {
  const result = itemArr.filter((e) => e.value === key);
  return result[0].label();
};
const nullRule = (item: any) => {
  if (item?.data !== undefined && item?.data !== null) {
    const data = Object.keys(item.data);
    let merge = 0;
    data.map((e: any) => {
      if (e !== 'date' && e !== 'order') {
        merge += Number(item.data[e]);
      }
    });
    return item?.date === null || item?.info !== undefined || merge === 0;
  } else {
    return item?.date === null || item?.info !== undefined || item?.data === null;
  }
};

onBeforeMount(() => {
  getData(today);
});
</script>

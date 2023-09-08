<template>
  <vue3-extend-calendar
    class="status-daily"
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
          <li class="status-li" v-if="value !== '0' && String(key) !== 'date'">
            <span class="key"> {{ translationPicker(String(key)) }} : </span>
            <span>
              {{ comma(value) }}
            </span>
          </li>
        </template>
      </ul>
    </template>
    <template #weekCellContent="{ data }">
      <ul>
        <template v-for="(value, key, index) in data?.data" :key="index">
          <li class="status-li" v-if="value !== '0' && String(key) !== 'order'">
            <span class="key"> {{ translationPicker(String(key)) }} : </span>
            <span>
              {{ comma(value) }}
            </span>
          </li>
        </template>
      </ul>
    </template>
    <template #monthCellContent="{ data }">
      <ul>
        <template v-for="(value, key, index) in data?.data" :key="index">
          <li class="status-li" v-if="value !== '0' && String(key) !== 'order'">
            <span class="key"> {{ translationPicker(String(key)) }} : </span>
            <span>
              {{ comma(value) }}
            </span>
          </li>
        </template>
      </ul>
    </template>
  </vue3-extend-calendar>
  <DailyDetails :show="isDetail" :data="detailData" @update:show="clearDetail" />
</template>

<script setup lang="ts">
import DailyDetails from 'src/components/modals/DailyDetails.vue';
import dayjs from 'dayjs';
import { useI18n } from 'vue-i18n';
import { ref, onBeforeMount } from 'vue';
import { comma } from 'src/boot/global';
import { apis } from 'src/stores/apis';

const { t } = useI18n();
const itemArr = [
  { value: 'cash', label: () => t('table.thead.cash') },
  { value: 'point', label: () => t('table.thead.point') },
  { value: 'charge', label: () => t('common.text.charging') },
  { value: 'exchange', label: () => t('common.text.exchange') },
];
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
const clearDetail = (state: boolean) => {
  detailData.value = null;
  isDetail.value = state;
};
const getData = async (val: string) => {
  data.value = [];
  weekData.value = [];
  monthData.value = [];

  try {
    const response = await apis.partner.SiteCalendar({
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

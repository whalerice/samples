<template>
  <div class="v3f-range-picker-group">
    <a-rangePicker
      v-model:value="dateValue"
      dropdownClassName="v3f-search-range-picker"
      :format="dateFormat"
      :class="{ hover: dateValue?.length > 0 && dateValue.length !== null, open: open }"
      :open="open"
      @change="changeDate"
      @openChange="handleOpen"
    >
      <template #renderExtraFooter>
        <div class="v3f-range-picker-btn-group">
          <a-typography-link v-for="item in btnOptions" :key="item.value" @click="pickDate(item.value)">
            <slot :name="`${propData.name}RangePickerLabel`" :data="{ item }">
              {{ returnFunction(item.label) }}
            </slot>
          </a-typography-link>
        </div>
      </template>
      <template #separator>
        <slot :name="`${propData.name}RangePickerPlaceHolder`" :data="{ propData }">
          {{ returnFunction(propData.placeHolder) }}
        </slot>
      </template>
    </a-rangePicker>
  </div>
</template>

<script setup>
import dayjs from 'dayjs';

import { ref, onMounted, computed, watch } from 'vue';
import { returnFunction } from '../../assets/js/global';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  reset: {
    type: Boolean,
    required: false,
  },
});
const emit = defineEmits(['clickFn']);
const open = ref(false);
const dateValue = ref();
const propData = computed(() => props.data);
const propReset = computed(() => props.reset);
const dateFormat = 'YYYY-MM-DD';
const btnOptions = ref([
  {
    value: 1,
    label: () => {
      return t('search.button.today');
    },
    class: '',
  },
  {
    value: 7,
    label: () => {
      return t('search.button.days', { num: 7 });
    },
    class: '',
  },
  {
    value: 30,
    label: () => {
      return t('search.button.days', { num: 30 });
    },
    class: '',
  },
]);

const pickDate = (value) => {
  dateValue.value = [dayjs(dateSet(value), dateFormat), dayjs(dateSet(1), dateFormat)];
  btnOptions.value.forEach((each, index) => {
    each.class = value === each.value ? 'active' : '';
  });
  emit('clickFn', {
    type: propData.value.type,
    name: propData.value.name,
    data: [dateSet(value), dateSet(1)],
    placeHolder: propData.value.placeHolder,
    order: propData.value.order,
  });
  open.value = false;
};
function set(day) {
  const date = new Date();
  let setDay = day === 1 ? date.getDate() : date.getDate() - (day - 1);
  // @ts-expect-error
  const today = new Date(date.toString(date.setDate(setDay)));
  const y = today.getFullYear();
  const m = today.getMonth() + 1;
  const d = today.getDate();
  return y + m + d;
}
function dateSet(day) {
  const date = new Date();
  let setDay = day === 1 ? date.getDate() : date.getDate() - (day - 1);
  // @ts-expect-error
  const today = new Date(date.toString(date.setDate(setDay)));
  const y = today.getFullYear();
  const m = today.getMonth() + 1;
  const d = today.getDate();

  return `${y}-${('0' + m).slice(-2)}-${('0' + d).slice(-2)}`;
}
const changeDate = (date, dateString) => {
  emit('clickFn', {
    type: propData.value.type,
    name: propData.value.name,
    data: dateString,
    placeHolder: propData.value.placeHolder,
  });
  if (date !== null) {
    const date1 = date[0].$d;
    const date2 = date[1].$d;
    const diffDate = date1.getTime() - date2.getTime();
    const dateDays = Math.abs(diffDate / (1000 * 3600 * 24)) + 1;

    const day1 = set(1);
    const day7 = set(1) + set(7);
    const day30 = set(1) + set(30);

    const start = date[0].$y + date[0].$M + 1 + date[0].$D;
    const end = date[1].$y + date[1].$M + 1 + date[1].$D;
    const sum = start + end;

    if (dateDays === 7 && day7 === sum) {
      btnOptions.value[1].class = 'active';
    } else if (dateDays === 30 && day30 === sum) {
      btnOptions.value[2].class = 'active';
    } else if (dateDays === 1 && day1 === start) {
      btnOptions.value[0].class = 'active';
    } else {
      btnOptions.value.forEach((e) => {
        e.class = '';
      });
    }
  } else {
    btnOptions.value.forEach((e) => {
      e.class = '';
    });
  }
};
const handleOpen = (val) => {
  open.value = val;
};

watch(
  propReset,
  (val) => {
    const isReset = val[`${propData.value.name}`];
    if (isReset) {
      dateValue.value = [];
      emit('clickFn', {
        type: propData.value.type,
        name: propData.value.name,
        data: ['', ''],
        placeHolder: propData.value.placeHolder,
        order: propData.value.order,
      });
    }
  },
  {
    deep: true,
  },
);

onMounted(() => {
  dateValue.value = [];
  emit('clickFn', {
    type: propData.value.type,
    name: propData.value.name,
    data: ['', ''],
    placeHolder: propData.value.placeHolder,
    order: propData.value.order,
  });
});
</script>

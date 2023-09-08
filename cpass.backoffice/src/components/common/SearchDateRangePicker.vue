<template>
  <div class="range-picker-group">
    <a-range-picker
      v-if="!propCustom?.active"
      v-model:value="dateValue"
      :format="dateFormat"
      @change="changeDate"
      @openChange="handleOpen"
      :open="open"
      :placeholder="[$t('datatable.thead.start_date'), $t('datatable.thead.end_date')]"
      dropdownClassName="search-range-picker"
      :class="{ hover: dateValue?.length > 0 && dateValue.length !== null }"
    >
      <template #renderExtraFooter>
        <div class="range-picker-btn-group">
          <a-typography-link
            v-for="item in btnOptions"
            :class="item.class"
            :key="item.value"
            @click="pickDate(item.value)"
          >
            {{ item.value === 1 ? $t('search.button.today') : $t('search.button.days', { num: item.value }) }}
          </a-typography-link>
        </div>
      </template>
      <template #separator>
        {{ $t(props.data) }}
      </template>
    </a-range-picker>
    <a-range-picker
      v-if="propCustom?.active"
      v-model:value="dateValue"
      :format="dateFormat"
      @change="changeDate"
      :placeholder="[$t('datatable.thead.start_date'), $t('datatable.thead.end_date')]"
      ref="custom"
    >
    </a-range-picker>
  </div>
</template>

<script setup>
import dayjs from 'dayjs';
import { ref, onMounted, computed, watch } from 'vue';
import { dateSet } from '@/assets/js/global.js';

const props = defineProps({
  isEmpty: {
    type: Boolean,
    required: false,
  },
  isCustom: {
    type: Object,
    required: false,
  },
  reset: {
    type: Boolean,
    required: false,
  },
  data: {
    type: String,
    required: true,
  },
});

const open = ref(false);
const custom = ref(null);
const propCustom = computed(() => props.isCustom);
const propReset = computed(() => props.reset);
const dateFormat = 'YYYY-MM-DD';
const btnOptions = ref([
  { value: 1, label: '1', class: '' },
  { value: 7, label: '7', class: '' },
  { value: 30, label: '30', class: '' },
]);
const emit = defineEmits(['clickFn']);

const dateValue = ref([]);

const pickDate = (value) => {
  dateValue.value = [dayjs(dateSet(value), dateFormat), dayjs(dateSet(1), dateFormat)];
  btnOptions.value.forEach((each, index) => {
    each.class = value === each.value ? 'active' : '';
  });
  emit('clickFn', [dateSet(value), dateSet(1)]);
  open.value = false;
};

function set(day) {
  const date = new Date();
  let setDay = day === 1 ? date.getDate() : date.getDate() - (day - 1);
  const today = new Date(date.toString(date.setDate(setDay)));
  const y = today.getFullYear();
  const m = today.getMonth() + 1;
  const d = today.getDate();
  return y + m + d;
}

const changeDate = (date, dateString) => {
  emit('clickFn', dateString);
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

watch(propCustom, (val) => {
  if (val.focus === 4) {
    custom.value.focus();
  } else {
    custom.value.blur();
    dateValue.value = [];
  }
});

watch(propReset, (val) => {
  if (val) {
    dateValue.value = [];
    emit('clickFn', ['', '']);
  }
});

onMounted(() => {
  if (props.isEmpty) {
    dateValue.value = [];
    emit('clickFn', ['', '']);
  } else {
    dateValue.value = [dayjs(dateSet(1), dateFormat), dayjs(dateSet(1), dateFormat)];
    emit('clickFn', [dateSet(1), dateSet(1)]);
  }
});
</script>

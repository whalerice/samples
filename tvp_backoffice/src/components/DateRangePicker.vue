<template>
  <a-range-picker
    v-model:value="value"
    format="YYYY-MM-DD"
    class="custom-range-picker"
    dropdownClassName="custom-range-picker-dropdown"
  >
    <template #renderExtraFooter>
      <a-row justify="space-around">
        <a-button
          v-for="option in options"
          :key="option.label"
          @click="preset(option.day)"
          class="no-border"
        >
          {{ $t(option.label) }}
        </a-button>
      </a-row>
    </template>

    <template #separator> {{ $t(props.label) }} </template>
  </a-range-picker>
</template>

<script setup lang="ts">
import { PropType, computed, watch } from 'vue';
import dayjs, { Dayjs } from 'dayjs';

const emits = defineEmits(['update:value']);

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  value: {
    type: Object,
    required: true,
  },
});

const options = [
  { day: 0, label: 'common.word.today' },
  { day: 7, label: 'common.word.week' },
  { day: 30, label: 'common.word.month' },
];

const value = computed({
  get: () => props.value[props.id] ?? '',
  set: (value: Dayjs[]) => {
    if (!value[0] && !value[1]) {
      emits('update:value', {
        ...props.value,
        [props.id]: undefined,
      });
      return;
    }

    emits('update:value', {
      ...props.value,
      [props.id]: value,
    });
  },
});

const preset = (day: number) => {
  const now = dayjs();
  const previous = now.subtract(day, 'day');
  value.value = [previous, now];
};
</script>

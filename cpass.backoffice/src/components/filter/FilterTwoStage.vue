<template>
  <a-space :size="5">
    <a-button class="v3f-btn-wrap" :class="{ 'v3f-btn-hover': firstSelected, open: firstOpen }">
      <slot :name="`${propData.name}PlaceHolder1`" :data="{ propData }">
        {{ returnFunction(placeHolder[0]) }}
      </slot>

      <i class="v3f-ico v3f-ico-arrow-down v3f-ml10">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
          <path
            d="M201.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 338.7 54.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"
          />
        </svg>
      </i>
      <a-select
        class="v3f-double-select"
        :class="{ 'v3f-btn-hover': secondSelected, open: secondOpen }"
        v-model:value="firstValue"
        :open="firstOpen"
        :showSearch="false"
        :placeholder="false"
        :maxTagCount="0"
        :dropdownStyle="{ padding: 0 }"
        :dropdownMatchSelectWidth="false"
        @change="handleFirstSelect"
        @dropdownVisibleChange="handleFirstOpen"
      >
        <a-select-option v-for="item in firstStep" :key="item.value" :value="item.value">
          <slot :name="`${propData.name}Options`" :data="{ item }">{{ returnFunction(item.label) }}</slot>
        </a-select-option>
      </a-select>
    </a-button>

    <a-button
      class="v3f-btn-wrap"
      :class="{ 'v3f-btn-hover': secondSelected, open: secondOpen, disabled: !firstSelected || secondListEmpty }"
    >
      <slot :name="`${propData.name}PlaceHolder2`" :data="{ propData }">
        {{ returnFunction(placeHolder[1]) }}
      </slot>

      <i class="v3f-ico v3f-ico-arrow-down v3f-ml10">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
          <path
            d="M201.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 338.7 54.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"
          />
        </svg>
      </i>
      <a-select
        class="v3f-double-select"
        v-model:value="secondValue"
        :open="secondOpen"
        :showSearch="false"
        :placeholder="false"
        :maxTagCount="0"
        :dropdownStyle="{ padding: 0 }"
        :dropdownMatchSelectWidth="false"
        @change="handleSecondSelect"
        @dropdownVisibleChange="handleSecondOpen"
      >
        <a-select-option v-for="item in setSecondStep()" :key="item.value" :value="item.value">
          <slot :name="`${propData.name}Options`" :data="{ item }">{{ returnFunction(item.label) }}</slot>
        </a-select-option>
      </a-select>
    </a-button>
  </a-space>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { returnFunction } from '../../assets/js/global';

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
});
const firstOpen = ref(false);
const emits = defineEmits(['doubleStepResult']);
const propData = computed(() => props.data);
const placeHolder = computed(() => props.data.placeHolder);
const firstStep = computed(() => props.data.firstData);
const firstValue = ref();
const firstSelected = computed(() => firstStep.value.filter((e) => e.checked === true).length > 0);
const secondOpen = ref(false);
const secondStep = computed(() =>
  props.data.secondData?.filter((e) => {
    if (e.index === firstValue.value) {
      return e;
    } else {
      return null;
    }
  }),
);
const secondValue = ref(null);
const secondSelected = computed(() => secondStep.value[0]?.data.filter((e) => e.checked === true).length > 0);
const secondListEmpty = computed(() => secondStep.value[0]?.data.length === 0);
const type = computed(() => props.data.type);
const name = computed(() => props.data.name);

const handleFirstSelect = (val) => {
  emits('doubleStepResult', {
    type: type.value,
    name: name.value,
    data: [val],
  });
};
const handleFirstOpen = (val) => {
  firstOpen.value = val;
  if (secondOpen.value === true) {
    secondOpen.value = false;
  }
};
const handleSecondSelect = (val) => {
  emits('doubleStepResult', {
    type: type.value,
    name: name.value,
    data: [firstValue.value, val],
  });
};
const handleSecondOpen = (val) => {
  secondOpen.value = val;
  if (firstOpen.value === true) {
    firstOpen.value = false;
  }
};
const setSecondStep = () => {
  const data = props.data.secondData?.filter((e) => {
    if (e.index === firstValue.value) {
      return e;
    } else {
      return null;
    }
  });
  return data[0]?.data;
};

watch(
  propData,
  (val) => {
    const first = val.firstData.filter((e) => e.checked === true);

    if (secondValue.value !== null) {
      if (firstValue.value !== first[0]?.value) {
        secondValue.value = null;
      }
    }

    if (first.length <= 0) {
      firstValue.value = null;
    } else {
      firstValue.value = first[0].value;
    }

    const secondData = val.secondData;
    secondData.filter((e) => {
      const data = e.data.filter((el) => el.checked === true);
      if (data.length > 0) {
        secondValue.value = data.filter((e) => e.checked === true)[0]?.value;
      }
    });
  },
  { deep: true },
);
</script>

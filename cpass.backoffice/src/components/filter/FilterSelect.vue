<template>
  <a-button class="v3f-btn-wrap" :class="{ 'v3f-btn-hover': isSelected, open: open }">
    <slot :name="`${propData.name}PlaceHolder`" :data="{ propData }">
      {{ returnFunction(propData.placeHolder) }}
    </slot>

    <i class="v3f-ico v3f-ico-arrow-down v3f-ml10">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
        <path
          d="M201.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 338.7 54.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"
        />
      </svg>
    </i>
    <a-select
      class="v3f-search-select"
      mode="multiple"
      v-model:value="selectValueArr"
      :open="open"
      :showSearch="false"
      :placeholder="false"
      :maxTagCount="0"
      :dropdownStyle="{ padding: 0 }"
      @change="handleSelect"
      @dropdownVisibleChange="handleOpen"
      :dropdownMatchSelectWidth="false"
    >
      <a-select-option v-for="item in selectOptions" :key="item.value" :value="item.value">
        <slot :name="`${propData.name}Options`" :data="{ item }">{{ returnFunction(item.label) }}</slot>
      </a-select-option>
    </a-select>
  </a-button>
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
const open = ref(false);
const emits = defineEmits(['selectResult']);
const propData = computed(() => props.data);
const selectValueArr = ref();
const selectOptions = computed(() => propData.value?.data);
const isSelected = computed(() => selectOptions.value.filter((e) => e.checked === true).length > 0);
const type = computed(() => props.data.type);
const name = computed(() => props.data.name);

const handleSelect = (val) => {
  emits('selectResult', {
    type: type.value,
    name: name.value,
    data: val,
  });
};
const handleOpen = (val) => {
  open.value = val;
};
watch(
  propData,
  (val) => {
    const newSelectValueArr = val.data
      .filter((e) => e.checked === true)
      .map((e) => {
        return e.value;
      });
    selectValueArr.value = newSelectValueArr;
  },
  { deep: true },
);
</script>

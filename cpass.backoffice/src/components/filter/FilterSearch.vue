<template>
  <a-input-group compact class="v3f-input-group" :class="{ isSelected: isSelected, hover: searchValue.length > 0 }">
    <a-select v-model:value="selectValue" :dropdownStyle="{ padding: 0 }" @change="handleSelect">
      <template #suffixIcon>
        <i class="v3f-ico v3f-ico-arrow-down">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
            <path
              d="M201.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 338.7 54.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"
            />
          </svg>
        </i>
      </template>
      <a-select-option v-for="item in selectOptions" :key="item.value" :value="item.value">
        <slot :name="`${propData.name}SearchOptions`" :data="{ item }">{{ returnFunction(item?.label) }}</slot>
      </a-select-option>
    </a-select>
    <a-input
      class="v3f-input-group-main"
      v-model:value="searchValue"
      :placeholder="returnFunction(propData.placeHolder)"
      @change="handleSelect"
      @pressEnter="search"
    >
    </a-input>
  </a-input-group>
</template>

<script setup>
import { returnFunction } from '../../assets/js/global';
import { ref, computed, watch, onBeforeMount, onMounted } from 'vue';

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
});
const selectValue = ref();
const searchValue = ref('');
const propData = computed(() => props.data);
const emits = defineEmits(['searchResult', 'search']);
const type = computed(() => props.data.type);
const name = computed(() => props.data.name);
const selectOptions = computed(() => propData.value?.data);
const isSelected = computed(() => searchValue.value.length > 0);

const handleSelect = () => {
  emits('searchResult', {
    type: type.value,
    name: name.value,
    data: selectValue.value,
    search: searchValue.value,
  });
};
const setPlaceHolderWidth = () => {
  const inputs = document.querySelectorAll('.v3f-input-group-main');
  for (let i = 0; i < inputs.length; i++) {
    const length = inputs[i].getAttribute('placeholder').length;
    inputs[i].style.minWidth = length * 8 + 'px';
  }
};
const search = () => {
  emits('search');
};

watch(
  propData,
  (val) => {
    selectValue.value = val.data.filter((e) => e.checked === true)[0].value;
    searchValue.value = val.search;
  },
  { deep: true },
);

onMounted(() => {
  setPlaceHolderWidth();
});
onBeforeMount(() => {
  selectValue.value = propData.value.data.filter((e) => e.checked === true)[0].value;
});
</script>

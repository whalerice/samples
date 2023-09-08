<template>
  <a-input
    class="v3f-total-search"
    v-model:value="searchValue"
    :maxlength="30"
    :class="{ isSelected: isSelected }"
    :placeholder="returnFunction(propData[0]?.placeHolder)"
    @change="handleSelect"
    @pressEnter="search"
  />
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { returnFunction } from '../../assets/js/global';

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
});
const emits = defineEmits(['totalSearchResult', 'search']);
const propData = computed(() => props.data);
const searchValue = ref('');
const isSelected = computed(() => searchValue.value.length > 0);
const type = computed(() => props.data[0].type);
const name = computed(() => props.data[0].name);

const handleSelect = () => {
  emits('totalSearchResult', {
    type: type.value,
    name: name.value,
    search: searchValue.value,
  });
};

const search = () => {
  emits('search');
};

watch(
  propData,
  (val) => {
    searchValue.value = val[0].search;
  },
  { deep: true },
);
</script>

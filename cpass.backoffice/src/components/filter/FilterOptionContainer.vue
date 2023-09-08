<template>
  <a-row class="v3f-filter-row" :gutter="[5, 5]">
    <a-col v-for="(item, index) in selectData" :key="index" :order="item?.order">
      <Select :data="item" @selectResult="selectResult">
        <template v-slot:[getSelectPlaceholderSlot(item.name)]="{ data }">
          <slot :name="getSelectPlaceholderSlot(item.name)" :data="data"> </slot>
        </template>
        <template v-slot:[getSelectOptionsSlot(item.name)]="{ data }">
          <slot :name="getSelectOptionsSlot(item.name)" :data="data"></slot>
        </template>
      </Select>
    </a-col>
    <a-col v-for="(item, index) in rangePickerData" :key="index" :order="item?.order">
      <RangePicker :data="item" @clickFn="rangePickerResult" :reset="resetRangePicker">
        <template v-slot:[getRangePickerLabelSlot(item.name)]="{ data }">
          <slot :name="getRangePickerLabelSlot(item.name)" :data="data"></slot>
        </template>
        <template v-slot:[getRangePickerPlaceHolderSlot(item.name)]="{ data }">
          <slot :name="getRangePickerPlaceHolderSlot(item.name)" :data="data"></slot>
        </template>
      </RangePicker>
    </a-col>
    <a-col v-for="(item, index) in searchData" :key="index" :order="item?.order">
      <Search :data="item" @searchResult="searchResult" @search="search">
        <template v-slot:[getSearchOptionsSlot(item.name)]="{ data }">
          <slot :name="getSearchOptionsSlot(item.name)" :data="data"></slot>
        </template>
      </Search>
    </a-col>
    <a-col v-if="totalSearchData.length > 0" :order="totalSearchData[0]?.order">
      <TotalSearch :data="totalSearchData" @totalSearchResult="totalSearchResult" @search="search" />
    </a-col>
    <a-col v-for="(item, index) in doubleStepData" :key="index" :order="item.order">
      <DoubleStep :data="item" @doubleStepResult="doubleStepResult"> </DoubleStep>
    </a-col>
    <a-col v-if="isCountry.length > 0" :order="isCountry[0]?.order">
      <Country :origin="countryList" :data="countryData" @countryResult="countryResult" />
    </a-col>
    <a-col :order="20">
      <a-button v-if="data.length > 0" class="v3f-search-btn" type="primary" @click="search">
        <SearchOutlined />
      </a-button>
    </a-col>
  </a-row>
</template>
<script setup>
import Select from './FilterSelect.vue';
import Search from './FilterSearch.vue';
import RangePicker from './FilterRangePicker.vue';
import TotalSearch from './FilterAdvanceSearch.vue';
import DoubleStep from './FilterTwoStage.vue';
import Country from './FilterCountry.vue';

import { SearchOutlined } from '@ant-design/icons-vue';
import { computed } from 'vue';

const emits = defineEmits([
  'selectResult',
  'rangePickerResult',
  'searchResult',
  'totalSearchResult',
  'doubleStepResult',
  'search',
  'countryResult',
]);
const props = defineProps({
  data: {
    type: Array,
    require: true,
  },
  resetRangePicker: {
    type: Boolean,
    require: true,
  },
  countryList: {
    type: Object,
    require: true,
  },
  countryData: {
    type: Object,
    require: true,
  },
});
const data = computed(() => props.data);
const selectData = computed(() => props.data?.filter((e) => e.type === 'select'));
const searchData = computed(() => props.data?.filter((e) => e.type === 'search'));
const rangePickerData = computed(() => props.data?.filter((e) => e.type === 'rangePicker'));
const totalSearchData = computed(() => props.data?.filter((e) => e.type === 'totalSearch'));
const doubleStepData = computed(() => props.data?.filter((e) => e.type === 'doubleStepSelect'));
const isCountry = computed(() => props.data?.filter((e) => e.type === 'country'));
const countryData = computed(() => props.countryData);
const resetRangePicker = computed(() => props.resetRangePicker);
const countryList = computed(() => props.countryList);

const getSelectPlaceholderSlot = (val) => {
  return val + 'PlaceHolder';
};
const getSelectOptionsSlot = (val) => {
  return val + 'Options';
};
const getRangePickerPlaceHolderSlot = (val) => {
  return val + 'RangePickerPlaceHolder';
};
const getRangePickerLabelSlot = (val) => {
  return val + 'RangePickerLabel';
};
const getSearchOptionsSlot = (val) => {
  return val + 'SearchOptions';
};

const selectResult = (val) => {
  emits('selectResult', val);
};
const rangePickerResult = (val) => {
  emits('rangePickerResult', val);
};
const searchResult = (val) => {
  emits('searchResult', val);
};
const totalSearchResult = (val) => {
  emits('totalSearchResult', val);
};
const doubleStepResult = (val) => {
  emits('doubleStepResult', val);
};
const search = () => {
  emits('search');
};
const countryResult = (val) => {
  emits('countryResult', val);
};
</script>

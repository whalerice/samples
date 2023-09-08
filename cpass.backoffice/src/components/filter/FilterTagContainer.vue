<template>
  <a-row :gutter="[0, 5]" class="v3f-filter v3f-tag-controller" v-if="visible">
    <i class="v3f-filter-ico"></i>
    <a-tag closable v-for="(item, index) in countryData" :key="index" @close="handleCountry(item)">
      <div class="v3f-country-container" style="margin-right: 0.5rem">
        <i
          class="v3f-country-flag-img mr-10"
          :style="{
            'background-image': `url(http://purecatamphetamine.github.io/country-flag-icons/3x2/${item.alpha2Code.toUpperCase()}.svg)`,
          }"
        ></i>
        {{ item.country.split('(')[0] }}
      </div>
    </a-tag>
    <template v-for="(itemGroup, index) in selectData" :key="index" :order="itemGroup?.order">
      <template v-for="(item, idx) in itemGroup.data">
        <a-tag closable :key="idx" v-if="item.checked" @close="handleSelectTag(item, itemGroup)">
          <slot :name="`${itemGroup.name}Tag`" :data="{ item }">{{ returnFunction(item?.label) }}</slot>
        </a-tag>
      </template>
    </template>
    <template v-for="(item, index) in rangePickerData" :key="index" :order="item?.order">
      <a-tag closable v-if="rangeDecision(item?.data)" @close="handleRangePickerTag(item)">
        <slot :name="`${item.name}Tag`" :data="{ item }">
          <span> {{ returnFunction(item.placeHolder) }} : {{ item.data[0] }} ~ {{ item.data[1] }} </span>
        </slot>
      </a-tag>
    </template>
    <template v-for="(item, index) in searchData" :key="index" :order="item?.order">
      <a-tag closable v-if="item.search !== ''" @close="handleSearchTag(item)">
        <slot :name="`${item.name}Tag`" :data="{ item }"> {{ returnFunction(searchDecision(item.data)) }}</slot> :
        {{ item.search }}
      </a-tag>
    </template>
    <a-col :order="totalSearchData?.order">
      <a-tag
        v-if="totalSearchData?.search !== '' && totalSearchData !== undefined"
        closable
        @close="handleTotalSearchTag(totalSearchData)"
      >
        <slot :name="`${totalSearchData?.name}Tag`" :data="{ totalSearchData }">
          {{ returnFunction(totalSearchData?.label) }}
        </slot>
        : {{ totalSearchData?.search }}
      </a-tag>
    </a-col>
    <template v-for="(items, index) in doubleStepData" :key="index" :order="items?.order">
      <template v-for="(data, idx) in items.firstData" :key="idx">
        <a-tag closable v-if="data.checked" @close="handleFirstStep(items)">
          {{ returnFunction(items.label[0]) }} : {{ returnFunction(data.label) }}
        </a-tag>
      </template>
      <template v-for="(data, idx) in items.secondData" :key="idx">
        <template v-for="(value, idx2) in data.data" :key="idx2">
          <a-tag closable v-if="value.checked" @close="handleSecondStep(items)">
            {{ returnFunction(items.label[1]) }} : {{ returnFunction(value.label) }}
          </a-tag>
        </template>
      </template>
    </template>
  </a-row>
</template>

<script setup>
import { computed, onBeforeMount, watch, ref, onMounted } from 'vue';
import { returnFunction } from '../../assets/js/global';

const emits = defineEmits([
  'tagSelectResult',
  'tagRangePickerResult',
  'tagSearchResult',
  'tagTotalSearchResult',
  'handleFirstStep',
  'handleSecondStep',
  'handleCountry',
]);
const props = defineProps({
  selectData: {
    type: Array,
    require: true,
  },
  rangePickerData: {
    type: Array,
    require: true,
  },
  searchData: {
    type: Array,
    require: true,
  },
  totalSearchData: {
    type: Array,
    require: true,
  },
  doubleStepData: {
    type: Array,
    require: true,
  },
  countryData: {
    type: Array,
    require: true,
  },
  countryList: {
    type: Object,
    require: true,
  },
  visible: {
    type: Boolean,
    require: true,
  },
});
const selectPropData = computed(() => props.selectData);
const rangePickerPropData = computed(() => props.rangePickerData);
const searchPropData = computed(() => props.searchData);
const totalSearchPropData = computed(() => props.totalSearchData);
const doubleStepPropData = computed(() => props.doubleStepData);
const countryPropData = computed(() => props.countryData);
const visible = computed(() => props.visible);
const selectData = ref();
const rangePickerData = ref();
const searchData = ref();
const totalSearchData = ref();
const doubleStepData = ref();
const countryData = ref();

function deepCopy(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  if (obj instanceof Array) {
    return obj.reduce((arr, item, i) => {
      arr[i] = deepCopy(item);
      return arr;
    }, []);
  }

  if (obj instanceof Object) {
    return Object.keys(obj).reduce((newObj, key) => {
      newObj[key] = deepCopy(obj[key]);
      return newObj;
    }, {});
  }
}
const handleSelectTag = (item, itemGroup) => {
  emits('tagSelectResult', { type: itemGroup.type, name: itemGroup.name, value: item.value, checked: false });
};
const handleRangePickerTag = (item) => {
  emits('tagRangePickerResult', item);
};
const handleSearchTag = (item) => {
  emits('tagSearchResult', item);
};
const handleTotalSearchTag = (item) => {
  emits('tagTotalSearchResult', item);
};
const handleFirstStep = (item) => {
  emits('handleFirstStep', item);
};
const handleSecondStep = (item) => {
  emits('handleSecondStep', item);
};
const handleCountry = (item) => {
  emits('handleCountry', item);
};
const rangeDecision = (item) => {
  if (item === undefined) {
    return false;
  } else {
    if (item[0] + item[1] === '') {
      return false;
    } else {
      return true;
    }
  }
};
const searchDecision = (data) => {
  const result = data.filter((e) => e.checked === true)[0];
  return result.label;
};

watch(
  selectPropData,
  () => {
    selectData.value = deepCopy(selectPropData.value);
  },
  {
    deep: true,
  },
);
watch(
  rangePickerPropData,
  () => {
    rangePickerData.value = deepCopy(rangePickerPropData.value);
  },
  {
    deep: true,
  },
);
watch(
  searchPropData,
  () => {
    searchData.value = deepCopy(searchPropData.value);
  },
  {
    deep: true,
  },
);
watch(
  totalSearchPropData,
  () => {
    totalSearchData.value = deepCopy(totalSearchPropData.value);
  },
  {
    deep: true,
  },
);
watch(
  doubleStepPropData,
  () => {
    doubleStepData.value = deepCopy(doubleStepPropData.value);
  },
  {
    deep: true,
  },
);
watch(
  countryPropData,
  (val) => {
    const data = val;

    let result = [];
    props.countryList.forEach((el) => {
      data.forEach((e) => {
        if (e === el.alpha2Code) {
          result.push(el);
        }
      });
    });
    countryData.value = result;
  },
  {
    deep: true,
  },
);

onBeforeMount(() => {
  totalSearchData.value = deepCopy(totalSearchPropData.value);
});
</script>

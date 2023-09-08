<template>
  <a-button class="v3f-btn-wrap v3f-btn-country" :class="{ 'v3f-btn-hover': isSelected, open: open }">
    {{ $t('drawer.label.country') }}
    <i class="v3f-ico v3f-ico-arrow-down v3f-ml10">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
        <path
          d="M201.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 338.7 54.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"
        />
      </svg>
    </i>
    <a-select
      ref="scroll"
      class="v3f-country-select"
      mode="multiple"
      :open="open"
      :maxTagCount="0"
      :showSearch="false"
      :placeholder="false"
      :dropdownStyle="{ padding: 0 }"
      v-model:value="selectValueArr"
      @change="handleSelect"
      @dropdownVisibleChange="handleOpen"
      @select="blur"
      @disSelect="blur"
    >
      <a-select-option
        v-for="(item, index) in selectOptions"
        :key="index"
        :value="item?.alpha2Code"
        :dialCode="item?.dialCode"
        :country="item?.country"
        :alpha2Code="item?.alpha2Code"
        :disabled="item?.disabled"
        :class="item?.class"
      >
        <template v-if="index === 0">
          <a-input
            style="padding: 0"
            ref="searchElement"
            :bordered="false"
            v-model:value="searchData"
            :placeHolder="$t('drawer.label.country')"
            @click="focus"
            @blur="blur"
            @change="search"
          />
        </template>

        <template v-if="index !== 0">
          <div class="v3f-country-container">
            <i
              class="v3f-country-flag-img mr-10"
              :style="{
                'background-image': `url(http://purecatamphetamine.github.io/country-flag-icons/3x2/${item.alpha2Code.toUpperCase()}.svg)`,
              }"
            >
            </i>
            <span>
              {{ item.country.split('(')[0] }}
            </span>
          </div>
        </template>
      </a-select-option>
    </a-select>
  </a-button>
</template>

<script setup>
import { ref, computed, watch, onBeforeMount } from 'vue';

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  origin: {
    type: Object,
    require: true,
  },
});
const open = ref(false);
const searchData = ref('');
const selectOptions = ref();
const isFocused = ref(false);
const selectValueArr = ref([]);
const searchElement = ref(null);
const propData = computed(() => props.data);
const originData = computed(() => props.origin);
const emits = defineEmits(['countryResult']);
const isSelected = computed(() => selectValueArr.value.length > 0);
const scroll = ref(null);

const focus = () => {
  searchElement.value[0].input.focus();
  isFocused.value = true;
};
const blur = () => {
  searchElement.value[0]?.input.blur();
  isFocused.value = false;
};
const handleSelect = (val) => {
  emits('countryResult', val);
};
const handleOpen = (val) => {
  if (!isFocused.value) {
    open.value = val;
  }
};
const search = async (e) => {
  selectOptions.value.splice(1);

  const content = e.target.value;
  const isNan = isNaN(Number(e.target.value));
  const countryName = await keySearch('country', content);
  const alpha2Code = await keySearch('alpha2Code', content);
  const dialCode = await keySearch('dialCode', content);

  let result = [];

  if (isNan) {
    result = [...(await countryName), ...(await alpha2Code)];
  } else {
    result = [...(await dialCode)];
  }
  const searchResult = [...new Set(result.map((e) => e.dialCode))];

  originData.value.forEach((e, index) => {
    if (searchResult.includes(e.dialCode) && e.dialCode !== 'search') {
      selectOptions.value.push(e);
    }
  });
};
const keySearch = (key, value) => {
  return new Promise((resolve, reject) => {
    const result = originData.value.filter((e) => e[key].toLowerCase().includes(value.toLowerCase()));
    resolve(result);
  });
};

watch(
  open,
  (val) => {
    if (!val) {
      scroll.value.scrollTo(0);
      setTimeout(() => {
        selectOptions.value = JSON.parse(JSON.stringify(originData.value));
        searchData.value = '';
      }, 300);
    }
  },
  {
    deep: true,
  },
);

watch(
  propData,
  (val) => {
    selectValueArr.value = val;
  },
  { deep: true },
);

onBeforeMount(() => {
  selectOptions.value = JSON.parse(JSON.stringify(originData.value));
});
</script>

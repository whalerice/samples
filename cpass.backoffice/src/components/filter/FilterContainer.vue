<template>
  <a-menu class="v3f-search-menu" mode="inline" :openKeys="['menu']">
    <a-sub-menu :key="'menu'">
      <template #title>
        <a-button class="v3f-title-btn" type="primary" @click="filterVisible = !filterVisible">
          {{ filterVisible ? t('common.label.filter_close') : t('common.label.filter_open') }}
          <i :class="{ rotate: !filterVisible }" class="ico-btn" />
        </a-button>
      </template>
      <a-row class="v3f-main-option">
        <Options
          :data="data"
          :resetRangePicker="resetRangePicker"
          :countryList="countryList"
          :countryData="countryResult"
          @selectResult="handleSelect"
          @rangePickerResult="handleRangePicker"
          @searchResult="handelSearch"
          @totalSearchResult="handelTotalSearch"
          @doubleStepResult="handleDoubleStepResult"
          @search="search"
          @countryResult="handleCountryResult"
        >
          <template
            v-for="(item, index) in selectData"
            :key="index"
            v-slot:[String(getSelectPlaceholderSlot(item.name))]="{ data }"
          >
            <slot :name="getSelectPlaceholderSlot(item.name)" :data="data"></slot>
          </template>
          <template
            v-for="(item, index) in selectData"
            :key="index"
            v-slot:[String(getSelectOptionsSlot(item.name))]="{ data }"
          >
            <slot :name="getSelectOptionsSlot(item.name)" :data="data"></slot>
          </template>
          <!-- select -->
          <template
            v-for="(item, index) in rangePickerData"
            :key="index"
            v-slot:[String(getRangePickerPlaceHolderSlot(item.name))]="{ data }"
          >
            <slot :name="getRangePickerPlaceHolderSlot(item.name)" :data="data"></slot>
          </template>
          <template
            v-for="(item, index) in rangePickerData"
            :key="index"
            v-slot:[String(getRangePickerLabelSlot(item.name))]="{ data }"
          >
            <slot :name="getRangePickerLabelSlot(item.name)" :data="data"></slot>
          </template>
          <!-- rangePicker -->
          <template
            v-for="(item, index) in searchData"
            :key="index"
            v-slot:[getSearchOptionsSlot(item.name)]="{ data }"
          >
            <slot :name="getSearchOptionsSlot(item.name)" :data="data"></slot>
          </template>
          <!-- search -->
        </Options>
      </a-row>
    </a-sub-menu>
    <Filter
      :visible="tagVisible"
      :selectData="selectResult"
      :rangePickerData="rangePickerResult"
      :searchData="searchResult"
      :totalSearchData="totalSearchResult"
      :doubleStepData="doubleStepResult"
      :countryData="countryResult"
      :countryList="countryList"
      @tagSelectResult="tagSelectClose"
      @tagRangePickerResult="tagRangePickerClose"
      @tagSearchResult="tagSearchClose"
      @tagTotalSearchResult="tagTotalSearchClose"
      @handleFirstStep="handleFirstStepClose"
      @handleSecondStep="handleSecondStepClose"
      @handleCountry="handleCountryClose"
    >
      <template v-for="(item, index) in selectResult" :key="index" v-slot:[String(getTagSlot(item.name))]="{ data }">
        <slot :name="getTagSlot(item.name)" :data="data"></slot>
      </template>
      <template
        v-for="(item, index) in rangePickerResult"
        :key="index"
        v-slot:[String(getTagSlot(item.name))]="{ data }"
      >
        <slot :name="getTagSlot(item.name)" :data="data"></slot>
      </template>
      <template v-for="(item, index) in searchResult" :key="index" v-slot:[String(getTagSlot(item.name))]="{ data }">
        <slot :name="getTagSlot(item.name)" :data="data"></slot>
      </template>
      <template v-slot:[String(getTagSlot(totalSearchResult?.name))]="{ data }">
        <slot :name="getTagSlot(totalSearchResult?.name)" :data="data"></slot>
      </template>
    </Filter>
  </a-menu>

  <!-- export -->
</template>
<script setup>
import Options from './FilterOptionContainer.vue';
import Filter from './FilterTagContainer.vue';

import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { countryList } from '@/assets/js/global';
import { computed, watch, ref, onBeforeMount, reactive, toRefs, onMounted } from 'vue';

const { t } = useI18n();
const emits = defineEmits(['getData']);
const props = defineProps({
  data: {
    type: Array,
    require: true,
  },
});
const data = ref();
const store = useStore();
const propsData = computed(() => props.data);
const lang = computed(() => store.state['common'].currentLocale);
const selectData = computed(() => props.data?.filter((e) => e.type === 'select'));
const searchData = computed(() => props.data?.filter((e) => e.type === 'search'));
const rangePickerData = computed(() => props.data?.filter((e) => e.type === 'rangePicker'));
const totalSearchData = computed(() => props.data?.filter((e) => e.type === 'totalSearch'));
const doubleStepSelectData = computed(() => props.data?.filter((e) => e.type === 'doubleStepSelect'));
const countryData = computed(() => props.data?.filter((e) => e.type === 'country'));
//clone
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
const cloneRangePicker = () => {
  let rangePickerResult = reactive({});
  let resetRangePicker = reactive({});

  rangePickerData.value.forEach((e) => {
    rangePickerResult[`${e.name}`] = {};
    resetRangePicker[`${e.name}`] = false;
  });

  return toRefs({ rangePickerResult: rangePickerResult, resetRangePicker: resetRangePicker });
};
const selectResult = ref();
const searchResult = ref();
const totalSearchResult = ref();
const doubleStepResult = ref();
const doubleStepExportData = ref([null, null]);
const filterVisible = ref(true);
const tagVisible = ref(true);
const countryResult = ref([]);
let { rangePickerResult, resetRangePicker } = cloneRangePicker();

//slotName
const getSelectPlaceholderSlot = (val) => {
  return val + 'PlaceHolder';
};
const getSelectOptionsSlot = (val) => {
  return val + 'Options';
};
const getTagSlot = (val) => {
  return val + 'Tag';
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

//select
const handleSelect = (info) => {
  selectResult.value.forEach((e) => {
    if (e.type === info.type && e.name === info.name) {
      e.data.map((eachData) => {
        if (info.data.includes(eachData.value)) {
          eachData.checked = true;
        } else {
          eachData.checked = false;
        }
      });
    }
  });
  data.value.forEach((e) => {
    if (e.type === info.type && e.name === info.name) {
      e.data.map((eachData) => {
        if (info.data.includes(eachData.value)) {
          eachData.checked = true;
        } else {
          eachData.checked = false;
        }
      });
    }
  });
};
//rangePicker
const handleRangePicker = (info) => {
  rangePickerResult.value[info.name] = info;
};
//search
const handelSearch = (info) => {
  data.value.forEach((e) => {
    if (e.type === info.type && e.name === info.name) {
      e.data.map((eachData) => {
        if (info.data === eachData.value) {
          eachData.checked = true;
        } else {
          eachData.checked = false;
        }
      });
      e.search = info.search;
    }
  });
  searchResult.value.forEach((e) => {
    if (e.type === info.type && e.name === info.name) {
      e.data.map((eachData) => {
        if (info.data === eachData.value) {
          eachData.checked = true;
        } else {
          eachData.checked = false;
        }
      });
      e.search = info.search;
    }
  });
};
//totalSearch
const handelTotalSearch = (info) => {
  totalSearchResult.value.search = info.search;
  data.value.forEach((e) => {
    if (e.type === info.type && e.name === info.name) {
      e.search = info.search;
    }
  });
};
//doubleStepResult
const handleDoubleStepResult = (info) => {
  const length = info.data.length;
  if (length === 1) {
    doubleStepResult.value.map((e) => {
      if (e.type === info.type && e.name === info.name) {
        e.firstData.map((el) => {
          if (el.value === info.data[0]) {
            el.checked = true;
          } else {
            el.checked = false;
          }
        });
        e.secondData.map((el) => {
          const data = el.data;
          data.map((e) => {
            e.checked = false;
          });
        });
      }
    });
    data.value.map((e) => {
      if (e.type === info.type && e.name === info.name) {
        e.firstData.map((el) => {
          if (el.value === info.data[0]) {
            el.checked = true;
          } else {
            el.checked = false;
          }
        });
        e.secondData.map((el) => {
          const data = el.data;
          data.map((e) => {
            e.checked = false;
          });
        });
      }
    });
    doubleStepExportData.value[0] = info.data[0];
    doubleStepExportData.value[1] = null;
  } else if (length === 2) {
    doubleStepResult.value.map((e) => {
      if (e.type === info.type && e.name === info.name) {
        e.firstData.map((el) => {
          if (el.value === info.data[0]) {
            el.checked = true;
          } else {
            el.checked = false;
          }
        });
        e.secondData.map((el) => {
          if (el.index === info.data[0]) {
            const data = el.data;
            data.map((e) => {
              if (e.value === info.data[1]) {
                e.checked = true;
              } else {
                e.checked = false;
              }
            });
          }
        });
      }
    });
    data.value.map((e) => {
      if (e.type === info.type && e.name === info.name) {
        e.firstData.map((el) => {
          if (el.value === info.data[0]) {
            el.checked = true;
          } else {
            el.checked = false;
          }
        });
        e.secondData.map((el) => {
          if (el.index === info.data[0]) {
            el.data.map((e) => {
              if (e.value === info.data[1]) {
                e.checked = true;
              } else {
                e.checked = false;
              }
            });
          }
        });
      }
    });
    doubleStepExportData.value[1] = info.data[1];
  }
};
const handleCountryResult = (info) => {
  // countryResult.value = info.map((e) => e.option);
  countryResult.value = info;
};

//tag
const tagSelectClose = (removeTag) => {
  selectResult.value.forEach((e) => {
    if (e.type === removeTag.type && e.name === removeTag.name) {
      e.data.map((eachData) => {
        if (removeTag.value === eachData.value) {
          eachData.checked = false;
        }
      });
    }
  });
  data.value.forEach((e) => {
    if (e.type === removeTag.type && e.name === removeTag.name) {
      e.data.map((eachData) => {
        if (removeTag.value === eachData.value) {
          eachData.checked = false;
        }
      });
    }
  });
};
const tagRangePickerClose = (date) => {
  rangePickerResult.value[`${date.name}`].data = ['', ''];
  resetRangePicker.value[`${date.name}`] = true;
  setTimeout(() => {
    resetRangePicker.value[`${date.name}`] = false;
  }, 10);
};
const tagSearchClose = (info) => {
  data.value.forEach((e) => {
    if (e.type === info.type && e.name === info.name) {
      e.data.map((eachData, index) => {
        if (index === 0) {
          eachData.checked = true;
        } else {
          eachData.checked = false;
        }
      });
      e.search = '';
    }
  });
  searchResult.value.forEach((e) => {
    if (e.type === info.type && e.name === info.name) {
      e.data.map((eachData, index) => {
        if (index === 0) {
          eachData.checked = true;
        } else {
          eachData.checked = false;
        }
      });
      e.search = '';
    }
  });
};
const tagTotalSearchClose = (info) => {
  totalSearchResult.value.search = '';

  data.value.forEach((e) => {
    if (e.type === info.type && e.name === info.name) {
      e.search = '';
    }
  });
};
const handleFirstStepClose = (info) => {
  const selectData = doubleStepExportData.value;
  doubleStepResult.value.map((e) => {
    if (e.type === info.type && e.name === info.name) {
      e.firstData.map((el) => {
        el.checked = false;
      });
      e.secondData.map((el) => {
        if (el.index === selectData[0]) {
          const data = el.data;
          data.map((e) => {
            e.checked = false;
          });
        }
      });
    }
  });
  data.value.map((e) => {
    if (e.type === info.type && e.name === info.name) {
      e.firstData.map((el) => {
        el.checked = false;
      });
      e.secondData.map((el) => {
        if (el.index === selectData[0]) {
          const data = el.data;
          data.map((e) => {
            e.checked = false;
          });
        }
      });
    }
  });
  doubleStepExportData.value = [null, null];
};
const handleSecondStepClose = (info) => {
  const selectData = doubleStepExportData.value;
  doubleStepResult.value.map((e) => {
    if (e.type === info.type && e.name === info.name) {
      e.secondData.map((el) => {
        if (el.index === selectData[0]) {
          const data = el.data;
          data.map((e) => {
            e.checked = false;
          });
        }
      });
    }
  });
  data.value?.map((e) => {
    e.secondData?.map((el) => {
      if (el.index === selectData[0]) {
        const data = el.data;
        data.map((e) => {
          e.checked = false;
        });
      }
    });
  });
  doubleStepExportData.value[1] = null;
};
const handleCountryClose = (info) => {
  countryResult.value = countryResult.value.filter((item) => item !== info.alpha2Code);
};
//check
const matchNameToType = (name) => {
  const value = data.value.filter((e) => {
    if (e.name === name) {
      return e.type;
    }
  });
  return value[0]?.type;
};
const checkTagVisible = () => {
  let select = false;
  let rangePicker = false;
  let search = false;
  let totalSearch = false;
  let doubleStep = false;
  let country = false;

  Object.keys(exportData?.value).forEach((key) => {
    const type = matchNameToType(key);
    const item = exportData?.value[key];
    if (type === 'select') {
      if (item.length > 0) {
        select = true;
      }
    } else if (type === 'rangePicker') {
      if ((item[0] + item[1]).length > 0) {
        rangePicker = true;
      }
    } else if (type === 'search') {
      if (item.search.length > 0) {
        search = true;
      }
    } else if (type === 'totalSearch') {
      if (item.length > 0) {
        totalSearch = true;
      }
    } else if (type === 'doubleStepSelect') {
      if (item[0] !== null || item[1] !== null) {
        doubleStep = true;
      }
    } else if (type === 'country') {
      if (item.length > 0) {
        country = true;
      }
    }
  });

  return select || rangePicker || search || totalSearch || doubleStep || country;
};
// tagVisible
const exportData = ref({});

const exportSelect = () => {
  selectResult.value.map((e) => {
    let trueArr = [];
    e?.data?.forEach((data) => {
      if (data.checked === true) {
        trueArr.push(data.value);
      }
    });

    exportData.value[`${e.name}`] = trueArr;
  });
};
const exportSearch = () => {
  searchResult.value.map((e) => {
    let obj = {};
    e?.data?.forEach((data) => {
      if (data.checked === true) {
        obj[`${e.name}`] = {
          search: e.search,
          select: data,
        };
      }
    });
    exportData.value[`${e.name}`] = obj[`${e.name}`];
  });
};
const exportRangePicker = () => {
  Object.keys(rangePickerResult.value).forEach((key) => {
    exportData.value[`${key}`] = rangePickerResult.value[key].data;
  });
};
const exportTotalSearch = () => {
  exportData.value[`${totalSearchResult.value.name}`] = totalSearchResult.value.search;
};
const exportDoubleStep = () => {
  doubleStepResult.value.forEach((key) => {
    exportData.value[`${key.name}`] = doubleStepExportData.value;
  });
};
const exportCountry = () => {
  if (countryData.value.length > 0) {
    const data = countryResult.value;
    let result = [];
    countryList.forEach((el) => {
      data.forEach((e) => {
        if (e === el.alpha2Code) {
          result.push(el);
        }
      });
    });
    exportData.value[countryData.value[0]?.name] = result;
  }
};
const search = () => {
  emits('getData', deepCopy(exportData.value));
};
//export data

watch(
  selectResult,
  () => {
    exportSelect();
  },
  {
    deep: true,
  },
);
watch(
  searchResult,
  () => {
    exportSearch();
  },
  {
    deep: true,
  },
);
watch(
  rangePickerResult,
  () => {
    exportRangePicker();
  },
  {
    deep: true,
  },
);
watch(
  totalSearchResult,
  () => {
    exportTotalSearch();
  },
  {
    deep: true,
  },
);
watch(
  doubleStepResult,
  () => {
    exportDoubleStep();
  },
  {
    deep: true,
  },
);
watch(
  countryResult,
  () => {
    exportCountry();
  },
  {
    deep: true,
  },
);
//dataChange

watch(
  exportData,
  () => {
    tagVisible.value = checkTagVisible();
  },
  {
    deep: true,
  },
);
watch(
  propsData,
  () => {
    data.value = deepCopy(propsData.value);
    selectResult.value = deepCopy(selectData.value);
    searchResult.value = deepCopy(searchData.value);
    totalSearchResult.value = deepCopy(totalSearchData.value)[0];
    doubleStepResult.value = deepCopy(doubleStepSelectData.value);
  },
  {
    deep: true,
  },
);

const setAdvanceSearchWidth = () => {
  const advancedSearch = document.querySelectorAll('.v3f-total-search');
  if (advancedSearch.length > 0) {
    for (let i = 0; i < advancedSearch.length; i++) {
      setTimeout(() => {
        const length = advancedSearch[i].getAttribute('placeholder').length;
        if (lang.value === 'ko') {
          advancedSearch[i].setAttribute('size', length + 10);
        } else {
          advancedSearch[i].setAttribute('size', length + 10);
        }
      }, 0);
    }
  }
};
watch(lang, () => {
  setAdvanceSearchWidth();
});
onMounted(() => {
  setAdvanceSearchWidth();
});
onBeforeMount(() => {
  const unknownDuplicate = propsData.value?.map((e) => e.name);
  const noDuplicate = new Set(unknownDuplicate);
  const duplicateTotalSearch = propsData.value?.filter((e) => e.type === 'totalSearch');

  if (unknownDuplicate.length !== noDuplicate.size) {
    console.error('Duplicate names are not allowed');
  } else if (duplicateTotalSearch?.length > 1) {
    console.error('Total search cannot be duplicated');
  } else {
    data.value = deepCopy(propsData.value);
    selectResult.value = deepCopy(selectData.value);
    searchResult.value = deepCopy(searchData.value);
    totalSearchResult.value = deepCopy(totalSearchData.value)[0];
    doubleStepResult.value = deepCopy(doubleStepSelectData.value);
    exportCountry();
  }
});
</script>

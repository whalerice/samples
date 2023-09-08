<template>
  <a-menu class="search-menu" mode="inline" :openKeys="['menu']">
    <a-sub-menu key="menu">
      <template #title>
        <a-button class="title-btn" type="primary" @click="filterVisible = !filterVisible">
          {{ filterVisible ? t('common.label.filter_open') : t('common.label.filter_close') }}
          <fa-icon icon="fa-chevron-right" :class="{ rotate: !filterVisible }" class="ico-btn" />
        </a-button>
      </template>
      <a-space class="search-menu-space" direction="vertical">
        <a-row :gutter="[5, 5]">
          <a-col class="state-width" v-if="propType.includes('state')">
            <SelectSearchApplication
              :data="stateOptions"
              :placeholder="'datatable.thead.state'"
              @selectResult="handleStateSelect"
            />
          </a-col>
          <a-col class="state-width" v-if="propType.includes('partner.enterprise.withdrawal')">
            <SelectSearchApplication
              :data="partnerEnterpriseWithdrawalOptions"
              :placeholder="'datatable.thead.state'"
              @selectResult="handlePartnerEnterpriseWithdrawalSelect"
            />
          </a-col>
          <a-col v-if="propType.includes('coin')">
            <SelectSearchApplication
              :data="coinOptions"
              :placeholder="'datatable.thead.coin'"
              @selectResult="handleCoinSelect"
            />
          </a-col>
          <a-col v-if="propType.includes('partner.settlement.sortation')">
            <SelectSearchApplication
              :data="partnerSettlementSortationOptions"
              :placeholder="'datatable.thead.sortation'"
              @selectResult="handlePartnerSettlementSortationSelect"
            />
          </a-col>
          <a-col class="wallet-width" v-if="propType.includes('partner.settlement.state')">
            <SelectSearchApplication
              :data="partnerSettlementStateOptions"
              :placeholder="'datatable.thead.state'"
              @selectResult="handlePartnerSettlementStateSelect"
            />
          </a-col>
          <a-col v-if="propType.includes('req')">
            <SearchDateRangePicker
              @clickFn="changeDate"
              :isEmpty="true"
              :reset="resetDate[0]"
              :data="'search.label.request_date'"
            />
          </a-col>
          <a-col v-if="propType.includes('pro')">
            <SearchDateRangePicker
              @clickFn="changeDate2"
              :isEmpty="true"
              :reset="resetDate[1]"
              :data="'search.label.processing_date'"
            />
          </a-col>
          <a-col class="advance-search-col" v-if="propType.includes('search')">
            <a-space :size="0" class="advance-search">
              <a-select
                class="combine advance-search-select"
                style="width: 180px"
                v-model:value="filterData.searchType"
                :options="searchType"
              />
              <a-input
                class="advance-search-input"
                v-model:value="filterData.search"
                :placeholder="t('search.placeholder.search_text')"
              />
            </a-space>
          </a-col>
          <a-col>
            <a-button class="search-btn" type="primary" @click="emits('search', filterData)">
              <SearchOutlined />
            </a-button>
          </a-col>
        </a-row>
      </a-space>
    </a-sub-menu>
    <a-row :gutter="[0, 5]" class="filter tag-controller" v-if="tagVisible">
      <fa-icon class="ico" icon="fa-solid  fa-filter" />
      <a-col>
        <a-tag
          v-for="(item, index) in stateOptions"
          :key="index"
          :visible="item.checked"
          closable
          @close="handleStateSelect(item, 'tag')"
        >
          {{ t(item.label) }}
        </a-tag>
      </a-col>
      <a-col>
        <a-tag
          v-for="(item, index) in coinOptions"
          :key="index"
          :visible="item.checked"
          @close="handleCoinSelect(item, 'tag')"
          closable
        >
          {{ item.label }}
        </a-tag>
      </a-col>
      <a-col>
        <a-tag
          v-for="(item, index) in partnerSettlementSortationOptions"
          :key="index"
          :visible="item.checked"
          @close="handlePartnerSettlementSortationSelect(item, 'tag')"
          closable
        >
          {{ t(item.label) }}
        </a-tag>
      </a-col>
      <a-col>
        <a-tag
          v-for="(item, index) in partnerSettlementStateOptions"
          :key="index"
          :visible="item.checked"
          @close="handlePartnerSettlementStateSelect(item, 'tag')"
          closable
        >
          {{ t(item.label) }}
        </a-tag>
      </a-col>
      <a-col>
        <a-tag
          v-for="(item, index) in partnerEnterpriseWithdrawalOptions"
          :key="index"
          :visible="item.checked"
          @close="handlePartnerEnterpriseWithdrawalSelect(item, 'tag')"
          closable
        >
          {{ t(item.label) }}
        </a-tag>
      </a-col>
      <a-col>
        <template v-if="filterData.req_BeforeDate !== '' && filterData.req_AfterDate">
          <a-tag closable @close="closeDate()">
            {{ $t('search.label.request_date') + ' : ' }} {{ filterData.req_BeforeDate }} ~
            {{ filterData.req_AfterDate }}
          </a-tag>
        </template>
      </a-col>
      <a-col>
        <template v-if="filterData.proc_BeforeDate !== '' && filterData.proc_AfterDate">
          <a-tag closable @close="closeDate2()">
            {{ $t('search.label.processing_date') + ' : ' }} {{ filterData.proc_BeforeDate }} ~
            {{ filterData.proc_AfterDate }}
          </a-tag>
        </template>
      </a-col>
      <a-col>
        <a-tag v-if="searchVisible" closable @close="searchTagToggle()">
          {{ t('search.label.advanced_search') }} ({{ getSearchLabel() }})
          {{ ' : ' + filterData.search }}
        </a-tag>
      </a-col>
    </a-row>
  </a-menu>
</template>
<script setup>
import SelectSearchApplication from '@/components/search/SelectSearchApplication.vue';
import SearchDateRangePicker from '@/components/common/SearchDateRangePicker.vue';

import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { SearchOutlined } from '@ant-design/icons-vue';

const { t } = useI18n();
const store = useStore();
const emits = defineEmits(['search']);
const props = defineProps({
  type: {
    type: Array,
    required: true,
  },
});
const propType = computed(() => props.type);
const filterVisible = ref(false);
const tagVisible = ref(false);
const coinList = computed(() => store.state['sign'].coinList);
const coin_cd = computed(() => store.state['sign'].coin_cd);

const filterData = ref({
  state: '0,1,2,3,4',
  req_BeforeDate: '',
  req_AfterDate: '',
  proc_BeforeDate: '',
  proc_AfterDate: '',
  coin: coin_cd.value,
  search: '',
  searchType: 1,
  partnerSettlementSortation: '1,2,3,4,5',
  partnerSettlementState: '-1,0,1,2,3,4,5',
  PartnerEnterpriseWithdrawal: '0,1,2,3',
});
//

const partnerSettlementStateOptions = ref([
  // { value: -1, label: 'search.label.waiting_1st_approval', checked: false },
  // { value: 0, label: 'search.label.waiting_2nd_approval', checked: false },
  { value: '-1,0', label: 'search.label.waiting_approval', checked: false },
  { value: 1, label: 'search.label.waiting_transmission', checked: false },
  { value: 2, label: 'search.label.success', checked: false },
  { value: 3, label: 'search.label.failed', checked: false },
  { value: 4, label: 'search.label.1st_refusal_approval', checked: false },
  { value: 5, label: 'search.label.2nd_refusal_approval', checked: false },
]);

const setPartnerSettlementStateData = () => {
  filterData.value.partnerSettlementState = '';

  const trueItems = partnerSettlementStateOptions.value.filter((each) => each.checked === true);
  trueItems.forEach((checkedEach) => {
    if (filterData.value.partnerSettlementState.length > 0) {
      filterData.value.partnerSettlementState = filterData.value.partnerSettlementState + ',' + checkedEach.value;
    } else {
      filterData.value.partnerSettlementState = filterData.value.partnerSettlementState + checkedEach.value;
    }
  });
};

const handlePartnerSettlementStateSelect = (val, type) => {
  if (type === 'select') {
    partnerSettlementStateOptions.value.forEach((e) => {
      if (e.value === val) {
        e.checked = !e.checked;
      }
    });
    //select 추가 및 제거

    const trueItems = partnerSettlementStateOptions.value.filter((each) => each.checked === true);
    setPartnerSettlementStateData();

    if (trueItems.length === 0) {
      filterData.value.partnerSettlementState = '-1,0,1,2,3,4,5';
    }
    if (trueItems.length === partnerSettlementStateOptions.value.length) {
      filterData.value.partnerSettlementState = '-1,0,1,2,3,4,5';
    }

    //select filterData 추가 및 제거
  } else if (type === 'tag') {
    partnerSettlementStateOptions.value.forEach((e) => {
      if (e.value === val.value) {
        e.checked = !e.checked;
      }
    });

    const trueItems = partnerSettlementStateOptions.value.filter((each) => each.checked === true);
    setPartnerSettlementStateData();

    if (trueItems.length === 0 || trueItems.length === partnerSettlementStateOptions.value.length) {
      filterData.value.partnerSettlementState = '-1,0,1,2,3,4,5';
    }
  }
};

//
const stateOptions = ref([
  { value: 0, label: 'search.label.request', checked: false },
  { value: 1, label: 'search.label.cancelled_user', checked: false },
  { value: 2, label: 'search.label.completed', checked: false },
  { value: 3, label: 'search.label.cancelled_store', checked: false },
  { value: 4, label: 'datatable.text.expire', checked: false },
]);

const setStateData = () => {
  filterData.value.state = '';

  const trueItems = stateOptions.value.filter((each) => each.checked === true);
  trueItems.forEach((checkedEach) => {
    filterData.value.state = filterData.value.state + checkedEach.value;
  });
  filterData.value.state = filterData.value.state.split('').join(',');
};

const handleStateSelect = (val, type) => {
  if (type === 'select') {
    stateOptions.value.forEach((e) => {
      if (e.value === val) {
        e.checked = !e.checked;
      }
    });
    //select 추가 및 제거

    const trueItems = stateOptions.value.filter((each) => each.checked === true);
    setStateData();

    if (trueItems.length === 0) {
      filterData.value.state = '0,1,2,3,4';
    }
    if (trueItems.length === stateOptions.value.length) {
      filterData.value.state = '0,1,2,3,4';
    }

    //select filterData 추가 및 제거
  } else if (type === 'tag') {
    stateOptions.value.forEach((e) => {
      if (e.value === val.value) {
        e.checked = !e.checked;
      }
    });

    const trueItems = stateOptions.value.filter((each) => each.checked === true);
    setStateData();

    if (trueItems.length === 0 || trueItems.length === stateOptions.value.length) {
      filterData.value.state = '0,1,2,3,4';
    }
  }
};
//

const partnerSettlementSortationOptions = ref([
  { value: 1, label: 'search.label.send', checked: false },
  { value: 2, label: 'search.label.send_pay', checked: false },
  { value: 3, label: 'search.label.receive', checked: false },
  { value: 4, label: 'search.label.receive_pay', checked: false },
  { value: 5, label: 'search.label.swap', checked: false },
]);

const setSortationData = () => {
  filterData.value.partnerSettlementSortation = '';

  const trueItems = partnerSettlementSortationOptions.value.filter((each) => each.checked === true);
  trueItems.forEach((checkedEach) => {
    filterData.value.partnerSettlementSortation = filterData.value.partnerSettlementSortation + checkedEach.value;
  });
  filterData.value.partnerSettlementSortation = filterData.value.partnerSettlementSortation.split('').join(',');
};
const handlePartnerSettlementSortationSelect = (val, type) => {
  if (type === 'select') {
    partnerSettlementSortationOptions.value.forEach((e) => {
      if (e.value === val) {
        e.checked = !e.checked;
      }
    });

    //select 추가 및 제거

    const trueItems = partnerSettlementSortationOptions.value.filter((each) => each.checked === true);
    setSortationData();

    if (trueItems.length === 0) {
      filterData.value.partnerSettlementSortation = '1,2,3,4,5';
    }
    if (trueItems.length === partnerSettlementSortationOptions.value.length) {
      filterData.value.partnerSettlementSortation = '1,2,3,4,5';
    }

    //select filterData 추가 및 제거
  } else if (type === 'tag') {
    partnerSettlementSortationOptions.value.forEach((e) => {
      if (e.value === val.value) {
        e.checked = !e.checked;
      }
    });

    const trueItems = partnerSettlementSortationOptions.value.filter((each) => each.checked === true);
    setSortationData();

    if (trueItems.length === 0 || trueItems.length === partnerSettlementSortationOptions.value.length) {
      filterData.value.partnerSettlementSortation = '1,2,3,4,5';
    }
  }
};

//
const coinOptions = ref(
  coinList.value.map((e) => {
    e.checked = false;
    return e;
  }),
);
const setCoinData = () => {
  filterData.value.coin = '';

  const trueItems = coinOptions.value.filter((each) => each.checked === true);
  trueItems.forEach((checkedEach) => {
    filterData.value.coin = filterData.value.coin + checkedEach.value;
  });
  filterData.value.coin = filterData.value.coin.split('').join(',');
};
const handleCoinSelect = (val, type) => {
  if (type === 'select') {
    coinOptions.value.forEach((e) => {
      if (e.value === val) {
        e.checked = !e.checked;
      }
    });
    //select 추가 및 제거

    const trueItems = coinOptions.value.filter((each) => each.checked === true);
    setCoinData();

    if (trueItems.length === 0) {
      filterData.value.coin = coin_cd.value;
    }
    if (trueItems.length === coinOptions.value.length) {
      filterData.value.coin = coin_cd.value;
    }

    //select filterData 추가 및 제거
  } else if (type === 'tag') {
    coinOptions.value.forEach((e) => {
      if (e.value === val.value) {
        e.checked = !e.checked;
      }
    });

    const trueItems = coinOptions.value.filter((each) => each.checked === true);
    setCoinData();

    if (trueItems.length === 0 || trueItems.length === coinOptions.value.length) {
      filterData.value.coin = coin_cd.value;
    }
  }
};

const resetDate = ref([false, false]);
const changeDate = (day) => {
  filterData.value.req_BeforeDate = day[0];
  filterData.value.req_AfterDate = day[1];
};
const closeDate = () => {
  resetDate.value[0] = true;
  setTimeout(() => {
    resetDate.value[0] = false;
  }, 10);
};
const changeDate2 = (day) => {
  filterData.value.proc_BeforeDate = day[0];
  filterData.value.proc_AfterDate = day[1];
};
const closeDate2 = () => {
  resetDate.value[1] = true;
  setTimeout(() => {
    resetDate.value[1] = false;
  }, 10);
};
//

const searchVisible = ref(false);
const searchType = ref([
  { value: 1, label: () => t('search.select.cpass_id') },
  { value: 2, label: () => t('search.select.store_id') },
  { value: 3, label: () => t('search.select.confirmation_number') },
]);

const searchTagToggle = () => {
  searchVisible.value = !searchVisible.value;
  filterData.value.searchType = searchType.value[0].value;
  filterData.value.search = '';
};
const getSearchLabel = () => {
  return searchType.value.filter((e) => e.value === filterData.value.searchType)[0].label();
};

const partnerEnterpriseWithdrawalOptions = ref([
  { value: 0, label: 'search.label.request', checked: false },
  { value: 2, label: 'datatable.text.completed', checked: false },
  { value: 3, label: 'search.label.cancelled_store', checked: false },
]);

const setPartnerEnterpriseWithdrawalData = () => {
  filterData.value.PartnerEnterpriseWithdrawal = '';

  const trueItems = partnerEnterpriseWithdrawalOptions.value.filter((each) => each.checked === true);
  trueItems.forEach((checkedEach) => {
    filterData.value.PartnerEnterpriseWithdrawal = filterData.value.PartnerEnterpriseWithdrawal + checkedEach.value;
  });
  filterData.value.PartnerEnterpriseWithdrawal = filterData.value.PartnerEnterpriseWithdrawal.split('').join(',');
};

const handlePartnerEnterpriseWithdrawalSelect = (val, type) => {
  if (type === 'select') {
    partnerEnterpriseWithdrawalOptions.value.forEach((e) => {
      if (e.value === val) {
        e.checked = !e.checked;
      }
    });
    //select 추가 및 제거

    const trueItems = partnerEnterpriseWithdrawalOptions.value.filter((each) => each.checked === true);
    setPartnerEnterpriseWithdrawalData();

    if (trueItems.length === 0) {
      filterData.value.PartnerEnterpriseWithdrawal = '0,2,3';
    }
    if (trueItems.length === partnerEnterpriseWithdrawalOptions.value.length) {
      filterData.value.PartnerEnterpriseWithdrawal = '0,2,3';
    }

    //select filterData 추가 및 제거
  } else if (type === 'tag') {
    partnerEnterpriseWithdrawalOptions.value.forEach((e) => {
      if (e.value === val.value) {
        e.checked = !e.checked;
      }
    });

    const trueItems = partnerEnterpriseWithdrawalOptions.value.filter((each) => each.checked === true);
    setPartnerEnterpriseWithdrawalData();

    if (trueItems.length === 0 || trueItems.length === partnerEnterpriseWithdrawalOptions.value.length) {
      filterData.value.PartnerEnterpriseWithdrawal = '0,2,3';
    }
  }
};

const getAllHasChange = () => {
  const hasStateChange = stateOptions.value.filter((e) => e.checked === true).length > 0;
  const hasCoinChange = coinOptions.value.filter((e) => e.checked === true).length > 0;
  const hasDateChange =
    (filterData.value.req_AfterDate !== '' && filterData.value.req_BeforeDate !== '') ||
    (filterData.value.proc_AfterDate !== '' && filterData.value.proc_BeforeDate !== '');
  const hasSearchChange = filterData.value.search !== '';
  const hasPartnerSettlementSortationChange =
    partnerSettlementSortationOptions.value.filter((e) => e.checked == true).length > 0;
  const hasPartnerSettlementStateChange =
    partnerSettlementStateOptions.value.filter((e) => e.checked == true).length > 0;
  const hasPartnerEnterpriseWithdrawalChange =
    partnerEnterpriseWithdrawalOptions.value.filter((e) => e.checked == true).length > 0;

  hasSearchChange ? (searchVisible.value = true) : (searchVisible.value = false);

  return (
    hasStateChange ||
    hasCoinChange ||
    hasDateChange ||
    hasSearchChange ||
    hasPartnerSettlementSortationChange ||
    hasPartnerSettlementStateChange ||
    hasPartnerEnterpriseWithdrawalChange
  );
};

watch(filterData.value, () => {
  getAllHasChange() ? (tagVisible.value = true) : (tagVisible.value = false);
});
</script>
<style lang="scss">
.state-width {
  .ant-select-selector {
    width: 150px;
  }
}
.wallet-width {
  .ant-select-selector {
    width: 180px;
  }
}
</style>

<template>
  <div class="content-header">
    <a-button type="primary" @click="openInquiryForm">
      <fa-icon icon="pencil" />
      {{ $t('common.button.inquiry') }}
    </a-button>
  </div>

  <div class="search-area">
    <div class="row">
      <label class="label">{{ $t('search.label.request_date') }}</label>
      <div class="item">
        <DateRangePicker @clickFn="changeDate" :isEmpty="true" />
      </div>
    </div>
    <div class="row">
      <label class="label">{{ $t('search.label.processing_date') }}</label>
      <div class="item">
        <DateRangePicker @clickFn="changeDate2" :isEmpty="true" />
      </div>
    </div>
    <div class="row">
      <label class="label">{{ $t('search.label.category') }}</label>
      <div class="item">
        <a-select v-model:value="categoryValue" label-in-value>
          <a-select-option
            v-for="item in categories"
            :value="item.value"
            :key="item.value"
            @click="changeCategory(item)"
          >
            {{ $t(item.text) }}
          </a-select-option>
        </a-select>
      </div>
    </div>
    <div class="row">
      <label class="label">{{ $t('search.label.state') }}</label>
      <div class="item">
        <a-checkbox v-model:checked="checkAll.checked" :value="checkAll.value" @change="stateChange(checkAll)">
          {{ $t(checkAll.label) }}
        </a-checkbox>
        <a-checkbox
          v-for="(item, index) in stateCheckOptions"
          :key="index"
          v-model:checked="item.checked"
          :value="item.value"
          @change="stateChange(item)"
        >
          {{ $t(item.label) }}
        </a-checkbox>
      </div>
    </div>
    <div class="row">
      <label class="label">{{ $t('search.label.advanced_search') }}</label>
      <div class="item">
        <div class="search-box">
          <a-select v-model:value="searchValue.search_Type" label-in-value>
            <a-select-option v-for="item in searchType" :value="item.value" :key="item.value">
              {{ $t(item.label) }}
            </a-select-option>
          </a-select>
          <a-input-search
            v-model:value="searchValue.search"
            :placeholder="$t('search.placeholder.search_text')"
            enter-button
            @search="onSearch"
          />
        </div>
      </div>
    </div>
  </div>
  <a-table
    :class="['datatable', { 'is-mobile': isMobile }]"
    :columns="columns"
    :data-source="dataSource"
    :pagination="pagination"
    :loading="loading"
    :showSorterTooltip="false"
    :scroll="{ x: true }"
    @change="handleTableChange"
    @resizeColumn="handleResizeColumn"
  >
    <template #title>
      <h4 class="title">{{ $t('datatable.title.inquiry_details_list') }}</h4>
      <div class="control-box">
        <a-radio-group v-model:value="isMobile" button-style="solid" class="mr-5">
          <a-radio-button :value="true"><fa-icon icon="fa-solid fa-list" /></a-radio-button>
          <a-radio-button :value="false"><fa-icon icon="fa-solid fa-table" /></a-radio-button>
        </a-radio-group>
        <a-select
          v-model:value="selectedPageSize"
          label-in-value
          :options="pageSizeOptions"
          @change="selectPageSize"
        ></a-select>
      </div>
    </template>
    <template #headerCell="{ title }"> {{ $t(title) }}</template>
    <template #bodyCell="{ column, record, text }">
      <template v-if="isMobile">
        {{ $t(column.title) }} :
        <span v-if="column.dataIndex !== 'title' && column.dataIndex !== 'category' && column.dataIndex !== 'state'">{{
          text
        }}</span>
      </template>
      <template v-if="column.dataIndex === 'title'">
        <a-typography-link @click="openInquiryDetails(record)">
          {{ record.title }}
        </a-typography-link>
      </template>
      <template v-if="column.dataIndex === 'state'">
        {{ record.state === 4 ? $t('datatable.text.completed') : $t('datatable.text.ongoing') }}
      </template>
      <template v-if="column.dataIndex === 'category'">
        {{
          record.category === 1
            ? $t('search.select.become_partner')
            : record.category === 2
            ? $t('common.button.payment')
            : record.category === 3
            ? $t('common.button.withdrawal')
            : record.category === 4
            ? $t('common.button.settlement')
            : record.category === 5
            ? $t('search.select.withdrawal_partners')
            : $t('search.select.etc')
        }}
      </template>
    </template>
  </a-table>
  <EmailInquiry
    :show="visibleForm"
    :formFormat="formState"
    :categories="categories"
    @open="openInquiryForm"
    @close="closeInquiryForm"
  />
  <InquiryDetails
    :show="visibleDetail"
    :content="inquiryDetails"
    @open="openInquiryDetails"
    @close="closeInquiryDetail"
  />
</template>

<script setup>
import DateRangePicker from '@/components/common/DateRangePicker.vue';
import InquiryDetails from '@/components/modals/InquiryDetails.vue';
import EmailInquiry from '@/components/modals/EmailInquiry.vue';

import { ref, reactive, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { usePagination } from 'vue-request';
import { deepCopy } from '@/assets/js/global';

import { PartnerInquiryList, PartnerInquiryDetail } from '@/store/api';

const store = useStore();
const signInfo = computed(() => store.state['sign'].signInfo);
const pageSizeOptions = computed(() => store.state['common'].pageSize);
const inquiriesCategories = computed(() => store.state['common'].inquiriesCategories);
const categories = ref([]);
const errCode = computed(() => store.state['common'].errCode);
const categoryValue = ref();
const inquiryDetails = ref({});
const isDeviceMobile = computed(() => store.state['common'].isDeviceMobile);
const isMobile = ref(isDeviceMobile.value);

const checkAll = ref({ value: '', label: 'search.label.all', checked: true });
const stateCheckOptions = ref([
  { value: '1,2,3', label: 'search.label.ongoing', checked: true },
  { value: '4', label: 'search.label.completed', checked: true },
]);
const searchType = ref([
  { value: 1, label: 'search.select.subject' },
  { value: 2, label: 'search.select.email' },
]);
const searchValue = ref({
  req_BeforeDate: '',
  req_AfterDate: '',
  proc_BeforeDate: '',
  proc_AfterDate: '',
  category: '0',
  state: '1,2,3,4',
  search: '',
  search_Type: { value: searchType.value[0].value },
});
const dataControl = ref({
  req_BeforeDate: '',
  req_AfterDate: '',
  proc_BeforeDate: '',
  proc_AfterDate: '',
  category: '0',
  state: '1,2,3,4',
  search: '',
  search_Type: { value: searchType.value[0].value },
});

const changeCategory = (item) => {
  categoryValue.value = { value: item.value };
  searchValue.value.category = item.value;
};

const totalCount = ref(0);
const selectedPageSize = ref(pageSizeOptions.value[0]);

const pagination = computed(() => ({
  total: totalCount.value,
  current: current.value,
  pageSize: pageSize.value,
}));

const columns = ref([
  {
    title: 'datatable.thead.request_date',
    dataIndex: 'requestDate',
    sorter: true,
  },
  {
    title: 'datatable.thead.email',
    dataIndex: 'receiveEmail',
    sorter: true,
  },
  {
    title: 'datatable.thead.category',
    dataIndex: 'category',
    sorter: true,
  },
  {
    title: 'datatable.thead.subject',
    dataIndex: 'title',
    sorter: true,
  },
  {
    title: 'datatable.thead.state',
    dataIndex: 'state',
    sorter: true,
  },
  {
    title: 'datatable.thead.processing_date',
    dataIndex: 'processingDate',
    sorter: true,
  },
]);

const queryData = async (params) => {
  try {
    const response = await PartnerInquiryList({
      user_Sn: signInfo.value.sn,
      currentPage: params.page,
      currentPageSize: params.results,
      req_BeforeDate: dataControl.value.req_BeforeDate,
      req_AfterDate: dataControl.value.req_AfterDate,
      proc_BeforeDate: dataControl.value.proc_BeforeDate,
      proc_AfterDate: dataControl.value.proc_AfterDate,
      category: String(dataControl.value.category),
      state: dataControl.value.state,
      search: dataControl.value.search,
      search_Type: String(dataControl.value.search_Type.value),
      order: params.sortOrder === undefined ? '' : params.sortField,
      sort:
        params.sortOrder !== undefined && params.sortOrder === 'ascend'
          ? 'asc'
          : params.sortOrder !== undefined && params.sortOrder === 'descend'
          ? 'desc'
          : '',
    });

    if (errCode.value === 0) {
      const count = response.data.returnData.totalCount;
      totalCount.value = count === null ? totalCount.value : count.count;
      return response.data.returnData.boardPartnerInquiries;
    }
  } catch (error) {
    console.error(error);
  }
};

const {
  data: dataSource,
  run,
  loading,
  current,
  pageSize,
} = usePagination(queryData, {
  formatResult: (res) => res,
  pagination: {
    currentKey: 'page',
    pageSizeKey: 'results',
  },
});

const handleTableChange = (pag, filters, sorter) => {
  totalCount.value = pag.total;
  run({
    results: pag.pageSize ? pag.pageSize : pag.results,
    page: pag.current ? pag.current : pag.page,
    sortField: sorter.field,
    sortOrder: sorter.order,
  });
};

const handleResizeColumn = (w, col) => {
  col.width = w;
};

const stateChange = (item) => {
  if (item.value === '') {
    if (item.checked) {
      stateCheckOptions.value.forEach((each) => {
        each.checked = true;
      });
    } else {
      stateCheckOptions.value.forEach((each) => {
        each.checked = false;
      });
    }
    searchValue.value.state = '1,2,3,4';
  } else {
    if (checkAll.value.checked === true && item.checked === false) {
      checkAll.value.checked = false;
    }
    const items = stateCheckOptions.value.filter((each) => each.checked === true);
    checkAll.value.checked = items.length === stateCheckOptions.value.length ? true : false;

    searchValue.value.state = '';
    items.forEach((checkedEach) => {
      searchValue.value.state = searchValue.value.state + checkedEach.value;
    });

    let tempStr = '';
    items.filter((each) => each.checked === true).filter((each) => (tempStr = tempStr + each.value));
    tempStr = tempStr.split(',').join('').split('').join(',');
    searchValue.value.state = tempStr;

    if (searchValue.value.state.length === 0) {
      searchValue.value.state = '1,2,3,4';
    }
  }
};

const changeDate = (day) => {
  searchValue.value.req_BeforeDate = day[0];
  searchValue.value.req_AfterDate = day[1];
};

const changeDate2 = (day) => {
  searchValue.value.proc_BeforeDate = day[0];
  searchValue.value.proc_AfterDate = day[1];
};

const onSearch = () => {
  const resetSearchType = {
    value: searchValue.value.search_Type.value,
  };
  searchValue.value.search_Type = resetSearchType;
  dataControl.value = deepCopy(searchValue.value);

  handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
};

const selectPageSize = (e) => {
  selectedPageSize.value = e;
  handleTableChange({ page: 1, results: e.value }, {}, {});
};

const visibleForm = ref(false);
const openInquiryForm = () => {
  visibleForm.value = true;
};

const closeInquiryForm = () => {
  visibleForm.value = false;
  handleTableChange({ page: current.value, results: selectedPageSize.value.value }, {}, {});
};

const formState = reactive({
  id: '',
  email: '',
  category: { value: 0 },
  subject: '',
  message: '',
});

const visibleDetail = ref(false);

const openInquiryDetails = async (record) => {
  try {
    const response = await PartnerInquiryDetail({ id: record.id });
    inquiryDetails.value = response.data.returnData;
    visibleDetail.value = true;
  } catch (error) {
    console.error(error);
  }
};

const closeInquiryDetail = () => {
  visibleDetail.value = false;
  handleTableChange({ page: current.value, results: selectedPageSize.value.value }, {}, {});
};

onMounted(async () => {
  if (errCode.value !== 2) {
    await store.dispatch('common/inquiriesCategories');
  }

  const state = [
    {
      value: 1,
      key: 'search.select.become_partner',
    },
    {
      value: 2,
      key: 'common.button.payment',
    },
    {
      value: 3,
      key: 'common.button.withdrawal',
    },
    {
      value: 4,
      key: 'common.button.settlement',
    },
    {
      value: 5,
      key: 'search.select.withdrawal_partners',
    },
    {
      value: 6,
      key: 'search.select.etc',
    },
  ];

  categories.value = inquiriesCategories.value[1].middleCategory;

  categories.value.map((e) => {
    e.text = state.filter((el) => el.value === e.value)[0].key;
  });
  categoryValue.value = { value: categories.value[0].value };
});
</script>

<template>
  <div class="content-header">
    <a-button type="primary" @click="openModal(null)"><fa-icon icon="pencil" />{{ $t('common.button.new') }}</a-button>
  </div>

  <FilterContainer
    class="mb-10 filter-container advanced-search-width-40"
    :data="filterData"
    :button="buttonData"
    @getData="getFilterData"
  />
  <a-table
    :class="['datatable', { 'is-mobile': isMobile }]"
    :columns="columns"
    :data-source="dataSource"
    :pagination="pagination"
    :showSorterTooltip="false"
    :scroll="{ x: true }"
    :loading="loading"
    :rowKey="(index) => index"
    @change="handleTableChange"
    @resizeColumn="handleResizeColumn"
  >
    <template #title>
      <h4 class="title">
        <span class="text">{{ $t('datatable.title.notice') }}</span>
        <span class="total">{{ $t('common.text.total') }} {{ totalCount }}</span>
      </h4>
      <div class="control-box">
        <a-radio-group v-model:value="isMobile" button-style="solid" class="mr-5">
          <a-radio-button :value="true"><fa-icon icon="fa-solid fa-list" /></a-radio-button>
          <a-radio-button :value="false"><fa-icon icon="fa-solid fa-table" /></a-radio-button>
        </a-radio-group>
        <a-select v-model:value="selectedPageSize" label-in-value :options="pageSizeOptions" @change="selectPageSize" />
      </div>
    </template>
    <template #headerCell="{ title }"> {{ $t(title) }}</template>
    <template #bodyCell="{ column, record, text }">
      <template v-if="isMobile">
        {{ $t(column.title) }} :
        <a-typography-link @click="openModal(record)" v-if="column.dataIndex === 'title'" class="subject">
          {{ text }}
        </a-typography-link>
        <span
          v-if="
            column.dataIndex !== 'title' &&
            column.dataIndex !== 'state' &&
            column.dataIndex !== 'third_Code' &&
            column.dataIndex !== 'second_code'
          "
          >{{ text }}</span
        >
      </template>

      <template v-if="column.dataIndex === 'title'">
        <a-typography-link @click="openModal(record)" class="subject">
          {{ record.title }}
        </a-typography-link>
      </template>
      <template v-if="column.dataIndex === 'state'">
        {{
          record.state === 0
            ? $t('search.label.new')
            : record.state === 1
            ? $t('search.label.on')
            : $t('search.label.off')
        }}
        <template v-if="grade === 100 || grade === 95 || grade === 30 || grade === 50">
          <a-button shape="round" size="small" v-if="record.state === 0" @click="post('post', record)">
            {{ $t('common.button.post') }}
          </a-button>
          <a-button
            shape="round"
            size="small"
            v-if="record.state === 1 || record.state === 2"
            @click="post('repost', record)"
            >{{ $t('common.button.repost') }}</a-button
          >
          <a-button shape="round" size="small" v-if="record.state === 1" @click="post('off', record)">
            {{ $t('common.button.post_off') }}
          </a-button>
        </template>
      </template>
      <template v-if="column.dataIndex === 'second_code'">
        {{ $t(categoryList.firstCategories[record.second_code]?.label) }}
      </template>
      <template v-if="column.dataIndex === 'third_Code'">
        <span v-if="record.third_Code === 0"></span>
        <span v-if="record.second_code === 1 && record.third_Code !== 0">
          {{ $t(registerCategoryList.secondCategories[0][record.third_Code - 1]?.label) }}
        </span>
        <span v-if="record.second_code === 2 && record.third_Code !== 0">
          {{
            $t(
              categoryList.secondCategories[2][
                record.third_Code === 4 || record.third_Code === 5 ? record.third_Code - 1 : record.third_Code
              ]?.label,
            )
          }}
        </span>
      </template>
    </template>
  </a-table>
  <RegisterNoticeModal :visible="isShowModal" :content="injectContent" @close="closeModal" />
</template>

<script setup>
import RegisterNoticeModal from '@/components/modals/RegisterNoticeModal.vue';
import FilterContainer from '@/components/filter/FilterContainer.vue';

import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { Modal } from 'ant-design-vue';
import { usePagination } from 'vue-request';
import { useStore } from 'vuex';
import { ref, computed, watch, createVNode, onBeforeMount } from 'vue';
import { useI18n } from 'vue-i18n';
import { NoticeList } from '@/store/api';
import { openNotificationWithIcon, deepCopy } from '@/assets/js/global';
import { apis } from '../../store/api';

const { t } = useI18n();
const store = useStore();
const pageSizeOptions = computed(() => store.state['common'].pageSize);
const noticeTransactionState = computed(() => store.state['common'].noticeTransactionState);
const categoryList = computed(() => store.state['sign'].csNoticeCategoryList.search);
const registerCategoryList = computed(() => store.state['sign'].csNoticeCategoryList.register);
const grade = computed(() => store.state['sign'].signInfo.grade);
const errCode = computed(() => store.state['common'].errCode);
const isDeviceMobile = computed(() => store.state['common'].isDeviceMobile);
const isMobile = ref(isDeviceMobile.value);
const isShowModal = ref(false);
const injectContent = ref(null);

const columns = [
  {
    title: 'datatable.thead.modify_date',
    dataIndex: 'altertime',
    sorter: true,
  },
  {
    title: 'datatable.thead.post_date',
    dataIndex: 'posttime',
    sorter: true,
  },
  {
    title: 'datatable.thead.category_1',
    dataIndex: 'second_code',
    sorter: true,
  },
  {
    title: 'datatable.thead.category_2',
    dataIndex: 'third_Code',
    sorter: true,
  },
  {
    title: 'datatable.thead.subject',
    dataIndex: 'title',
    width: '30%',
    sorter: true,
  },
  {
    title: 'datatable.thead.state',
    dataIndex: 'state',
    className: 'btn-cell',
    sorter: true,
  },
  {
    title: 'datatable.thead.id_name',
    dataIndex: 'user_Id',
    sorter: true,
  },
];
const totalCount = ref(0);
const selectedPageSize = ref(pageSizeOptions.value[0]);
const pagination = computed(() => ({
  total: totalCount.value,
  current: current.value,
  pageSize: pageSize.value,
}));
const dataControl = ref({
  second_Code: 0,
  third_Code: 0,
  requestBeforeDate: '',
  requestAfterDate: '',
  concludeBeforeDate: '',
  concludeAfterDate: '',
  state: '0,1,2',
  searchType: 0,
  search: '',
});

const queryData = async (params) => {
  try {
    const response = await NoticeList({
      second_Code: dataControl.value.second_Code,
      third_Code: dataControl.value.third_Code !== undefined ? dataControl.value.third_Code : 0,
      CurrentPage: params.page,
      CurrentPageSize: params.results,
      ModifyBeforeDT: dataControl.value.requestBeforeDate,
      ModifyAfterDT: dataControl.value.requestAfterDate,
      PostBeforeDT: dataControl.value.concludeBeforeDate,
      PostAfterDT: dataControl.value.concludeAfterDate,
      State: dataControl.value.state.toString(),
      Search_Type: dataControl.value.searchType,
      Search: dataControl.value.search,
      Order: params.sortOrder === undefined ? '' : params.sortField,
      Sort:
        params.sortOrder !== undefined && params.sortOrder === 'ascend'
          ? 'asc'
          : params.sortOrder !== undefined && params.sortOrder === 'descend'
          ? 'desc'
          : '',
    });
    if (errCode.value === 0) {
      const count = response.data.returnData.totalCount;
      totalCount.value = count === null ? totalCount.value : count.count;
      let list = response.data.returnData.list;
      return list;
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

const selectPageSize = (e) => {
  selectedPageSize.value = e;
  handleTableChange({ page: 1, results: e.value }, {}, {});
};

const openModal = async (record) => {
  if (record === null) {
    isShowModal.value = true;
  } else {
    const res = await apis.CSNoticeDetail({
      id: record.id,
    });
    const data = deepCopy(res.data.returnData);
    injectContent.value = data;
    isShowModal.value = true;
  }
};
const closeModal = (e) => {
  if (e === 'refresh') {
    handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
  }
  injectContent.value = null;
  isShowModal.value = false;
};
const post = (type, record) => {
  Modal.confirm({
    title: type === 'off' ? t('confirm.title.notice_withdrawn') : t('confirm.title.notice_posted'),
    icon: createVNode(ExclamationCircleOutlined),
    content: t('confirm.description.want_continue'),
    okText: t('common.button.ok'),
    cancelText: t('common.button.cancel'),
    async onOk() {
      await store.dispatch('common/noticePosting', {
        mainValue: record.second_code,
        Transaction_Type: type === 'off' ? 0 : 1,
        Id: record.id,
      });
    },
  });
};

watch(noticeTransactionState, (val) => {
  if (val.errCode < 0) {
    openNotificationWithIcon('error', t('notification.title.error'), val.errMessage);
  } else {
    openNotificationWithIcon('success', t('notification.title.success'), val.errMessage);
    handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
  }
});

const firstCategory = ref([]);
const secondCategory = ref([]);
const stateOption = ref([
  { value: 0, label: () => t('search.label.new'), checked: false },
  { value: 1, label: () => t('search.label.on'), checked: false },
  { value: 2, label: () => t('search.label.off'), checked: false },
]);
const rangePickerOption = ref([
  {
    value: 1,
    label: () => {
      return t('search.button.today');
    },
  },
  {
    value: 7,
    label: () => {
      return t('search.button.days', { num: 7 });
    },
  },
  {
    value: 30,
    label: () => {
      return t('search.button.days', { num: 30 });
    },
  },
]);
const searchOption = ref([
  { value: 0, label: () => t('search.select.subject'), checked: true },
  { value: 1, label: () => t('search.select.id_name'), checked: false },
]);
const filterData = [
  {
    type: 'rangePicker',
    name: 'modifyDate',
    data: rangePickerOption.value,
    placeHolder: () => t('search.label.modify_date'),
    order: 1,
  },
  {
    type: 'rangePicker',
    name: 'postDate',
    data: rangePickerOption.value,
    placeHolder: () => t('search.label.post_date'),
    order: 2,
  },
  {
    type: 'select',
    name: 'state',
    data: stateOption.value,
    order: 4,
    placeHolder: () => {
      return t('datatable.thead.state');
    },
  },
  {
    type: 'doubleStepSelect',
    name: 'doubleStep',
    order: 3,
    firstData: firstCategory.value,
    secondData: secondCategory.value,
    label: [
      () => {
        return t('search.label.category_1');
      },
      () => {
        return t('search.label.category_2');
      },
    ],
    placeHolder: [
      () => {
        return t('search.label.category_1');
      },
      () => {
        return t('search.label.category_2');
      },
    ],
  },
  {
    type: 'search',
    name: 'search',
    data: searchOption.value,
    search: '',
    order: 6,
    placeHolder: () => {
      return t('search.placeholder.search_text');
    },
  },
];
const buttonData = {
  label: [() => t('common.label.filter_close'), () => t('common.label.filter_open')],
};
const getFilterData = (val) => {
  const temp = deepCopy(val);

  const defaultState = '0,1,2';

  if (temp.doubleStep[0] === null) {
    temp.doubleStep[0] = 0;
  }
  if (temp.doubleStep[1] === null) {
    temp.doubleStep[1] = 0;
  }

  dataControl.value = {
    requestBeforeDate: temp.modifyDate[0],
    requestAfterDate: temp.modifyDate[1],
    concludeBeforeDate: temp.postDate[0],
    concludeAfterDate: temp.postDate[1],
    state: temp.state.length === 0 ? defaultState : temp.state.join(','),
    second_Code: temp.doubleStep[0],
    third_Code: temp.doubleStep[1],
    searchType: temp.search.select.value,
    search: temp.search.search,
  };

  handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
};

onBeforeMount(() => {
  categoryList.value.firstCategories.forEach((e) => {
    firstCategory.value.push({
      value: e.value,
      label: () => t(e.label),
      checked: false,
    });
  });
  categoryList.value.secondCategories.forEach((e, index) => {
    secondCategory.value.push({
      index: index,
      data: [],
    });

    e?.forEach((el) => {
      secondCategory.value[index].data?.push({
        value: el.value,
        label: () => t(el.label),
        checked: false,
      });
    });
  });
});
</script>

<template>
  <FilterContainer
    v-if="!(isTopMenu || isWallet || isPartner)"
    class="mb-10 filter-container"
    :data="filterData"
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
    :rowExpandable="(record) => record.step !== 4"
    @change="handleTableChange"
    @resizeColumn="handleResizeColumn"
  >
    <template #title v-if="!(isTopMenu || isWallet || isPartner)">
      <h4 class="title">
        <span class="text">{{ $t('datatable.title.customer_inquiries_list') }}</span>
        <span class="total">{{ $t('common.text.total') }} {{ totalCount }}</span>
      </h4>
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
        <span
          v-if="
            column.dataIndex !== 'route' &&
            column.dataIndex !== 'category1' &&
            column.dataIndex !== 'category2' &&
            column.dataIndex !== 'state' &&
            column.dataIndex !== 'subject' &&
            column.dataIndex !== 'message'
          "
        >
          {{ text }}
        </span>
      </template>
      <template v-if="column.dataIndex === 'subject'">
        <a-typography-link :style="{ width: '50ch' }" :ellipsis="true" :content="text" @click="showDetail(record)" />
      </template>
      <template v-if="column.dataIndex === 'category1'">
        {{
          record.category1 === 1
            ? $t('search.select.cpass_wallet')
            : record.category1 === 2
            ? $t('search.select.cpass_payment')
            : $t('common.text.tvp')
        }}
      </template>
      <template v-if="column.dataIndex === 'category2'">
        {{ getSecondCategory(record.category1, record.category2) }}
      </template>
      <template v-if="column.dataIndex === 'message'">
        <a-typography-text :style="{ width: '50ch' }" :ellipsis="true" :content="text" />
      </template>
      <template v-if="column.dataIndex === 'state'">
        <a-typography-text>{{
          record.state === 1
            ? $t('datatable.text.request')
            : record.state === 2
            ? $t('datatable.text.to_dev')
            : record.state === 3
            ? $t('datatable.text.to_cs')
            : $t('datatable.text.completed')
        }}</a-typography-text>
        <a-button shape="round" size="small" class="ant-btn-round" @click="confirm(record)" v-if="record.step !== 4">
          <span v-if="record.step === 1 || record.step === 3">{{ $t('common.button.dev') }}</span>
          <span v-if="record.step === 2">{{ $t('common.button.cs') }}</span>
        </a-button>
      </template>
      <template v-if="column.dataIndex === 'processingDate'">
        <span>{{ record.processingDate ? record.processingDate : $t('datatable.text.waiting') }}</span>
      </template>
      <template v-if="column.dataIndex === 'route'">
        {{
          record.route === 1
            ? $t('search.label.web')
            : record.route === 2
            ? $t('datatable.text.app')
            : $t('datatable.text.partner')
        }}
      </template>
    </template>
    <template #expandedRowRender="{ record }">
      <a-table
        :columns="innerColumns"
        :data-source="record.comments"
        :pagination="false"
        size="small"
        class="inner-table"
      >
        <template #headerCell="{ title }"> {{ $t(title) }}</template>
        <template #bodyCell="{ column, record, text }">
          <template v-if="isMobile">
            <template v-if="column.dataIndex === 'message'">
              <span> {{ $t(column.title) }} <span v-if="text !== ''">: </span></span>
            </template>
            <template v-else> {{ $t(column.title) }} : </template>

            <span v-if="column.dataIndex !== 'message'">{{ text }}</span>
          </template>
          <template v-if="column.dataIndex === 'message'">
            <a-input
              v-if="!record.createDate"
              v-model:value="record.message"
              show-count
              :maxlength="500"
              style="margin: 1rem 0"
            />
            <span v-else>{{ record.message }}</span>
          </template>
          <template v-if="column.dataIndex === 'state'">
            <a-button type="primary" shape="round" size="small" v-if="!record.createDate" @click="commentSave(record)">
              {{ $t('common.button.save') }}
            </a-button>
            <a-button
              v-if="record.createDate && record.step !== 4 && record.user_Sn === signInfo.sn"
              shape="round"
              size="small"
              @click="commentDel(record)"
            >
              {{ $t('common.button.del') }}
            </a-button>
          </template>
        </template>
      </a-table>
    </template>
  </a-table>
  <CustomerInquiryModal :show="isShowDetail" :info="infoData" @close="closeDetail" />
</template>
<script setup>
import FilterContainer from '@/components/filter/FilterContainer.vue';
import CustomerInquiryModal from '@/components/modals/CustomerInquiryModal.vue';

import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { usePagination } from 'vue-request';
import { Modal, notification } from 'ant-design-vue';
import { useStore } from 'vuex';
import { ref, computed, createVNode, watch, onBeforeMount } from 'vue';
import { useI18n } from 'vue-i18n';
import { SupportInquiryManagerList } from '@/store/api';
import { deepCopy } from '@/assets/js/global';
import { SupportMessage, SupportStateChange } from '@/store/api';

const { t } = useI18n();
const store = useStore();
const props = defineProps({
  type: String,
  sn: Number,
});
const isTopMenu = computed(() => props.type === 'topMenu');
const isWallet = computed(() => props.type === 'wallet');
const isPartner = computed(() => props.type === 'partner');
const isRefresh = computed(() => store.state['manager'].managerTopMenu.inquiry);
const inquiriesCategories = computed(() => store.state['common'].inquiriesCategories);
const pageSizeOptions = computed(() => store.state['common'].pageSize);
const supportStateValue = computed(() => store.state['common'].supportStateValue);
const signInfo = computed(() => store.state['sign'].signInfo);
const errCode = computed(() => store.state['common'].errCode);
const isDeviceMobile = computed(() => store.state['common'].isDeviceMobile);
const isMobile = ref(isDeviceMobile.value);
let columns = ref([
  {
    title: 'common.label.request_date',
    dataIndex: 'lastestRequestDate',
    sorter: true,
  },
  {
    title: 'datatable.thead.processed_date',
    dataIndex: 'processingDate',
    sorter: true,
    hidden: true,
  },
  {
    title: 'datatable.thead.route',
    dataIndex: 'route',
    sorter: true,
  },
  {
    title: 'datatable.thead.category_1',
    dataIndex: 'category1',
    sorter: true,
  },
  {
    title: 'datatable.thead.category_2',
    dataIndex: 'category2',
    sorter: true,
  },
  {
    title: 'datatable.thead.id_name',
    dataIndex: 'inquirer',
    sorter: true,
  },
  {
    title: 'datatable.thead.email',
    dataIndex: 'email',
    sorter: true,
  },
  {
    title: 'datatable.thead.subject',
    dataIndex: 'subject',
    width: '15%',
  },
  {
    title: 'common.text.content',
    dataIndex: 'message',
  },
  {
    title: 'datatable.thead.state',
    dataIndex: 'state',
    className: 'btn-cell ',
    sorter: true,
  },
]);
const innerColumns = [
  {
    title: 'datatable.thead.destination',
    dataIndex: 'destination',
    width: '15rem',
  },
  {
    title: 'datatable.thead.message',
    dataIndex: 'message',
    key: 'message',
  },
  {
    title: 'datatable.thead.created_date',
    dataIndex: 'createDate',
    width: '15rem',
  },
  {
    title: 'datatable.thead.save_del',
    dataIndex: 'state',
    width: '15rem',
  },
];
const isShowDetail = ref(false);
const infoData = ref({});
const destinationType = ref('');
const mainCategory = ref();
const totalCount = ref(0);
const selectedPageSize = ref(pageSizeOptions.value[0]);
const pagination = computed(() => ({
  total: totalCount.value,
  current: current.value,
  pageSize: pageSize.value,
  size: isTopMenu.value || isWallet.value || isPartner.value ? 'small' : '',
}));
const defaultState = [1, 2, 3, 4];
const defaultRoute = [1, 2, 3];
const dataControl = ref({
  requestBeforeDate: '',
  requestAfterDate: '',
  concludeBeforeDate: '',
  concludeAfterDate: '',
  state: defaultState,
  route: defaultRoute,
  mainCategory: 0,
  middleCategory: 0,
  search: '',
});

const queryData = async (params) => {
  try {
    if (errCode.value !== -2) {
      const response = await SupportInquiryManagerList({
        userSn: isWallet.value || isPartner.value ? props.sn : 0,
        currentPage: params.page,
        currentPageSize: params.results,
        RequestStartDate: dataControl.value.requestBeforeDate,
        RequestEndDate: dataControl.value.requestAfterDate,
        ProcessStartDate: dataControl.value.concludeBeforeDate,
        ProcessEndDate: dataControl.value.concludeAfterDate,
        category1: dataControl.value.mainCategory,
        category2: dataControl.value.middleCategory,
        state: isTopMenu.value || isWallet.value ? [1] : dataControl.value.state,
        route: dataControl.value.route,
        search: dataControl.value.search,
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
        let list = response.data.returnData.list;
        list.forEach((e) => {
          if (e.step !== 4) {
            e.comments.push({
              boardId: e.id,
              destination: destinationType.value,
              message: '',
              created_date: '',
            });
          }
        });

        return list;
      }
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

const showDetail = (record) => {
  isShowDetail.value = true;
  infoData.value = record;
};

const closeDetail = (val) => {
  isShowDetail.value = val;
};
const topMenuRefresh = async () => {
  await store.dispatch('manager/setTopMenuRefresh');
};
const commentSave = async (record) => {
  const response = await SupportMessage({
    Board_Id: record.boardId,
    Comment: record.message,
    Type: 1,
  });
  const responseData = response.data;

  onResponse(responseData);
  topMenuRefresh();
};

const commentDel = async (record) => {
  const response = await SupportMessage({
    Idx: record.idx,
    Board_Id: record.board_Id,
    Comment: record.message,
    Type: 3,
  });

  const responseData = response.data;

  onResponse(responseData);
  topMenuRefresh();
};

const confirm = (record) => {
  let state = record.step === 2 ? 3 : record.step === 3 ? 2 : 1;

  Modal.confirm({
    title: t('confirm.title.confirm'),
    icon: createVNode(ExclamationCircleOutlined),
    content: () => {
      return record.state === 'Request'
        ? t('confirm.description.dev_send_mail')
        : t('confirm.description.change_status', {
            status: `${record.step === 3 ? t('common.text.dev') : t('common.text.cs')}`,
          });
    },
    okText: t('common.button.ok'),
    cancelText: t('common.button.cancel'),
    async onOk() {
      const response = await SupportStateChange({
        id: record.id,
        state: state,
        receiveEmail: record.email,
        title: record.subject,
        contents: record.message,
        addtime: record.requestDate,
      });

      const responseData = response.data;

      onResponse(responseData);
      topMenuRefresh();
    },
  });
};

const openNotificationWithIcon = (type, value) => {
  notification[type]({
    message: value.title,
    description: value.description,
  });
};
const firstCategory = ref([]);
const secondCategory = ref([]);
const stateOption = ref([
  { value: 1, label: () => t('search.label.request'), checked: false },
  { value: 2, label: () => t('search.label.dev'), checked: false },
  { value: 3, label: () => t('search.label.cs'), checked: false },
  { value: 4, label: () => t('search.label.completed'), checked: false },
]);
const routeOption = ref([
  { value: 1, label: () => t('search.label.web'), checked: false },
  { value: 2, label: () => t('search.label.app'), checked: false },
  { value: 3, label: () => t('search.label.partners'), checked: false },
]);
const filterData = [
  {
    type: 'rangePicker',
    name: 'requestDate',
    placeHolder: () => t('search.label.request_date'),
    order: 1,
  },
  {
    type: 'rangePicker',
    name: 'processingDate',
    placeHolder: () => t('search.label.processing_date'),
    order: 2,
  },
  {
    type: 'select',
    name: 'route',
    data: routeOption.value,
    order: 5,
    placeHolder: () => {
      return t('search.label.route');
    },
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
    type: 'totalSearch',
    name: 'search',
    search: '',
    order: 6,
    placeHolder: () => {
      return t('search.placeholder.customer_inquiry');
    },
    label: () => {
      return t('common.label.text');
    },
  },
];

const getFilterData = (val) => {
  const temp = deepCopy(val);

  if (temp.doubleStep[0] === null) {
    temp.doubleStep[0] = 0;
  }
  if (temp.doubleStep[1] === null) {
    temp.doubleStep[1] = 0;
  }

  dataControl.value = {
    requestBeforeDate: temp.requestDate[0],
    requestAfterDate: temp.requestDate[1],
    concludeBeforeDate: temp.processingDate[0],
    concludeAfterDate: temp.processingDate[1],
    state: temp.state.length === 0 ? defaultState : temp.state,
    route: temp.route.length === 0 ? defaultRoute : temp.route,
    mainCategory: temp.doubleStep[0],
    middleCategory: temp.doubleStep[1],
    search: temp.search,
  };

  handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
};
const getSecondCategory = (c1, c2) => {
  const result = secondCategory.value.filter((e) => e.index === c1)[0]?.data;
  if (result === undefined) {
    return null;
  } else {
    return result.filter((el) => el.value === c2)[0]?.label();
  }
};

const onResponse = async (responseData) => {
  const errCode = responseData.errCode;
  const errMessage = responseData.errMessage;
  const returnData = responseData.returnData;

  if (errCode < 0) {
    openNotificationWithIcon('error', { title: t('notification.title.error'), description: errMessage });
  } else {
    openNotificationWithIcon('success', { title: t('notification.title.success'), description: returnData });
    handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
  }
};

watch(isRefresh, (val) => {
  if (val) {
    handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
  }
});
const setDestinationType = () => {
  if (
    signInfo.value.grade === 25 ||
    signInfo.value.grade === 30 ||
    signInfo.value.grade === 50 ||
    signInfo.value.grade === 60
  ) {
    destinationType.value = 'To Dev';
  } else if (signInfo.value.grade === 100 || signInfo.value.grade === 95) {
    destinationType.value = 'To CS';
  } else {
    destinationType.value = '';
  }
};

onBeforeMount(async () => {
  setDestinationType();

  await store.dispatch('common/inquiriesCategories');

  mainCategory.value = { value: inquiriesCategories.value[0].value };

  inquiriesCategories.value.forEach((e) => {
    e.label = e.text;

    firstCategory.value.push({
      value: e.value,
      label: () => {
        return t(e.label);
      },
      checked: false,
    });
    secondCategory.value.push({
      index: e.value,
      data: e.middleCategory,
    });
  });
  secondCategory.value.forEach((e) => {
    e?.data.forEach((el) => {
      el.label = () => t(el.text);
    });
  });

  if (isTopMenu.value || isWallet.value) {
    columns.value = columns.value.filter((e) => !e.hidden);
  }
});
</script>

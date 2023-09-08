<template>
  <FilterContainer v-if="!isTopMenu" class="mb-gap filter-container" :data="filterData" @getData="getFilterData" />

  <div class="tabs" v-if="!isTopMenu">
    <a-button
      v-for="(item, index) in tabList"
      :key="index"
      :class="{ active: currentTab === index }"
      @click="changeTabEvent(item, index)"
    >
      <span class="name">{{ $t(item.label) }}</span>
      <a-badge :count="item.value" v-if="index < 2" />
    </a-button>
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
    <template #title v-if="!isTopMenu">
      <h4 class="title">
        <span class="text">{{ $t('datatable.title.kyc_list') }}</span>
        <span class="total">{{ $t('common.text.total') }} {{ tabList[tabIndex].value }}</span>
      </h4>
      <div v-if="!isTopMenu" class="control-box">
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
        <span v-if="column.dataIndex !== 'state' && column.dataIndex !== 'type'">{{ text }}</span>
      </template>
      <template v-if="column.dataIndex === 'state'">
        <a-typography-link @click="showDrawer(record)" class="subject">
          {{
            record.state === -2
              ? $t('datatable.text.final_refusal')
              : record.state === -1
              ? $t('datatable.text.1st_refusal')
              : record.state === 0
              ? $t('datatable.text.request')
              : record.state === 1
              ? $t('datatable.text.1st_approval')
              : $t('datatable.text.final_approval')
          }}
        </a-typography-link>
      </template>
      <!-- <template v-if="column.dataIndex === 'type'">
        $t('datatable.text.id_card') : $t('datatable.text.selfie') 
      </template> -->
    </template>
  </a-table>
  <DetailKYC :show="drawerIsActive" :info="drawerSendData" @close="onCloseDrawer" />
</template>

<script setup>
import DetailKYC from '@/components/drawers/DetailKYC.vue';
import FilterContainer from '@/components/filter/FilterContainer.vue';

import { useStore } from 'vuex';
import { apis } from '@/store/api';
import { useI18n } from 'vue-i18n';
import { Enum } from '@/assets/js/enum.js';
import { ref, computed, watch } from 'vue';
import { usePagination } from 'vue-request';
import { notification } from 'ant-design-vue';
import { deepCopy, auth, admin, manager } from '@/assets/js/global';

const { t } = useI18n();
const store = useStore();
const props = defineProps({
  type: {
    type: String,
  },
});
const isTopMenu = computed(() => props.type === 'topMenu');
const pageSizeOptions = computed(() => store.state['common'].pageSize);
const withdrawStateMsg = computed(() => store.state['partner'].withdrawStateMsg);
const isDeviceMobile = computed(() => store.state['common'].isDeviceMobile);
const isRefresh = computed(() => store.state['manager'].managerTopMenu.kyc);
const isMobile = ref(isDeviceMobile.value);
const tabList = ref([
  { label: 'kyc.tab_title.waiting_1', value: 0, key: 'waiting_1' },
  { label: 'kyc.tab_title.waiting_2', value: 0, key: 'waiting_2' },
  { label: 'kyc.tab_title.approval', value: 0, key: 'approval' },
  { label: 'kyc.tab_title.refusal', value: 0, key: 'refusal' },
]);
const grade = computed(() => store.state['sign'].signInfo.grade);
const currentTab = ref(0);
const tabIndex = ref(0);
const dataControl = ref({
  requestBeforeDate: '',
  requestAfterDate: '',
  concludeBeforeDate: '',
  concludeAfterDate: '',
  search: '',
});
const totalCount = ref(0);
const selectedPageSize = ref(pageSizeOptions.value[0]);
const pagination = computed(() => ({
  total: totalCount.value,
  current: current.value,
  pageSize: pageSize.value,
  size: isTopMenu.value ? 'small' : '',
}));
const columns = [
  {
    title: 'datatable.thead.request_date',
    dataIndex: 'requestDate',
  },
  {
    title: 'datatable.thead.id',
    dataIndex: 'id',
  },
  // {
  //   title: 'datatable.thead.type',
  //   dataIndex: 'type',
  // },
  {
    title: 'datatable.thead.state',
    dataIndex: 'state',
  },
  {
    title: 'datatable.thead.processing_date',
    dataIndex: 'processingDate',
  },
  {
    title: 'datatable.thead.id_name',
    dataIndex: 'idOrName',
  },
];
const drawerIsActive = ref(false);
const drawerSendData = ref({});

const gradeDecision = () => {
  const waiting1stPossible =
    grade.value !== auth.Supervisor && (admin.includes(grade.value) || manager.includes(grade.value));
  const waiting2ndPossible = admin.includes(grade.value);

  if (waiting1stPossible) {
    return true;
  } else if (waiting2ndPossible) {
    return false;
  }
};
const onCloseDrawer = async () => {
  drawerIsActive.value = false;
  handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
};

const changeTabEvent = (item, index) => {
  selectedPageSize.value = pageSizeOptions.value[0];
  currentTab.value = index;
  tabIndex.value = index;
  handleTableChange({ page: 1, results: 10 }, {}, {});
};

const showDrawer = (record) => {
  drawerIsActive.value = true;
  drawerSendData.value = { id: record.id };
};

const queryData = async (params) => {
  const gradeResult = gradeDecision();

  if (isTopMenu.value) {
    if (gradeResult) {
      tabIndex.value = Enum.kycTabType.Waiting1stList;
    } else if (!gradeResult) {
      tabIndex.value = Enum.kycTabType.Waiting2ndList;
    }
  }

  const response = await apis.KycRequestList({
    userSn: 0,
    tabMenuValue: tabIndex.value,
    currentPage: params.page,
    currentPageSize: params.results,
    req_BeforeDate: dataControl.value.requestBeforeDate,
    req_AfterDate: dataControl.value.requestAfterDate,
    proc_BeforeDate: dataControl.value.concludeBeforeDate,
    proc_AfterDate: dataControl.value.concludeAfterDate,
    search: dataControl.value.search,
  });

  const getData = response.data;
  if (getData.errCode === 0) {
    tabList.value.forEach((e) => {
      if (e.key === 'waiting_1') {
        e.value = getData.returnData.waiting1stListCount.count;
      }
      if (e.key === 'waiting_2') {
        e.value = getData.returnData.waiting2ndListCount.count;
      }
      if (e.key === 'approval') {
        e.value = getData.returnData.approvalListCount.count;
      }
      if (e.key === 'refusal') {
        e.value = getData.returnData.refusalListCount.count;
      }
    });
    totalCount.value = tabList.value[tabIndex.value].value;

    return getData.returnData.list;
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

const openNotification = (val) => {
  if (val.errCode === 0) {
    notification['success']({
      message: t('notification.title.success'),
      description: val.returnData,
    });
  } else {
    notification['error']({
      message: t('notification.title.error'),
      description: val.errMessage,
    });
  }
};

const filterData = [
  {
    type: 'rangePicker',
    name: 'requestDate',
    placeHolder: () => t('search.label.request_date'),
    order: 1,
  },
  {
    type: 'rangePicker',
    name: 'concludeDate',
    placeHolder: () => t('search.label.processing_date'),
    order: 2,
  },
  {
    type: 'totalSearch',
    name: 'search',
    order: 3,
    search: '',
    placeHolder: () => {
      return t('search.placeholder.kyc');
    },
    label: () => {
      return t('common.label.text');
    },
  },
];

const getFilterData = (val) => {
  const temp = deepCopy(val);

  dataControl.value = {
    requestBeforeDate: temp.requestDate[0],
    requestAfterDate: temp.requestDate[1],
    concludeBeforeDate: temp.concludeDate[0],
    concludeAfterDate: temp.concludeDate[1],
    search: temp.search,
  };

  handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
};

watch(withdrawStateMsg, (val) => {
  openNotification(val);
  if (val.errCode === 0) {
    handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
  }
});
watch(isRefresh, (val) => {
  if (val) {
    handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
  }
});
</script>

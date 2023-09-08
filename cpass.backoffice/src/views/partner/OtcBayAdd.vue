<template>
  <a-card class="otc-bay-search mb-gap-lg">
    <a-row>
      <a-col :xs="24" :md="4" :xl="3">
        <a-typography-text strong>{{ $t('otc_bay.label.otc_bay_nickname') }}</a-typography-text>
      </a-col>
      <a-col :xs="24" :md="20" :xl="21">
        <a-input-group compact>
          <a-input-search
            v-model:value="nickname"
            :placeholder="$t('otc_bay.placeholder.enter_nickname')"
            @search="onNicknameConfirm"
          >
            <template #enterButton>
              <a-button type="primary" ghost @click="onNicknameConfirm" :loading="isLoadingConfirm">{{
                $t('common.button.confirm')
              }}</a-button>
            </template>
          </a-input-search>
        </a-input-group>
      </a-col>
    </a-row>

    <a-divider v-if="noData || chatList !== null">{{ $t('datatable.title.list') }}</a-divider>
    <a-empty v-if="noData" :description="null" />
    <template v-if="chatList !== null">
      <a-row :gutter="5">
        <a-col :xs="12" :md="10" v-for="item in chatList" :key="item.tradeType" class="chat-col">
          <a-button block @click="onChecking(item)" :class="{ checked: item.checked }">
            <span>
              <a-tag color="red" v-if="item.tradeType === 0">{{ $t('datatable.text.sell') }}</a-tag>
              <a-tag color="green" v-if="item.tradeType === 1">{{ $t('datatable.text.buy') }}</a-tag>
              <a-typography-text strong> {{ item.userId }}</a-typography-text>
            </span>
            <fa-icon icon="fa-check" color="#1890ff" v-if="item.checked" />
          </a-button>
        </a-col>
        <a-col :xs="24" :md="4">
          <a-button type="primary" :loading="isLoadingSave" :disabled="isSaveDisabled" @click="onNicknameSave" block>
            {{ $t('common.button.save') }}
          </a-button>
        </a-col>
      </a-row>
    </template>
  </a-card>

  <a-table
    :class="['datatable', { 'is-mobile': isMobile }]"
    :columns="columns"
    :data-source="dataSource"
    :pagination="pagination"
    :showSorterTooltip="false"
    :scroll="{ x: true }"
    :row-key="(index) => index"
    :loading="loading"
    @change="handleTableChange"
    @resizeColumn="handleResizeColumn"
  >
    <template #title>
      <h4 class="title">
        <span class="text">{{ $t('datatable.title.list') }}</span>
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
        {{ $t(column.title) }} : <span v-if="column.dataIndex === 'userId'">{{ text }}</span></template
      >
      <template v-if="column.dataIndex === 'tradeType'">
        {{ record.tradeType === 0 ? $t('datatable.text.sell') : $t('datatable.text.buy') }}
      </template>
      <template v-if="column.dataIndex === 'isPosted'">
        {{ record.isPosted === true ? $t('datatable.text.ing') : $t('datatable.text.stop') }}
      </template>
      <template v-if="column.dataIndex === 'delete'">
        <a-button type="primary" danger shape="round" size="small" @click="onNicknameDelete(record)">{{
          $t('common.button.delete')
        }}</a-button>
      </template>
    </template>
  </a-table>
</template>

<script setup>
import { apis } from '@/store/api';
import { useStore } from 'vuex';
import { usePagination } from 'vue-request';
import { ref, computed, watch } from 'vue';

const store = useStore();

const pageSizeOptions = computed(() => store.state['common'].pageSize);
const errCode = computed(() => store.state['common'].errCode);
const isDeviceMobile = computed(() => store.state['common'].isDeviceMobile);
const otcBayNicknameData = computed(() => store.state['partner'].otcBayNicknameData);
const otcBayUpdate = computed(() => store.state['partner'].otcBayUpdate);

const pagination = computed(() => ({
  total: totalCount.value,
  current: current.value,
  pageSize: pageSize.value,
}));

const isMobile = ref(isDeviceMobile.value);
const totalCount = ref(0);
const selectedPageSize = ref(pageSizeOptions.value[0]);
const nickname = ref('');
const isSaveData = ref(null);
const isLoadingConfirm = ref(false);
const isLoadingSave = ref(false);
const isSaveDisabled = ref(true);
const chatList = ref(null);
const noData = ref(false);
const isChecking = ref([]);

const columns = [
  {
    title: 'datatable.thead.nickname',
    dataIndex: 'userId',
    // sorter: true,
  },
  {
    title: 'datatable.thead.sortation',
    dataIndex: 'tradeType',
    // sorter: true,
  },
  {
    title: 'datatable.thead.posting_status',
    dataIndex: 'isPosted',
    // sorter: true,
  },
  {
    title: 'datatable.thead.delete',
    dataIndex: 'delete',
    // sorter: true,
  },
];

const queryData = async (params) => {
  try {
    let data = {
      skip: 0,
      take: 100,
      coinCodes: [],
      types: [],
      search: '',
      alpha2Code: 'VN',
      alpha2Codes: [],
      days: null,
    };
    const response = await apis.SystemBoard(data);
    if (errCode.value === 0) {
      const count = response.data.returnData.totalCount;
      totalCount.value = count === null ? totalCount.value : count.count;

      return response.data.returnData.boards;
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

const onNicknameConfirm = () => {
  isLoadingConfirm.value = true;
  store.dispatch('partner/PartnerSystemProfileSearch', {
    userId: nickname.value,
  });
};

const onChecking = (item) => {
  item.checked = !item.checked;
  if (item.checked) {
    isChecking.value.push(item);
  } else {
    isChecking.value = isChecking.value.filter((e) => e.tradeType !== item.tradeType);
  }

  isSaveDisabled.value = isChecking.value.length > 0 ? false : true;
};

const onNicknameSave = () => {
  isLoadingSave.value = true;
  isSaveData.value = {
    profileId: isChecking.value[0].profileId,
    type: isChecking.value.length > 1 ? null : isChecking.value[0].tradeType,
  };

  store.dispatch('partner/PartnerSystemProfileAdd', isSaveData.value);
};

const onNicknameDelete = (val) => {
  store.dispatch('partner/PartnerSystemProfileRemove', {
    profileId: val.profileId,
    type: val.tradeType,
  });
};

watch(otcBayNicknameData, (data) => {
  if (data.length > 0) {
    let items = [];
    data.forEach((el) => {
      const item = {
        profileId: el.profileId,
        tradeType: el.tradeType,
        userId: el.userId,
        checked: false,
      };
      items.push(item);
    });
    chatList.value = items;
  } else {
    noData.value = true;
  }
  isLoadingConfirm.value = false;
});

watch(nickname, (newText, fromText) => {
  if (fromText !== newText) {
    chatList.value = null;
    isSaveDisabled.value = true;
    noData.value = false;
  }
});

watch(otcBayUpdate, (val) => {
  if (val) {
    nickname.value = '';
    isLoadingSave.value = false;
    chatList.value = null;
    isChecking.value = [];
    handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
  }
  setTimeout(() => {
    store.state['partner'].otcBayUpdate = false;
  }, 200);
});
</script>

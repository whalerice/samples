<template>
  <a-table
    class="datatable mt-40"
    :columns="columns"
    :data-source="dataSource"
    :pagination="pagination"
    :loading="loading"
    :showSorterTooltip="false"
    @change="handleTableChange"
  >
    <template #title>
      <h4 class="title">
        <span class="text">{{ $t('datatable.title.history') }}</span>
      </h4>
      <a-select
        v-model:value="selectedPageSize"
        label-in-value
        :options="pageSizeOptions"
        @change="selectPageSize"
      ></a-select>
    </template>
    <template #headerCell="{ title }"> {{ $t(title) }}</template>
    <template #bodyCell="{ column, record, text }">
      <template v-if="column.dataIndex === 'type'">
        {{ record.type === 'ID' ? $t('datatable.text.id_card') : $t('datatable.text.selfie') }}
      </template>
      <template v-if="column.dataIndex === 'view' && record.type === 'ID'">
        <vue3-image-view
          :controllerBtnText="$t('common.button.view')"
          :imageWrap="record.imageUrls"
          v-if="dataChanged"
        />
      </template>

      <template v-if="column.dataIndex === 'view' && record.type === 'Selfie'">
        <vue3-image-view
          :controllerBtnText="$t('common.button.view')"
          :imageWrap="record.imageUrls"
          v-if="dataChanged"
        />
      </template>

      <template v-if="column.dataIndex === 'memo'">
        <a-typography-link
          v-if="text !== null && text !== ''"
          :style="{ width: '10ch' }"
          :ellipsis="true"
          :content="text"
          @click="openMemo(record)"
        />
        <a-typography-link
          v-else
          :style="{ width: '10ch' }"
          :ellipsis="true"
          :content="$t('common.label.note_taking')"
          @click="openMemo(record)"
        />
      </template>
      <template v-if="column.dataIndex === 'transfer_Memo'">
        <a-typography-link
          v-if="
            record.stateValue === Enum.kycApprovalType.finalRefusal ||
            record.stateValue === Enum.kycApprovalType.finalApproval
          "
          :style="{ width: '10ch' }"
          :ellipsis="true"
          :content="text"
          @click="openTransferMemo(record)"
        />
      </template>

      <template v-if="column.dataIndex === 'state'">
        <span>
          {{ getKycApprovalType(t, record.stateValue).label() }}
          <template
            v-if="
              record.isBtnVisible && (grade === 100 || grade === 95 || grade === 50 || grade === 30 || grade === 25)
            "
          >
            <a-button
              shape="round"
              size="small"
              @click="stateChange(1, record.type === 'ID' ? 1 : 2, record.memo, record.transfer_Memo, record)"
              v-if="
                (record.stateValue === 0 && grade !== 30) ||
                (record.stateValue === 1 && (grade === 30 || grade === 95 || grade === 100))
              "
            >
              {{ $t('common.button.approval') }}
            </a-button>
            <a-button
              shape="round"
              size="small"
              @click="stateChange(-1, record.type === 'ID' ? 1 : 2, record.memo, record.transfer_Memo, record)"
              v-if="
                (record.stateValue === 0 && grade !== 30) ||
                (record.stateValue === -1 && (grade === 30 || grade === 95 || grade === 100))
              "
            >
              {{ $t('common.button.refusal') }}
            </a-button>
            <a-button
              shape="round"
              size="small"
              @click="stateChange(0, record.type === 'ID' ? 1 : 2, record.memo, record.transfer_Memo, record)"
              v-if="
                (grade === 30 || grade === 95 || grade === 100) && (record.stateValue === 1 || record.stateValue === -1)
              "
            >
              {{ $t('common.button.reconsider') }}
            </a-button>
          </template>
        </span>
      </template>
      <template v-if="column.dataIndex === 'processing_Date'">
        <span>{{ record.processingDate }}</span>
      </template>
      <template v-if="column.dataIndex === 'id/name'">
        <span>{{ record.idOrName }}</span>
      </template>
    </template>
  </a-table>

  <a-modal
    v-model:visible="memoModalVisible"
    :title="$t('datatable.thead.memo_confirmation')"
    @ok="modifyMemo"
    @cancel="closeMemo"
  >
    <a-textarea
      v-model:value="memoModalInfo.memo"
      :placeholder="$t('datatable.thead.memo_confirmation')"
      :rows="4"
      :maxlength="50"
      :showCount="true"
    />
    <template #footer>
      <a-button @click="closeMemo"> {{ $t('common.button.cancel') }}</a-button>
      <a-button @click="modifyMemo" type="primary"> {{ $t('common.button.change') }} </a-button>
    </template>
  </a-modal>

  <a-modal
    v-model:visible="transferMemoVisible"
    :title="$t('datatable.thead.memo_send')"
    :footer="null"
    @cancel="closeTransferMemo"
  >
    <a-textarea
      v-model:value="transferMemoInfo.transfer_Memo"
      :placeholder="$t('datatable.thead.memo_confirmation')"
      :rows="4"
      :maxlength="50"
      :showCount="true"
      :readOnly="true"
    />
  </a-modal>

  <StateChangeModal
    :visible="refusalVisible"
    :data="refusalData"
    :type="refusalType"
    @close="closeRefusalModal"
    @return="returnRefusalModal"
  />
</template>

<script setup>
import StateChangeModal from '@/components/modals/StateChangeModal.vue';

import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { usePagination } from 'vue-request';
import { notification } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { apis } from '@/store/api';
import { deepCopy, getKycApprovalType } from '@/assets/js/global';
import { Enum } from '@/assets/js/enum';

const { t } = useI18n();
const store = useStore();

const props = defineProps({
  userId: String,
  show: Boolean,
  type: String,
});

const pageSizeOptions = computed(() => store.state['common'].pageSize);
const historyInfo = computed(() => store.state['kyc'].kycRequestHistory);
const isShow = computed(() => props.show);
const userId = computed(() => props.userId);
const selectedPageSize = ref(pageSizeOptions.value[0]);
const totalCount = ref(0);
const grade = computed(() => store.state['sign'].signInfo.grade);
const dataChanged = ref(false);

const columns = ref([
  {
    title: 'datatable.thead.request_date',
    dataIndex: 'requestDate',
  },

  // {
  //   title: 'datatable.thead.type',
  //   dataIndex: 'type',
  // },

  {
    title: 'datatable.thead.view',
    dataIndex: 'view',
  },
  {
    title: 'datatable.thead.memo_send',
    dataIndex: 'transfer_Memo',
  },
  {
    title: 'datatable.thead.memo_confirmation',
    dataIndex: 'memo',
  },

  {
    title: 'datatable.thead.state',
    dataIndex: 'state',
    className: 'btn-cell',
  },

  {
    title: 'datatable.thead.processing_date',
    dataIndex: 'processing_Date',
  },

  {
    title: 'datatable.thead.id_name',
    dataIndex: 'id/name',
  },
]);

const queryData = async () => {
  await store.dispatch('kyc/KycRequestHistory', { userId: userId.value });
  setTimeout(() => {
    dataChanged.value = true;
  }, 100);
  return historyInfo.value;
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

const pagination = computed(() => ({
  total: totalCount.value,
  current: current.value,
  pageSize: pageSize.value,
  size: props.type === 'wallet' ? 'small' : '',
}));

const handleTableChange = (pag, filters, sorter) => {
  totalCount.value = pag.total;
  run({
    results: pag.pageSize ? pag.pageSize : pag.results,
    page: pag.current ? pag.current : pag.page,
    sortField: sorter.field,
    sortOrder: sorter.order,
  });
};

const afterConfirmation = (type) => {
  notification['success']({
    message:
      type === 1
        ? t('notification.title.kyc_confirmed_approval')
        : type === -1
        ? t('notification.title.kyc_confirmed_refusal')
        : t('notification.title.kyc_confirmed_reconsider'),
    duration: 3,
  });
};

const postKycConfirmation = async (data) => {
  const response = await apis.KycConfirmation(data);
  const getData = response.data;
  if (getData.errCode === 0) {
    afterConfirmation(data.confirmationType);
    handleTableChange({ page: 1, results: 10 }, {}, {});
    await store.dispatch('kyc/KycRequestDetail', { userId: userId.value });
  }
};

const stateChange = (confirmationType, type, memo, transfer_Memo, record) => {
  if (confirmationType === -1 && record.state === '1st Refusal') {
    openRefusalModal('refusal', record);
    refusalRequestData.value = {
      User_Id: userId.value,
      confirmationType: confirmationType,
      kycType: type,
      memo: memo,
      transfer_Memo: transfer_Memo,
    };
  } else {
    postKycConfirmation({
      User_Id: userId.value,
      confirmationType: confirmationType,
      kycType: type,
      memo: memo,
      transfer_Memo: transfer_Memo,
    });
  }
};

const selectPageSize = (e) => {
  selectedPageSize.value = e;
  handleTableChange({ page: 1, results: e.value }, {}, {});
};
//
const memoModalVisible = ref(false);
const memoModalInfo = ref({});
const transferMemoVisible = ref(false);
const transferMemoInfo = ref({});

const openMemo = (record) => {
  memoModalInfo.value = deepCopy(record);
  memoModalVisible.value = true;
};
const closeMemo = () => {
  memoModalVisible.value = false;

  setTimeout(() => {
    memoModalInfo.value = {};
  }, 300);
};
const modifyMemo = async () => {
  const response = await apis.KycConfirmMemo({
    kyc_Approval_Idx: memoModalInfo.value.kyc_Approval_Idx,
    value: memoModalInfo.value.memo,
  });
  const getData = response.data;

  if (getData.returnData) {
    handleTableChange({ page: 1, results: 10 }, {}, {});
    notification['success']({
      message: t('notification.title.success'),
      duration: 3,
    });
  } else {
    notification['error']({
      message: t('notification.title.error'),
      duration: 3,
    });
  }
  closeMemo();
};
const openTransferMemo = (record) => {
  transferMemoInfo.value = deepCopy(record);
  transferMemoVisible.value = true;
};
const closeTransferMemo = () => {
  transferMemoVisible.value = false;

  setTimeout(() => {
    transferMemoInfo.value = {};
  }, 300);
};
//

const refusalVisible = ref(false);
const refusalData = {
  refusalOptions: [
    {
      value: 1,
      label: 'datatable.text.blurry_photo',
    },
    {
      value: 2,
      label: 'datatable.text.expired_id',
    },
    {
      value: 3,
      label: 'datatable.text.identity_inconsistency',
    },
    {
      value: 4,
      label: 'datatable.text.invalid_id',
    },
  ],
  refusalLabel: 'confirm.description.kyc_refusal',
};
const refusalType = ref('');
const refusalRequestData = ref({});

const openRefusalModal = (type, record) => {
  refusalType.value = type;
  refusalVisible.value = true;
};
const closeRefusalModal = () => {
  refusalType.value = '';
  refusalVisible.value = false;
  refusalRequestData.value = {};
};
const returnRefusalModal = async (val) => {
  refusalRequestData.value.transfer_Memo = val.content;
  refusalRequestData.value.signature = val.signature;
  await postKycConfirmation(refusalRequestData.value);

  closeRefusalModal();
};

watch(isShow, () => {
  if (isShow.value) {
    setTimeout(() => {
      handleTableChange({ page: 1, results: 10 }, {}, {});
    }, 100);
  } else {
    dataChanged.value = false;
  }
});
</script>

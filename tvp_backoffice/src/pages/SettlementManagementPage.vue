<template>
  <FilterCard
    :filters="filters"
    @search="search"
    v-if="!props.data && !props.isTop"
  />
  <a-table
    :showSorterTooltip="false"
    :columns="columns"
    :row-key="(record:any) => record.key"
    :data-source="dataSource"
    :pagination="pagination"
    :loading="loading"
    :scroll="{ x: 1400 }"
    @change="paginationChanged"
  >
    <template #bodyCell="{ column, text, record }">
      <template v-if="column.dataIndex === 'coinCode'">
        <CoinIcon :coin-code="text" />
      </template>

      <template v-if="column.dataIndex === 'status'">
        <a-space align="center">
          <a-typography-text
            :type="
              text === TransactionStatus.Completed
                ? 'success'
                : text === TransactionStatus.Rejected
                ? 'danger'
                : ''
            "
          >
            {{
              text === TransactionStatus.OnRequest
                ? $t('common.word.proceeding')
                : text === TransactionStatus.Completed
                ? $t('common.word.complete')
                : text === TransactionStatus.Rejected
                ? $t('common.word.refusal')
                : text
            }}
          </a-typography-text>

          <template v-if="text === TransactionStatus.OnRequest">
            <a-button danger @click="confirm(false, record)">
              {{ $t('common.word.refusal') }}
            </a-button>
            <a-button type="primary" @click="confirm(true, record)">
              {{ $t('common.word.approval') }}
            </a-button>
          </template>
        </a-space>
      </template>
    </template>
  </a-table>

  <ConfirmPasswordModal
    :visible="isConfirmPasswordModal"
    @update:visible="(value:boolean) => isConfirmPasswordModal = value"
    :data="confirmData"
    @return="confirmFeedback"
  />
</template>

<script setup lang="ts">
import ConfirmPasswordModal from '@/components/modal/ConfirmPasswordModal.vue';
import FilterCard from '@/components/FilterCard.vue';
import CoinIcon from '@/components/CoinIcon.vue';

import dayjs from 'dayjs';
import { PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ColumnsType } from 'ant-design-vue/lib/table';
import { depWitStatusOptions } from '@/utils/constants';
import { SettlementStatus, TransactionStatus } from '@/utils/enums';
import { comma } from '@/boot/global';
import { api } from '@/boot/axios';
import { useCustomPagination } from '@/utils/pagination';

const { t } = useI18n();
const props = defineProps({
  data: {
    type: Object as PropType<IMemberManagementResponse>,
    required: true,
  },
  isTop: { type: Boolean, required: false },
});

const isConfirmPasswordModal = ref<boolean>(false);
const confirmData = ref<any>();

const filters: IFilter[] = [
  {
    id: 'createdTime',
    label: 'common.word.request_date',
    type: 'date',
  },
  {
    id: 'updatedTime',
    label: 'common.word.proceed_date',
    type: 'date',
  },
  {
    id: 'settlementStatus',
    label: 'common.word.status',
    type: 'select',
    options: depWitStatusOptions,
  },
  {
    id: 'searchText',
    label: 'common.input.id_name_search',
    type: 'search',
  },
];

const columns: ColumnsType = [
  {
    title: () => t('common.word.request_date'),
    dataIndex: 'createdTime',
    sorter: true,
    align: 'right',
    customRender: ({ text }) =>
      text === null ? '' : dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
  },
  {
    title: () => t('common.word.proceed_date'),
    dataIndex: 'completedTime',
    sorter: true,
    align: 'right',
    customRender: ({ text }) =>
      text === null ? '' : dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
  },
  {
    title: () => t('common.word.partner'),
    dataIndex: 'investor',
    sorter: true,
  },
  {
    title: () => t('common.word.top_agent'),
    dataIndex: 'topAgent',
    sorter: true,
  },
  {
    title: () => t('common.word.id'),
    dataIndex: 'email',
    sorter: true,
  },
  {
    title: () => t('common.word.nickname'),
    dataIndex: 'nickname',
    sorter: true,
  },
  {
    title: () => t('common.word.coin'),
    dataIndex: 'coinCode',
    sorter: true,
    align: 'center',
  },
  {
    title: () => t('common.word.request_amount'),
    dataIndex: 'requestAmount',
    sorter: true,
    align: 'right',
    customRender: ({ text }) => comma(text),
  },
  {
    title: () => t('common.word.processing_before_balance'),
    dataIndex: 'beforeBalance',
    sorter: true,
    align: 'right',
    customRender: ({ text }) => comma(text),
  },
  {
    title: () => t('common.word.processing_after_balance'),
    dataIndex: 'afterBalance',
    sorter: true,
    align: 'right',
    customRender: ({ text }) => comma(text),
  },
  {
    title: () => t('common.word.status'),
    dataIndex: 'status',
    sorter: true,
  },
];

const {
  data: dataSource,
  loading,
  pagination,
  search,
  paginationChanged,
} = useCustomPagination(
  async (params: any) => await api.auto.settlement.settlement(params),
  (params: any) => {
    if (props.data) {
      return {
        ...params,
        filters: {
          ...params.filters,
          id: props.data.memberId,
        },
      };
    }

    if (props.isTop) {
      return {
        ...params,
        filters: {
          ...params.filters,
          settlementStatus: [SettlementStatus.OnRequest],
        },
      };
    }

    return params;
  }
);

const confirm = (status: boolean, record: any) => {
  isConfirmPasswordModal.value = true;
  confirmData.value = { id: record.settlementId, isApproved: status };
};

const confirmFeedback = async (data: any) => {
  isConfirmPasswordModal.value = false;

  await api.auto.settlement.status(data.id, {
    status: data.isApproved
      ? SettlementStatus.Approved
      : SettlementStatus.Refused,
  });
  search();
};
</script>

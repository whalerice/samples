<template>
  <a-modal
    v-model:visible="visible"
    :footer="null"
    :title="$t('common.word.request_partner')"
    :bodyStyle="{ padding: 0 }"
    :width="1000"
    :destroyOnClose="true"
  >
    <a-table
      :columns="columns"
      :row-key="(record: any) => record.id"
      :data-source="dataSource"
      :pagination="pagination"
      :loading="loading"
      @change="paginationChanged"
    >
      <template #headerCell="{ title }">
        {{ $t(title) }}
      </template>

      <template #bodyCell="{ column, record, text }">
        <template v-if="column.dataIndex === 'id'">
          <a-typography-link
            @click="(selectData = record), (partnerInfoModalVisible = true)"
          >
            {{ record.id }}
          </a-typography-link>
        </template>

        <template v-if="column.dataIndex === 'state'">
          {{ userStateType.find((e: any) => e.value === text)?.label() }}
        </template>
      </template>
    </a-table>
  </a-modal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { TableColumnsType } from 'ant-design-vue';
import { useCustomPagination } from '@/utils/pagination';
import { api } from '@/boot/axios';
import { useI18n } from 'vue-i18n';
import { comma } from '@/boot/global';
import { UserStateType } from '@/utils/enums';

const props = defineProps({
  show: { type: Boolean },
});

const { t } = useI18n();
const emits = defineEmits(['update:show']);

const userStateType = [
  {
    value: UserStateType.Request,
    label: () => t('common.text.request'),
    color: 'default',
    checked: false,
  },
  {
    value: UserStateType.ApprovalProgress,
    label: () => t('common.text.approval_progress'),
    color: 'processing',
    checked: false,
  },
  {
    value: UserStateType.Refusal,
    label: () => t('common.text.refusal'),
    color: 'error',
    checked: false,
  },
  {
    value: UserStateType.ConfirmDeposit,
    label: () => t('common.text.confirm_deposit'),
    color: 'warning',
    checked: false,
  },
  {
    value: UserStateType.Approval,
    label: () => t('common.text.approval'),
    color: 'success',
    checked: false,
  },
];

const visible = computed({
  get() {
    return props.show;
  },
  set(val) {
    emits('update:show', val);
  },
});
const selectData = ref({});
const partnerInfoModalVisible = ref(false);

const columns: TableColumnsType = [
  {
    title: 'common.word.id',
    dataIndex: 'id',
  },
  {
    title: 'common.word.name',
    dataIndex: 'name',
  },
  {
    title: 'common.word.currency',
    dataIndex: 'currencyType',
    align: 'center',
  },
  {
    title: 'common.word.ratio',
    dataIndex: 'partnerRate',
    align: 'right',
  },
  {
    title: 'common.word.status',
    dataIndex: 'state',
  },
  {
    title: 'common.word.request_date',
    dataIndex: 'date',
    align: 'center',
  },
];

const innerColumns = [
  {
    title: () => t('common.word.coin'),
    dataIndex: 'coinCode',
    align: 'center',
  },
  {
    title: () => t('common.word.wallet_address'),
    dataIndex: 'address',
  },
  {
    title: () => t('common.word.destination_tag'),
    dataIndex: 'destinationTag',
  },
  {
    title: () => t('common.word.quantity'),
    dataIndex: 'balance',
    align: 'right',
    customRender: ({ text }: any) => comma(text),
  },
];

const {
  data: dataSource,
  loading,
  pagination,
  paginationChanged,
} = useCustomPagination(
  async (params: any) => await api.auto.investment.partners({ state: [1, 2] })
);
</script>

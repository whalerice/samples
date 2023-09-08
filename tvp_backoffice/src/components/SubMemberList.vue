<template>
  <a-table
    :columns="columns"
    :row-key="(record:any) => record.key"
    :data-source="dataSource"
    :pagination="pagination"
    :loading="loading"
    :scroll="{ x: 1500 }"
    @change="paginationChanged"
  >
    <template #headerCell="{ title }">
      {{ $t(title) }}
    </template>
    <template #bodyCell="{ column, record, text }">
      <template v-if="column.dataIndex === 'level'">
        {{ $t(text === 6 ? 'common.word.user' : `common.word.agent${text}`) }}
      </template>
      <template v-if="column.dataIndex === 'settlementMethod'">
        {{ text ? $t('common.word.rolling') : $t('common.word.losing') }}
      </template>
      <template v-if="column.dataIndex === 'rewardAmount'">
        {{ $comma(text) }}
      </template>
      <template v-if="column.dataIndex === 'createdTime'">
        {{ text === null ? '' : $dayjs(text).format('YYYY-MM-DD HH:mm:ss') }}
      </template>
      <template v-if="column.dataIndex === 'lastChallengedTime'">
        {{ text === null ? '' : $dayjs(text).format('YYYY-MM-DD HH:mm:ss') }}
      </template>
      <template v-if="column.dataIndex === 'lastPredictedTime'">
        {{ text === null ? '' : $dayjs(text).format('YYYY-MM-DD HH:mm:ss') }}
      </template>

      <template v-if="column.dataIndex === 'state'">
        <SingleStatusSelect
          :options="memberStatusOptions"
          :value="record.state"
          :grade="record.level"
          @change-status="(record) => changeStatus(record)"
          :record="record"
        />
      </template>
    </template>
  </a-table>
</template>

<script setup lang="ts">
import SingleStatusSelect from '@/components/select/SingleStatusSelect.vue';
import { ref, PropType } from 'vue';
import { TableColumnsType } from 'ant-design-vue';
import { memberStatusOptions } from '@/utils/constants';
import { api } from '@/boot/axios';
import { useCustomPagination } from '@/utils/pagination';

const props = defineProps({
  data: {
    type: Object as PropType<IMemberManagementResponse>,
    required: true,
  },
});

const columns: TableColumnsType = [
  {
    title: 'common.word.partner',
    dataIndex: 'investor',
  },
  {
    title: 'common.word.top_agent',
    dataIndex: 'topAgent',
  },
  {
    title: 'common.word.id',
    dataIndex: 'email',
  },
  {
    title: 'common.word.nickname',
    dataIndex: 'nickname',
  },
  {
    title: 'common.word.grade',
    dataIndex: 'level',
    align: 'center',
  },
  {
    title: 'common.word.settlement_method',
    dataIndex: 'settlementMethod',
  },
  {
    title: 'common.word.losing_reserve',
    dataIndex: 'rewardAmount',
    align: 'right',
  },
  {
    title: 'common.word.subscription_date',
    dataIndex: 'createdTime',
    align: 'center',
  },
  {
    title: 'common.word.latest_connection_time',
    dataIndex: 'lastChallengedTime',
    align: 'center',
  },
  {
    title: 'common.word.latest_predict_time',
    dataIndex: 'lastPredictedTime',
    align: 'center',
  },
  {
    title: 'common.word.status',
    dataIndex: 'state',
    align: 'center',
  },
];

const {
  data: dataSource,
  loading,
  pagination,
  search,
  paginationChanged,
} = useCustomPagination(
  async (params: any) => await api.auto.member.subMembers(params),
  (params: any) => ({ ...params, filters: { id: props.data?.memberId } })
);

const changeStatus = async (data: {
  record: IMemberManagementResponse;
  status: 6 | 7;
}) => {
  await api.auto.member.state(data.record.memberId, data.status === 7 ? 6 : 7);

  search();
};
</script>

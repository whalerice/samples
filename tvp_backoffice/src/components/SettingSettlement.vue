<template>
  <a-table
    :key="dataSource"
    :defaultExpandAllRows="true"
    :row-key="(record:any) => record.key"
    :data-source="dataSource"
    :loading="loading"
    :columns="columns"
    :pagination="false"
    @change="paginationChanged"
    class="custom-settlement-setting-table"
  >
    <template #headerCell="{ title }">{{ $t(title) }}</template>

    <template #bodyCell="{ column, record, text }">
      <template v-if="column.dataIndex === 'id'">
        <template v-if="!record.children">
          <span class="custom-tree-row-span">
            {{ text }}
          </span>
        </template>
      </template>

      <template v-if="column.dataIndex === 'settlementRate'">
        <span class="txt">
          {{ text?.isRolling ? 'R' : 'L' }}
        </span>

        <a-input-number
          v-model:value="valeus[record.memberId]"
          style="min-width: 12rem; margin-left: 1rem"
          :max="100"
          :min="0"
          :formatter="(value:string | number) => `${value}%`"
          :parser="(value:string) => value.replace('%', '')"
        />
      </template>
    </template>

    <template #summary>
      <a-table-summary fixed>
        <a-table-summary-row>
          <a-table-summary-cell :col-span="3" class="text-right">
            <a-button type="primary" @click="save">
              {{ $t('common.word.apply') }}
            </a-button>
          </a-table-summary-cell>
        </a-table-summary-row>
      </a-table-summary>
    </template>
  </a-table>
</template>

<script setup lang="ts">
import { TableColumnType } from 'ant-design-vue';
import { useCustomPagination } from '@/utils/pagination';
import { api } from '@/boot/axios';
import { defineProps, PropType, ref } from 'vue';

const props = defineProps({
  data: {
    type: Object as PropType<IMemberManagementResponse>,
    required: true,
  },
});

const columns: TableColumnType[] = [
  {
    title: 'common.word.id',
    dataIndex: 'email',
  },
  {
    title: 'common.word.nickname',
    dataIndex: 'nickname',
  },
  {
    title: 'common.word.settlement_rate',
    dataIndex: 'settlementRate',
    align: 'center',
  },
];

const valeus = ref<Record<string, number>>({});

const setValues = (item: ISettlementSetting) => {
  valeus.value = {
    ...valeus.value,
    [item.memberId]: item.settlementRate * 100,
  };

  for (let i in item.children) {
    setValues(item.children[i]);
  }
};

const {
  data: dataSource,
  loading,
  search,
  paginationChanged,
} = useCustomPagination(async (params: any) => {
  const item = await api.auto.member.settlementSetting(props.data.memberId);
  setValues(item);

  return [item];
});

const save = async () => {
  const data = Object.keys(valeus.value).reduce(
    (result, key) => ({ ...result, [key]: valeus.value[key] / 100 }),
    {}
  );

  await api.auto.member.updateSettlementSetting(props.data.memberId, data);

  await search();
};
</script>

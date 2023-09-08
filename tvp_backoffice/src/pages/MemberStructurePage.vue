<template>
  <FilterCard :filters="filters" @search="search" />

  <a-table
    :showSorterTooltip="false"
    :columns="columns"
    :loading="loading"
    :pagination="false"
    :row-key="(record:any) => record.key"
    :data-source="dataSource"
    :expandedRowKeys="expandedRowKeys"
    :scroll="{ x: 1600 }"
    :indent-size="24"
    @expand="expand"
    @change="paginationChanged"
  >
    <template #bodyCell="{ column, text, record }">
      <template v-if="column.dataIndex === 'nickname'">
        <FolderOutlined v-if="record.directory" class="q-mr-xs" />
        <UserOutlined
          v-if="record.level === MemberLevelType.User"
          class="q-mr-xs"
        />
        {{ record.directory ? $t('common.word.user') : text }}
      </template>
    </template>
  </a-table>
</template>

<script setup lang="ts">
import FilterCard from '@/components/FilterCard.vue';

import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { UserOutlined, FolderOutlined } from '@ant-design/icons-vue';
import { role, comma, options } from '@/boot/global';
import { MemberStatusType, MemberLevelType } from '@/utils/enums';
import { roleNames } from '@/router/routes';
import {
  memberStatusOptions,
  settlementMethodOptions,
} from '@/utils/constants';
import { api } from '@/boot/axios';
import ConfirmPasswordModal from '@/components/modal/ConfirmPasswordModal.vue';
import { useCustomPagination } from '@/utils/pagination';

const { t } = useI18n();
const expandedRowKeys = ref<string[]>([]);

const filters: IFilter[] = [
  {
    id: 'settlementMethod',
    label: 'common.word.settlement_method',
    type: 'select',
    options: settlementMethodOptions,
  },
  {
    id: 'memberState',
    label: 'common.word.status',
    type: 'select',
    options: memberStatusOptions,
  },
  {
    id: 'searchText',
    label: 'common.input.id_name_search',
    type: 'search',
  },
];

const columns = [
  {
    title: () => t('common.word.nickname'),
    dataIndex: 'nickname',
    sorter: true,
  },
  {
    title: () => t('common.word.grade'),
    dataIndex: 'level',
    sorter: true,
    customRender: ({ text, record }: any) =>
      text && !record.directory
        ? options.memberLevel.filter((e: any) => e.value === text)[0].label()
        : null,
  },
  {
    title: () => t('common.word.settlement_method'),
    dataIndex: 'settlementMethod',
    sorter: true,
    customRender: ({ text, record }: any) =>
      text && !record.directory
        ? options.reward.filter((e: any) => e.value === text)[0].label()
        : null,
  },
  {
    title: () => t('common.word.reserve'),
    dataIndex: 'rewardAmount',
    align: 'right',
    sorter: true,
    customRender: ({ text, record }: any) =>
      !record.directory ? comma(text) : null,
  },
  {
    title: () => t('common.word.predict_amount'),
    dataIndex: 'predictionAmount',
    align: 'right',
    sorter: true,
    customRender: ({ text, record }: any) =>
      !record.directory ? comma(text) : null,
  },
  {
    title: () => t('common.word.winning_amount'),
    dataIndex: 'winningAmount',
    align: 'right',
    sorter: true,
    customRender: ({ text, record }: any) =>
      !record.directory ? comma(text) : null,
  },
  {
    title: () => t('common.word.status'),
    dataIndex: 'state',
    sorter: true,
    customRender: ({ text, record }: any) =>
      !record.directory && text === MemberStatusType.Stop
        ? t('common.word.status_stop')
        : !record.directory && text === MemberStatusType.Normal
        ? t('common.word.status_normal')
        : null,
  },
];

const generateUserGroup = (item: any) => ({
  ...item,
  directory: true,
  key: `${item.memberId}_users`,
  nickname: 'common.word.user',
  children: [],
});

const queryData = async (params: any) => {
  const data = await api.auto.member.structureMap('', params);

  return [
    ...(role === roleNames.agent ? [generateUserGroup({})] : []),
    ...data.map((e) => {
      return {
        ...e,
        key: e.memberId,
        children: e.level !== 0 ? [generateUserGroup(e)] : [],
      };
    }),
  ];
};

const expand = async (expanded: boolean, record: any) => {
  if (expanded) {
    const data = await api.auto.member.structureMap(record.memberId, {
      user: record.directory || false,
    });

    record.children = [
      ...(record.directory || record.level === 0 || record.level === 6
        ? []
        : [generateUserGroup(record)]),
      ...data.map((e) => ({
        ...e,
        key: e.memberId,
        ...(e.level !== 6
          ? {
              children: [],
            }
          : {}),
      })),
    ];

    expandedRowKeys.value = [...expandedRowKeys.value, record.key];
  } else {
    for (let i = 0; i < expandedRowKeys.value.length; i++) {
      if (expandedRowKeys.value[i].indexOf(record.key) > -1) {
        expandedRowKeys.value.splice(i, 1);
        i--;
      }
    }
  }
};

const {
  data: dataSource,
  loading,
  // pagination,
  search,
  paginationChanged,
} = useCustomPagination(async (params: any) => queryData(params));
</script>

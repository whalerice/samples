<template>
  <a-card class="gap-xl">
    <StatisticAction
      :list="memberList"
      :data="memberCardData"
      :unit="$t('common.word.people')"
    />
  </a-card>

  <a-row
    align="middle"
    justify="end"
    :gutter="[15, 15]"
    class="q-mb-md"
    v-if="route.name === 'member-management-operator'"
  >
    <a-col>
      <a-button type="primary" size="default" @click="createAgent(true)">
        {{ $t('common.word.create_agent') }}
      </a-button>
    </a-col>
  </a-row>

  <FilterCard :filters="filters" @search="search" />

  <a-table
    :showSorterTooltip="false"
    :columns="columns"
    :row-key="(index:any) => index"
    :data-source="dataSource"
    :pagination="pagination"
    :loading="loading"
    :scroll="{ x: 1600 }"
    @change="paginationChanged"
  >
    <template #bodyCell="{ column, record, text }">
      <template v-if="column.dataIndex === 'topAgent' && record.role !== 0">
        <HierarchyTooltip :id="record.memberId" :text="record.topAgent" />
      </template>

      <template v-if="column.dataIndex === 'email'">
        <a-typography-link @click="showMemberDetailModal(record)">
          {{ text }}
        </a-typography-link>
      </template>
      <template v-if="column.dataIndex === 'nickname'">
        <a-typography-link @click="showMemberDetailModal(record)">
          {{ text }}
        </a-typography-link>
      </template>

      <template v-if="column.dataIndex === 'state'">
        <SelectChangeStatus :data="record" @return="returnSelectChangeStatus" />
      </template>
    </template>
  </a-table>
  <CreateAgentModal :show="isCreateAgentModal" @update:show="createAgent" />

  <MemberInformationModal
    :visible="isMemberDetailModal"
    :open="isMemberDetailModal"
    @update:visible="updateMemberInformation"
    :member-data="memberData"
  />
</template>

<script setup lang="ts">
import FilterCard from '@/components/FilterCard.vue';
import StatisticAction from '@/components/StatisticAction.vue';
import MemberInformationModal from '@/components/modal/MemberInformationModal.vue';
import HierarchyTooltip from '@/components/HierarchyTooltip.vue';
import CreateAgentModal from '@/components/modal/CreateAgentModal.vue';
import SelectChangeStatus from '@/components/select/SelectChangeStatus.vue';

import { ref, onMounted } from 'vue';
import dayjs from 'dayjs';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ColumnsType } from 'ant-design-vue/lib/table';
import {
  memberStatusOptions,
  settlementMethodOptions,
} from '@/utils/constants';
import { options } from '@/boot/global';
import { comma } from '@/boot';
import { api } from '@/boot/axios';
import { useCustomPagination } from '@/utils/pagination';

const route = useRoute();
const { t } = useI18n();
const isMemberDetailModal = ref(false);
const isCreateAgentModal = ref(false);

const filters: IFilter[] = [
  {
    id: 'memberLevel',
    label: 'common.word.grade',
    type: 'select',
    options: options.memberLevel,
  },
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
    label: 'common.input.id_nickname_recommender_search',
    type: 'search',
  },
];

const memberData = ref<IMemberManagementResponse>();

const columns: ColumnsType = [
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
    title: () => t('common.word.grade'),
    dataIndex: 'level',
    sorter: true,
    customRender: ({ text }: any) =>
      options.memberLevel.filter((e: any) => e.value === text)[0].label(),
  },
  {
    title: () => t('common.word.settlement_method'),
    dataIndex: 'settlementMethod',
    sorter: true,
    customRender: ({ text }: any) =>
      text !== null
        ? options.reward.filter((e: any) => e.value === text)[0].label()
        : text,
  },
  {
    title: () => t('common.word.reserve_amount'),
    dataIndex: 'rewardAmount',
    sorter: true,
    align: 'right',
    customRender: ({ text }) => comma(text),
  },
  {
    title: () => t('common.word.subscription_date'),
    dataIndex: 'createdTime',
    sorter: true,
    align: 'right',
    customRender: ({ text }) =>
      text !== null ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : text,
  },
  {
    title: () => t('common.word.latest_connection_time'),
    dataIndex: 'lastChallengedTime',
    sorter: true,
    align: 'right',
    customRender: ({ text }) =>
      text !== null ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : text,
  },
  {
    title: () => t('common.word.latest_predict_time'),
    dataIndex: 'lastPredictedTime',
    sorter: true,
    align: 'right',
    customRender: ({ text }) =>
      text !== null ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : text,
  },
  {
    title: () => t('common.word.status'),
    dataIndex: 'state',
    sorter: true,
    align: 'center',
  },
];

const memberList = [
  {
    label: () => t('common.word.agent'),
    value: 'agentCount',
  },
  {
    label: () => t('common.word.user'),
    value: 'userCount',
  },
  {
    label: () => t('common.word.new_member_this_month'),
    value: 'newOfMonthCount',
  },
  {
    label: () => t('common.word.today_new_member'),
    value: 'newOfTodayCount',
  },
  {
    label: () => t('common.word.today_visitor'),
    value: 'visitedTodayCount',
  },
  {
    label: () => t('common.word.today_predict_member'),
    value: 'predictedTodayCount',
  },
  {
    label: () => t('common.word.current_access_user'),
    value: 'onlineCount',
  },
  {
    label: () => t('common.word.two_weeks_without_access'),
    value: 'disconnectedForTwoWeeksCount',
  },
];

const memberCardData = ref<ISummaryMemberResponse>({
  investorCount: 0,
  agentCount: 0,
  userCount: 0,
  newOfMonthCount: 0,
  newOfTodayCount: 0,
  visitedTodayCount: 0,
  onlineCount: 0,
  predictedTodayCount: 0,
  disconnectedForTwoWeeksCount: 0,
});

const showMemberDetailModal = (data: IMemberManagementResponse) => {
  memberData.value = data;
  isMemberDetailModal.value = true;
};

const {
  data: dataSource,
  loading,
  pagination,
  search,
  paginationChanged,
} = useCustomPagination(async (params: any) => {
  return route.meta.type === 'user'
    ? await api.auto.member.users(params)
    : await api.auto.member.operators(params);
});

const updateMemberInformation = (value: boolean) => {
  isMemberDetailModal.value = value;
  search();
};
const returnSelectChangeStatus = (value: boolean) => {
  if (value) search();
};

const createAgent = (value: boolean) => {
  isCreateAgentModal.value = value;
  if (value === false) {
    search();
  }
};

onMounted(async () => {
  memberCardData.value = await api.auto.summary.member();
});
</script>

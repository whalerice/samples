<template>
  <a-button
    v-if="role === roleNames.master"
    type="primary"
    class="q-mb-md"
    @click="
      (noticeRegisterModalVisible = !noticeRegisterModalVisible),
        (isModify = false)
    "
  >
    <EditOutlined />
    {{ $t('common.word.registration') }}
  </a-button>

  <FilterCard
    v-if="role === roleNames.master"
    :filters="filters"
    @search="search"
  />

  <a-table
    :showSorterTooltip="false"
    :columns="columns"
    :row-key="(record:any) => record.key"
    :pagination="pagination"
    :data-source="dataSource"
    :loading="loading"
    :scroll="{ x: 1200 }"
    @change="paginationChanged"
  >
    <template #headerCell="{ title }">
      {{ $t(title) }}
    </template>

    <template #bodyCell="{ column, record, text }">
      <template v-if="column.dataIndex === 'title'">
        <a-typography-link @click="openWrite(record)">
          {{ text.length > 50 ? `${text.substr(0, 49)}…` : text }}
          <!-- {{
            text[locale].length > 50
              ? `${text[locale].substr(0, 49)}…`
              : text[locale]
          }} -->
        </a-typography-link>
      </template>

      <template v-if="column.dataIndex === 'state'">
        <a-row align="middle" :gutter="[5, 0]">
          <template v-if="text === 0">
            <a-col>
              {{ $t('common.word.latest') }}
            </a-col>
            <a-col>
              <a-button size="small">{{
                $t('common.word.reposting')
              }}</a-button>
            </a-col>
            <a-col>
              <a-button size="small">{{
                $t('common.word.declare_post')
              }}</a-button>
            </a-col>
          </template>

          <template v-if="text === 1">
            <a-col>
              {{ $t('common.word.turn_off') }}
            </a-col>
            <a-col>
              <a-button size="small">{{ $t('common.word.post') }}</a-button>
            </a-col>
          </template>

          <template v-if="text === 2">
            <a-col>
              <span>{{ $t('common.word.turn_on') }}</span>
            </a-col>
            <a-col>
              <a-button size="small">
                {{ $t('common.word.reposting') }}
              </a-button>
            </a-col>
          </template>
        </a-row>
      </template>
    </template>
  </a-table>

  <NoticeRegisterModal
    :visible="noticeRegisterModalVisible"
    @update:visible="(value: boolean)=> noticeRegisterModalVisible = value"
    v-model:value="formState"
    :is-modify="isModify"
    :id="noticeId"
  />

  <a-modal
    :visible="noticeDetailModalVisible"
    centered
    style="min-width: 28rem; max-width: 50rem; width: 100%"
    :title="$t('route.title.notice')"
    :destroyOnClose="true"
    @ok="noticeDetailModalVisible = false"
    @cancel="noticeDetailModalVisible = false"
  >
    <div v-html="formState.contents"></div>
  </a-modal>
</template>

<script setup lang="ts">
import FilterCard from '@/components/FilterCard.vue';
import NoticeRegisterModal from '@/components/modal/NoticeRegisterModal.vue';

import { computed, ref } from 'vue';
import { EditOutlined } from '@ant-design/icons-vue';
import {
  noticeCategory1Options,
  noticeCategory2Options,
  noticeStatusOptions,
} from '@/utils/constants';
import { api } from '@/boot/axios';
import { TableColumnsType } from 'ant-design-vue';
import { useCustomPagination } from '@/utils/pagination';
import dayjs from 'dayjs';
import { optionList } from '@/utils/constants';
import { useI18n } from 'vue-i18n';
import { role } from '@/boot/global';
import { roleNames } from '@/router/routes';

const i18n = useI18n();

const locale = computed(() => i18n.locale.value);

const noticeRegisterModalVisible = ref(false);
const noticeDetailModalVisible = ref(false);
const noticeId = ref('');

const formState = ref();

const isModify = ref(false);

const filters = ref<IFilter[]>([
  {
    id: 'a',
    label: 'common.word.registration_modify_date',
    type: 'select',
  },
  {
    id: 'a',
    label: 'common.word.post_date',
    type: 'select',
  },
  {
    id: 'a',
    label: 'common.word.category1',
    type: 'select',
    options: noticeCategory1Options,
  },
  {
    id: 'b',
    label: 'common.word.category2',
    type: 'select',
    options: noticeCategory2Options,
  },
  {
    id: 'c',
    label: 'common.word.status',
    type: 'select',
    options: noticeStatusOptions,
  },
  {
    id: 'dc',
    label: 'common.input.id_name_search',
    type: 'search',
  },
]);

const columns: TableColumnsType =
  role === roleNames.master
    ? [
        {
          title: 'common.word.registration_modify_date',
          dataIndex: 'alterTime',
          sorter: true,
          align: 'right',
          customRender: ({ text }) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
          title: 'common.word.post_date',
          dataIndex: 'postTme',
          sorter: true,
          align: 'right',
          customRender: ({ text }) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
          title: 'common.word.category1',
          dataIndex: 'secondeCode',
          sorter: true,
          customRender: ({ text }) =>
            i18n.t(optionList.noticeCategory.category1[text - 1]),
        },
        {
          title: 'common.word.category2',
          dataIndex: 'thirdCode',
          sorter: true,
          customRender: ({ text }) =>
            i18n.t(optionList.noticeCategory.category2[text - 1]),
        },
        {
          title: 'common.word.title',
          dataIndex: 'title',
          sorter: true,
        },
        {
          title: 'common.word.status',
          dataIndex: 'state',
          sorter: true,
        },
        {
          title: 'common.word.id_name',
          dataIndex: 'userId',
          sorter: true,
        },
      ]
    : [
        {
          title: 'common.word.post_date',
          dataIndex: 'addtime',
          sorter: true,
          align: 'right',
          customRender: ({ text }) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
          title: 'common.word.category1',
          dataIndex: 'subCategoryCode',
          sorter: true,
          customRender: ({ text }) =>
            i18n.t(optionList.noticeCategory.category2[text - 1]),
        },
        {
          title: 'common.word.title',
          dataIndex: 'title',
          sorter: true,
        },
      ];

const openWrite = async (record: any) => {
  if (role === roleNames.master) {
    const response = await api.auto.notice.getDetailNotice(record.id);
    formState.value = { ...response };
    noticeRegisterModalVisible.value = true;
  } else {
    formState.value = { ...record };
    noticeDetailModalVisible.value = true;
  }
};

const {
  data: dataSource,
  loading,
  pagination,
  search,
  paginationChanged,
} = useCustomPagination(async (params: any) => {
  const { skip, take, ...options } = params;
  const currentPage = Math.ceil(skip / take) + 1;

  return await api.auto.notice.getNotice({
    currentPage,
    currentPageSize: take,
    ...options,
  });
});
</script>

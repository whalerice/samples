<template>
  <a-card :title="$t('common.word.reserve_request')">
    <a-row :gutter="[20, 20]">
      <a-col :span="12">
        <a-card
          class="text-center full-height"
          :body-style="{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }"
        >
          <a-statistic
            :title="$t('common.word.reserve_amount')"
            :value="rewardAmount"
            :value-style="{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }"
          >
            <template #prefix>
              <CoinIcon :coin-code="CoinCode.USDT" />
            </template>
          </a-statistic>
        </a-card>
      </a-col>

      <a-col :span="12">
        <a-form layout="vertical" autocomplete="off">
          <a-form-item :label="$t('common.word.wallet_address')">
            <a-input-group compact>
              <a-input size="default" v-model:value="walletAddress">
                <template #prefix>
                  <WalletOutlined />
                </template>
                <template #suffix>
                  <a-tooltip placement="top" :title="$t('common.word.paste')">
                    <CopyOutlined @click="paste" />
                  </a-tooltip>
                </template>
              </a-input>
              <a-button type="primary" size="default" @click="save">
                {{ $t('common.word.save') }}
              </a-button>
            </a-input-group>
          </a-form-item>
          <!-- :parser="(value: number) => `${value}`.replace(/\$\s?|(,*)/g, '')" -->
          <a-form-item :label="$t('common.word.settlement_request_amount')">
            <a-input-group compact>
              <a-input-number
                size="default"
                v-model:value="settlementAmount"
                :min="0.02"
                :formatter="
                (value: number) => $comma(value)
              "
              >
                <template #prefix>
                  <CoinIcon :coin-code="CoinCode.USDT" />
                </template>
              </a-input-number>
              <a-button type="primary" size="default" @click="request">
                {{ $t('common.word.withdrawal_request') }}
              </a-button>
            </a-input-group>
          </a-form-item>
        </a-form>
      </a-col>
    </a-row>
  </a-card>

  <div class="q-mb-xl"></div>

  <FilterCard :filters="filters" @search="search" />

  <a-table
    :showSorterTooltip="false"
    :columns="columns"
    :row-key="(record:any) => record.key"
    :data-source="dataSource"
    :pagination="pagination"
    :loading="loading"
    :scroll="{ x: 1000 }"
    @change="paginationChanged"
  >
    <template #bodyCell="{ column, text }">
      <template v-if="column.dataIndex === 'coinCode'">
        <CoinIcon :coin-code="text" />
      </template>
    </template>
  </a-table>
</template>

<script setup lang="ts">
import FilterCard from '@/components/FilterCard.vue';
import CoinIcon from '@/components/CoinIcon.vue';

import dayjs from 'dayjs';
import { ref, onBeforeMount } from 'vue';
import { useI18n } from 'vue-i18n';
import { notification, TableColumnsType } from 'ant-design-vue';
import { CopyOutlined, WalletOutlined } from '@ant-design/icons-vue';
import { depWitStatus3Options } from '@/utils/constants';
import { SettlementType, CoinCode } from '@/utils/enums';
import { comma } from '@/boot/global';
import { api } from '@/boot/axios';
import { useCustomPagination } from '@/utils/pagination';

const { t } = useI18n();
const walletAddress = ref('');
const settlementAmount = ref(0.02);
const rewardAmount = ref();

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
    options: depWitStatus3Options,
  },
  {
    id: 'searchText',
    label: 'common.input.id_name_search',
    type: 'search',
  },
];

const columns: TableColumnsType = [
  {
    title: () => t('common.word.request_date'),
    dataIndex: 'createdTime',
    sorter: true,
    align: 'right',
    customRender: ({ text }) =>
      text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : null,
  },
  {
    title: () => t('common.word.proceed_date'),
    dataIndex: 'completedTime',
    sorter: true,
    align: 'right',
    customRender: ({ text }) =>
      text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : null,
  },
  {
    title: () => t('common.word.coin'),
    dataIndex: 'coinCode',
    sorter: true,
  },
  {
    title: () => t('common.word.previous_balance'),
    dataIndex: 'beforeBalance',
    sorter: true,
    align: 'right',
    customRender: ({ text }) => comma(text),
  },
  {
    title: () => t('common.word.request_amount'),
    dataIndex: 'requestAmount',
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
    customRender: ({ text }) =>
      text === 0 ? t('common.word.proceeding') : t('common.word.complete'),
  },
];

const {
  data: dataSource,
  loading,
  pagination,
  search,
  paginationChanged,
} = useCustomPagination(
  async (params: any) => await api.operator.settlement.reward(params)
);

const save = () => {
  // console.log('save');
};

const readClipboard = async () => {
  const result = await navigator.permissions.query({ name: 'clipboard-read' });
  if (result.state !== 'granted' && result.state !== 'prompt') {
    notification.info({
      message: t('notification.text.clipboard_access'),
    });

    return;
  }

  return await navigator.clipboard.readText();
};

const paste = async () => {
  const text = await readClipboard();
  walletAddress.value = text ?? '';
};

const request = async () => {
  await api.operator.settlement.request(CoinCode.USDT, settlementAmount.value);

  search();
};

onBeforeMount(async () => {
  rewardAmount.value = (
    await api.auto.summary.settlement(SettlementType.All)
  ).rewardAmount;
});
</script>

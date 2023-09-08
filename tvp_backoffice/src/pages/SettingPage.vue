<template>
  <a-card>
    <a-row align="middle" :gutter="[10, 10]">
      <a-col>
        {{ $t('common.word.site_inspection') }}
      </a-col>

      <a-col>
        <a-popconfirm @confirm="confirm('site')">
          <template #title>
            {{ $t('modal.warning.site_inspection') }} <br />
            {{ $t('modal.warning.proceed') }}
          </template>
          <a-switch :checked="isChecking" />
        </a-popconfirm>
      </a-col>
    </a-row>

    <!-- <a-row align="middle" :gutter="[10, 10]">
      <a-col>
        <span>{{ $t('notice.switch.label') }}</span>
      </a-col>
      <a-col>
        <a-select
          v-model:value="partnerSelect"
          :options="partnerList"
          size="default"
          style="width: 20rem"
        />
      </a-col>
    </a-row> -->
  </a-card>

  <a-table
    :columns="columns"
    :pagination="false"
    :row-key="(record:any) => record.gameId"
    :data-source="dataSource"
    class="q-mt-lg"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.dataIndex === 'roomName'">
        <a-space>
          <CoinIcon :coin-code="record.coinCode" margin-right="0" />
          {{ record.minAmount }} ~ {{ record.maxAmount }}
        </a-space>
      </template>

      <template v-if="column.dataIndex === 'provide'">
        <a-popconfirm @confirm="confirm('game', record)">
          <template #title>
            {{ $t('modal.warning.game_provide') }} <br />
            {{ $t('modal.warning.proceed') }}
          </template>
          <a-switch :checked="record.isEnabled" />
        </a-popconfirm>
      </template>
    </template>
  </a-table>

  <ConfirmPasswordModal
    :visible="isConfirmPasswordModal"
    @update:visible="(value:boolean) => isConfirmPasswordModal = value"
    :data="sendData"
    @return="confirmFeedback"
  />
</template>

<script setup lang="ts">
import CoinIcon from '@/components/CoinIcon.vue';
import ConfirmPasswordModal from '@/components/modal/ConfirmPasswordModal.vue';

import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { SelectProps, TableColumnsType } from 'ant-design-vue';

import { api } from '@/boot/axios';

const { t } = useI18n();
const columns: TableColumnsType = [
  {
    title: () => t('common.word.partner'),
    dataIndex: 'partner',
  },
  {
    title: () => t('common.word.room_name'),
    dataIndex: 'roomName',
  },
  {
    title: () => t('common.word.provide'),
    dataIndex: 'provide',
    align: 'center',
  },
];

const partnerList = ref<any[]>([]);

const dataSource = ref();
const isConfirmPasswordModal = ref(false);
const sendData = ref<any>();
const isChecking = ref<boolean>(false);
const partnerSelect = ref<SelectProps>({});

const queryData = async () => {
  const data = await api.admin.setting.game();
  return data;
};

const gameState = async (id: string, isEnabled: boolean) => {
  await api.admin.setting.gameState(id, isEnabled);
  dataSource.value = await queryData();
};

const confirm = (type: string, data?: any) => {
  isConfirmPasswordModal.value = true;

  if (data) sendData.value = { type: type, ...data };
  else sendData.value = { type: type };
};

const confirmFeedback = (data: any) => {
  isConfirmPasswordModal.value = false;
  if (data.type === 'site') {
    isChecking.value = true;
  }

  if (data.type === 'game') {
    gameState(data.gameId, !data.isEnabled);
  }
};

const simpleList = async () => {
  let items: any[] = [{ label: () => t('common.word.all'), value: -1 }];
  const response = await api.admin.member.simple();
  response.forEach((el: IMemberPartnerSimple) => {
    const item = { value: el.email, label: el.email, ...el };
    items.push(item);
  });
  return items;
};

onBeforeMount(async () => {
  dataSource.value = await queryData();
  partnerList.value = await simpleList();

  partnerSelect.value = partnerList.value[0];
});
</script>

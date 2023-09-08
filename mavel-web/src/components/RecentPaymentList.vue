<template>
  <q-table
    flat
    ref="tableRef"
    row-key="name"
    :title="$t('common.title.recent_list')"
    class="q-mt-xl"
    :class="{ 'table-bottom-center': isMobile }"
    :grid="isMobile"
    :no-data-label="$t('table.message.no_data')"
    :rows-per-page-options="[5, 10, 15, 20, 25, 30]"
    :columns="columns"
    :loading="loading"
    :filter="filter"
    binary-state-sort
    :rows="rows"
    @request="onRequest">
    <template v-slot:top-right>
      <!-- <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
        <template v-slot:append>
        </template>
      </q-input> -->
      <q-btn flat dense round icon="refresh" :class="{ 'fa-spin': loading }" @click="onRefresh" />
      <q-btn flat dense round :icon="isMobile === true ? 'list' : 'grid_view'" @click="isMobile = !isMobile" />
    </template>
    <template v-slot:item="props">
      <div
        class="q-pa-xs col-xs-12 col-sm-6 col-md-4 col-lg-3 grid-style-transition"
        :style="props.selected ? 'transform: scale(0.95);' : ''">
        <q-card :class="props.selected ? 'bg-grey-2' : ''" flat bordered class="table-card">
          <q-list dense class="table-card-list">
            <q-item v-for="col in props.cols.filter((col:any) => col.name !== 'desc')" :key="col.name">
              <q-item-section>
                <q-item-label class="title">{{ $t(col.label) }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label class="value">{{
                  col.field === 'totalCategory'
                    ? actionCategory.filter((e) => e.key === props.row.totalCategory)[0].label()
                    : col.field === 'total_Type'
                    ? actionType.filter((e) => e.key === props.row.total_Type)[0].label()
                    : col.field === 'total_State'
                    ? actionState.filter((e) => e.key === props.row.total_State)[0].label()
                    : col.value
                }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </template>
    <template v-slot:header="props">
      <q-tr :props="props">
        <q-th v-for="col in props.cols" :key="col.name" :props="props">
          {{ $t(col.label) }}
        </q-th>
      </q-tr>
    </template>
    <template v-slot:no-data="{ message }">
      <div class="full-width row flex-center">
        <span> {{ message }} </span>
      </div>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { Platform } from 'quasar';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { onMounted, ref, watch } from 'vue';

import { userStore } from 'src/stores/user';
import { commonStore } from 'src/stores/common';
import { RecentTableCategory, RecentTableType, RecentTableState } from 'src/components/models/enums';
import { apis } from 'src/stores/apis';

const { t } = useI18n();
const { payInfo } = storeToRefs(userStore.user());
const { comma } = commonStore.common();

const actionCategory = [
  { key: RecentTableCategory.PaymentRequest, label: () => t('common.text.payment_request') },
  { key: RecentTableCategory.GameBetting, label: () => t('common.text.game_betting') },
  { key: RecentTableCategory.Point, label: () => t('common.text.point') },
  { key: RecentTableCategory.Reward, label: () => t('common.text.reward') },
  { key: RecentTableCategory.RewardRequest, label: () => t('common.text.reward_request') },
];
const actionType = [
  { key: RecentTableType.Betting, label: () => t('common.text.betting') },
  { key: RecentTableType.Result, label: () => t('common.text.result') },
  { key: RecentTableType.Deposit, label: () => t('common.button.deposit') },
  { key: RecentTableType.Withdraw, label: () => t('common.button.withdrawal') },
  { key: RecentTableType.Lose, label: () => t('common.text.lose') },
  { key: RecentTableType.Win, label: () => t('common.text.win') },
  { key: RecentTableType.CashSwitching, label: () => t('common.text.cash_switching') },
  { key: RecentTableType.Event, label: () => t('common.text.event_gain') },
  { key: RecentTableType.AdminDeduct, label: () => t('common.text.admin_deduct') },
  { key: RecentTableType.AdminProvide, label: () => t('common.text.admin_provide') },
  { key: RecentTableType.Rolling, label: () => t('common.label.rolling') },
  { key: RecentTableType.Losing, label: () => t('common.label.losing') },
];
const actionState = [
  { key: RecentTableType.Lose, label: () => t('common.text.lose') },
  { key: RecentTableType.Win, label: () => t('common.text.win') },
  { key: RecentTableState.Request, label: () => t('common.text.request') },
  { key: RecentTableState.Approval, label: () => t('common.text.approval') },
  { key: RecentTableState.Waiting, label: () => t('common.text.wait') },
  { key: RecentTableState.Refusal, label: () => t('common.text.refusal') },
  { key: RecentTableState.Fail, label: () => t('common.text.failed') },
  { key: RecentTableState.Processing, label: () => t('common.text.progress') },
  { key: RecentTableState.Complete, label: () => t('common.text.done') },
  { key: RecentTableState.Apply, label: () => t('common.text.application') },
  { key: RecentTableState.PaidOut, label: () => t('common.text.paid_out') },
];

const isMobile = ref(Platform.is.mobile === undefined ? false : true);
const tableRef = ref();
const filter = ref('');
const loading = ref(false);
const rows = ref<any[]>([]);
// const headerStyle = 'padding-left: 3rem';
const columns = ref<any[]>([
  {
    name: 'totalCategory',
    field: 'totalCategory',
    label: 'table.thead.category',
    align: 'left',
    sortable: true,
    style: 'width: 12%',
    format: (text: number) =>
      actionCategory.filter((e) => e.key === text).length > 0
        ? actionCategory.filter((e) => e.key === text)[0].label()
        : text,
  },
  {
    name: 'total_Type',
    field: 'total_Type',
    label: 'table.thead.type',
    align: 'left',
    sortable: true,
    style: 'width: 10%',
    format: (text: number) =>
      actionType.filter((e) => e.key === text).length > 0 ? actionType.filter((e) => e.key === text)[0].label() : text,
  },
  {
    name: 'content',
    field: 'content',
    label: 'table.thead.content',
    align: 'left',
    sortable: true,
  },
  {
    name: 'amount',
    field: 'amount',
    label: 'table.thead.amount',
    align: 'right',
    sortable: true,
    format: (val: number) => comma(val),
  },
  {
    name: 'total_State',
    field: 'total_State',
    label: 'table.thead.state',
    align: 'left',
    sortable: true,
    style: 'width: 10%',
    format: (text: number) =>
      actionState.filter((e) => e.key === text).length > 0
        ? actionState.filter((e) => e.key === text)[0].label()
        : text,
    // headerStyle: headerStyle,
  },
  {
    name: 'addTime',
    field: 'addTime',
    label: 'table.thead.addtime',
    align: 'left',
    style: 'width: 10%',
    sortable: true,
  },
]);

const onRequest = async () => {
  // const filter = props.filter
  loading.value = true;

  try {
    const response = await apis.AccountActionInfoList();

    if (response.data.errCode === 0) {
      const returnData = response.data.returnData;
      rows.value = returnData;
    }
    loading.value = false;
  } catch (error) {
    console.error(error);
  }
};
const onRefresh = () => {
  tableRef.value.requestServerInteraction();
};

watch(
  () => payInfo.value,
  () => {
    onRefresh();
  },
);

onMounted(() => {
  tableRef.value.requestServerInteraction();
});
</script>

<style scoped></style>

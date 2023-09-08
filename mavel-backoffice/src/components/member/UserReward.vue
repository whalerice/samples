<template>
  <a-table
    class="tree-table"
    :key="rows"
    :row-key="(record:any) => record.idx"
    :columns="columns.filter((col) => col.key !== (rewardType ? 'losing' : 'rolling'))"
    :data-source="rows"
    :loading="loading"
    :pagination="false"
    bordered
    :defaultExpandAllRows="true">
    <template #headerCell="{ title }">
      {{ $t(title) }}
    </template>
    <template #bodyCell="{ column, record }">
      <template v-if="column.dataIndex === 'casino'">
        <a-space :size="10" v-if="editableDataCasino[record.idx]">
          <a-input-number
            v-model:value="editableDataCasino[record.idx].casino_Fee"
            :min="0"
            :max="100"
            :formatter="(value:any) => `${value}%`"
            :parser="(value:any) => value.replace('%', '')" />
          <a-typography-link @click="save(record.idx, FeeType.RollingCasino)">
            {{ $t('common.button.save') }}
          </a-typography-link>
          <a-typography-link @click="cancel(record.idx, FeeType.RollingCasino)">{{
            $t('common.button.cancel')
          }}</a-typography-link>
        </a-space>
        <a-space :size="10" v-else>
          <span>{{ record.casino_Fee }}</span>
          <a-typography-link v-if="record.isModify" @click="edit(record, FeeType.RollingCasino)">
            {{ $t('common.button.edit') }}
          </a-typography-link>
        </a-space>
      </template>
      <template v-if="column.dataIndex === 'user_Id'">
        <span class="q-pl-sm">{{ record.user_Id }}</span>
      </template>
      <template v-if="column.dataIndex === 'slot'">
        <a-space :size="10" v-if="editableDataSlot[record.idx]">
          <a-input-number
            v-model:value="editableDataSlot[record.idx].slot_Fee"
            :min="0"
            :max="100"
            :formatter="(value:any) => `${value}%`"
            :parser="(value:any) => value.replace('%', '')" />
          <a-typography-link @click="save(record.idx, FeeType.RollingSlot)">
            {{ $t('common.button.save') }}
          </a-typography-link>
          <a-typography-link @click="cancel(record.idx, FeeType.RollingSlot)">{{
            $t('common.button.cancel')
          }}</a-typography-link>
        </a-space>
        <a-space :size="10" v-else>
          <span>{{ record.slot_Fee }}%</span>
          <a-typography-link v-if="record.isModify" @click="edit(record, FeeType.RollingSlot)">
            {{ $t('common.button.edit') }}
          </a-typography-link>
        </a-space>
      </template>

      <template v-if="column.dataIndex === 'losing'">
        <a-space :size="10" v-if="editableDataLosing[record.idx]">
          <a-input-number
            v-model:value="editableDataLosing[record.idx].losing_Fee"
            :min="0"
            :max="100"
            :formatter="(value:any) => `${value}%`"
            :parser="(value:any) => value.replace('%', '')" />
          <a-typography-link @click="save(record.idx, FeeType.Losing)">
            {{ $t('common.button.save') }}
          </a-typography-link>
          <a-typography-link @click="cancel(record.idx, FeeType.Losing)">{{
            $t('common.button.cancel')
          }}</a-typography-link>
        </a-space>
        <a-space :size="10" v-else>
          <span>{{ record.losing_Fee }}%</span>
          <a-typography-link v-if="record.isModify" @click="edit(record, FeeType.Losing)">
            {{ $t('common.button.edit') }}
          </a-typography-link>
        </a-space>
      </template>
    </template>
    <template #expandIcon="{ record, expanded, onExpand }">
      <q-icon
        :name="expanded ? 'indeterminate_check_box' : 'add_box'"
        :class="{ null: record.children.length <= 0 }"
        class="q-icon"
        @click="(e:any)=>onExpand(record,e)" />
    </template>
  </a-table>
</template>

<script setup lang="ts">
import { extend } from 'quasar';
import { storeToRefs } from 'pinia';
import type { UnwrapRef } from 'vue';
import { onBeforeMount, ref, reactive } from 'vue';

import { apis } from 'src/stores/apis';
import { RewardType, FeeType, UserType } from 'src/components/models/enums';
import { onTree } from 'src/boot/global';
import { userStore } from 'src/stores/user';
import { useRoute } from 'vue-router';

const route = useRoute();
const { memberType } = storeToRefs(userStore.sign());
const sendData = ref<IDataTableDetail>({ user_Idx: Number(route.params.idx) });

const rows = ref<any[]>([]);
const loading = ref(false);

const columns = ref<any[]>([
  {
    dataIndex: 'user_Id',
    title: 'table.thead.user_id',
    key: 'id',
    width: '40%',
    // align: 'left',
  },
  {
    title: 'table.thead.rolling_fee',
    key: 'rolling',
    children: [
      {
        title: 'table.thead.casino',
        dataIndex: 'casino',
        key: 'casino',
        width: '30%',
      },
      {
        title: 'table.thead.slot',
        dataIndex: 'slot',
        key: 'slot',
        width: '30%',
      },
    ],
    // align: 'left',
  },
  {
    dataIndex: 'losing',
    title: 'table.thead.losing_fee',
    key: 'losing',
    width: '60%',
    // align: 'left',
  },
]);

const rewardType = ref(true);

const editableDataCasino: UnwrapRef<Record<string, any>> = reactive({});
const editableDataSlot: UnwrapRef<Record<string, any>> = reactive({});
const editableDataLosing: UnwrapRef<Record<string, any>> = reactive({});

const edit = (data: any, type: number) => {
  if (type === FeeType.RollingCasino) editableDataCasino[data.idx] = extend(true, {}, data);
  if (type === FeeType.RollingSlot) editableDataSlot[data.idx] = extend(true, {}, data);
  if (type === FeeType.Losing) editableDataLosing[data.idx] = extend(true, {}, data);
};

const save = async (key: any, type: number) => {
  const send = {
    user_Idx:
      type === FeeType.RollingCasino
        ? editableDataCasino[key].idx
        : type === FeeType.RollingSlot
        ? editableDataSlot[key].idx
        : editableDataLosing[key].idx,
    feeRate:
      type === FeeType.RollingCasino
        ? editableDataCasino[key].casino_Fee
        : type === FeeType.RollingSlot
        ? editableDataSlot[key].slot_Fee
        : editableDataLosing[key].losing_Fee,
    fee_Type: type,
    referral_Idx:
      type === FeeType.RollingCasino
        ? editableDataCasino[key].referral_Idx
        : type === FeeType.RollingSlot
        ? editableDataSlot[key].referral_Idx
        : editableDataLosing[key].referral_Idx,
  };

  try {
    const response =
      memberType.value === UserType.Manager
        ? await apis.manager.UserRewardSetting(send)
        : await apis.partner.UserRewardSetting(send);
    if (response.data.errCode === 0) {
      await onRequest(sendData.value);
      cancel(key, type);
    }
  } catch (error) {
    console.error(error);
  }
};
const cancel = (key: string, type: number) => {
  if (type === FeeType.RollingCasino) delete editableDataCasino[key];
  if (type === FeeType.RollingSlot) delete editableDataSlot[key];
  if (type === FeeType.Losing) delete editableDataLosing[key];
};

const onRequest = async (send: IDataTableDetail) => {
  loading.value = true;
  try {
    const response =
      memberType.value === UserType.Manager
        ? await apis.manager.UserRewardList(send)
        : await apis.partner.UserRewardList(send);

    if (response.data.errCode === 0) {
      const returnData = response.data.returnData;
      rewardType.value = returnData[0].rewardType === RewardType.Rolling;
      rows.value = onTree(returnData);
      loading.value = false;
    }
  } catch (error) {
    console.error(error);
  }
};

onBeforeMount(async () => {
  await onRequest(sendData.value);
});
</script>

<style lang="scss" scoped>
.q-icon {
  // margin-right: 1rem;
  cursor: pointer;
  &.null {
    opacity: 0;
  }
}
</style>

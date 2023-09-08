<template>
  <a-row :gutter="[8, 8]" class="q-mb-sm" v-if="$props.type === UserType.Manager">
    <a-col span="12">
      <a-button type="primary" @click="createAffiliateModal(true)">
        {{ $t('modal.title.affiliate_register') }}
      </a-button>
    </a-col>
    <a-col span="12" class="text-right"></a-col>
  </a-row>
  <a-table
    :key="rows"
    :row-key="(record:any) => record.idx"
    :columns="columns"
    :data-source="rows"
    :loading="loading"
    bordered
    :defaultExpandAllRows="true"
    class="tree-table">
    <template #headerCell="{ title, column }">
      <template v-if="column.dataIndex === 'user_Id'">
        {{ $t(title) }}
        ({{ $t('table.thead.nick') }})
      </template>
      <template v-else-if="['losing_Fee', 'casino_Fee', 'slot_Fee'].includes(column.dataIndex)">
        {{ $t(title) }} (%)
      </template>
      <template v-else>
        {{ $t(title) }}
      </template>
    </template>
    <template #bodyCell="{ column, record }">
      <template v-if="column.dataIndex === 'user_Id'">
        <UserBtn :idx="record.idx" :id="record.user_Id" :type="record.rewardType" :status="record.status" />
        ({{ record.nick }})
      </template>

      <template v-if="column.dataIndex === 'role'">
        {{ options.role.filter((e: any) => e.value === record.role)[0].label() }}
      </template>
      <template v-if="column.dataIndex === 'rewardType'">
        <template v-if="options.rewardType.filter((e: any) => e.value === record.rewardType).length > 0">
          {{ options.rewardType.filter((e: any) => e.value === record.rewardType)[0].label() }}
        </template>
        <template v-else>-</template>
      </template>
      <template v-if="column.dataIndex === 'status'">
        {{ options.userStatus.filter((e: any) => e.value === record.status)[0].label() }}
      </template>
    </template>
    <template #expandIcon="{ record, expanded, onExpand }">
      <component
        v-if="record.children.length !== 0"
        :is="!expanded ? PlusSquareOutlined : MinusSquareOutlined"
        @click="(e:any)=>onExpand(record,e)"
        class="tree-icon" />
      <span v-if="record.referral_Idx !== 0 && record.children.length === 0" class="empty-icon"></span>
    </template>
  </a-table>

  <CreateAffiliate :show="isCreateAffiliate" @update:show="createAffiliateModal" />
</template>

<script setup lang="ts">
import UserBtn from 'src/components/UserBtn.vue';
import CreateAffiliate from 'components/modals/CreateAffiliate.vue';

import { onMounted, ref } from 'vue';
import { PlusSquareOutlined, MinusSquareOutlined } from '@ant-design/icons-vue';

import { comma, onTree, options } from 'src/boot/global';
import { UserType } from 'src/components/models/enums';
import { apis } from 'src/stores/apis';

const props = defineProps({
  type: {
    type: String,
    required: true,
  },
});

const rows = ref<any[]>([]);
const loading = ref(false);
const isCreateAffiliate = ref<boolean>(false);

const columns = ref<any[]>([
  {
    dataIndex: 'user_Id',
    key: 'user_Id',
    title: 'table.thead.user_id',
  },
  {
    dataIndex: 'role',
    key: 'role',
    title: 'table.thead.role',
    width: '12rem',
  },
  {
    dataIndex: 'level',
    key: 'level',
    title: 'table.thead.level',
    width: '10rem',
  },
  {
    dataIndex: 'rewardType',
    title: 'table.thead.reward_type',
    key: 'rewardType',
  },
  {
    dataIndex: 'cash',
    title: 'table.thead.cash',
    key: 'cash',
    align: 'right',
    customRender: ({ text }: any) => comma(text),
  },
  {
    dataIndex: 'point',
    title: 'table.thead.point',
    key: 'point',
    align: 'right',
    customRender: ({ text }: any) => comma(text),
  },
  {
    dataIndex: 'rolling',
    title: 'table.thead.rolling',
    key: 'rolling',
    align: 'right',
    customRender: ({ text }: any) => comma(text),
  },
  {
    dataIndex: 'losing',
    title: 'table.thead.losing',
    key: 'losing',
    align: 'right',
    customRender: ({ text }: any) => comma(text),
  },
  {
    title: 'table.thead.rolling_fee',
    key: 'rolling_fee',
    children: [
      {
        title: 'table.thead.casino',
        dataIndex: 'casino_Fee',
        key: 'casino_Fee',
        align: 'right',
      },
      {
        title: 'table.thead.slot',
        dataIndex: 'slot_Fee',
        key: 'slot_Fee',
        align: 'right',
      },
    ],
  },
  {
    dataIndex: 'losing_Fee',
    key: 'losing_Fee',
    title: 'table.thead.losing_fee',
    align: 'right',
  },
  {
    dataIndex: 'status',
    title: 'table.thead.status',
    key: 'status',
    width: '10rem',
  },
]);

const onRequest = async () => {
  loading.value = true;
  const send = {
    currentPage: 1,
    currentPageSize: 10,
  };
  try {
    const response =
      props.type === UserType.Manager
        ? await apis.manager.MemberStructuralDiagram(send)
        : await apis.partner.MemberStructuralDiagram(send);
    if (response.data.errCode === 0) {
      const returnData = response.data.returnData;
      rows.value = onTree(returnData);

      loading.value = false;
    }
  } catch (error) {
    console.error(error);
  }
};

const createAffiliateModal = (value: boolean) => {
  isCreateAffiliate.value = value;
  if (!value) onRequest();
};

onMounted(() => {
  onRequest();
});
</script>
<style lang="scss" scoped>
.tree-icon {
  font-size: 1.5rem;
  margin-right: 1rem;
  line-height: 1;
  display: inline-flex;
  align-items: center;
}
.empty-icon {
  display: inline-flex;
  align-items: center;
  width: 1rem;
  height: 1rem;
  margin-right: 1rem;
  margin-left: 1rem;
  border-left: 1px solid rgba(0, 0, 0, 0.5);
  border-bottom: 1px solid rgba(0, 0, 0, 0.5);
}
</style>

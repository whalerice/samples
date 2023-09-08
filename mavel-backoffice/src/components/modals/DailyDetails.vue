<template>
  <a-modal
    class="daily-details"
    centered
    v-model:visible="visible"
    :destroyOnClose="true"
    :footer="false"
    @ok="onClose">
    <template #title>
      {{ type === 'date' ? propsData?.fullDate : propsData?.date }}
    </template>
    <a-tabs v-model:activeKey="tabKey" @change="handelTabChange">
      <a-tab-pane v-for="item in options.paymentInquireType" :key="item.value" :tab="item?.label()"></a-tab-pane>
    </a-tabs>
    <a-table
      size="small"
      :data-source="data"
      :loading="loading"
      :pagination="pagination"
      :scroll="{ x: true }"
      :columns="columnController(tabKey)"
      @change="handleTableChange"
      @resizeColumn="handleResizeColumn">
    </a-table>
  </a-modal>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { computed, ref, onBeforeUpdate, createVNode } from 'vue';
import { PaymentType, CurrencyType } from 'src/components/models/enums';
import { comma, options } from 'src/boot/global';
import { apis } from 'src/stores/apis';
import { userStore } from 'src/stores/user';

const { t } = useI18n();
const { memberType } = storeToRefs(userStore.sign());
const emits = defineEmits(['update:show']);
const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  data: {
    type: Object || null,
    required: false,
  },
});
const data = ref([]);
const type = ref('date');
const tabKey = ref(PaymentType.Cash);
const columns = [
  [
    {
      title: () => t('table.thead.user_id'),
      dataIndex: 'user_Id',
      align: 'center',
    },
    {
      title: () => t('table.thead.use_type'),
      dataIndex: 'use_Type',
      customRender(data: any) {
        const type = data?.value;
        if (type !== undefined) {
          const match = options.useCategory.filter((e: any) => {
            return e.value === type;
          });
          return createVNode('span', null, match[0]?.label());
        }
      },
      align: 'center',
    },
    {
      title: () => t('table.thead.use_detail'),
      dataIndex: 'use_Detail',
    },
    {
      title: () => t('table.thead.cash'),
      dataIndex: 'cash',
      align: 'right',
      customRender(data: any) {
        return createVNode('span', null, comma(data.value));
      },
    },
    {
      title: () => t('table.thead.after_cash'),
      dataIndex: 'after_Cash',
      align: 'right',
      customRender(data: any) {
        return createVNode('span', null, comma(data.value));
      },
    },
    {
      title: () => t('table.thead.add_time_using'),
      dataIndex: 'addTime',
    },
  ],
  [
    {
      title: () => t('table.thead.user_id'),
      dataIndex: 'user_Id',
      align: 'center',
    },
    {
      title: () => t('table.thead.use_type'),
      dataIndex: 'use_Type',
      customRender(data: any) {
        const type = data?.value;
        if (type !== undefined) {
          const match = options.pointUseType.filter((e: any) => {
            return e.value === type;
          });
          return createVNode('span', null, match[0]?.label());
        }
      },
      align: 'center',
    },
    {
      title: () => t('table.thead.use_detail'),
      dataIndex: 'use_Detail',
    },
    {
      title: () => t('table.thead.point'),
      dataIndex: 'point',
      align: 'right',
      customRender(data: any) {
        return createVNode('span', null, comma(data.value));
      },
    },
    {
      title: () => t('table.thead.after_point'),
      dataIndex: 'after_Point',
      align: 'right',
      customRender(data: any) {
        return createVNode('span', null, comma(data.value));
      },
    },
    {
      title: () => t('table.thead.add_time_using'),
      dataIndex: 'addTime',
    },
  ],
  [
    {
      title: () => t('table.thead.user_id'),
      dataIndex: 'user_Id',
      align: 'center',
    },
    {
      title: () => t('table.thead.pg_name'),
      dataIndex: 'pG_Name',
      align: 'center',
    },
    {
      title: () => t('table.thead.order_number'),
      dataIndex: 'order_Number',
    },
    {
      title: () => t('table.thead.order_name'),
      dataIndex: 'order_Name',
    },
    {
      title: () => t('table.thead.currency_type'),
      dataIndex: 'currency_Type',
      customRender(data: any) {
        const type = data?.value;
        if (type !== undefined) {
          const match = Object.keys(CurrencyType).filter((e: any) => {
            return CurrencyType[e] === type;
          });
          return createVNode('span', null, t(match[0]));
        }
      },
    },
    {
      title: () => t('table.thead.price'),
      dataIndex: 'price',
      align: 'right',
      customRender(data: any) {
        return createVNode('span', null, comma(data.value));
      },
    },
    {
      title: () => t('table.thead.pg_approval_no'),
      dataIndex: 'pg_Approval_No',
    },
    {
      title: () => t('table.thead.add_time_request'),
      dataIndex: 'addTime',
    },
    {
      title: () => t('table.thead.processing_date'),
      dataIndex: 'processing_Date',
    },
  ],
];
const loading = ref(true);
const totalCount = ref(0);
const current = ref(1);
const pageSize = ref(10);

const propsData = computed<any>(() => props.data);
const visible = computed({
  get() {
    return props.show;
  },
  set(value) {
    emits('update:show', value);
  },
});
const pagination = computed(() => ({
  total: totalCount.value,
  current: current.value,
  pageSize: pageSize.value,
}));

const onClose = () => {
  visible.value = false;
};
const reset = () => {
  loading.value = true;
  data.value = [];
  tabKey.value = PaymentType.Cash;
};
const onRequest = async () => {
  const getData = propsData.value.data;
  const member: string = memberType.value.toLowerCase();

  if (getData !== null && type.value === 'date') {
    if (member === 'manager') {
      try {
        const response = await apis.manager.SiteCalendarDetail({
          Day: getData?.date,
          Payment: tabKey.value,
          CurrentPage: pagination.value.current,
          CurrentPageSize: pagination.value.pageSize,
        });

        const getResponse = response.data;

        if (getResponse.errCode === 0) {
          totalCount.value = getResponse.returnData.totalCount.count;
          data.value = getResponse.returnData.list;
          loading.value = false;
        }
      } catch (error) {
        console.error(error);
      }
    } else if (member === 'partner') {
      try {
        const response = await apis.partner.SiteCalendarDetail({
          Day: getData?.date,
          Payment: tabKey.value,
          CurrentPage: pagination.value.current,
          CurrentPageSize: pagination.value.pageSize,
        });

        const getResponse = response.data;

        if (getResponse.errCode === 0) {
          totalCount.value = getResponse.returnData.totalCount.count;
          data.value = getResponse.returnData.list;
          loading.value = false;
        }
      } catch (error) {
        console.error(error);
      }
    }
  }
};
const handleTableChange = (pag: any) => {
  totalCount.value = pag.total;
  current.value = pag.current;
  pageSize.value = pag.pageSize;
  onRequest();
};
const handleResizeColumn = (w: any, col: any) => {
  col.width = w;
};
const handelTabChange = () => {
  totalCount.value = 0;
  current.value = 1;
  pageSize.value = 10;
  loading.value = true;
  onRequest();
};
const columnController = (tabKey: number) => {
  if (tabKey === PaymentType.Charging || tabKey === PaymentType.Exchange) {
    return columns[2];
  } else {
    return columns[tabKey - 1];
  }
};
onBeforeUpdate(() => {
  const data = propsData.value;
  if (data != null) {
    data.info === undefined ? (type.value = 'date') : (type.value = 'total');
    reset();
    onRequest();
  }
});
</script>

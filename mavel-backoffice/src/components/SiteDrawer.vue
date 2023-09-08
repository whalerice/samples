<template>
  <a-drawer
    :width="800"
    :placement="placement"
    :visible="visible"
    @close="onClose"
    :closable="false"
    :destroyOnClose="true">
    <a-descriptions
      :title="props.idx !== null ? $t('drawer.title.site_detail') : $t('drawer.title.site_register')"
      size="small"
      :column="1"
      bordered
      :labelStyle="{ width: '24rem' }">
      <template #extra>
        <a-button type="primary" @click="editToggle" v-if="!isEdit">{{ $t('common.button.edit') }}</a-button>
        <a-space :size="5" v-if="isEdit">
          <a-button @click="editToggle">{{ $t('common.button.cancel') }}</a-button>
          <a-button type="primary" v-if="props.idx !== null" @click="onEdit">
            {{ $t('common.button.confirm') }}
          </a-button>
          <a-button type="primary" v-if="props.idx === null" @click="onRegister">
            {{ $t('common.button.confirm') }}
          </a-button>
        </a-space>
      </template>
      <a-descriptions-item :label="$t('common.label.solution')" v-if="props.idx === null">
        <a-select
          ref="select"
          v-model:value="solutionIdx"
          :options="solution"
          class="full-width"
          :placeholder="$t('common.placeholder.select_solution')" />
      </a-descriptions-item>
      <a-descriptions-item :label="$t('common.label.name')">
        <template v-if="!isEdit">{{ getData.name }}</template>
        <a-input v-if="isEdit" v-model:value="getData.name" :placeholder="$t('common.placeholder.enter_site_name')" />
      </a-descriptions-item>
      <a-descriptions-item :label="$t('common.label.inspection')">
        <template v-if="!isEdit">{{ getData.inspection }}</template>
        <a-switch v-if="isEdit" v-model:checked="getData.inspection" size="small" />
      </a-descriptions-item>
      <a-descriptions-item :label="$t('common.label.auto_approval')">
        <template v-if="!isEdit">{{ getData.autoApproval }}</template>
        <a-switch v-if="isEdit" v-model:checked="getData.autoApproval" size="small" />
      </a-descriptions-item>
      <a-descriptions-item :label="$t('common.label.site_status')">
        <template v-if="!isEdit">
          {{ options.userStatus.filter((e: any) => e.value === getData.status)[0]?.label() }}
        </template>
        <a-select v-if="isEdit" v-model:value="getData.status" :options="options.userStatus" class="full-width" />
      </a-descriptions-item>
      <a-descriptions-item :label="$t('common.label.currency')">
        <template v-if="!isEdit">
          {{ options.currencyType.filter((e: any) => e.value === getData.currency)[0]?.label }}
        </template>
        <a-select v-if="isEdit" v-model:value="getData.currency" :options="options.currencyType" class="full-width" />
      </a-descriptions-item>
      <a-descriptions-item :label="$t('common.label.rolling')">
        <template v-if="!isEdit">{{ comma(getData.exchange_Rolling) + '%' }}</template>
        <a-input-number
          v-if="isEdit"
          v-model:value="getData.exchange_Rolling"
          :min="0"
          :formatter="(value:any) => `${value}%`"
          :parser="(value:any) => value.replace('%', '')"
          class="text-right" />
      </a-descriptions-item>
      <a-descriptions-item :label="$t('common.label.losing')">
        <template v-if="!isEdit">{{ comma(getData.exchange_Losing) + '%' }}</template>
        <a-input-number
          v-if="isEdit"
          v-model:value="getData.exchange_Losing"
          :min="0"
          :formatter="(value:any) => `${value}%`"
          :parser="(value:any) => value.replace('%', '')"
          class="text-right" />
      </a-descriptions-item>
      <a-descriptions-item :label="$t('common.label.exchange_amount')">
        <template v-if="!isEdit">{{ comma(getData.exchange_Amount) }}</template>
        <a-input-number
          v-if="isEdit"
          v-model:value="getData.exchange_Amount"
          :min="0"
          :formatter="(value:any) => comma(value)"
          oninput="javascript: this.value = this.value.replace(/[^0-9]/g, '' );"
          class="text-right" />
      </a-descriptions-item>
      <a-descriptions-item :label="$t('common.label.charge_amount')">
        <template v-if="!isEdit">{{ comma(getData.charge_Amount) }}</template>
        <a-input-number
          v-if="isEdit"
          v-model:value="getData.charge_Amount"
          :min="0"
          :formatter="(value:any) => comma(value)"
          oninput="javascript: this.value = this.value.replace(/[^0-9]/g, '' );"
          class="text-right" />
      </a-descriptions-item>
      <a-descriptions-item :label="$t('common.label.charge_interval_time')">
        <template v-if="!isEdit">{{ comma(getData.charge_Interval_Time) }}</template>
        <a-input-number
          v-if="isEdit"
          v-model:value="getData.charge_Interval_Time"
          :min="0"
          oninput="javascript: this.value = this.value.replace(/[^0-9]/g, '' );"
          class="text-right" />
      </a-descriptions-item>
      <a-descriptions-item :label="$t('common.label.exchange_interval_time')">
        <template v-if="!isEdit">{{ comma(getData.exchange_Interval_Time) }}</template>
        <a-input-number
          v-if="isEdit"
          v-model:value="getData.exchange_Interval_Time"
          :min="0"
          oninput="javascript: this.value = this.value.replace(/[^0-9]/g, '' );"
          class="text-right" />
      </a-descriptions-item>
      <a-descriptions-item :label="$t('common.label.start_date')">
        <a-date-picker
          v-model:value="startDate"
          :format="dateFormat"
          :disabled="!isEdit"
          :class="{ readonly: !isEdit }" />
      </a-descriptions-item>
      <a-descriptions-item :label="$t('common.label.end_date')">
        <a-date-picker
          v-model:value="endDate"
          :format="dateFormat"
          :disabled="!isEdit"
          :class="{ readonly: !isEdit }" />
      </a-descriptions-item>
    </a-descriptions>

    <a-row class="q-mt-xl" :gutter="[0, 30]" v-if="props.idx !== null">
      <a-col span="24">
        <SiteBlockIpList />
      </a-col>
      <a-col span="24">
        <BackOfficeAllowIpList :idx="selectSiteIdx" />
      </a-col>
    </a-row>
  </a-drawer>
</template>

<script setup lang="ts">
import SiteBlockIpList from 'components/setting/SiteBlockIpList.vue';
import BackOfficeAllowIpList from 'components/setting/BackOfficeAllowIpList.vue';

import dayjs, { Dayjs } from 'dayjs';
import { storeToRefs } from 'pinia';
import { message } from 'ant-design-vue';
import type { DrawerProps } from 'ant-design-vue';
import { ref, computed, onMounted } from 'vue';

import { comma, options } from 'src/boot/global';
import { commonStore } from 'src/stores/common';
import { apis } from 'src/stores/apis';

const { solution } = storeToRefs(commonStore.board());

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  idx: {
    type: Number || null,
    required: true,
  },
});

const show = computed({
  get() {
    return props.show;
  },
  set(value) {
    emits('close', value);
  },
});

const emits = defineEmits(['close']);

const startDate = ref<Dayjs | undefined>();
const endDate = ref<Dayjs | undefined>();
const dateFormat = 'YYYY-MM-DD';

interface IDetails {
  addTime: string;
  autoApproval: boolean;
  charge_Amount: number;
  charge_Interval_Time: number;
  currency: number;
  exchange_Amount: number;
  exchange_Interval_Time: number;
  exchange_Losing: number;
  exchange_MaxAmount: number;
  exchange_Rolling: number;
  idx: number;
  inspection: boolean;
  name: string;
  solution_Idx: number;
  status: number;
  start_Date: string;
  end_Date: string;
}

const solutionIdx = ref<number>();
const visible = ref<boolean>(true);
const isEdit = ref<boolean>(false);
const placement = ref<DrawerProps['placement']>('right');
const getData = ref<IDetails>({
  addTime: '',
  autoApproval: false,
  charge_Amount: 0,
  charge_Interval_Time: 0,
  currency: 1,
  exchange_Amount: 0,
  exchange_Interval_Time: 0,
  exchange_Losing: 0,
  exchange_MaxAmount: 0,
  exchange_Rolling: 0,
  idx: 0,
  inspection: false,
  name: '',
  solution_Idx: 0,
  status: 1,
  start_Date: '',
  end_Date: '',
});

const selectSiteIdx = ref<number | null>(null);

const onClose = () => {
  visible.value = false;
  show.value = false;
};

const siteDetail = async () => {
  try {
    const response = await apis.manager.SiteDetail({ Idx: props.idx });

    if (response.data.errCode === 0) {
      getData.value = response.data.returnData;
      startDate.value = dayjs(getData.value.start_Date, dateFormat);
      endDate.value = dayjs(getData.value.end_Date, dateFormat);
    }
  } catch (error) {
    console.error(error);
  }
};

const editToggle = () => {
  isEdit.value = !isEdit.value;
};

const onEdit = async () => {
  const send = {
    idx: props.idx,
    name: getData.value.name,
    exchange_Rolling: getData.value.exchange_Rolling,
    exchange_Losing: getData.value.exchange_Losing,
    exchange_Amount: getData.value.exchange_Amount,
    exchange_Interval_Time: getData.value.exchange_Interval_Time,
    charge_Amount: getData.value.charge_Amount,
    charge_Interval_Time: getData.value.charge_Interval_Time,
    currency: getData.value.currency,
    inspection: getData.value.inspection,
    status: getData.value.status,
    autoApproval: getData.value.autoApproval,
    start_date: dayjs(startDate.value).format(dateFormat),
    end_date: dayjs(endDate.value).format(dateFormat),
  };

  try {
    const response = await apis.manager.SiteModify(send);
    if (response.data.errCode === 0) {
      isEdit.value = false;
      siteDetail();
    }
  } catch (error) {
    console.error(error);
  }
};

const onRegister = async () => {
  const send = {
    name: getData.value.name,
    exchange_Rolling: getData.value.exchange_Rolling,
    exchange_Losing: getData.value.exchange_Losing,
    exchange_Amount: getData.value.exchange_Amount,
    exchange_Interval_Time: getData.value.exchange_Interval_Time,
    charge_Amount: getData.value.charge_Amount,
    charge_Interval_Time: getData.value.charge_Interval_Time,
    currency: getData.value.currency,
    inspection: getData.value.inspection,
    status: getData.value.status,
    autoApproval: getData.value.autoApproval,
    start_date: dayjs(startDate.value).format(dateFormat),
    end_date: dayjs(endDate.value).format(dateFormat),
  };

  try {
    const response = await apis.manager.SiteRegister(send);
    if (response.data.errCode === 0) {
      visible.value = false;
      isEdit.value = false;
      setTimeout(() => {
        message.success(response.data.errMessage);
      }, 500);
    }
  } catch (error) {
    console.error(error);
  }
};

onMounted(() => {
  if (props.idx !== null) {
    siteDetail();
    selectSiteIdx.value = props.idx;
  } else {
    isEdit.value = true;
  }
});
</script>

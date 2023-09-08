<template>
  <a-modal class="cpeso-verification-modal" :visible="isVisible" @cancel="close" :width="'100%'" :maskClosable="false">
    <template #title>
      <span class="text">{{ $t('common.label.file_verification') }}</span>
    </template>
    <template #footer>
      <a-button @click="close">{{ $t('common.button.cancel') }}</a-button>
      <a-button type="primary" :loading="saveLoading" @click="handleSave">
        {{ $t('common.button.save') }}
      </a-button>
    </template>
    <a-table
      class="cpeso-verification-table"
      :class="['datatable', { 'is-mobile': isMobile }]"
      :columns="columns"
      :pagination="false"
      :data-source="dataSource"
      :loading="loading"
      :showSorterTooltip="false"
      @change="handleTableChange"
      @resizeColumn="handleResizeColumn"
    >
      <template #headerCell="{ title }"> {{ t(title) }}</template>
      <template #bodyCell="{ text, record, column }">
        <template v-if="isMobile">
          {{ $t(column.title) }} :
          <span
            v-if="
              column.dataIndex !== 'price' &&
              column.dataIndex !== 'state' &&
              column.dataIndex !== 'addr' &&
              column.dataIndex !== 'coin_Cd' &&
              column.dataIndex !== 'currency_Type' &&
              column.dataIndex !== 'checkMessage'
            "
            >{{ text }}</span
          >
        </template>
        <template v-if="column.dataIndex === 'note'">
          <a-typography-link
            v-if="text !== null"
            :style="{ width: '10ch' }"
            :ellipsis="true"
            :content="text"
            @click="openNote(record)"
          />
        </template>
        <template v-if="column.dataIndex === 'state'">
          <a-typography-text v-if="text === Enum.cpesoVerificationStateType.ProcessingPayout">
            {{ $t('datatable.text.processing_payout') }}
          </a-typography-text>
          <a-typography-text v-if="text === Enum.cpesoVerificationStateType.Unfinished">
            {{ $t('datatable.text.unfinished') }}
          </a-typography-text>
          <a-typography-text v-if="text === Enum.cpesoVerificationStateType.PayoutComplete">
            {{ $t('datatable.text.payout_complete') }}
          </a-typography-text>
        </template>
        <template v-if="column.dataIndex === 'checkMessage'">
          <a-typography-text strong>
            {{ text?.verification_Result ? 'O' : 'X' }}
          </a-typography-text>
          <a-typography-text
            v-if="text?.verification_Message === Enum.cpesoVerificationType.AlreadyCompleted"
            type="success"
          >
            ({{ $t('datatable.text.already_completed') }})
          </a-typography-text>
          <a-typography-text
            v-if="text?.verification_Message === Enum.cpesoVerificationType.VerificationComplete"
            type="success"
          >
            ({{ $t('datatable.text.verification_complete') }})
          </a-typography-text>
          <a-typography-text
            v-if="
              text?.verification_Message === Enum.cpesoVerificationType.PaymentIdDuplicated &&
              record.status === 'Processing Payout'
            "
            type="danger"
          >
            ({{ $t('datatable.text.duplicate') }})
          </a-typography-text>
          <a-typography-text
            v-if="
              text?.verification_Message === Enum.cpesoVerificationType.PaymentIdDuplicated &&
              record.status === 'Payout Complete'
            "
            type="danger"
          >
            ({{ $t('datatable.text.duplicated_payment_id') }})
          </a-typography-text>
          <a-typography-text
            v-if="text?.verification_Message === Enum.cpesoVerificationType.AccountNotFound"
            type="danger"
          >
            ({{ $t('datatable.text.account_not_found') }})
          </a-typography-text>
          <a-typography-text
            v-if="text?.verification_Message === Enum.cpesoVerificationType.DisableAccount"
            type="danger"
          >
            ({{ $t('datatable.text.disable_account') }})
          </a-typography-text>
          <a-typography-text v-if="text?.verification_Message === Enum.cpesoVerificationType.Unfinished" type="danger">
            ({{ $t('datatable.text.unfinished') }})
          </a-typography-text>
        </template>
      </template>
    </a-table>
    <a-modal :title="$t('datatable.thead.note_from_customer')" :visible="noteVisible" @cancel="closeNote">
      <a-textarea v-model:value="noteData" :placeholder="$t('datatable.thead.note_from_customer')" :rows="4" readonly />
      <template #footer>
        <a-button @click="closeNote">{{ $t('common.button.close') }}</a-button>
      </template>
    </a-modal>
  </a-modal>
</template>
<script setup>
import { computed, watch, ref } from 'vue';
import { comma } from '@/assets/js/global';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { Enum } from '@/assets/js/enum';
import { apis } from '@/store/api';
import { notification } from 'ant-design-vue';

const { t } = useI18n();
const store = useStore();
const emits = defineEmits(['close', 'returnVerification']);
const propData = computed(() => props.data);
const props = defineProps({
  visible: {
    type: Boolean,
    require: true,
  },
  data: {
    type: Array,
    require: true,
  },
});
const isDeviceMobile = computed(() => store.state['common'].isDeviceMobile);
const isVisible = computed({
  get() {
    return props.visible;
  },
  set(val) {
    emits('close', val);
  },
});
const isMobile = ref(isDeviceMobile.value);
const saveLoading = ref(false);

const init = () => {
  setTimeout(() => {
    dataSource.value = null;
    saveLoading.value = false;
  }, 300);
};
const close = () => {
  isVisible.value = false;
};
const handleSave = async () => {
  const response = await apis.SetNextPayUpload(props.data);
  const getData = response.data;

  if (getData.errCode === 0) {
    isVisible.value = false;
    emits('returnVerification');
  } else {
    notification['error']({
      message: getData.errMessage,
    });
  }
};

//table
const columns = ref([
  {
    title: 'datatable.thead.request_date',
    dataIndex: 'date_Created',
    key: 'date_Created',
    align: 'left',
  },
  {
    title: 'datatable.thead.name',
    dataIndex: 'name',
    key: 'name',
    align: 'left',
  },
  {
    title: 'datatable.text.payment',
    dataIndex: 'payment_Method',
    key: 'payment_Method',
    align: 'left',
  },
  {
    title: 'datatable.thead.request_amount',
    dataIndex: 'amount',
    key: 'amount',
    align: 'right',
    customRender: ({ text }) => comma(text),
  },
  {
    title: 'datatable.thead.next_pay_fee',
    dataIndex: 'fee',
    key: 'fee',
    align: 'right',
    customRender: ({ text }) => comma(text),
  },
  {
    title: 'datatable.thead.email',
    dataIndex: 'email_Address',
    key: 'email_Address',
    align: 'left',
  },
  {
    title: 'datatable.thead.note_from_customer',
    dataIndex: 'note_From_Customer',
    key: 'note_From_Customer',
    align: 'left',
  },
  {
    title: 'datatable.thead.state',
    dataIndex: 'status',
    key: 'status',
    align: 'left',
  },
  {
    title: 'datatable.thead.verification',
    dataIndex: 'checkMessage',
    key: 'checkMessage',
    align: 'left',
  },
  {
    title: 'datatable.thead.payment_id',
    dataIndex: 'payment_Id',
    key: 'payment_Id',
    align: 'left',
  },
]);
const dataSource = ref();
//note
const noteVisible = ref(false);
const noteData = ref('');
const openNote = (val) => {
  noteVisible.value = true;
  noteData.value = val;
};
const closeNote = () => {
  noteVisible.value = false;
  setTimeout(() => {
    noteData.value = '';
  }, 300);
};

watch(
  propData,
  (val) => {
    dataSource.value = val;
  },
  { deep: true },
);

watch(isVisible, () => {
  if (!isVisible.value) init();
});
</script>

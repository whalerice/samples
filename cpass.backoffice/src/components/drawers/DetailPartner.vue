<template>
  <a-drawer :width="500" v-model:visible="visible">
    <template #title>
      <a-typography-text type="secondary" class="date">{{ data.date }}</a-typography-text>
      <a-typography-text class="id">{{ data.id }}</a-typography-text>
    </template>
    <div class="btn-group">
      <a-typography-text type="danger" style="margin-right: 2rem">
        {{ errMessage }}
      </a-typography-text>
      <a-button type="primary" v-if="data.state === 1" :loading="loading" @click="onApproval">
        {{ $t('common.button.approval') }}
      </a-button>
      <a-typography-text type="warning" v-if="data.state === 2">
        {{ $t('common.text.approval_progress') }}
      </a-typography-text>
      <a-typography-text type="danger" v-if="data.state === 40">{{ $t('common.text.withdrawal') }}</a-typography-text>
      <a-button v-if="data.state === 4" :loading="loading" @click="sendConfirmationEmail(data.user_Sn)">
        <fa-icon icon="envelope"></fa-icon>
        {{ $t('common.button.send_email') }}
      </a-button>
      <a-button type="primary" v-if="data.state === 10" :loading="loading" @click="onEdit">
        {{ $t('common.button.save') }}
      </a-button>
    </div>
    <a-form layout="vertical" class="partner-detail">
      <a-form-item :label="$t('drawer.label.partner_code')" v-bind="validateInfos.code">
        <a-input v-model:value="modelRef.code" :disabled="true" />
      </a-form-item>
      <a-form-item :label="$t('drawer.label.partner_name')" v-bind="validateInfos.name">
        <a-input v-model:value="modelRef.name" :placeholder="$t('drawer.placeholder.partner_name')" :disabled="true" />
      </a-form-item>
      <a-form-item :label="$t('drawer.label.type')">
        <a-input v-model:value="modelRef.type" disabled />
      </a-form-item>
      <a-form-item :label="$t('drawer.label.primary_currency')" v-bind="validateInfos.currency">
        <a-select
          v-model:value="modelRef.currency"
          :options="currencyList"
          :disabled="data.state === 2 || data.state === 4 || data.state === 40 || data.state === 10"
        />
      </a-form-item>
      <a-form-item label="Time zone" v-bind="validateInfos.timezone">
        <a-select
          v-model:value="modelRef.timezone"
          show-search
          placeholder="Select a timezone"
          :options="options"
          :filter-option="filterOption"
          :disabled="data.state === 2 || data.state === 4 || data.state === 40 || data.state === 10"
        ></a-select>
      </a-form-item>
      <a-form-item :label="$t('drawer.label.deposit_rate')" v-bind="validateInfos.partnerRate">
        <a-input
          v-model:value="modelRef.partnerRate"
          :placeholder="$t('drawer.label.deposit_rate')"
          suffix="%"
          :disabled="data.state === 2 || data.state === 4 || data.state === 40"
        />
      </a-form-item>
      <a-form-item :label="$t('drawer.label.withdraw_rate')" v-bind="validateInfos.withdrawRate">
        <a-input
          v-model:value="modelRef.withdrawRate"
          :placeholder="$t('drawer.label.withdraw_rate')"
          suffix="%"
          :disabled="data.state === 2 || data.state === 4 || data.state === 40"
        />
      </a-form-item>
      <a-form-item :label="$t('drawer.label.guarantee')" v-bind="validateInfos.guarantee" name="guarantee">
        <a-input
          v-model:value="modelRef.guarantee"
          class="text-right"
          :disabled="data.state === 2 || data.state === 4 || data.state === 40"
        />
        <a-typography-text type="danger">{{ newErrMessage.guarantee }}</a-typography-text>
      </a-form-item>
      <template v-if="true">
        <a-form-item :label="$t('drawer.label.encrypt_key')" v-if="data.state !== 1">
          <div class="input-copyable">
            <input class="ant-input" :value="encryptKey" readonly="readonly" />
            <a-typography-paragraph copyable>
              <span class="copy-text">{{ encryptKey }}</span>
            </a-typography-paragraph>
          </div>
        </a-form-item>
        <a-form-item :label="$t('drawer.label.vecter_key')" v-if="data.state !== 1">
          <div class="input-copyable">
            <input class="ant-input" :value="vecterKey" readonly="readonly" />
            <a-typography-paragraph copyable>
              <span class="copy-text">{{ vecterKey }}</span>
            </a-typography-paragraph>
          </div>
        </a-form-item>
        <a-form-item :label="$t('drawer.label.callback_url')" v-if="data.state !== 1">
          <a-textarea
            v-model:value="callbackUrl"
            :placeholder="$t('drawer.placeholder.no_callback_url')"
            :rows="4"
            :disabled="data.state !== 1 && data.state !== 10"
          />
        </a-form-item>
      </template>

      <a-form-item
        v-if="
          ((grade === auth.Supermaster || grade === auth.Supervisor) && getData.state === 5) || getData.state === 10
        "
        class="text-right"
      >
        <a-typography-link @click="openConfirmModal" :underline="true">
          {{ $t('common.button.withdraw_partner') }}
        </a-typography-link>
      </a-form-item>
    </a-form>
  </a-drawer>
  <ConfirmPassword :show="confirmVisible" :data="getData" @doubleConfirm="doubleConfirm" />
</template>
<script setup>
import { ref, computed, watch, onUpdated } from 'vue';
import { Form } from 'ant-design-vue';
import { decimal, comma, accessList, lottieModal } from '@/assets/js/global.js';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';

import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { createVNode } from 'vue';
import { Modal } from 'ant-design-vue';
import { auth } from '@/assets/js/global.js';
import ConfirmPassword from '@/components/modals/ConfirmPassword.vue';

const useForm = Form.useForm;
const { t } = useI18n();
const store = useStore();

const errData = computed(() => store.state['partner'].errData);
const currencyList = computed(() => store.state['sign'].currencyList);
const grade = computed(() => store.state['sign'].signInfo.grade);
const timezoneList = computed(() => store.state['sign'].timezoneList);
const callbackUrl = ref('');
const encryptKey = ref('');
const vecterKey = ref('');
const confirmVisible = ref(false);
const options = computed(() => {
  const arr = [];
  timezoneList.value.filter((e) => {
    arr.push({ value: e.timezone, label: e.timezone });
  });
  return arr;
});
const errCode = computed(() => store.state['common'].errCode);
const errMessage = computed(() => store.state['common'].errMessage);

const filterOption = (input, option) => {
  return option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};

const doubleConfirm = (val) => {
  confirmVisible.value = val;
  visible.value = val;
};
const newErrMessage = ref({
  guarantee: '',
});

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  data: {
    type: Object,
    required: false,
  },
});

const emit = defineEmits(['close', 'delete']);
const accessName = (val) => {
  const result = accessList.filter((e) => e.idx === val)[0];
  return result !== undefined ? result.name : '';
};
const visible = computed({
  get() {
    return props.show;
  },
  set(value) {
    emit('close', value);
  },
});

const getData = computed({
  get() {
    return props.data;
  },
});

const loading = ref(false);
const modelRef = ref({
  code: 0,
  name: '',
  grade: undefined,
  partnerRate: 0,
  withdrawRate: 0,
  guarantee: 0,
  currency: undefined,
  timezone: null,
  type: undefined,
});

const rulesRef = ref({
  code: [
    {
      required: false,
    },
  ],
  name: [
    {
      required: false,
      message: 'drawer.error_msg.partner_name',
      trigger: 'blur',
    },
  ],
  grade: [
    {
      required: false,
    },
  ],
  currency: [
    {
      required: false,
    },
  ],
  timezone: [
    {
      required: false,
    },
  ],
  partnerRate: [
    {
      required: false,
    },
  ],
  withdrawRate: [
    {
      required: false,
    },
  ],
  guarantee: [
    {
      required: false,
      message: 'drawer.error_msg.guarantee',
    },
  ],
});

const { validate, validateInfos } = useForm(modelRef, rulesRef);

const onApproval = () => {
  loading.value = true;
  validate()
    .then(async () => {
      const sendData = {
        User_Sn: getData.value.user_Sn,
        Currency_Type: modelRef.value.currency,
        partner_Rate: Number(modelRef.value.partnerRate) / 100,
        Withdraw_Rate: Number(modelRef.value.withdrawRate) / 100,
        Guarantee: Number(modelRef.value.guarantee.split(',').join('')),
        Partner_Grade: modelRef.value.grade,
        callback_Url: callbackUrl.value,
        timezone: modelRef.value.timezone,
      };
      await store.dispatch('partner/partnerApproval', sendData);
      loading.value = false;
      if (errCode.value === 0) {
        lottieModal(t('confirm.description.success_saved'), 'setting', 1.5);
        visible.value = false;
      }
    })
    .catch((err) => {
      loading.value = false;
      console.error(err);
    });
};

const onEdit = () => {
  loading.value = true;
  validate()
    .then(async () => {
      const sendData = {
        User_Sn: getData.value.user_Sn,
        timezone: modelRef.value.timezone,
        Currency_Type: modelRef.value.currency,
        partner_Rate: Number(modelRef.value.partnerRate) / 100,
        Withdraw_Rate: Number(modelRef.value.withdrawRate) / 100,
        Guarantee: Number(modelRef.value.guarantee.split(',').join('')),
        Partner_Grade: modelRef.value.grade,
        callback_Url: callbackUrl.value,
      };
      await store.dispatch('partner/partnerUpdate', sendData);
      loading.value = false;
    })
    .catch((err) => {
      loading.value = false;
      console.error(err);
    });
};

const sendConfirmationEmail = async (sn) => {
  await store.dispatch('partner/partnerApprovalGuaranteeMailSend', { User_Sn: sn });
  visible.value = false;
};

const openConfirmModal = () => {
  Modal.confirm({
    title: t('confirm.title.change_status_withdrawal_partner'),
    icon: createVNode(ExclamationCircleOutlined),
    onOk() {
      confirmVisible.value = true;
    },

    onCancel() {},
  });
};

watch(modelRef.value, (val) => {
  if (val.partnerRate) {
    modelRef.value.partnerRate = decimal(val.partnerRate);
  }
  if (val.withdrawRate) {
    modelRef.value.withdrawRate = decimal(val.withdrawRate);
  }

  if (val.grade) {
    modelRef.value.type = accessName(val.grade);
  }

  if (val.guarantee) {
    modelRef.value.guarantee = comma(decimal(val.guarantee));
    if (newErrMessage.value.guarantee.length > 0) {
      newErrMessage.value.guarantee = '';
    }
  }
});

watch(errData, (val) => {
  switch (val.errCode) {
    case -1803:
      newErrMessage.value.guarantee = val.errMessage;
      break;
    default:
      break;
  }
});

watch(getData, () => {
  callbackUrl.value = getData.value.callback_Url;
  encryptKey.value = getData.value.encrypt_Key;
  vecterKey.value = getData.value.vecter_Key;
});

onUpdated(() => {
  // let currency;
  currencyList.value.filter((e) => e.label === getData.value.primary_currency).length !== 0
    ? (currency = currencyList.value.filter((e) => e.label === getData.value.primary_currency)[0].value)
    : null;

  modelRef.value.code = getData.value.code;
  modelRef.value.name = getData.value.name;
  modelRef.value.grade = getData.value.grade;
  modelRef.value.currency = getData.value.currency_Type;
  modelRef.value.partnerRate = decimal(getData.value.partner_Rate * 100);
  modelRef.value.withdrawRate = decimal(getData.value.withdraw_Rate * 100);
  modelRef.value.guarantee = comma(decimal(getData.value.guarantee));
  modelRef.value.timezone = getData.value.timezone;
});
</script>

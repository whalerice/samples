<template>
  <a-descriptions class="descriptions-label-width" bordered size="small" :column="2">
    <a-descriptions-item v-for="(item, idx) in info" :label="item.label()" :key="idx">
      <template v-if="item.key === 'grade' && data.grade">
        {{ getPartnerType(t, data.grade).label() }}
      </template>
      <template v-else-if="item.key === 'currency_Type'">
        <a-select
          v-model:value="data[item.key]"
          :options="currencyList"
          :disabled="item.disabled.includes(data.state)"
        />
      </template>
      <template v-else-if="item.key === 'timezone'">
        <a-select
          v-model:value="data[item.key]"
          class="input-timezone"
          show-search
          :options="options"
          :filter-option="filterOption"
          :disabled="item.disabled.includes(data.state)"
        />
      </template>
      <template v-else-if="item.key === 'partner_Rate' || item.key === 'withdraw_Rate'">
        <a-input
          class="input-fee-rate"
          suffix="%"
          v-model:value="data[item.key]"
          :disabled="item.disabled.includes(data.state)"
        />
      </template>
      <template v-else-if="item.key === 'guarantee'">
        <a-input v-model:value="data[item.key]" :disabled="item.disabled.includes(data.state)" />
      </template>
      <template v-else-if="item.key === 'callback_Url'">
        <a-input
          v-if="item.hide !== data.state"
          v-model:value="data[item.key]"
          :rows="4"
          :disabled="item.disabled.includes(data.state)"
        />
      </template>
      <template v-else-if="item.key === 'encrypt_Key' || item.key === 'vector_Key'">
        <template v-if="item.hide !== data.state">
          {{ data[item.key] }}
        </template>
      </template>
      <template v-else>
        {{ data[item.key] }}
      </template>
    </a-descriptions-item>
  </a-descriptions>

  <a-row type="flex" justify="end" class="mt-10" style="align-items: center">
    <template
      v-if="((grade === auth.Supermaster || grade === auth.Supervisor) && data.state === 5) || data.state === 10"
    >
      <a-typography-link class="partner-withdrawal-btn" @click="openConfirmModal" :underline="true">
        {{ $t('common.button.withdraw_partner') }}
      </a-typography-link>
    </template>
    <a-button v-if="data.state === 1" type="primary" :disabled="isDisable" @click="onApproval">
      {{ $t('common.button.approval') }}
    </a-button>
    <a-button type="primary" v-if="data.state === 10" :loading="isLoading" :disabled="isDisable" @click="onEdit">
      {{ $t('common.button.save') }}
    </a-button>
    <a-button v-if="data.state === 4" :loading="isLoading" @click="sendConfirmationEmail()">
      <fa-icon icon="envelope"></fa-icon>
      {{ $t('common.button.send_email') }}
    </a-button>
  </a-row>
  <ConfirmPassword :show="confirmVisible" :data="data" @doubleConfirm="doubleConfirm" />
</template>

<script setup>
import ConfirmPassword from '@/components/modals/ConfirmPassword.vue';

import { useStore } from 'vuex';
import { apis } from '@/store/api';
import { useI18n } from 'vue-i18n';
import { Modal } from 'ant-design-vue';
import { Enum } from '@/assets/js/enum';
import { openNotificationWithIcon } from '@/assets/js/global';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { ref, computed, onBeforeMount, watch, createVNode } from 'vue';
import { decimal, comma, lottieModal, auth, getPartnerType } from '@/assets/js/global.js';
import { PartnerApproval, PartnerUpdate, PartnerApprovalGuaranteeMailSend } from '@/store/api';

const { t } = useI18n();
const store = useStore();
const currencyList = computed(() => store.state['sign'].currencyList);
const timezoneList = computed(() => store.state['sign'].timezoneList);
const props = defineProps({
  data: {
    type: Object,
  },
});
const options = computed(() => {
  const arr = [];
  timezoneList.value.filter((e) => {
    arr.push({ value: e.timezone, label: e.timezone });
  });
  return arr;
});
const info = ref([
  { label: () => t('user_info.label.id'), value: '', key: 'id' },
  { label: () => t('user_info.label.partner_code'), value: '', key: 'code' },
  { label: () => t('user_info.label.partner_name'), value: '', key: 'name' },
  { label: () => t('user_info.label.type'), value: '', key: 'grade' },

  {
    label: () => t('user_info.label.primary_currency'),
    value: '',
    key: 'currency_Type',
    disabled: [Enum.userStateType.ApprovalProgress, Enum.userStateType.ConfirmDeposit, Enum.userStateType.Approval],
  },
  {
    label: () => t('user_info.label.timezone'),
    value: '',
    key: 'timezone',
    disabled: [Enum.userStateType.ApprovalProgress, Enum.userStateType.ConfirmDeposit, Enum.userStateType.Approval],
  },
  {
    label: () => t('user_info.label.deposit_rate'),
    value: '',
    key: 'partner_Rate',
    disabled: [Enum.userStateType.ApprovalProgress, Enum.userStateType.ConfirmDeposit],
  },
  {
    label: () => t('user_info.label.withdraw_rate'),
    value: '',
    key: 'withdraw_Rate',
    disabled: [Enum.userStateType.ApprovalProgress, Enum.userStateType.ConfirmDeposit],
  },
  {
    label: () => t('user_info.label.guarantee'),
    value: '',
    key: 'guarantee',
    disabled: [Enum.userStateType.ApprovalProgress, Enum.userStateType.ConfirmDeposit],
  },

  { label: () => t('user_info.label.encrypt_key'), value: '', key: 'encrypt_Key', hide: Enum.userStateType.Request },
  { label: () => t('user_info.label.vector_key'), value: '', key: 'vector_Key', hide: Enum.userStateType.Request },
  {
    label: () => t('user_info.label.callback_url'),
    value: '',
    key: 'callback_Url',
    hide: Enum.userStateType.Request,
    disabled: [Enum.userStateType.Approval],
  },
]);
const data = ref({});
const isLoading = ref(false);
const isDisable = ref(false);
const confirmVisible = ref(false);

const filterOption = (input, option) => {
  return option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};
const getPartnerInfo = async () => {
  const response = await apis.manager.CSmasterPartnerInformation({
    user_Sn: props.data.user_Sn,
    id: props.data.user_Id,
  });
  const getData = response.data;

  if (getData.errCode === 0) {
    data.value = {
      ...getData.returnData,
      partner_Rate: getData.returnData.partner_Rate * 100,
      withdraw_Rate: getData.returnData.withdraw_Rate * 100,
    };
  } else {
    console.error(error);
  }
};
const onApproval = async () => {
  try {
    isLoading.value = true;
    const response = await PartnerApproval({
      User_Sn: props.data.user_Sn,
      Currency_Type: data.value.currency_Type,
      partner_Rate: Number(data.value.partner_Rate) / 100,
      Withdraw_Rate: Number(data.value.withdraw_Rate) / 100,
      Guarantee: Number(String(data.value.guarantee).split(',').join('')),
      Partner_Grade: data.value.grade,
      callback_Url: data.value.callback_Url,
      timezone: data.value.timezone,
    });
    isLoading.value = false;
    const getData = response.data;

    if (getData.errCode === 0) {
      await lottieModal(t('confirm.description.success_saved'), 'setting', 1.5);
      getPartnerInfo();
    }
  } catch (error) {
    console.error(error);
  }
};
const sendConfirmationEmail = async () => {
  try {
    const response = await PartnerApprovalGuaranteeMailSend({
      User_Sn: props.data.user_Sn,
    });
    const getData = response.data;
    if (getData.errCode === 0) {
      openNotificationWithIcon('success', t('notification.title.success'), '');
      getPartnerInfo();
    } else {
      openNotificationWithIcon('error', t('notification.title.error'), '');
    }
  } catch (error) {
    console.error(error);
  }
};
const onEdit = async () => {
  try {
    isLoading.value = true;
    const response = await PartnerUpdate({
      User_Sn: props.data.user_Sn,
      Currency_Type: data.value.currency_Type,
      partner_Rate: Number(data.value.partner_Rate) / 100,
      Withdraw_Rate: Number(data.value.withdraw_Rate) / 100,
      Guarantee: Number(String(data.value.guarantee).split(',').join('')),
      Partner_Grade: data.value.grade,
      callback_Url: data.value.callback_Url,
      timezone: data.value.timezone,
    });
    isLoading.value = false;

    const getData = response.data;

    if (getData.errCode === 0) {
      openNotificationWithIcon('success', t('notification.title.success'), '');
    } else {
      openNotificationWithIcon('error', t('notification.title.error'), '');
    }
  } catch (error) {
    isLoading.value = false;
    console.error(err);
  }
};
const doubleConfirm = (val) => {
  confirmVisible.value = val;
};
const openConfirmModal = () => {
  Modal.confirm({
    title: t('confirm.title.change_status_withdrawal_partner'),
    icon: createVNode(ExclamationCircleOutlined),
    okText: t('common.button.ok'),
    cancelText: t('common.button.cancel'),
    onOk() {
      confirmVisible.value = true;
    },
  });
};

watch(
  data,
  (val) => {
    if (val.partner_Rate) {
      data.value.partner_Rate = decimal(val.partner_Rate);
    }
    if (val.withdraw_Rate) {
      data.value.withdraw_Rate = decimal(val.withdraw_Rate);
    }
    if (val.guarantee) {
      data.value.guarantee = comma(decimal(data.value.guarantee));
    }

    if (val.guarantee.length === 0 || val.timezone === null) {
      isDisable.value = true;
    } else {
      isDisable.value = false;
    }
  },
  { deep: true },
);

onBeforeMount(() => {
  getPartnerInfo();
});
</script>

<style lang="scss">
.partner-withdrawal-btn {
  position: absolute;
  left: 0;
}
</style>

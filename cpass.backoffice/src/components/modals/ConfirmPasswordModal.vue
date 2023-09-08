<template>
  <a-modal v-model:visible="isShow.isPwModalVisible" :title="$t('modal.label.confirm_password')">
    <a-form layout="vertical" labelAlign="left">
      <a-form-item :label="$t('common.label.password')">
        <a-input-password
          v-model:value="inputPwd"
          :placeholder="$t('common.label.password')"
          v-on:keyup.enter="handleConfirm"
          ref="pwInput"
        />
      </a-form-item>
    </a-form>
    <template #footer>
      <a-button key="close" @click="handleClose">{{ $t('common.button.close') }}</a-button>
      <a-button key="confirm" type="primary" @click="handleConfirm">{{ $t('common.button.confirm') }}</a-button>
    </template>
  </a-modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { Form, notification } from 'ant-design-vue';
import { useStore } from 'vuex';

import { SafetyTransaction } from '@/store/api';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const store = useStore();

const pwInput = ref(null);
const props = defineProps({
  visible: {
    type: Object,
    required: true,
  },
  clickedBtn: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['close']);

const clickedBtnProp = computed({
  get() {
    return props.clickedBtn;
  },
});

const isShow = computed({
  get() {
    return props.visible;
  },
  set(value) {
    emit('close', value, clickedBtnProp.value);
  },
});

const useForm = Form.useForm;

const inputPwd = ref('');

const rulesRef = ref({
  password: [
    {
      required: true,
      message: 'Please enter password',
    },
  ],
});

const reset = () => {
  inputPwd.value = '';
};

const handleConfirm = async () => {
  const sendData = {
    password: inputPwd.value,
    deal_Id: clickedBtnProp.value.deal_Id,
    safe_State: clickedBtnProp.value.value,
  };

  try {
    const response = await SafetyTransaction(sendData);

    if (response?.data.errCode === 0) {
      openNotificationWithIcon('success', t('notification.title.success'), '');
      isShow.value.isPwModalVisible = false;
      clickedBtnProp.value.adjusted = true;
      emit('close', false, clickedBtnProp.value);
      reset();
    } else if (response.data.errCode !== -2 || response.data.errCode !== -4 || response.data.errCode !== 0) {
      openNotificationWithIcon('error', t('notification.title.error'), response.data.errMessage);
    }

    if (response.data.errCode === -2 || response.data.errCode === -4 || response.data.errCode === -5) {
      store.state['sign'].overlapLogin = response.data;
    }
  } catch (error) {
    console.error(error);
  }
};

const handleClose = () => {
  isShow.value.isModalVisible = false;
  isShow.value.isPwModalVisible = false;
  reset();
};

const openNotificationWithIcon = (type, msg, desc) => {
  notification[type]({
    message: msg,
    description: desc,
  });
};

watch(isShow, (val) => {
  if (!val) {
    reset();
  }
});

watch(clickedBtnProp, (val) => {
  if (val.isConfirmBtnClicked) {
    setTimeout(() => {
      pwInput.value.focus();
    }, 500);
  }
});
</script>

<template>
  <a-modal v-model:visible="isVisible" :title="$t('modal.title.confirm_password')" class="confirm-pw-modal">
    <a-form layout="vertical" labelAlign="left" style="width: 100%">
      <a-form-item :label="$t('common.label.password')" v-bind="validateInfos.password">
        <a-input-password
          v-model:value="modelRef.password"
          :placeholder="$t('common.label.password')"
          v-on:keyup.enter="handleConfirm"
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
import { useI18n } from 'vue-i18n';

const store = useStore();
const errCode = computed(() => store.state['common'].errCode);
const errMessage = computed(() => store.state['common'].errMessage);
const { t: $t } = useI18n();
const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  data: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['doubleConfirm']);

const isVisible = computed({
  get() {
    return props.show;
  },
  set(val) {
    emit('doubleConfirm', val);
  },
});

const userDetails = computed({
  get() {
    return props.data;
  },
});

const useForm = Form.useForm;

const modelRef = ref({
  password: '',
});
const rulesRef = ref({
  password: [
    {
      required: true,
      message: $t('component.error_msg.correct_number'),
    },
  ],
});

const { resetFields, validate, validateInfos } = useForm(modelRef, rulesRef, {
  onValidate: (...args) => {},
});

const reset = () => {
  resetFields();
};

const openNotificationWithIcon = (type, message, desc) => {
  notification[type]({
    message: message,
    description: desc,
  });
};

const handleConfirm = async () => {
  const sendData = {
    manager_Password: modelRef.value.password,
    user_Id: userDetails.value.id,
    partner_Code: userDetails.value.code,
    type: 1,
  };

  await store.dispatch('partner/cSmasterWithdrawUser', sendData);

  if (errCode.value === 0) {
    openNotificationWithIcon('success', $t('notification.title.success'), errMessage.value);
    handleClose();
  } else {
    openNotificationWithIcon('warning', $t('notification.title.error'), errMessage.value);
  }
};

const handleClose = () => {
  isVisible.value = false;
  modelRef.value.password = '';
};

watch(isVisible, (val) => {
  if (!val) {
    reset();
  }
});
</script>

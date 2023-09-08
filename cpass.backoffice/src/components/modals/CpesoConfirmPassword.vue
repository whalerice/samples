<template>
  <a-modal
    closable
    :visible="isVisible"
    :title="$t('modal.title.confirm_password')"
    :destroyOnClose="true"
    @ok="handleClose"
    @cancel="handleClose"
  >
    <a-form layout="vertical" labelAlign="left">
      <a-form-item :label="$t('common.label.password')" v-bind="validateInfos.password">
        <a-input-password
          v-model:value="modelRef.password"
          :placeholder="$t('common.label.password')"
          v-on:keyup.enter="handleConfirm"
          @change="changed"
        />
        <a-typography-text type="danger">
          {{ errMessage }}
        </a-typography-text>
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
import { Form } from 'ant-design-vue';
import { apis } from '@/store/api';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
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
const emit = defineEmits(['closeConfirm', 'confirmPassword']);
const isVisible = computed({
  get() {
    return props.show;
  },
  set(val) {
    emit('closeConfirm', val);
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
      message: t('component.error_msg.correct_number'),
    },
  ],
});
const errMessage = ref('');

const { resetFields, validate, validateInfos, onValidate } = useForm(modelRef, rulesRef, {
  onValidate: (...args) => {},
});
const reset = () => {
  resetFields();
};
const changed = () => {
  errMessage.value = '';
};
const handleConfirm = async () => {
  const sendData = {
    type: 1,
    method: 1,
    password: modelRef.value.password,
  };
  const response = await apis.ConfirmPassword(sendData);
  const getData = response.data;

  if (getData.errCode === 0) {
    emit('confirmPassword', getData.returnData);
  } else {
    reset();
    errMessage.value = getData.errMessage;
  }
};
const handleClose = () => {
  isVisible.value = false;
  modelRef.value.password = '';
  errMessage.value = '';
};

watch(isVisible, (val) => {
  if (!val) {
    reset();
  }
});
</script>

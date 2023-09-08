<template>
  <a-modal
    v-model:visible="visible"
    centered
    :title="$t('common.word.modify_password')"
    :destroyOnClose="true"
    :confirmLoading="loading"
    :afterClose="afterClose"
    :okButtonProps="{ size: 'middle', disabled: disabled }"
    :cancelButtonProps="{ size: 'middle' }"
    @ok="confirm"
  >
    <a-form layout="vertical">
      <a-form-item
        :label="$t('common.word.new_password')"
        v-bind="form.validateInfos.newPassword"
      >
        <a-input-password v-model:value="model.newPassword" allowClear>
          <template #prefix>
            <LockOutlined class="site-form-item-icon" />
          </template>
        </a-input-password>
      </a-form-item>

      <a-form-item
        :label="$t('common.word.confirm_new_password')"
        v-bind="form.validateInfos.confirmNewPassword"
      >
        <a-input-password v-model:value="model.confirmNewPassword" allowClear>
          <template #prefix>
            <LockOutlined class="site-form-item-icon" />
          </template>
        </a-input-password>
      </a-form-item>
    </a-form>
  </a-modal>

  <ConfirmPasswordModal
    :visible="isConfirmPasswordModal"
    @update:visible="(value:boolean) => isConfirmPasswordModal = value"
    :data="sendData"
    @return="changePassword"
  />
</template>

<script setup lang="ts">
import ConfirmPasswordModal from '@/components/modal/ConfirmPasswordModal.vue';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Form } from 'ant-design-vue';
import type { Rule } from 'ant-design-vue/es/form';
import { LockOutlined } from '@ant-design/icons-vue';
import { passwordRegex } from '@/utils/rules';
import { api } from '@/boot/axios';

const { t } = useI18n();
const emits = defineEmits(['update:show']);

const props = defineProps({
  show: { type: Boolean, required: true },
  data: { type: Object, required: true },
});

const model = ref<any>({
  newPassword: '',
  confirmNewPassword: '',
});

const loading = ref<boolean>(false);
const isConfirmPasswordModal = ref<boolean>(false);
const sendData = ref<any>();

const visible = computed({
  get() {
    return props.show;
  },
  set: (value: boolean) => {
    emits('update:show', value);
  },
});

const disabled = computed(() => {
  return (
    !model.value.newPassword.match(passwordRegex) ||
    !model.value.confirmNewPassword.match(passwordRegex) ||
    model.value.newPassword !== model.value.confirmNewPassword
  );
});

const validatePassword = async (_rule: Rule, value: string) => {
  if (value === '') {
    return Promise.reject(t('form.rule.empty'));
  } else if (!value.match(passwordRegex)) {
    return Promise.reject(t('form.rule.not_password_type'));
  } else if (value !== model.value.newPassword) {
    return Promise.reject(t('form.rule.different_password'));
  }
  return Promise.resolve();
};

const form = Form.useForm(model, {
  newPassword: [
    {
      required: true,
      message: () => t('form.rule.empty'),
    },
    {
      pattern: passwordRegex,
      message: () => t('form.rule.not_password_type'),
    },
  ],
  confirmNewPassword: [
    {
      required: true,
      validator: validatePassword,
    },
  ],
});

const changePassword = async () => {
  isConfirmPasswordModal.value = false;

  await api.auto.member.password(props.data.id, model.value.newPassword);

  loading.value = false;
  visible.value = false;
};

const confirm = async () => {
  await form.validate();

  isConfirmPasswordModal.value = true;
  loading.value = true;
  sendData.value = props.data;
};

const afterClose = () => {
  form.resetFields();
};
</script>

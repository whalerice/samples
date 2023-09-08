<template>
  <a-modal
    v-model:visible="visible"
    centered
    :title="$t('common.word.confirm_password')"
    :destroyOnClose="true"
    :confirmLoading="confirmLoading"
    :afterClose="afterClose"
    :okButtonProps="{ size: 'middle', disabled: disabled }"
    :cancelButtonProps="{ size: 'middle' }"
    @ok="onSubmit"
  >
    <a-form layout="vertical">
      <a-form-item
        :label="$t('common.word.confirm_password')"
        v-bind="form.validateInfos.password"
      >
        <a-input-password v-model:value="model.password" allowClear>
          <template #prefix>
            <LockOutlined class="site-form-item-icon" />
          </template>
        </a-input-password>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Form } from 'ant-design-vue';
import { LockOutlined } from '@ant-design/icons-vue';
import { passwordRegex } from '@/utils/rules';

const { t } = useI18n();

const emits = defineEmits(['return', 'update:visible']);
const props = defineProps({
  visible: { type: Boolean, required: true },
  data: { type: Object, required: true },
});

const visible = computed({
  get() {
    return props.visible;
  },
  set: (value) => {
    emits('update:visible', value);
  },
});

const confirmLoading = ref<boolean>(false);
const returnData = ref<any>(null);

const model = ref<any>({
  password: '',
});

const disabled = computed(() => {
  return !model.value.password.match(passwordRegex);
});

const form = Form.useForm(model, {
  password: [
    {
      required: true,
      message: () => t('form.rule.empty'),
    },
    {
      pattern: passwordRegex,
      message: () => t('form.rule.not_password_type'),
    },
  ],
});

const onSubmit = async () => {
  await form.validate();
  returnData.value = { ...props.data, confirm: true };
  emits('return', returnData.value);
};

const afterClose = () => {
  returnData.value = null;
  form.resetFields();
};
</script>

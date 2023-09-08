<template>
  <a-modal
    v-model:visible="visible"
    :title="$t('modal.title.affiliate_register')"
    :destroyOnClose="true"
    :forceRender="true"
    :confirmLoading="loading"
    :afterClose="afterClose">
    <a-form layout="vertical">
      <a-form-item :label="$t('form.label.id')" v-bind="form.validateInfos.user_Id">
        <a-input size="default" v-model:value="model.user_Id" allowClear autocomplete="off" />
      </a-form-item>
      <a-form-item :label="$t('form.label.name')" v-bind="form.validateInfos.name">
        <a-input v-model:value="model.name" allowClear />
      </a-form-item>
      <a-form-item :label="$t('form.label.nickname')" v-bind="form.validateInfos.nick">
        <a-input v-model:value="model.nick" allowClear />
      </a-form-item>
      <a-form-item :label="$t('form.label.password')" v-bind="form.validateInfos.password">
        <a-input-password v-model:value="model.password" allowClear autocomplete="new-password" />
      </a-form-item>
      <a-form-item :label="$t('form.label.confirm_password')" v-bind="form.validateInfos.confirmPassword">
        <a-input-password v-model:value="model.confirmPassword" allowClear autocomplete="new-confirm-password" />
      </a-form-item>
      <a-form-item :label="$t('form.label.reward_type')">
        <a-radio-group v-model:value="model.reward_Type">
          <a-radio :value="RewardType.Rolling">
            {{ $t('common.label.rolling') }}
          </a-radio>
          <a-radio :value="RewardType.Losing">
            {{ $t('common.label.losing') }}
          </a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item v-if="model.reward_Type === RewardType.Rolling">
        <span class="q-mr-sm">{{ $t('form.label.casino_rate') }}</span>
        <a-input-number
          v-model:value="model.casino_Fee"
          :min="0"
          :max="100"
          :formatter="(value:any) => `${value}%`"
          :parser="(value:any) => value.replace('%', '')" />

        <span class="q-mr-sm q-ml-lg">{{ $t('form.label.slot_rate') }}</span>
        <a-input-number
          v-model:value="model.slot_Fee"
          :min="0"
          :max="100"
          :formatter="(value:any) => `${value}%`"
          :parser="(value:any) => value.replace('%', '')" />
      </a-form-item>
      <a-form-item v-if="model.reward_Type === RewardType.Losing">
        <span class="q-mr-sm">{{ $t('form.label.losing_rate') }}</span>
        <a-input-number
          v-model:value="model.losing_Fee"
          :min="0"
          :max="100"
          :formatter="(value:any) => `${value}%`"
          :parser="(value:any) => value.replace('%', '')" />
      </a-form-item>
    </a-form>

    <template #footer>
      <a-button type="primary" size="default" @click="onSubmit">{{ $t('common.button.register') }} </a-button>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Form, message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';

import { RewardType } from 'src/components/models/enums';
import { passwordRegex } from 'src/boot/global';
import { apis } from 'src/stores/apis';

const { t } = useI18n();
const emits = defineEmits(['update:show']);

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
});

const loading = ref<boolean>(false);

const visible = computed({
  get() {
    return props.show;
  },
  set: (value: boolean) => {
    emits('update:show', value);
  },
});

const model = ref<ISetAffiliateByAdminRequest>({
  user_Id: '',
  name: '',
  nick: '',
  password: '',
  confirmPassword: '',
  reward_Type: RewardType.Rolling,
  casino_Fee: 0,
  slot_Fee: 0,
  losing_Fee: 0,
});

const validatePassword = async (_rule: any, value: string) => {
  if (value === '') {
    return Promise.reject(t('form.rule.empty'));
  } else if (!value.match(passwordRegex)) {
    return Promise.reject(t('form.rule.password'));
  } else if (value !== model.value.password) {
    return Promise.reject(t('form.rule.different_password'));
  }
  return Promise.resolve();
};

const form = Form.useForm(model, {
  user_Id: [
    {
      required: true,
      message: () => t('form.rule.empty'),
    },
  ],
  name: [
    {
      required: true,
      message: () => t('form.rule.empty'),
    },
  ],
  nick: [
    {
      required: true,
      message: () => t('form.rule.empty'),
    },
  ],
  password: [
    {
      required: true,
      message: () => t('form.rule.empty'),
    },
    {
      pattern: passwordRegex,
      message: () => t('form.rule.password'),
    },
  ],
  confirmPassword: [
    {
      required: true,
      validator: validatePassword,
    },
  ],
  reward_Type: [
    {
      required: true,
      message: () => t('form.rule.empty'),
    },
  ],
});

const onSubmit = async () => {
  loading.value = true;
  try {
    await form.validate();
    await apis.manager.SetAffiliateByAdmin(model.value);
    loading.value = false;
    visible.value = false;
    message.success('success');
  } catch (err) {}
};

const afterClose = () => {
  form.resetFields();
};
</script>

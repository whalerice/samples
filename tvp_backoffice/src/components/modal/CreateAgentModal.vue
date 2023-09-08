<template>
  <a-modal
    v-model:visible="visible"
    :title="$t('common.word.create_agent')"
    :afterClose="afterClose"
    :confirm-loading="confirmLoading"
    :destroyOnClose="true"
  >
    <a-form layout="vertical">
      <a-form-item
        has-feedback
        :label="$t('form.label.sign_in_id')"
        v-bind="form.validateInfos.identity"
      >
        <a-input-group compact>
          <a-input
            size="default"
            v-model:value="model.identity"
            allowClear
            autocomplete="off"
          >
            <template #suffix v-if="!!confirmedIdentity">
              <CheckOutlined class="text-h4 text-green" />
            </template>
          </a-input>

          <a-button
            size="default"
            type="primary"
            @click="idCheck"
            :disabled="!!confirmedIdentity"
          >
            {{ $t('common.word.confirm') }}
          </a-button>
        </a-input-group>
      </a-form-item>

      <a-form-item
        has-feedback
        :label="$t('form.label.sign_in_password')"
        v-bind="form.validateInfos.password"
      >
        <a-input-password
          v-model:value="model.password"
          allowClear
          autocomplete="new-password"
        />
      </a-form-item>

      <a-form-item
        :label="$t('common.word.nickname')"
        v-bind="form.validateInfos.nickname"
      >
        <a-input v-model:value="model.nickname" allowClear />
      </a-form-item>

      <a-form-item
        :label="$t('common.word.settlement_rate')"
        v-bind="form.validateInfos.feeRate"
      >
        <a-input
          v-model:value="model.feeRate"
          suffix="%"
          :maxlength="3"
          class="text-right"
        />
      </a-form-item>

      <a-form-item :label="$t('common.word.create_child_permissions')">
        <a-radio-group v-model:value="model.isSubPartnerAvailable">
          <a-radio :value="false">
            {{ $t('common.word.no_permission') }}
          </a-radio>
          <a-radio :value="true">
            {{ $t('common.word.have_permissions') }}
          </a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>

    <template #footer>
      <a-button type="primary" size="default" @click="onSubmit"
        >{{ $t('common.word.create') }}
      </a-button>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Form, message } from 'ant-design-vue';
import { CheckOutlined } from '@ant-design/icons-vue';
import { useI18n } from 'vue-i18n';
import { identityRegex, passwordRegex } from '@/utils/rules';
import { RewardType } from '@/utils/enums';
import { api } from '@/boot/axios';

const { t } = useI18n();
const emits = defineEmits(['update:show']);

const props = defineProps({
  show: { type: Boolean },
});

const visible = computed({
  get() {
    return props.show;
  },
  set(val) {
    emits('update:show', val);
  },
});

const confirmLoading = ref<boolean>(false);

const model = ref<ICreateAgent>({
  identity: '',
  password: '',
  nickname: '',
  settlementMethod: RewardType.Losing,
  feeRate: 0,
  isSubPartnerAvailable: false,
});

const confirmedIdentity = ref('');

const form = Form.useForm(model, {
  identity: [
    {
      required: true,
      message: () => t('form.rule.empty'),
    },
    {
      pattern: identityRegex,
      message: () =>
        'Login ID format is not currect. Allow alphabet + Number 6 to 16 letters.',
    },
  ],
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
  nickname: [
    {
      required: true,
      message: () => t('form.rule.empty'),
    },
  ],
  feeRate: [
    {
      min: 1,
      max: 100,
      message: () => t('form.rule.fee_rate'),
    },
  ],
});

const idCheck = async () => {
  const response = await api.operator.auth.canUseIdentity(model.value.identity);
  if (response) {
    confirmedIdentity.value = model.value.identity;
  }
};

const onSubmit = async () => {
  confirmLoading.value = true;

  try {
    await form.validate();

    const { feeRate, ...data } = model.value;

    const sendData = {
      ...data,
      feeRate: Number(feeRate) / 100,
    };

    await api.auto.member.agent(sendData);

    confirmLoading.value = false;
    visible.value = false;

    message.success('This is a success message');
  } catch (err) {}
};

const afterClose = () => {
  form.resetFields();

  confirmedIdentity.value = '';
};
</script>

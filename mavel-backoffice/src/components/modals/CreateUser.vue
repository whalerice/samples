<template>
  <a-modal
    v-model:visible="visible"
    :title="$t('modal.title.user_register')"
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
      <a-form-item :label="$t('form.label.nickname')" v-bind="form.validateInfos.nickname">
        <a-input v-model:value="model.nickname" allowClear />
      </a-form-item>
      <a-form-item :label="$t('common.label.birth')" v-bind="form.validateInfos.birthDay">
        <a-date-picker v-model:value="model.birthDay" class="full-width" />
      </a-form-item>
      <a-form-item :label="$t('form.label.password')" v-bind="form.validateInfos.password">
        <a-input-password v-model:value="model.password" allowClear autocomplete="new-password" />
      </a-form-item>
      <a-form-item :label="$t('form.label.confirm_password')" v-bind="form.validateInfos.confirmPassword">
        <a-input-password v-model:value="model.confirmPassword" allowClear autocomplete="new-confirm-password" />
      </a-form-item>
      <a-form-item :label="$t('form.label.affiliate_id')" v-bind="form.validateInfos.affiliate">
        <a-input-group compact>
          <a-input v-model:value="model.affiliate" @change="isAffiliateVerify = false" allowClear>
            <template #suffix>
              <check-outlined class="success q-ml-sm" v-if="isAffiliateVerify" />
            </template>
          </a-input>
          <a-button
            type="primary"
            @click="form.validate('affiliate')"
            :disabled="model.affiliate === ''"
            :loading="affiliateLoading">
            {{ $t('common.button.confirm') }}
          </a-button>
        </a-input-group>
      </a-form-item>
      <!-- <a-form-item :label="$t('form.label.reward_type')" v-if="isAffiliateVerify">
        <a-radio-group v-model:value="model.rewardType">
          <a-radio :value="RewardType.Rolling">
            {{ $t('common.label.rolling') }}
          </a-radio>
          <a-radio :value="RewardType.Losing">
            {{ $t('common.label.losing') }}
          </a-radio>
        </a-radio-group>
      </a-form-item> -->
      <a-form-item v-if="model.rewardType === RewardType.Rolling && isAffiliateVerify">
        <span class="q-mr-sm">{{ $t('form.label.casino_rate') }}</span>
        <a-input-number
          v-model:value="model.casinoFee"
          :min="0"
          :max="100"
          :formatter="(value:any) => `${value}%`"
          :parser="(value:any) => value.replace('%', '')" />

        <span class="q-mr-sm q-ml-lg">{{ $t('form.label.slot_rate') }}</span>
        <a-input-number
          v-model:value="model.slotFee"
          :min="0"
          :max="100"
          :formatter="(value:any) => `${value}%`"
          :parser="(value:any) => value.replace('%', '')" />
      </a-form-item>
      <a-form-item v-if="model.rewardType === RewardType.Losing && isAffiliateVerify">
        <span class="q-mr-sm">{{ $t('form.label.losing_rate') }}</span>
        <a-input-number
          v-model:value="model.losingFee"
          :min="0"
          :max="100"
          :formatter="(value:any) => `${value}%`"
          :parser="(value:any) => value.replace('%', '')" />
      </a-form-item>
      <a-form-item :label="$t('form.label.memo')" v-bind="form.validateInfos.memo">
        <a-textarea v-model:value="model.memo" allow-clear class="resize-none" />
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
import { CheckOutlined } from '@ant-design/icons-vue';
import { useI18n } from 'vue-i18n';

import { RewardType } from 'src/components/models/enums';
import { idRegex, passwordRegex } from 'src/boot/global';
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

const isAffiliateVerify = ref<boolean>(false);
const affiliateLoading = ref<boolean>(false);

const model = ref<ICreateUser>({
  user_Id: '',
  name: '',
  nickname: '',
  affiliate: '',
  birthDay: '',
  password: '',
  confirmPassword: '',
  rewardType: RewardType.Rolling,
  casinoFee: 0,
  slotFee: 0,
  losingFee: 0,
  memo: '',
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

const validateAffiliate = async () => {
  if (model.value.affiliate !== '' && !isAffiliateVerify.value) {
    const returnData = await affiliateConfirm();

    if (returnData !== null) {
      isAffiliateVerify.value = true;
      return Promise.resolve();
    } else {
      return Promise.reject();
    }
  } else {
    return Promise.resolve();
  }
};
const affiliateConfirm = async () => {
  affiliateLoading.value = true;

  const {
    data: { returnData: returnData },
  } = await apis.manager.CheckAffiliate({ Affiliate: model.value.affiliate });

  if (returnData !== null) {
    model.value.rewardType = returnData.rewardType;
    model.value.slotFee = returnData.slotFee;
    model.value.losingFee = returnData.losingFee;
    model.value.casinoFee = returnData.casinoFee;
  }

  affiliateLoading.value = false;

  return returnData;
};

const form = Form.useForm(model, {
  user_Id: [
    {
      required: true,
      message: () => t('form.rule.empty'),
    },
    {
      pattern: idRegex,
      message: () => t('modal.error_msg.id_rules'),
    },
  ],
  name: [
    {
      required: true,
      message: () => t('form.rule.empty'),
    },
  ],
  nickname: [
    {
      required: true,
      message: () => t('form.rule.empty'),
    },
  ],
  birthDay: [
    {
      required: true,
      message: () => t('form.rule.empty'),
    },
  ],
  affiliate: [
    {
      required: true,
      message: () => t('form.rule.empty'),
    },
    {
      message: () => t('form.rule.empty_affiliate'),
      validator: validateAffiliate,
      trigger: 'blur',
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
    await form
      .validate()
      .then(async () => {
        const {
          data: { errCode: errCode, errMessage: errMessage, returnData: returnData },
        } = await apis.manager.RegisterUser(model.value);

        if (errCode === 0) {
          visible.value = false;
          message.success(t('common.text.success'));
        }
      })
      .catch((error) => {
        console.error(error);
      });
  } catch (err) {}
  loading.value = false;
};

const afterClose = () => {
  form.resetFields();
  isAffiliateVerify.value = false;
};
</script>

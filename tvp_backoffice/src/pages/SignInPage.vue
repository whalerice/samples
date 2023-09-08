<template>
  <a-config-provider componentSize="middle">
    <a-form
      ref="formRef"
      :model="formState"
      name="basic"
      autocomplete="off"
      v-bind="formItemLayout"
      :rules="rules"
      @Finish="onFinish"
      class="sign-in-form-controller"
      layout="vertical"
    >
      <a-form-item>
        <a-row justify="center" :gutter="[15, 0]">
          <a-col>
            <a-image width="7rem" src="/icons/logo-icon.svg" :preview="false" />
          </a-col>
          <a-col>
            <a-image
              width="12rem"
              src="/icons/logo-text.svg"
              :preview="false"
            />
          </a-col>
        </a-row>
      </a-form-item>

      <a-form-item>
        <a-radio-group v-model:value="signInType" class="sign-radio-group">
          <a-radio-button value="partner">
            {{ $t('common.word.partner') }}
          </a-radio-button>
          <a-radio-button value="agent">
            {{ $t('common.word.agent') }}
          </a-radio-button>
          <a-radio-button value="manager">
            {{ $t('common.word.manager') }}
          </a-radio-button>
        </a-radio-group>
      </a-form-item>

      <a-form-item
        has-feedback
        name="email"
        :label="$t('common.word.email')"
        type="email"
      >
        <a-input v-model:value="formState.email" allowClear>
          <template #prefix>
            <UserOutlined class="site-form-item-icon" />
          </template>
        </a-input>
      </a-form-item>

      <a-form-item
        has-feedback
        name="password"
        :label="$t('common.word.password')"
      >
        <a-input-password v-model:value="formState.password" allowClear>
          <template #prefix>
            <LockOutlined class="site-form-item-icon" />
          </template>
        </a-input-password>
      </a-form-item>
      <a-form-item name="checkNick" style="margin-bottom: 0.5rem">
        <a-checkbox v-model:checked="formState.remember">
          {{ $t('sign.word.remember_me') }}
        </a-checkbox>
      </a-form-item>

      <a-form-item>
        <a-button
          :disabled="disabled"
          type="primary"
          html-type="submit"
          class="full-width"
        >
          {{ $t('sign.word.sign_in') }}
        </a-button>
      </a-form-item>
      <a-form-item>
        <a-row justify="space-between">
          <a-col><TranslateLanguage /></a-col>
          <a-col><ThemeSwitch /></a-col>
        </a-row>
      </a-form-item>
    </a-form>
  </a-config-provider>
</template>

<script setup lang="ts">
import ThemeSwitch from '@/components/ThemeSwitch.vue';
import TranslateLanguage from '@/components/TranslateLanguage.vue';

import { LocalStorage, useQuasar, QSpinnerFacebook } from 'quasar';
import { ref, computed } from 'vue';
import { message } from 'ant-design-vue';
import { Rule } from 'ant-design-vue/es/form/interface';
import { LockOutlined, UserOutlined } from '@ant-design/icons-vue';
import { emailRegex, passwordRegex } from '@/utils/rules';
import { formItemLayout } from '@/utils/constants';
import { api } from '@/boot/axios';

const $q = useQuasar();
// const SIGN_INFO = 'signInfo';
// const signInType = ref(
//   LocalStorage.getItem<ISignInfo>(SIGN_INFO)
//     ? String(LocalStorage.getItem<ISignInfo>(SIGN_INFO)?.auth)
//     : 'manager'
// );
const signInType = ref<string>('partner');

const formState = ref<FormState>({
  email: LocalStorage.getItem<ISignInfo>('id')
    ? String(LocalStorage.getItem<ISignInfo>('id'))
    : '',
  password: '',
  remember: LocalStorage.getItem<ISignInfo>('id') ? true : false,
});

const formRef = ref();

const onFinish = async () => {
  $q.loading.show({
    spinner: QSpinnerFacebook,
    spinnerColor: 'blue',
    spinnerSize: 100,
    message: 'You are logging in. Please wait.',
    messageColor: 'white',
  });

  try {
    const { email, password } = formState.value;

    const response =
      signInType.value === 'manager'
        ? await api.admin.auth.login(email, password)
        : signInType.value === 'partner'
        ? await api.operator.auth.login(email, password)
        : await api.operator.auth.loginAgent(email, password);

    LocalStorage.set('token', response.apiToken);

    if (formState.value.remember) LocalStorage.set('id', email);

    location.reload();
  } catch (ex) {
    message.error(`${ex}`);
  } finally {
    $q.loading.hide();
  }
};

// const onFinishFailed = (errorInfo: any) => {};

const validateEmail = async (_rule: Rule, value: string) => {
  if (value === '') {
    return Promise.reject('Please input your email.');
  } else if (!value.match(emailRegex)) {
    return Promise.reject('Please input the collect email.');
  }
  return Promise.resolve();
};

const validatePassword = async (_rule: Rule, value: string) => {
  if (value === '') {
    return Promise.reject('Please input the password.');
  } else if (!value.match(passwordRegex)) {
    return Promise.reject('Please input the collect password.');
  }
  return Promise.resolve();
};

const rules: Record<string, Rule[]> = {
  email: [{ required: true, validator: validateEmail, trigger: 'change' }],
  password: [
    { required: true, validator: validatePassword, trigger: 'change' },
  ],
};

const disabled = computed(() => {
  return (
    !formState.value.email.match(emailRegex) ||
    !formState.value.password.match(passwordRegex)
  );
});
</script>

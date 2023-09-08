<template>
  <div class="sign-area">
    <q-img src="img/logo.svg" class="brand-logo" />
    <a-radio-group v-model:value="type">
      <a-radio-button :value="UserType.Manager">Manager</a-radio-button>
      <a-radio-button :value="UserType.Partner">Partner</a-radio-button>
    </a-radio-group>
    <a-form
      layout="vertical"
      name="login"
      class="login-form"
      :model="formState"
      @finish="onFinish"
      @finishFailed="onFinishFailed">
      <a-form-item
        has-feedback
        name="id"
        :label="$t('form.label.user_id')"
        :rules="[{ required: true, message: $t('modal.error_msg.user_id') }]">
        <a-input v-model:value="formState.id" allowClear>
          <template #prefix>
            <UserOutlined class="site-form-item-icon" />
          </template>
        </a-input>
      </a-form-item>

      <a-form-item
        has-feedback
        name="password"
        autocomplete="off"
        :label="$t('form.label.password')"
        :rules="[{ required: true, message: $t('modal.error_msg.enter_password') }]">
        <a-input-password v-model:value="formState.password" allowClear>
          <template #prefix>
            <LockOutlined class="site-form-item-icon" />
          </template>
        </a-input-password>
      </a-form-item>

      <!-- <a-form-item class="text-right">
        <a class="login-form-forgot" href="">{{ $t('common.button.forgot_password') }}</a>
      </a-form-item> -->
      <div class="q-mb-xl"></div>

      <div class="text-red error-message">{{ serverError }}</div>

      <a-form-item class="login-bottom-area">
        <a-button :disabled="disabled" type="primary" html-type="submit" class="login-form-button">
          {{ $t('common.button.sign_in') }}
        </a-button>
        <div class="text-right q-mt-xs">
          <Translate />
        </div>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import Translate from 'components/Translate.vue';
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue';

import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { computed, reactive, ref, watch } from 'vue';

import { userStore } from 'src/stores/user';
import { commonStore } from 'src/stores/common';
import { apis } from 'src/stores/apis';
import { UserType } from 'src/components/models/enums';

const router = useRouter();
const { loggedIn, memberType } = storeToRefs(userStore.sign());
const { isLanding } = storeToRefs(commonStore.ui());
// const { signIn } = userStore.sign();
const { onUserInfo } = userStore.user();

const type = ref<string>(UserType.Manager);
const serverError = ref<string>('');

interface IFormState {
  id: string;
  password: string;
}

const formState = reactive<IFormState>({
  id: '',
  password: '',
});

const onFinish = (values: any) => {
  onSignIn(values.id, values.password);
};

const onFinishFailed = (errorInfo: any) => {
  console.log('Failed:', errorInfo);
};
const disabled = computed(() => {
  return !(formState.id && formState.password);
});

const onSignIn = async (id: string, pass: string) => {
  isLanding.value = true;

  const url = type.value === UserType.Manager ? '/' : '/p';
  memberType.value = type.value;

  const send = {
    user_Id: id,
    password: pass,
  };

  try {
    const response =
      type.value === UserType.Manager ? await apis.manager.SignIn(send) : await apis.partner.SignIn(send);
    if (response.data.errCode < 0) {
      serverError.value = response.data.errMessage;
      isLanding.value = false;
    } else {
      onUserInfo(response.data.returnData);
      loggedIn.value = true;
      router.push(url);
      setTimeout(() => {
        isLanding.value = false;
      }, 100);
    }
  } catch (error) {
    console.error(error);
    isLanding.value = false;
  }
};

watch(formState, () => {
  serverError.value = '';
});
</script>
<style scoped lang="scss">
.sign-area {
  width: 100%;
  height: 100vh;
  // background-color: $bright-gray;
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
  padding: 5rem;
}

.login-form {
  max-width: 34rem;
  width: 100%;
}

.login-form-button {
  width: 100%;
}

.login-bottom-area {
  margin-bottom: 0;
}

.brand-logo {
  max-width: 34rem;
  transform: translateX(-1.2rem);
  margin-bottom: 4rem;
}
.ant-radio-group {
  width: 100%;
  max-width: 34rem;
  margin-bottom: 2rem;
  .ant-radio-button-wrapper {
    width: 50%;
    text-align: center;
  }
}
</style>

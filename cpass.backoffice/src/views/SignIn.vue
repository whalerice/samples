<template>
  <div class="sign-wrapper">
    <div class="backoffice-loading-box login-loading" v-if="loading">
      <a-spin />
    </div>
    <div class="sign-area">
      <i class="cpass-logo">cpass</i>
      <div class="sign-box">
        <a-typography-title :level="2">{{ $t('sign_in.top.title') }}</a-typography-title>
        <a-typography-paragraph>{{ $t('sign_in.top.description') }}</a-typography-paragraph>
        <div class="form-box mt-20">
          <a-form layout="vertical" :model="formState" @finish="SignIn">
            <a-form-item :label="$t('common.label.email')">
              <a-input
                v-model:value="formState.email"
                :placeholder="$t('sign_in.placeholder.username')"
                class="form-input"
              >
              </a-input>
            </a-form-item>
            <a-form-item :label="$t('common.label.password')">
              <a-input-password
                v-model:value="formState.password"
                type="password"
                :placeholder="$t('sign_in.placeholder.password')"
                class="form-input"
                autoComplete="on"
              >
              </a-input-password>
            </a-form-item>
            <a-form-item>
              <div class="remember">
                <a-switch v-model:checked="formState.remember" id="remember" />
                <label for="remember"> {{ $t('sign_in.label.remember_me') }}</label>
              </div>
              <div class="invalid-feedback">
                {{ getErr.errMessage }}
              </div>
              <a-button
                type="primary"
                html-type="submit"
                :disabled="formState.email === '' || formState.password === '' || loading"
                id="signInBtn"
              >
                {{ $t('common.button.sign_in') }}
              </a-button>
            </a-form-item>
            <div class="bottom-box">
              <Translate class="mr-30" />
              <a
                class="ml-20"
                :class="{ 'disabled-password-find': formState.email.match(regExp) === null }"
                @click="openEmail"
              >
                {{ t('common.forgot_password') }}
              </a>
            </div>
          </a-form>
        </div>
      </div>
    </div>
  </div>
  <EmailVerification
    v-if="activeEmail"
    :type="'sign'"
    :data="formState.email"
    @returnEmail="returnEmail"
    @closeEmail="closeEmail"
  />
  <ChangePassword
    v-if="activePassword"
    :type="'sign'"
    :data="formState.email"
    @closeChangePassword="closePassword"
    @returnChangePassword="returnPassword"
  />
</template>

<script setup>
import Translate from '@/components/common/Translate.vue';
import EmailVerification from '@/components/partner/EmailVerification.vue';
import ChangePassword from '@/components/modals/ChangePassword.vue';

import { ref, computed, watch, onBeforeMount } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { useStore } from 'vuex';
import { notification } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { authGroup, lottieModal } from '@/assets/js/global';

const { t } = useI18n();
const store = useStore();
const getErr = computed(() => store.state.sign.error);
const token = computed(() => store.state['sign'].token);
const signInfo = computed(() => store.state['sign'].signInfo);
const rememberStatus = ref({ remember: false, user: '' });
const isRemembered = JSON.parse(localStorage.getItem('_rememberStatus'));
const loading = ref(false);
const errCode = computed(() => store.state['common'].errCode);
const errMessage = computed(() => store.state['common'].errMessage);
const formState = ref({
  email: rememberStatus.value.user,
  password: '',
  remember: rememberStatus.value.remember,
});
const activeEmail = ref(false);
const activePassword = ref(false);
const regExp = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;

const SignIn = async () => {
  loading.value = true;
  await store.dispatch('sign/setSignIn', formState.value);
  setTimeout(() => {
    loading.value = false;
    if (errCode.value !== 0) {
      notification['error']({
        message: t('notification.title.login error'),
        description: errMessage.value,
      });
    }
  }, 2000);

  if (formState.value.remember) {
    rememberStatus.value = { remember: formState.value.remember, user: formState.value.email };
    localStorage.setItem('_rememberStatus', JSON.stringify(rememberStatus.value));
  } else {
    rememberStatus.value = { remember: false, user: '' };
    localStorage.removeItem('_rememberStatus');
  }
};
const openEmail = () => {
  activeEmail.value = true;
};
const closeEmail = () => {
  activeEmail.value = false;
};
const openPassword = () => {
  activePassword.value = true;
};
const closePassword = () => {
  activePassword.value = false;
};
const returnEmail = () => {
  openPassword();
};
const returnPassword = () => {
  closePassword();
  lottieModal(t('confirm.description.success_saved'), 'setting', 2);
};
watch(getErr, (val) => {
  return val;
});

onBeforeMount(() => {
  if (isRemembered) {
    formState.value.email = isRemembered.user;
    formState.value.remember = isRemembered.remember;
  }
});

onBeforeRouteLeave(async (to, from, next) => {
  const isPartner = authGroup(signInfo.value.grade) === 'partner';
  await store.dispatch('sign/coinList');
  await store.dispatch('sign/currencyList');

  store.commit('sign/SET_NOTIFICATION', true);

  if (isPartner) {
    await store.dispatch('otp/OtpIsRegister');
    await store.dispatch('sign/partnerMyInfo');
    await store.dispatch('sign/partnerWalletInfo').then(next);
  } else {
    await store.dispatch('sign/GetSubManager', token.value);
    await store.dispatch('sign/ShareSASQuery');
    await store.dispatch('sign/CsNoticeCategoryList');
    await store.dispatch('sign/TimezoneList', { keyword: '' }).then(next);
  }
});
</script>

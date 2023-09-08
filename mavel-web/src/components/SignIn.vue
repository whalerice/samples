<template>
  <q-form @submit="onSignIn" class="sign-form">
    <div class="logo-area">
      <img src="/images/logo.png" alt="Mavel Games" class="logo-img" />
    </div>
    <div class="input-group">
      <label class="form-label">{{ $t('modal.label.id') }}</label>
      <q-input
        dense
        v-model="formData.user_Id"
        outlined
        input-class="border-06"
        :placeholder="$t('modal.label.id')"
        clearable
        autofocus
        :tabindex="1"
        :dark="false"
        :hint="$t('form.rule.user_id')"
        :rules="[(val) => (String(val).length > 0 && idRegExp.test(val)) || $t('form.rule.user_id')]" />
    </div>

    <div class="input-group">
      <label class="form-label">{{ $t('modal.label.password') }}</label>
      <q-input
        dense
        v-model="formData.password"
        outlined
        clearable
        :tabindex="1"
        class="border-06"
        :dark="false"
        :type="isPwd ? 'password' : 'text'"
        :placeholder="$t('modal.label.password')"
        :hint="$t('form.rule.password')"
        :rules="[(val) => (String(val).length > 0 && pwdRegExp.test(val)) || $t('form.rule.password')]">
        <template v-slot:append>
          <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="isPwd = !isPwd" />
        </template>
      </q-input>
    </div>

    <div class="mb-20 full-width">
      <span class="forgot-pwd" style="color: transparent">Forgot Password?</span>
    </div>

    <q-btn
      no-caps
      unelevated
      type="submit"
      class="btn-sign-in default-gradient"
      :loading="signInIng"
      size="lg"
      :label="$t('common.button.sign_in')">
      <template v-slot:loading>
        <q-spinner-pie />
      </template>
    </q-btn>
  </q-form>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { userStore } from 'src/stores/user';
import { apis } from 'src/stores/apis';

const { loggedIn } = storeToRefs(userStore.sign());
const { onUserInfo } = userStore.user();

const idRegExp = /^[A-Za-z0-9]{6,16}$/;
const pwdRegExp = /^.*(?=^.{6,16}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[~!@#$%^&*()=+|/:;?<>']).*$/;

const signInIng = ref<boolean>(false);
const isPwd = ref<boolean>(true);
const serverError = ref<any>(null);

const formData = ref<ISignIn>({
  user_Id: null,
  password: null,
});

const onSignIn = async () => {
  signInIng.value = true;

  try {
    const response = await apis.SignIn(formData.value);

    if (response.data.errCode < 0) {
      serverError.value = response.data.errMessage;
      signInIng.value = false;
    } else {
      loggedIn.value = true;
      onUserInfo(response.data.returnData);
      signInIng.value = false;
    }
  } catch (error) {
    signInIng.value = false;
    console.error(error);
    serverError.value = error;
  }
};
</script>
<style scoped lang="scss">
.btn-sign-in {
  width: 100%;
  height: 6.3rem;
  color: #fff;
  border-radius: 0.6rem;
}
</style>

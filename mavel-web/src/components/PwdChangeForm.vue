<template>
  <div class="column user-info-input change-form">
    <span class="profile-label mb-08">{{ $t('modal.label.password') }}</span>
    <q-btn
      no-caps
      :label="$t('common.label.change_password')"
      class="change-pwd-controller"
      @click="dialog = !dialog" />
  </div>

  <q-dialog
    v-model="dialog"
    :maximized="maximizedToggle"
    transition-show="rotate"
    transition-hide="fade"
    class="custom-dialog-container"
    @hide="(idValue = ''), (pwdValue = ''), (pwdConfirmValue = '')">
    <q-card class="custom-dialog-card-area q-pb-lg">
      <q-bar>
        <q-space />
        <q-btn dense flat icon="open_in_full" @click="maximizedToggle = !maximizedToggle">
          <q-tooltip class="bg-white text-primary">
            {{ maximizedToggle ? $t('common.label.shrink') : $t('common.label.magnification') }}
          </q-tooltip>
        </q-btn>
        <q-btn dense flat icon="close" v-close-popup>
          <q-tooltip class="bg-white text-primary">{{ $t('common.label.close') }}</q-tooltip>
        </q-btn>
      </q-bar>

      <div class="balance-control-container q-px-md q-py-lg">
        <span class="text-h4">
          {{ $t('common.label.change_password') }}
        </span>
        <div class="mb-30 mt-30 q-gutter-md">
          <q-input v-model="idValue" :label="$t('modal.label.id')" clearable autofocus tabindex="1" />
          <q-input v-model="pwdValue" :label="$t('modal.label.password')" clearable tabindex="1" />
          <q-input
            v-model="pwdConfirmValue"
            :label="$t('modal.label.confirmpassword')"
            clearable
            tabindex="1"
            @keyup.enter="changePassword" />
        </div>
        <q-btn
          :label="$t('common.label.change_password')"
          unelevated
          class="full-width"
          padding="2rem"
          color="custom-purple-01"
          :disable="idValue.length === 0 || pwdValue.length === 0 || pwdValue !== pwdConfirmValue"
          @click="changePassword" />
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { apis } from 'src/stores/apis';
import { userStore } from 'src/stores/user';
import { storeToRefs } from 'pinia';
import { notify } from 'src/boot/main';

const { userInfo } = storeToRefs(userStore.user());

const dialog = ref<boolean>(false);
const maximizedToggle = ref<boolean>(false);
const idValue = ref<string>('');
const pwdValue = ref<string>('');
const pwdConfirmValue = ref<string>('');

const changePassword = async () => {
  if (!(idValue.value.length === 0 || pwdValue.value.length === 0 || pwdValue.value !== pwdConfirmValue.value)) {
    try {
      const res = await apis.ChangePassword({
        user_Id: idValue.value,
        user_Idx: userInfo.value.idx,
        password: pwdValue.value,
      });

      if (res.data.errCode === 0) {
        notify({
          message: 'Your password has been changed.',
          color: 'custom-purple-gradient-01',
          textColor: 'white',
          position: 'top',
          spinnerSize: '4rem',
          timeout: 5000,
        });
        dialog.value = false;
      } else {
        notify({
          message: res.data.errMessage,
          color: 'custom-purple-gradient-01',
          textColor: 'white',
          position: 'top',
          spinnerSize: '4rem',
          timeout: 5000,
        });
      }
    } catch (e: any) {
      notify({
        message: JSON.parse(e.response.data).ErrMessage,
        color: 'custom-purple-gradient-01',
        textColor: 'white',
        position: 'top',
        spinnerSize: '4rem',
        timeout: 5000,
      });
    }
  }
};
</script>

<style scoped lang="scss"></style>

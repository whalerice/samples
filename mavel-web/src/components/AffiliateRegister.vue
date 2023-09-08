<template>
  <div class="affiliate-form-area">
    <q-form @submit="onSubmit" @reset="onReset" ref="myForm">
      <q-input
        dense
        lazy-rules
        clearable
        v-model="data.user_Id"
        :label="$t('form.label.user_id')"
        :rules="[
          (val) => (val && val.length > 0) || $t('form.rule.empty'),
          (val) => (val && val.length >= 6) || $t('form.rule.user_id'),
          (val) => (val && val.length <= 16) || $t('form.rule.user_id'),
        ]"
        tabindex="1" />

      <q-input
        dense
        lazy-rules
        clearable
        v-model="data.password"
        :label="$t('form.label.password')"
        :type="isPwd ? 'password' : 'text'"
        :rules="[(val) => (val && val.length > 0) || $t('form.rule.empty')]"
        autocomplete="new-password"
        tabindex="2">
        <template v-slot:append>
          <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="isPwd = !isPwd" />
        </template>
      </q-input>

      <q-input
        dense
        lazy-rules
        clearable
        v-model="data.nick"
        :label="$t('form.label.nick')"
        :rules="[(val) => (val && val.length > 0) || $t('form.rule.empty')]"
        tabindex="3" />

      <q-input
        dense
        lazy-rules
        clearable
        v-model="data.name"
        :label="$t('form.label.name')"
        :rules="[(val) => (val && val.length > 0) || $t('form.rule.empty')]"
        tabindex="4" />

      <q-input
        dense
        lazy-rules
        clearable
        type="email"
        v-model="data.email"
        :label="$t('form.label.email')"
        :rules="[
          (val) => (val && val.length > 0) || $t('form.rule.empty'),
          (val) => emailCheck(val) || $t('form.rule.email'),
        ]"
        tabindex="5" />

      <q-input
        dense
        lazy-rules
        clearable
        v-model="data.title"
        :label="$t('form.label.title')"
        :rules="[(val) => (val && val.length > 0) || $t('form.rule.empty')]"
        tabindex="6" />

      <!-- autogrow -->
      <q-input
        dense
        lazy-rules
        clearable
        type="textarea"
        v-model="data.message"
        :input-style="{ maxHeight: '40rem', resize: 'none' }"
        :label="$t('form.label.message')"
        :rules="[(val) => (val && val.length > 0) || $t('form.rule.empty')]"
        tabindex="7" />

      <div>
        <q-btn unelevated label="Submit" type="submit" :color="isDisable ? 'grey-9' : 'primary'" :disable="isDisable" />
        <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
      </div>
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { apis } from 'src/stores/apis';

const { t } = useI18n();
const $q = useQuasar();
const isDisable = ref<boolean>(true);
const isPwd = ref<boolean>(true);
const myForm = ref();

const emailCheck = (email: string) => {
  var regex = /([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
  return email != '' && email != 'undefined' && regex.test(email);
};

const data = ref<any>({
  user_Id: '', //아이디
  password: '', //비밀번호
  nick: '', //닉네임
  name: '', //이름
  email: '', //메일주소
  title: '', //제목
  message: '', //내용
});

const onSubmit = async () => {
  const send = {
    user_Id: data.value.user_Id,
    password: data.value.password,
    nick: data.value.nick,
    name: data.value.name,
    email: data.value.email,
    title: data.value.title,
    message: data.value.message,
  };
  try {
    const res = await apis.AffiliateRegister(send);

    if (res.data.errCode === 0) {
      $q.dialog({
        title: t('dialog.affiliate.title'),
        message: t('dialog.affiliate.message'),
        cancel: false,
        persistent: true,
        ok: {
          color: 'primary',
        },
      }).onOk(() => {
        myForm.value.reset();
      });
    }
  } catch (error) {}
};

const onReset = () => {
  data.value['user_Id'] = '';
  data.value['password'] = '';
  data.value['nick'] = '';
  data.value['name'] = '';
  data.value['email'] = '';
  data.value['title'] = '';
  data.value['message'] = '';
};

watch(data.value, (v) => {
  if (
    v.user_Id.length > 0 &&
    v.password.length > 0 &&
    v.nick.length > 0 &&
    v.name.length > 0 &&
    v.email.length > 0 &&
    v.title.length > 0 &&
    v.message.length > 0
  ) {
    isDisable.value = false;
  } else {
    isDisable.value = true;
  }
});
</script>

<style scoped></style>

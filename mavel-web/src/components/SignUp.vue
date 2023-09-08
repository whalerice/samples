<template>
  <div class="sign-form">
    <div class="waggle-area">
      <span class="waggle-title"><img src="/icons/waggle.svg" alt="waggle" class="img-waggle" />Welcome</span>
    </div>
    <p class="text-center">{{ $t('modal.description.membership') }}</p>
    <q-stepper
      flat
      v-model="step"
      alternative-labels
      ref="stepper"
      animated
      active-color="gradient"
      class="sign-stepper"
      :dark="false">
      <q-step :name="1" :done="step > 1" title="Step 1">
        <div class="items-start align-left mb-20 column">
          <div class="sign-input-title">
            <span>{{ $t('modal.label.id') }}</span
            ><span>*</span>
          </div>
          <q-input
            dense
            v-model="formData.user_Id"
            outlined
            input-class="border-06"
            autocapitalize="off"
            class="full-width"
            :placeholder="$t('modal.label.id')"
            clearable
            tabindex="1"
            :dark="false"
            :error="errorMsgId !== null"
            :hint="$t('form.rule.user_id')"
            :rules="[
              (val) => (val && val.length > 0) || $t('form.rule.empty'),
              (val) => (val && val.length >= 6) || $t('form.rule.user_id'),
              (val) => (val && val.length <= 16) || $t('form.rule.user_id'),
            ]">
            <template v-slot:append v-if="isIdCheck">
              <q-icon name="check" color="success" />
            </template>
            <template v-slot:after>
              <q-btn
                tabindex="2"
                no-caps
                class="btn-verify"
                color="gradient"
                unelevated
                dense
                :loading="loadingIdCheck"
                :label="$t('common.button.verify')"
                :disable="disableIdCheck"
                @click="onCheck(UserCheckType.Id)" />
            </template>
            <template v-slot:error>
              {{ errorMsgId }}
            </template>
          </q-input>
        </div>
        <div class="items-start align-left column">
          <div class="sign-input-title">
            <span>{{ $t('modal.label.password') }}</span
            ><span>*</span>
          </div>
          <q-input
            dense
            v-model="formData.password"
            outlined
            class="full-width border-06"
            autocomplete="new-password"
            :clearable="true"
            :type="signUpPwdShow ? 'password' : 'text'"
            :placeholder="$t('modal.label.password')"
            tabindex="3"
            :dark="false"
            :error="errorMsgPassword !== null"
            :rules="[
              (val) => (val && val.length > 0) || $t('form.rule.empty'),
              (val) => passwordValidCheck(val) || validPassword,
            ]">
            <template v-slot:append>
              <q-icon
                :name="signUpPwdShow ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="signUpPwdShow = !signUpPwdShow" />
            </template>
            <template v-slot:error>
              {{ errorMsgPassword }}
            </template>
          </q-input>
        </div>
      </q-step>

      <q-step :name="2" :done="step > 2" title="Step 2">
        <div class="items-start align-left column">
          <div class="sign-input-title">
            <span>{{ $t('modal.label.nick') }}</span
            ><span>*</span>
          </div>
          <q-input
            autocapitalize="off"
            v-model="formData.nick"
            class="full-width"
            dense
            clearable
            outlined
            :dark="false"
            :placeholder="$t('modal.label.nick')"
            :hint="$t('form.rule.user_id')"
            :error="errorMsgNick !== null"
            :rules="[
              (val) => (val && val.length > 0) || $t('form.rule.empty'),
              (val) => (val && val.length >= 6) || $t('form.rule.user_id'),
              (val) => (val && val.length <= 16) || $t('form.rule.user_id'),
            ]">
            <template v-slot:append v-if="isNickCheck">
              <q-icon name="check" color="success" />
            </template>
            <template v-slot:after>
              <q-btn
                no-caps
                class="btn-verify"
                color="gradient"
                unelevated
                dense
                :loading="loadingNicCheck"
                :label="$t('common.button.verify')"
                :disable="false"
                @click="onCheck(UserCheckType.Nickname)" />
            </template>
            <template v-slot:error>
              {{ errorMsgNick }}
            </template>
          </q-input>
        </div>
        <div class="column">
          <div class="sign-input-title">
            <span>{{ $t('modal.label.birth') }}</span
            ><span>*</span>
          </div>
          <q-input
            dense
            clearable
            outlined
            input-class="border-06"
            mask="####-##-##"
            v-model="formData.birthDate"
            :dark="false"
            :placeholder="$t('modal.label.birth')"
            :rules="[
              (val) => (val && val.length > 0) || $t('form.rule.empty'),
              (val) => (val && adultCheck(formData.birthDate)) || $t('form.rule.birth'),
            ]">
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy ref="popup" cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="formData.birthDate" mask="YYYY-MM-DD" default-view="Years" />
                  <!-- :locale="myLocale" -->
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
      </q-step>

      <q-step :name="3" title="Step 3">
        <div class="items-start align-left column">
          <div class="sign-input-title">
            <span>{{ $t('modal.label.referral_id') }}</span
            ><span>*</span>
          </div>
          <q-input
            v-model="formData.referral_Id"
            :dark="false"
            :placeholder="$t('modal.label.referral_id')"
            class="full-width"
            dense
            tabindex="1"
            :clearable="true"
            outlined
            :rules="[
              (val) => (val && val.length > 0) || $t('form.rule.empty'),
              (val) => (val && val.length >= 6) || $t('form.rule.user_id'),
              (val) => (val && val.length <= 16) || $t('form.rule.user_id'),
            ]" />
        </div>
        <div class="items-start align-left column">
          <div class="sign-input-title">
            <span>{{ $t('common.label.extra_info') }}</span>
          </div>
          <q-input
            v-model="formData.moreInformation"
            :dark="false"
            :placeholder="$t('common.label.extra_info')"
            class="full-width"
            dense
            tabindex="1"
            :clearable="true"
            outlined
            :rules="[]" />
        </div>
      </q-step>
    </q-stepper>
    <div class="sign-up-bottom-area">
      <span>
        <q-btn
          no-caps
          flat
          unelevated
          color="primary"
          icon="arrow_back_ios"
          :label="$t('common.button.back')"
          class="btn-back text-gradient"
          v-if="step > 1"
          @click="onBack" />
      </span>

      <q-btn
        unelevated
        class="btn-sign-up"
        color="gradient"
        size="lg"
        :label="step !== 3 ? $t('common.button.next') : $t('common.button.sign_up')"
        :loading="loading"
        :disable="disableAction"
        @click="step !== 3 ? onNext() : onSignUp()">
        <template v-slot:loading>
          <q-spinner-pie />
        </template>
      </q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { apis } from 'src/stores/apis';
import { ref, watch } from 'vue';
import { UserCheckType, UserRole } from 'src/components/models/enums';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// const bankList = ref<IBanks[]>([]);
const signUpPwdShow = ref<boolean>(true);
const step = ref<number>(1);
const loadingIdCheck = ref<boolean>(false);
const isIdCheck = ref<boolean>(false);
const loadingNicCheck = ref<boolean>(false);
const isNickCheck = ref<boolean>(false);

const disableIdCheck = ref<boolean>(false);
const loading = ref<boolean>(false);
const popup = ref<any>(null);
const errorMsgId = ref<string | null>(null);
const errorMsgNick = ref<string | null>(null);
const errorMsgPassword = ref<string | null>(null);
const validPassword = ref<string>('');

const disableAction = ref<boolean>(false);

const formData = ref<ISignUp>({
  user_Id: '',
  password: '',
  referral_Id: '',
  nick: '', //영문만
  moreInformation: '',
  birthDate: '',
});
const sendData = ref<ISignUp>({
  user_Id: '',
  password: '',
  referral_Id: '',
  nick: '',
  moreInformation: '',
  birthDate: '',
  role: UserRole.User,
});

const emits = defineEmits(['success']);

const passwordValidCheck = (pw: any) => {
  const reg = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,15}$/;
  const hangulCheck = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;

  if (/(\w)\1\1\1/.test(pw)) {
    validPassword.value = t('form.error_msg.pwd_1');
    return false;
  } else if (pw.search(/\s/) != -1) {
    validPassword.value = t('form.error_msg.pwd_2');
    return false;
  } else if (hangulCheck.test(pw)) {
    validPassword.value = t('form.error_msg.pwd_3');
    return false;
  } else if (reg.test(pw) === false) {
    validPassword.value = t('form.error_msg.pwd_4');
  } else {
    return true;
  }
};

const onCheck = async (type: number) => {
  if (type === UserCheckType.Id) loadingIdCheck.value = true;
  else loadingNicCheck.value = true;
  const val = type === UserCheckType.Id ? formData.value.user_Id : formData.value.nick;
  const data = { root: type, user_Value: val };
  try {
    const response = await apis.UserCheckId(data);

    if (response.data.errCode === 0) {
      if (type === UserCheckType.Id) {
        isIdCheck.value = true;
        loadingIdCheck.value = false;
        sendData.value.user_Id = val;
        errorMsgId.value = null;
      }
      if (type === UserCheckType.Nickname) {
        isNickCheck.value = true;
        loadingNicCheck.value = false;
        sendData.value.nick = val;
        errorMsgNick.value = null;
      }
    } else {
      loadingIdCheck.value = false;
      loadingNicCheck.value = false;
      if (type === UserCheckType.Id) errorMsgId.value = response.data.errMessage;
      else errorMsgNick.value = response.data.errMessage;
    }
  } catch (error) {
    console.error(error);
    loadingIdCheck.value = false;
    loadingNicCheck.value = false;
  }
};

const onBack = () => {
  step.value = step.value - 1;
};

const onNext = () => {
  if (step.value === 1 && !isIdCheck.value) {
    errorMsgId.value = t('form.rule.verify_id');
  } else if (step.value === 1 && !formData.value.password) {
    errorMsgPassword.value = t('form.rule.empty');
  } else if (step.value === 2 && !isNickCheck.value) {
    errorMsgNick.value = t('form.rule.verify_nick');
  } else {
    step.value = step.value + 1;
  }
};

const dateFormat = (date: any) => {
  let dateFormat =
    date.getFullYear() +
    '-' +
    (date.getMonth() + 1 < 9 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) +
    '-' +
    (date.getDate() < 9 ? '0' + date.getDate() : date.getDate());
  return dateFormat;
};

const adultCheck = (birth: string) => {
  const minAge = 19;
  const my = birth.replaceAll('-', '');
  const now = dateFormat(new Date()).replaceAll('-', '');

  const yy = my.substr(0, 4);
  const mm = my.substr(2, 2);
  const dd = my.substr(6, 2);

  const sum = yy + mm + dd;

  const oyy = now.substr(0, 4);
  const omm = now.substr(2, 2);
  const odd = now.substr(6, 2);

  const minObj = Number(oyy) - minAge;
  const fix = minObj + omm + odd;

  return Number(sum) > Number(fix) ? false : true;
};

const onSignUp = async () => {
  try {
    const response = await apis.SignUp(sendData.value);
    if (response.data.errCode === 0) {
      emits('success');
    }
    loading.value = false;
  } catch (error) {
    console.error(error);
    loading.value = false;
  }
};

watch(formData.value, (v) => {
  if (v.user_Id !== sendData.value.user_Id || v.user_Id === null) {
    isIdCheck.value = false;
    errorMsgId.value = null;
  }
  if (v.nick !== sendData.value.nick || v.nick === null) {
    isNickCheck.value = false;
    errorMsgNick.value = null;
  }

  if (v.referral_Id === null || (v.referral_Id !== null && v.referral_Id.length > 0)) {
    disableAction.value = false;
  }

  if (step.value === 3 && v.referral_Id === null) {
    disableAction.value = true;
  }

  if (v.password === null || (v.password !== null && v.password.length > 0)) {
    errorMsgPassword.value = null;
  }

  sendData.value['password'] = v.password;
  sendData.value['referral_Id'] = v.referral_Id;
  sendData.value['birthDate'] = v.birthDate;
});

watch(step, (val) => {
  if (val === 3) {
    disableAction.value = true;
  } else {
    disableAction.value = false;
  }
});

watch(
  () => formData.value.birthDate,
  () => {
    popup.value.hide();
  },
);
</script>
<style scoped lang="scss">
.btn-verify {
  height: 100%;
  border-radius: 0.6rem;
  width: 10rem;
}

.btn-sign-up {
  width: 15rem;
  height: 4.7rem;
  border-radius: 0.6rem;
  color: #fff;
}

.sign-up-bottom-area {
  display: flex;
  justify-content: space-between;
  margin-top: 4rem;
}
</style>

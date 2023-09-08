<template>
  <a-modal
    v-model:visible="activeModal"
    :title="t('modal.title.change_password')"
    class="change-password-modal"
    :closable="false"
    :maskClosable="false"
  >
    <a-form-item v-if="props.type !== 'sign'" :label="t('modal.label.current_password')" class="change-password-modal">
      <a-input
        v-model:value="input.current"
        :placeholder="t('modal.label.current_password')"
        @change="focus = 'current'"
        type="password"
      />
      <a-typography-text type="danger">{{ feed.current }}</a-typography-text>
    </a-form-item>
    <a-form-item :label="t('modal.label.new_password')" class="change-password-modal">
      <a-input
        v-model:value="input.new"
        :placeholder="t('modal.label.new_password')"
        @change="focus = 'new'"
        type="password"
      />
      <a-typography-text type="danger">{{ feed.new }}</a-typography-text>
    </a-form-item>
    <a-form-item :label="t('modal.label.confirm_password')" class="change-password-modal">
      <a-input
        v-model:value="input.confirm"
        :placeholder="t('modal.label.confirm_password')"
        @change="focus = 'confirm'"
        type="password"
      />
      <a-typography-text type="danger">{{ feed.confirm }}</a-typography-text>
    </a-form-item>

    <template #footer>
      <a-button @click="closeBtn()">{{ t('common.button.close') }}</a-button>
      <a-button @click="confirmBtn()" type="primary" :disabled="confirmBtnHide">{{
        t('common.button.confirm')
      }}</a-button>
    </template>
  </a-modal>
</template>
<script setup>
import { onBeforeMount, onBeforeUnmount, ref, watch, reactive, computed } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { apis } from '@/store/api';

const { t } = useI18n();
const store = useStore();
const emits = defineEmits(['closeChangePassword', 'returnChangePassword']);
const props = defineProps({
  type: {
    type: String,
    default: 'default',
    require: false,
  },
  data: {
    type: String,
    require: false,
  },
});
const memberMailCertificationConfirm = computed(() => store.state['partner'].memberMailCertificationConfirm);
const changePassword = computed(() => store.state['partner'].changePassword);
const pwdRegExp = /^.*(?=^.{8,15}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[~!@#$%^&*()=+|/:;?<>']).*$/;
const input = reactive({
  current: '',
  new: '',
  confirm: '',
});
const feed = ref({
  current: '',
  new: '',
  confirm: '',
});
const activeModal = ref(true);
const confirmBtnHide = ref(true);
const focus = ref('');

const closeBtn = () => {
  activeModal.value = false;
  setTimeout(() => {
    emits('closeChangePassword');
  }, 300);
};
const confirmBtn = async () => {
  if (props.type === 'default') {
    await store.dispatch('partner/PartnerChangePassword', {
      OriginPassword: input.current,
      ChangePassword: input.new,
      ConfirmPassword: input.confirm,
      signature: [`${memberMailCertificationConfirm.value.returnData.signature}`],
    });
    if (changePassword.value.errCode === 0) {
      emits('returnChangePassword', changePassword.value.errMessage);
    } else {
      feed.value.confirm = changePassword.value.errMessage;
    }
  } else {
    const response = await apis.MemberResetPassword({
      user_Id: props.data,
      password: input.new,
      confirmPassword: input.confirm,
      signature: [`${memberMailCertificationConfirm.value.returnData.signature}`],
    });
    const getData = response.data;

    if (getData?.errCode === 0) {
      emits('returnChangePassword', getData.errMessage);
    } else {
      feed.value.confirm = getData.errMessage;
    }
  }
};
const headerRule = (val) => {
  if (focus.value === 'current') {
    if (val.current.match(pwdRegExp) === null) {
      feed.value.current = t('modal.error_msg.match_format');
    } else {
      feed.value.current = '';
    }
  }

  if (focus.value === 'new') {
    if (val.new.match(pwdRegExp) === null) {
      feed.value.new = t('modal.error_msg.match_format');
    } else {
      feed.value.new = '';
    }
  }

  if (focus.value === 'confirm') {
    if (val.confirm.match(pwdRegExp) === null) {
      feed.value.confirm = t('modal.error_msg.match_format');
    } else {
      feed.value.confirm = '';
    }
  }

  if (val.new !== val.confirm && val.new.length > 0 && val.confirm.length > 0) {
    feed.value.confirm = t('modal.error_msg.not_match');
  } else if (val.new === val.confirm && val.new.length > 0 && val.confirm.length > 0) {
    feed.value.confirm = '';
  }

  if (
    val.current.match(pwdRegExp) !== null &&
    val.new.match(pwdRegExp) !== null &&
    val.confirm.match(pwdRegExp) !== null &&
    val.new === val.confirm
  ) {
    confirmBtnHide.value = false;
  } else {
    confirmBtnHide.value = true;
  }
};
const signRule = (val) => {
  if (focus.value === 'new') {
    if (val.new.match(pwdRegExp) === null) {
      feed.value.new = t('modal.error_msg.match_format');
    } else {
      feed.value.new = '';
    }
  }

  if (focus.value === 'confirm') {
    if (val.confirm.match(pwdRegExp) === null) {
      feed.value.confirm = t('modal.error_msg.match_format');
    } else {
      feed.value.confirm = '';
    }
  }

  if (val.new !== val.confirm && val.new.length > 0 && val.confirm.length > 0) {
    feed.value.confirm = t('modal.error_msg.not_match');
  } else if (val.new === val.confirm && val.new.length > 0 && val.confirm.length > 0) {
    feed.value.confirm = '';
  }

  if (val.new.match(pwdRegExp) !== null && val.confirm.match(pwdRegExp) !== null && val.new === val.confirm) {
    confirmBtnHide.value = false;
  } else {
    confirmBtnHide.value = true;
  }
};
watch(input, (val) => {
  if (props.type === 'default') {
    headerRule(val);
  } else if (props.type === 'sign') {
    signRule(val);
  }
});

onBeforeMount(() => {
  confirmBtnHide.value = true;
  activeModal.value = true;
});
onBeforeUnmount(() => {
  input.value = {
    current: '',
    new: '',
    confirm: '',
  };
  feed.value = {
    current: '',
    new: '',
    confirm: '',
  };
});
</script>

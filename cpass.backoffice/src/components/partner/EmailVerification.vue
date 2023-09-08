<template>
  <a-modal
    v-model:visible="activeModal"
    :title="t('modal.title.email_verification')"
    class="confirm-email-modal"
    :closable="false"
    :maskClosable="false"
    @cancel="closeBtn()"
  >
    <fa-icon class="ico-lock" icon="fa-envelope"></fa-icon>
    <strong class="mb-gap">{{ t('modal.description.check_mail') }}</strong>
    <span class="mb-gap"
      >({{ t('common.label.email') }} : {{ props.type === 'default' ? userInfo.user_Id : props.data }})</span
    >
    <a-input-group class="mb-10" compact>
      <span class="relative-position">
        <input
          :class="{ pass: isPwd }"
          id="email-input-controller"
          @input="setInput"
          maxlength="6"
          :disabled="time === 0"
        />
        <span v-if="readyForInput" class="controller btn-change">{{ numToTime(time) }}</span>
        <div class="eye" :class="{ disabled: time === 0 }" @click="isPwd = !isPwd">
          <EyeOutlined v-if="!isPwd" />
          <EyeInvisibleOutlined v-if="isPwd" />
        </div>
      </span>
      <a-button
        :disabled="time > 150 || !readyForInput"
        type="primary"
        :loading="!readyForInput"
        @click="resendBtn()"
        >{{ btnFeed }}</a-button
      >
    </a-input-group>
    <a-typography-text type="danger" class="feed">{{ feed }}</a-typography-text>
    <template #footer>
      <a-button @click="closeBtn()">{{ t('common.button.close') }}</a-button>
      <a-button @click="confirmBtn()" type="primary" :disabled="inputNumber.length === 0 || time === 0">{{
        t('common.button.confirm')
      }}</a-button>
    </template>
  </a-modal>
</template>

<script setup>
import { ref, computed, onBeforeMount, onBeforeUnmount } from 'vue';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons-vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';

const store = useStore();
const { t } = useI18n();
const emits = defineEmits(['closeEmail', 'returnEmail']);
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
const signEmail = computed(() => props.data);
const type = computed(() => props.data);
const memberMailCertificationConfirm = computed(() => store.state['partner'].memberMailCertificationConfirm);
const activeModal = ref(true);
const inputNumber = ref('');
const time = ref(0);
let timeInterval;
const btnFeed = ref('');
const feed = ref('');
const userInfo = computed(() => store.state['sign'].userInfo);
const readyForInput = ref(false);
const isPwd = ref(true);
const regExp = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g;

const numToTime = (val) => {
  let min = Math.floor(val / 60);
  let sec = Math.floor(val % 60);

  const doubleDigits = (value) => {
    const length = String(value).length;
    return length === 1 ? '0' + value : value;
  };

  return `${doubleDigits(min)}:${doubleDigits(sec)}`;
};
const startTime = () => {
  time.value = 180;
  feed.value = '';
  timeInterval = setInterval(() => {
    time.value -= 1;
    if (time.value === 0) clearInterval(timeInterval);
  }, 1000);
};
const resendBtn = async () => {
  const userMail = props.type === 'default' ? userInfo.value.user_Id : props.data;

  readyForInput.value = false;
  feed.value = '';
  btnFeed.value = t('common.button.sending');

  await store.dispatch('partner/MemberMailCertification', {
    userMail: userMail,
    mail_Type: 2,
  });
  readyForInput.value = true;
  btnFeed.value = t('common.button.resend');
  clearInterval(timeInterval);
  startTime();
};
const closeBtn = () => {
  activeModal.value = false;
  setTimeout(() => {
    emits('closeEmail');
  }, 300);
};
const confirmBtn = async () => {
  const emailInputController = document.getElementById('email-input-controller');
  const userMail = props.type === 'default' ? userInfo.value.user_Id : props.data;

  await store.dispatch('partner/MemberMailCertificationConfirm', {
    method: 10,
    type: 2,
    email: userMail,
    pin_Number: inputNumber.value,
    mail_Type: 2,
  });

  if (memberMailCertificationConfirm.value.errCode === 0) {
    closeBtn();
    emits('returnEmail');
  } else {
    inputNumber.value = '';
    emailInputController.value = '';
    feed.value = memberMailCertificationConfirm.value.errMessage;
  }
};
const setInput = (val) => {
  const emailInputController = document.getElementById('email-input-controller');
  const newVal = val.target.value;

  if (newVal.match(regExp)) {
    emailInputController.value = emailInputController.value.replaceAll(regExp, '');
    alert('Please enter in English');
  } else {
    inputNumber.value = emailInputController.value;
  }
};

onBeforeMount(async () => {
  btnFeed.value = t('common.button.sending');
  const userMail = props.type === 'default' ? userInfo.value.user_Id : props.data;

  await store.dispatch('partner/MemberMailCertification', {
    userMail: userMail,
    mail_Type: 2,
  });
  readyForInput.value = true;
  activeModal.value = true;
  btnFeed.value = t('common.button.resend');
  startTime();
});
onBeforeUnmount(() => {
  clearInterval(timeInterval);
  time.value = 0;
  inputNumber.value = '';
  readyForInput.value = false;
});
</script>

<style scoped lang="scss">
.controller {
  position: absolute;
  right: 3rem;
  top: 0.5rem;
  z-index: 9999;
  color: #ff4d4f;
}
.eye {
  position: absolute;
  right: 1rem;
  top: 0.6rem;
  cursor: pointer;
  &.disabled {
    pointer-events: none;
    opacity: 0.5;
  }
}

.relative-position {
  position: relative;
  width: 100%;
}
.pass {
  -webkit-text-security: disc;
  -moz-text-security: disc;
  text-security: disc;
}

#email-input-controller {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-variant: tabular-nums;
  list-style: none;
  font-feature-settings: 'tnum';
  position: relative;
  display: inline-block;
  width: 100%;
  min-width: 0;
  padding: 4px 11px;
  color: rgba(0, 0, 0, 0.85);
  font-size: 14px;
  line-height: 1.5715;
  background-color: #fff;
  background-image: none;
  border-radius: 2px;
  transition: all 0.3s;
  border: 1px solid #d9d9d9;
  &:focus {
    border-color: #40a9ff;
    box-shadow: 0 0 0 2px rgb(24 144 255 / 20%);
    border-right-width: 1px !important;
    outline: 0;
  }
  &:disabled {
    color: rgba(0, 0, 0, 0.25);
    background-color: #f5f5f5;
    border-color: #d9d9d9;
    box-shadow: none;
    cursor: not-allowed;
    opacity: 1;
  }
}
</style>

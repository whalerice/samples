<template>
  <a-modal v-model:visible="isShow" centered :title="$t('modal.title.email_inquiry')">
    <a-form :model="inquiryContent" layout="vertical" class="email-inquiry-box" labelAlign="left">
      <a-form-item :label="$t('modal.label.id')">
        <a-input v-model:value="modelRef.user_Id" disabled />
      </a-form-item>
      <a-form-item :label="$t('modal.label.email_address')" v-bind="validateInfos.email">
        <a-input v-model:value="modelRef.email" />
      </a-form-item>
      <a-form-item :label="$t('modal.label.category')" v-bind="validateInfos.category">
        <a-select v-model:value="categoryValue" :placeholder="$t('modal.placeholder.select')" label-in-value>
          <a-select-option
            v-for="item in categories"
            :value="item.value"
            :key="item.value"
            @click="changeCategory(item)"
          >
            {{ $t(item.text) }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item :label="$t('modal.label.subject')" v-bind="validateInfos.subject">
        <a-input
          :maxlength="500"
          show-count
          :placeholder="$t('modal.placeholder.enter_subject')"
          v-model:value="modelRef.subject"
        />
      </a-form-item>
      <a-form-item :label="$t('modal.label.message')" v-bind="validateInfos.message">
        <a-textarea
          :rows="4"
          :maxlength="4000"
          :showCount="true"
          :placeholder="$t('modal.placeholder.enter_message')"
          v-model:value="modelRef.message"
        />
      </a-form-item>
    </a-form>
    <template #footer>
      <a-button key="submit" type="primary" @click.prevent="onSubmit">
        {{ $t('common.button.send') }}
      </a-button>
    </template>
  </a-modal>
</template>
<script setup>
import { ref, reactive, computed, watch, onUpdated } from 'vue';
import { useStore } from 'vuex';
import { Modal, Form } from 'ant-design-vue';
import { lottieModal } from '@/assets/js/global.js';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const store = useStore();
const userInfo = computed(() => store.state['sign'].userInfo);
const emailInquiryRes = computed(() => store.state['partner'].emailInquiryRes);

const categoryValue = ref();

const useForm = Form.useForm;

const modelRef = ref({
  user_Id: userInfo.value.user_Id,
  email: userInfo.value.user_Id,
  category: 0,
  subject: '',
  message: '',
});

const inquirySendData = ref({
  guest_Id: '',
  receiveEmail: modelRef.value.email,
  mainValue: 2,
  middleValue: modelRef.value.category,
  step: 1,
  router: 3,
  title: modelRef.value.subject,
  contents: modelRef.value.message,
});

const rulesRef = ref({
  user_Id: [
    {
      required: true,
    },
  ],
  email: [
    {
      required: true,
      message: t('component.error.input_email'),
    },
  ],
  category: [
    {
      required: true,
      message: t('component.error.select_category'),
    },
  ],
  subject: [
    {
      required: true,
      message: t('component.error.input_subject'),
    },
  ],
  message: [
    {
      required: true,
      message: t('component.error.input_message'),
    },
  ],
});
const { resetFields, validate, validateInfos } = useForm(modelRef.value, rulesRef);

const onSubmit = () => {
  rulesRef.value.email[0].message = t('component.error.input_email');
  rulesRef.value.category[0].message = t('component.error.select_category');
  rulesRef.value.subject[0].message = t('component.error.input_subject');
  rulesRef.value.message[0].message = t('component.error.input_message');
  validate()
    .then(async (res) => {
      await store.dispatch('partner/sendInquiry', inquirySendData.value);
    })
    .catch((err) => {
      console.error(err);
    });
};

const reset = () => {
  resetFields();
};

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  formFormat: {
    type: Object,
    required: true,
  },
  categories: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['open', 'close']);

const isShow = computed({
  get() {
    return props.show;
  },
  set(val) {
    emit('close', val);
  },
});

const inquiryContent = computed({
  get() {
    return props.formFormat;
  },
});

const categoryOptions = computed({
  get() {
    return props.categories;
  },
});

const changeCategory = (value) => {
  modelRef.value.category = value.value;
  categoryValue.value = value.value;
};

const confirmModal = async (val) => {
  if (val.errCode === 0) {
    await lottieModal(t('confirm.title.success_sended'), 'inquiry', 2.5);
    isShow.value = false;
  } else {
    Modal.error({
      title: val.errMessage,
      okText: t('common.button.confirm'),
      onOk() {
        isShow.value = false;
      },
    });
  }
};

watch(emailInquiryRes, (val) => {
  confirmModal(val);
});

watch(modelRef.value, (val) => {
  inquirySendData.value.title = val.subject;
  inquirySendData.value.contents = val.message;
  inquirySendData.value.middleValue = val.category;
  inquirySendData.value.receiveEmail = val.email;
});

onUpdated(() => {
  if (isShow.value === false) {
    modelRef.value.category = 0;
    categoryValue.value = undefined;
    reset();
  }
});
</script>

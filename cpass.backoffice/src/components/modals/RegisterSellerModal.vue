<template>
  <a-modal v-model:visible="isVisible" centered title="Register" @cancel="handleCancel" width="auto">
    <template #footer>
      <a-button @click="reset">Reset</a-button>
      <a-button key="back" @click="handleCancel">Cancel</a-button>
      <a-button type="primary" @click.prevent="onSubmit">Create</a-button>
    </template>
    <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 30 }" labelAlign="left">
      <a-form-item label="User ID" v-bind="validateInfos.id">
        <a-row :gutter="[10, 10]">
          <a-col :span="12"><a-input v-model:value="modelRef.id" placeholder="Input user ID" /></a-col>
          <a-col :span="12"
            ><a-select
              v-model:value="modelRef.type"
              label-in-value
              :options="gradeList"
              class=""
              dropdownClassName=""
            ></a-select
          ></a-col>
        </a-row>
      </a-form-item>
      <a-form-item label="Password" v-bind="validateInfos.password">
        <a-input v-model:value="modelRef.password" type="password" autocomplete="off" />
      </a-form-item>
      <a-form-item label="Referral Code" v-bind="validateInfos.referralCode">
        <a-input v-model:value="modelRef.referralCode" />
      </a-form-item>
      <a-form-item label="Referral Description" v-bind="validateInfos.referralDescription">
        <a-textarea v-model:value="modelRef.referralDescription" :auto-size="{ minRows: 3, maxRows: 3 }" />
      </a-form-item>
      <a-form-item label="Referral Rate" v-bind="validateInfos['referralRate.higher']">
        <div class="rate-row">
          <div class="rate-cell rate-header">
            <div class="rate-col"></div>
            <div class="rate-col">Rate</div>
            <div class="rate-col">Final Rate</div>
          </div>
          <a-divider />
          <div class="rate-cell">
            <div class="rate-col">{{ authorityHigher }}</div>
            <div class="rate-col"><a-input v-model:value="modelRef.referralRate.higher" />%</div>
            <div class="rate-col">{{ higherCalVal.toFixed(2) }}%</div>
          </div>
          <div class="rate-cell">
            <div class="rate-col">{{ modelRef?.type?.label }}</div>
            <div class="rate-col"><a-input v-model:value="modelRef.referralRate.lower" disabled />%</div>
            <div class="rate-col">{{ lowerCalVal.toFixed(2) }}%</div>
          </div>
        </div>
      </a-form-item>
      <a-form-item label="Memo" v-bind="validateInfos.memo">
        <a-textarea v-model:value="modelRef.memo" :auto-size="{ minRows: 3, maxRows: 3 }" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { Form, Modal } from 'ant-design-vue';
import { h, ref, reactive, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';

const useForm = Form.useForm;
const store = useStore();

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
});

const isVisible = computed({
  get() {
    return props.visible;
  },
  set(val) {
    emit('close', val);
  },
});

const emit = defineEmits(['close']);

const gradeList = computed(() => store.getters['common/gradeList']);
const userInfo = computed(() => store.state['sign'].userInfo);
const formErr = computed(() => store.state['manager'].formSubmitError);

const authorityHigher = ref('');

const modelRef = ref({
  id: '',
  type: gradeList.value[0],
  password: '',
  referralCode: '',
  referralDescription: '',
  referralRate: {
    higher: 100,
    lower: 0,
  },
  memo: '',
});

const higherCalVal = ref(0);
const lowerCalVal = ref(0);

const { resetFields, validate, validateInfos } = useForm(
  modelRef.value,
  reactive({
    id: [
      {
        required: true,
        message: 'Please input id',
      },
    ],
    password: [
      {
        required: true,
        message: 'Please input password',
      },
    ],
    referralCode: [
      {
        required: true,
        message: 'Please input Referral Code',
      },
    ],
    referralDescription: [
      {
        required: false,
        message: 'Please input Referral Description',
      },
    ],
    'referralRate.higher': [
      {
        required: false,
        message: '',
      },
    ],
    memo: [
      {
        required: false,
        message: '',
      },
    ],
  }),
);

const calcRate = (val) => {
  if (userInfo.value.base_Rate > 0) {
    higherCalVal.value = (val / 100) * userInfo.value.base_Rate;
    lowerCalVal.value = userInfo.value.base_Rate - higherCalVal.value;
  } else {
    higherCalVal.value = (val / 100) * 100;
    lowerCalVal.value = 100 - higherCalVal.value;
  }
};

const reset = () => {
  resetFields();
};

const onSubmit = () => {
  validate()
    .then(async (res) => {
      await store.dispatch('manager/register', modelRef.value);
    })
    .catch((err) => {
      console.error(err);
    });
};
const handleCancel = () => {
  isVisible.value = false;
  resetFields();
};

const successModal = () => {
  Modal.success({
    title: () => 'This is a success message',
    content: () => h('div', {}, [h('p', 'Registration completed')]),
    onOk() {
      reset();
    },
  });
};

const errorModal = (msg) => {
  Modal.error({
    title: () => 'This is an error message',
    content: () => msg,
  });
};

watch(modelRef.value, (val) => {
  if (val.referralRate.higher) {
    const textString = String(val.referralRate.higher);
    let result = textString.replace(/(^0+)/, '').replace(/[^0-9]/g, '');
    if (Number(result) > 100) {
      result = 100;
    }
    val.referralRate.higher = result;
    calcRate(val.referralRate.higher);
    val.referralRate.lower = 100 - val.referralRate.higher;
  }
});

watch(formErr, (val) => {
  if (val.errCode < 0) {
    errorModal(val.errMessage);
  } else {
    successModal();
  }
});

onMounted(() => {
  calcRate(modelRef.value.referralRate.higher);
});
</script>

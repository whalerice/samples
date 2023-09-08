<template>
  <a-modal
    v-model:visible="visible"
    :destroyOnClose="true"
    :forceRender="true"
    :title="!props.data?.idx ? $t('modal.title.ip_register') : $t('modal.title.ip_edit')"
    centered
    :confirmLoading="loading"
    @ok="onSubmit"
    :afterClose="afterClose">
    <a-form layout="vertical">
      <a-form-item :label="$t('common.label.ip')" v-bind="validateInfos.ip">
        <a-input v-model:value="modelRef.ip" @blur="validate('ip', { trigger: 'blur' }).catch(() => {})" />
      </a-form-item>
      <a-form-item :label="$t('common.label.memo')">
        <a-textarea v-model:value="modelRef.memo" :auto-size="{ minRows: 2, maxRows: 5 }" />
      </a-form-item>
    </a-form>
    <a-space>
      <span>{{ $t('common.label.allow') }}</span>
      <a-switch v-model:checked="modelRef.isAllow" size="small" />
    </a-space>
  </a-modal>
</template>

<script setup lang="ts">
import { computed, onUpdated, reactive, ref, toRaw } from 'vue';
import { Form, message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';

import { apis } from 'src/stores/apis';

const { t } = useI18n();
const useForm = Form.useForm;

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  data: {
    type: Object || null,
    required: true,
  },
});

const visible = computed({
  get() {
    return props.show;
  },
  set(value) {
    emits('close', value);
  },
});

const emits = defineEmits(['close']);

const modelRef = reactive({
  ip: '',
  memo: '',
  isAllow: false,
});

const rulesRef = reactive({
  ip: [
    {
      required: true,
      message: t('form.rule.empty'),
    },
  ],
});

const loading = ref<boolean>(false);

const { resetFields, validate, validateInfos } = useForm(modelRef, rulesRef);
//  58.151.190.236
const onSubmit = () => {
  validate()
    .then(() => {
      submit(toRaw(modelRef));
    })
    .catch((err) => {
      console.log('error', err);
    });
};

const submit = async (data: any) => {
  loading.value = true;

  const send = {
    idx: props.data?.idx,
    site_Idx: props.data.siteIdx,
    ipAddress: data.ip,
    memo: data.memo,
    isallow: data.isAllow,
  };

  if (!props.data?.idx) {
    delete send.idx;
  }
  try {
    const response = props.data?.idx
      ? await apis.manager.SiteAllowIpUpdate(send)
      : await apis.manager.SiteAllowIpRegister(send);

    if (response.data.errCode === 0) {
      message.success(response.data.errMessage);
    }
    setTimeout(() => {
      loading.value = false;
      visible.value = false;
    }, 300);
  } catch (error) {
    loading.value = false;
    console.error(error);
  }
};

onUpdated(() => {
  if (visible.value) {
    if (props.data?.idx) {
      modelRef.ip = props.data.ipAddress;
      modelRef.memo = props.data.memo;
      modelRef.isAllow = props.data.isallow;
    }
  }
});

const afterClose = () => {
  resetFields();
};
</script>

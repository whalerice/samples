<template>
  <a-modal v-model:visible="visible" title="리소스 등록/수정" :destroyOnClose="true" :forceRender="true" @ok="onClose">
    <template #footer>
      <a-button key="back" @click="onClose">
        {{ $t('common.button.cancel') }}
      </a-button>
      <a-button type="primary" :loading="loading" @click="onSave">
        {{ props.data !== null ? $t('common.button.edit') : $t('common.button.register') }}
      </a-button>
    </template>
    <!-- :rules="[{ required: true, message: $t('form.rule.empty') }]" -->
    <a-form :model="formState" layout="vertical" autocomplete="off">
      <a-form-item :label="$t('table.thead.resource_key')" name="resource_key">
        <a-input v-model:value="formState.resource_Key" allowClear />
      </a-form-item>
      <a-form-item :label="$t('common.language.en')" name="en">
        <a-input v-model:value="formState.en" allowClear />
      </a-form-item>
      <a-form-item :label="$t('common.language.ko')" name="ko">
        <a-input v-model:value="formState.ko" allowClear />
      </a-form-item>
      <a-form-item :label="$t('common.language.zh')" name="cn">
        <a-input v-model:value="formState.cn" allowClear />
      </a-form-item>
      <a-form-item :label="$t('common.language.ja')" name="jp">
        <a-input v-model:value="formState.jp" allowClear />
      </a-form-item>
      <a-form-item :label="$t('common.language.ph')" name="ph">
        <a-input v-model:value="formState.ph" allowClear />
      </a-form-item>
      <a-form-item :label="$t('common.language.ru')" name="ru">
        <a-input v-model:value="formState.ru" allowClear />
      </a-form-item>
      <a-form-item :label="$t('common.language.th')" name="th">
        <a-input v-model:value="formState.th" allowClear />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import { computed, ref, onBeforeUpdate } from 'vue';

import { apis } from 'src/stores/apis';

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  data: {
    type: Object || null,
    required: false,
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

const loading = ref<boolean>(false);

const formState = ref<IResource>({
  resource_Key: '',
  ko: '',
  cn: '',
  en: '',
  ph: '',
  jp: '',
  ru: '',
  th: '',
});

const onClose = () => {
  visible.value = false;
};

const onSave = async () => {
  loading.value = true;

  try {
    const response = await apis.manager.ResourceSetting(formState.value);

    if (response.data.errCode === 0) {
      visible.value = false;

      setTimeout(() => {
        message.success(response.data.errMessage);
        loading.value = false;
      }, 500);
    }
  } catch (error) {
    console.error(error);
    loading.value = false;
  }
};

onBeforeUpdate(() => {
  if (visible.value) {
    if (props.data !== null) {
      formState.value.resource_Key = props.data?.resource_Key;
      formState.value.en = props.data?.en;
      formState.value.ko = props.data?.ko;
      formState.value.cn = props.data?.cn;
      formState.value.jp = props.data?.jp;
      formState.value.ph = props.data?.ph;
      formState.value.ru = props.data?.ru;
      formState.value.th = props.data?.th;
    }
  } else {
    formState.value = {
      resource_Key: '',
      ko: '',
      cn: '',
      en: '',
      ph: '',
      jp: '',
      ru: '',
      th: '',
    };
  }
});
</script>

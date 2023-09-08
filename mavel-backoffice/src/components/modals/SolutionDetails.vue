<template>
  <a-modal v-model:visible="visible" :destroyOnClose="true" :forceRender="true" @ok="onClose">
    <template #title>
      {{ props.data === null ? $t('modal.title.solution_register') : $t('modal.title.solution_edit') }}
    </template>
    <template #footer>
      <a-button key="back" @click="onClose">
        {{ $t('common.button.cancel') }}
      </a-button>
      <a-button type="primary" :loading="loading" @click="onEdit" v-if="props.data !== null">
        {{ $t('common.button.edit') }}
      </a-button>
      <a-button type="primary" :loading="loading" @click="onRegister" v-if="props.data === null">
        {{ $t('common.button.register') }}
      </a-button>
    </template>
    <a-form :model="formState" layout="vertical" autocomplete="off">
      <a-form-item
        :label="$t('table.thead.solution_name')"
        name="name"
        :rules="[{ required: true, message: $t('form.rule.empty') }]">
        <a-input v-model:value="formState.name" allowClear />
      </a-form-item>
      <a-form-item
        :label="$t('table.thead.api_key')"
        name="name"
        :rules="[{ required: true, message: $t('form.rule.empty') }]">
        <a-input v-model:value="formState.key" allowClear />
      </a-form-item>
      <a-form-item
        :label="$t('table.thead.api_url')"
        name="name"
        :rules="[{ required: true, message: $t('form.rule.empty') }]">
        <a-input v-model:value="formState.url" allowClear />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
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

const formState = ref<any>({
  name: '',
  key: '',
  url: '',
});

const onEdit = async () => {
  loading.value = true;

  const send = {
    idx: props.data?.idx,
    name: formState.value.name,
    api_Key: formState.value.key,
    api_Url: formState.value.url,
  };

  try {
    const response = await apis.manager.SolutionModify(send);
    if (response.data.errCode === 0) {
      setTimeout(() => {
        loading.value = false;
        visible.value = false;
      }, 1000);
    }
  } catch (error) {
    console.error(error);
    loading.value = false;
  }
};

const onRegister = async () => {
  loading.value = true;
  const send = {
    name: formState.value.name,
    api_Key: formState.value.key,
    api_Url: formState.value.url,
  };

  try {
    const response = await apis.manager.SolutionRegister(send);
    if (response.data.errCode === 0) {
      setTimeout(() => {
        loading.value = false;
        visible.value = false;
      }, 1000);
    }
  } catch (error) {
    console.error(error);
    loading.value = false;
  }
};

const onClose = () => {
  visible.value = false;
};

onBeforeUpdate(() => {
  if (visible.value) {
    if (props.data !== null) {
      formState.value['name'] = props.data?.name;
      formState.value['key'] = props.data?.api_Key;
      formState.value['url'] = props.data?.api_Url;
    } else {
      formState.value.name = '';
      formState.value.key = '';
      formState.value.url = '';
    }
  }
});
</script>

<template>
  <a-modal
    v-model:visible="visible"
    :destroyOnClose="true"
    :forceRender="true"
    color="primary"
    :confirmLoading="isLoading"
    @ok="onCreate"
    :afterClose="afterClose">
    <template #title>
      <span class="title q-mr-xs">
        {{ $t('common.button.create_block') }}
      </span>
    </template>
    <a-form layout="vertical" :model="formState">
      <a-form-item :label="$t('form.label.type')" :rules="[{ required: true, message: $t('form.rule.empty_select') }]">
        <a-select
          v-model:value="formState.type"
          :options="options.blockType"
          :placeholder="$t('common.placeholder.select')" />
      </a-form-item>

      <a-form-item :label="$t('form.label.words')" :rules="[{ required: true, message: $t('form.rule.empty') }]">
        <a-input v-model:value="formState.words" :placeholder="$t('form.label.words')" allowClear />
      </a-form-item>

      <a-form-item :label="$t('form.label.memo')" :rules="[{ required: true, message: $t('form.rule.empty') }]">
        <a-textarea
          v-model:value="formState.memo"
          :placeholder="$t('form.label.memo')"
          :auto-size="{ minRows: 5, maxRows: 5 }"
          allowClear />
      </a-form-item>

      <div class="text-red error-message">{{ serverError }}</div>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import type { SelectProps } from 'ant-design-vue';
import { computed, reactive, ref } from 'vue';
import { options } from 'src/boot/global';
import { apis } from 'src/stores/apis';

const props = defineProps({
  show: {
    type: Boolean,
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

interface IFormState {
  type: SelectProps | null;
  words: string;
  memo: string;
}

const formState = reactive<IFormState>({
  type: null,
  words: '',
  memo: '',
});
const isLoading = ref<boolean>(false);
const serverError = ref<string>();

const onCreate = async () => {
  const send = {
    block_Type: formState.type,
    block_Words: formState.words,
    memo: formState.memo,
  };
  try {
    const response = await apis.manager.BlockUser(send);

    if (response.data.errCode === 0) {
      visible.value = false;
    }
    setTimeout(() => {
      isLoading.value = false;
    }, 100);
  } catch (error) {
    console.error(error);
  }
};
const afterClose = () => {
  formState.type = null;
  formState.words = '';
  formState.memo = '';
};
</script>

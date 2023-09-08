<template>
  <a-modal
    centered
    :title="$t('common.word.email_inquiry')"
    :destroyOnClose="true"
  >
    <a-form
      :model="formState"
      :rules="rules"
      @Finish="onFinish"
      layout="vertical"
    >
      <a-form-item :label="$t('common.word.id')">
        <a-input value="khr157929@quagga.ai" disabled />
      </a-form-item>
      <a-form-item
        has-feedback
        name="email"
        :label="$t('common.word.email_address')"
        type="email"
      >
        <a-input
          v-model:value="formState.email"
          allow-clear
          autocomplete="off"
        />
      </a-form-item>
      <a-form-item :label="$t('common.word.title')" name="title">
        <a-input
          v-model:value="formState.title"
          show-count
          :maxlength="500"
          autocomplete="off"
        />
      </a-form-item>
      <a-form-item :label="$t('common.word.message')" name="message">
        <a-textarea
          v-model:value="formState.message"
          show-count
          :maxlength="4000"
        />
      </a-form-item>
    </a-form>

    <template #footer>
      <a-button :disabled="disabled" type="primary" html-type="submit">
        {{ $t('common.word.send') }}
      </a-button>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { Rule } from 'ant-design-vue/lib/form';
import { emailRegex } from '@/utils/rules';
import { ref, computed } from 'vue';

const formState = ref({
  email: '',
  title: '',
  message: '',
});

const validateEmail = async (_rule: Rule, value: string) => {
  if (value === '') {
    return Promise.reject('Please input your email.');
  } else if (!value.match(emailRegex)) {
    return Promise.reject('Please input the collect email.');
  }
  return Promise.resolve();
};

const rules: Record<string, Rule[]> = {
  email: [{ required: true, validator: validateEmail, trigger: 'change' }],
  title: [{ required: true }],
  message: [{ required: true }],
};

const onFinish = () => {
  //
};

const disabled = computed(() => {
  return (
    !formState.value.email.match(emailRegex) ||
    formState.value.message.length === 0 ||
    formState.value.title.length === 0
  );
});
</script>

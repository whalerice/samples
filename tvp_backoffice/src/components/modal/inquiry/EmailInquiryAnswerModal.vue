<template>
  <a-modal
    centered
    :title="$t('common.word.customer_inquiry')"
    :destroyOnClose="true"
    :afterClose="afterClose"
  >
    <a-config-provider componentSize="middle">
      <a-form :model="formState" @Finish="onFinish" layout="vertical">
        <a-form-item :label="$t('common.word.id')">
          <a-input :value="formState.id" disabled />
        </a-form-item>
        <a-form-item :label="$t('common.word.email_address')">
          <a-input :value="formState.email" disabled />
        </a-form-item>
        <a-form-item :label="$t('common.word.category1')">
          <a-input :value="formState.category1" disabled />
        </a-form-item>
        <a-form-item :label="$t('common.word.category2')">
          <a-input :value="formState.category2" disabled />
        </a-form-item>
        <a-form-item :label="$t('common.word.title')">
          <a-textarea
            :value="formState.title"
            disabled
            :auto-size="{ minRows: 1, maxRows: 10 }"
          />
        </a-form-item>

        <a-divider></a-divider>

        {{ formState.status }}
        <a-form-item :label="$t('common.word.message')">
          <a-textarea
            :value="formState.message"
            disabled
            :auto-size="{ minRows: 2, maxRows: 6 }"
          />
        </a-form-item>
        <a-form-item :label="$t('common.word.answer')">
          <a-textarea
            v-model:value="formState.answer"
            show-count
            :maxlength="2000"
            :disabled="formState.status === 3"
            :auto-size="{ minRows: 3, maxRows: 10 }"
          />
        </a-form-item>
      </a-form>
    </a-config-provider>
    <template #footer>
      <a-button
        :disabled="formState.answer.length === 0"
        type="primary"
        html-type="submit"
      >
        {{ $t('common.word.complete') }}
      </a-button>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { optionList } from '@/utils/constants';

const { t: $t } = useI18n();

interface IAnswerData {
  idName: string;
  email: string;
  category1: number;
  category2: number;
  title: string;
  message: string;
  status: number;
}

const props = defineProps({
  answerData: { type: Object as PropType<IAnswerData>, required: true },
});

const formState = ref({
  id: computed(() => props.answerData.idName),
  email: computed(() => props.answerData.email),
  category1: computed(() =>
    props.answerData.category1 === 0
      ? $t('common.word.cpass_wallet')
      : props.answerData.category1 === 1
      ? $t('common.word.cpass_payment')
      : $t('common.word.tvp')
  ),
  category2: computed(() =>
    $t(optionList.inquiryCategory.child[props.answerData.category2])
  ),
  title: computed(() => props.answerData.title),
  message: computed(() => props.answerData.message),
  answer: '',
  status: computed(() => props.answerData.status),
});

const onFinish = () => {
  //
};

const afterClose = () => {
  formState.value.answer = '';
};
</script>

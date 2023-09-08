<template>
  <a-modal
    v-model:visible="visible"
    :ok-text="$t('common.label.send_note')"
    :cancel-text="$t('common.button.cancel')"
    :destroyOnClose="true"
    :forceRender="true"
    :confirm-loading="confirmLoading"
    @ok="onSend">
    <template #title v-if="direct"> {{ $t('modal.title.send_note') }} </template>
    <a-comment v-if="!direct">
      <template #author>{{ props.data.sender_Id }} / {{ props.data.sender_Nick }}</template>
      <template #avatar>
        <user-outlined />
      </template>
      <template #content>
        <h5>
          {{ props.data.title }}
        </h5>
        <p>{{ props.data.content }}</p>
      </template>
      <template #datetime>
        {{ props.data.registration_Date }}
      </template>
    </a-comment>
    <a-divider v-if="!direct">{{ $t('common.text.answer') }}</a-divider>
    <a-space direction="vertical" :size="10" class="full-width">
      <a-input v-model:value="title" show-count :maxlength="20" :placeholder="$t('form.placeholder.title')" />
      <a-textarea
        v-model:value="content"
        show-count
        :maxlength="100"
        :autoSize="{ minRows: 4, maxRows: 6 }"
        :placeholder="$t('form.placeholder.input_message')" />
    </a-space>
  </a-modal>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import { UserOutlined } from '@ant-design/icons-vue';
import { computed, onUpdated, ref } from 'vue';

import { apis } from 'src/stores/apis';

const title = ref<string>('');
const content = ref<string>('');
const direct = ref<boolean>(false);

const confirmLoading = ref<boolean>(false);

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  data: {
    type: Object,
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

const onSend = async () => {
  confirmLoading.value = true;

  const send = {
    messageType: 3, // 3: 관리자가 유저에게, 4: 유저가 관리자에게
    receiver_Idx: props.data.sender_Idx,
    title: title.value,
    content: content.value,
  };
  try {
    const response = await apis.manager.SendMessage(send);
    if (response.data.errCode === 0) {
      setTimeout(() => {
        visible.value = false;
        confirmLoading.value = false;
        message.success(response.data.errMessage);
      }, 500);
    }
  } catch (error) {
    console.error(error);
  }
  // console.log('ok');
};

onUpdated(() => {
  if (visible.value) {
    if (props.data.title === undefined || props.data.title === null) {
      direct.value = true;
    }
  } else {
    title.value = '';
    content.value = '';
  }
});
</script>

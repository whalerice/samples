<template>
  <a-modal
    v-model:visible="visible"
    :title="$t('nav.payment')"
    :destroyOnClose="true"
    :forceRender="true"
    @ok="onClose">
    <template #footer>
      <a-button key="back" @click="onClose">
        {{ $t('common.button.cancel') }}
      </a-button>
      <a-button type="primary" :loading="loading" @click="onUpdate" v-if="props.data !== null">
        {{ $t('common.button.edit') }}
      </a-button>
      <a-button type="primary" :loading="loading" @click="onRegister" v-if="props.data === null">
        {{ $t('common.button.register') }}
      </a-button>
    </template>
    <a-row :gutter="[10, 10]">
      <a-col span="24">
        <a-select
          v-model:value="payment"
          :options="options.paymentType"
          class="full-width"
          :placeholder="$t('common.placeholder.select')" />
      </a-col>
      <a-col span="24">
        <a-input v-model:value="text" :placeholder="payment === 1 ? $t('common.placeholder.enter_payment_code') : ''" />
      </a-col>
      <a-col span="24">
        <a-space :size="5">
          <span>{{ $t('table.thead.is_use') }}</span>
          <a-switch v-model:checked="isUse" size="small" />
        </a-space>
      </a-col>
    </a-row>
  </a-modal>
</template>

<script setup lang="ts">
import { computed, ref, onBeforeUpdate } from 'vue';

import { options } from 'src/boot/global';
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
const isUse = ref<boolean>(false);
const payment = ref<number | null>(null);
const text = ref<string>('');

const onClose = () => {
  visible.value = false;
};

const onUpdate = async () => {
  loading.value = true;
  const send = {
    idx: props.data?.idx,
    payment_Code: text.value,
    is_Use: isUse.value,
  };
  try {
    const response = await apis.manager.SitePaymentModify(send);
    if (response.data.errCode === 0) {
      setTimeout(() => {
        loading.value = false;
        visible.value = false;
      }, 1000);
    }
  } catch (error) {
    console.error(error);
  }
};

const onRegister = async () => {
  loading.value = true;
  const send = {
    payment_Idx: payment.value,
    payment_Code: text.value,
    is_Use: isUse.value,
  };

  try {
    const response = await apis.manager.SitePaymentRegister(send);
    if (response.data.errCode === 0) {
      setTimeout(() => {
        loading.value = false;
        visible.value = false;
      }, 500);
    }
  } catch (error) {
    loading.value = false;
    console.error(error);
  }
};

onBeforeUpdate(() => {
  if (visible.value) {
    if (props.data !== null) {
      payment.value = props.data?.payment_Idx;
      text.value = props.data?.payment_Code;
      isUse.value = props.data?.is_Use;
    }
  } else {
    text.value = '';
    payment.value = null;
    isUse.value = false;
  }
});
</script>

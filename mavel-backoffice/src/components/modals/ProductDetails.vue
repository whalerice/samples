<template>
  <a-modal
    v-model:visible="visible"
    :title="props.data === null ? $t('modal.title.product_register') : $t('modal.title.product_edit')"
    :destroyOnClose="true"
    :forceRender="true"
    @ok="onClose">
    <template #footer>
      <a-button key="back" @click="onClose">
        {{ $t('common.button.cancel') }}
      </a-button>
      <a-button type="primary" :loading="loading" @click="onUpdate">
        {{ props.data !== null ? $t('common.button.edit') : $t('common.button.register') }}
      </a-button>
    </template>
    <a-form :model="formState" layout="vertical" autocomplete="off">
      <a-form-item
        :label="$t('table.thead.product_name')"
        name="name"
        :rules="[{ required: true, message: $t('form.rule.empty') }]">
        <a-input v-model:value="formState.name" allowClear />
      </a-form-item>
      <a-form-item
        :label="$t('table.thead.price')"
        name="price"
        :rules="[{ required: true, message: $t('form.rule.empty') }]">
        <a-input-number
          v-model:value="formState.price"
          :min="0"
          :formatter="(val:number) => comma(val)"
          oninput="javascript: this.value = this.value.replace(/[^0-9]/g, '' );"
          class="full-width text-right" />
      </a-form-item>
      <a-form-item :label="$t('table.thead.discount')" name="discount">
        <a-input-number
          v-model:value="formState.discount"
          :min="0"
          :max="100"
          :formatter="(value:number) => `${value}%`"
          :parser="(value:string) => value.replace('%', '')"
          class="full-width text-right" />
      </a-form-item>
    </a-form>
    <a-space :size="10">
      <span>{{ $t('table.thead.is_use') }}</span>
      <a-switch v-model:checked="formState.state" size="small" />
    </a-space>
  </a-modal>
</template>

<script setup lang="ts">
import { computed, ref, onBeforeUpdate } from 'vue';

import { comma } from 'src/boot/global';
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
  price: 0,
  discount: 0,
  state: false,
});

const onClose = () => {
  visible.value = false;
};

const onUpdate = async () => {
  loading.value = true;
  const send = {
    idx: props.data?.no,
    productName: formState.value.name,
    price: formState.value.price,
    descount: formState.value.discount,
    isUse: formState.value.state,
  };
  if (props.data === null) {
    delete send.idx;
  }

  try {
    const response = await apis.manager.ProductUpdate(send);
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

onBeforeUpdate(() => {
  if (visible.value) {
    if (props.data !== null) {
      formState.value['name'] = props.data?.productName;
      formState.value['price'] = props.data?.price;
      formState.value['discount'] = props.data?.descount;
      formState.value['state'] = props.data?.isUse;
    }
  } else {
    formState.value['name'] = '';
    formState.value['price'] = 0;
    formState.value['discount'] = 0;
    formState.value['state'] = false;
  }
});
</script>

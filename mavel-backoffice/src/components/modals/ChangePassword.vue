<template>
  <a-modal
    v-model:visible="visible"
    :destroyOnClose="true"
    :forceRender="true"
    :confirmLoading="loading"
    :afterClose="afterClose"
    @ok="onConfirm"
    zIndex="1001"
    :title="$t('common.text.change_password')">
    <a-form :model="formState" layout="vertical">
      <a-form-item
        :label="$t('form.label.admin_password')"
        name="admin_password"
        :rules="[{ required: false, message: $t('form.rule.empty') }]">
        <a-input-password v-model:value="formState.loginPassword" allowClear />
      </a-form-item>
      <a-form-item
        :label="$t('form.label.password')"
        name="password"
        :rules="[{ required: false, message: $t('form.rule.empty') }]">
        <a-input-password v-model:value="formState.password" allowClear autocomplete="new-password" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import { computed, ref } from 'vue';

import { apis } from 'src/stores/apis';

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  idx: {
    type: Number,
    required: true,
  },
});

const visible = computed({
  get() {
    return props.show;
  },
  set(value) {
    emits('update:show', value);
  },
});

const emits = defineEmits(['update:show']);

const loading = ref<boolean>(false);
const formState = ref<any>({
  loginPassword: '',
  password: '',
});

const onConfirm = async () => {
  loading.value = true;

  const send = {
    user_Idx: props.idx,
    loginPassword: formState.value.loginPassword, // 로그인한 유저 비밀번호
    password: formState.value.password, // 변경할 유저의 비밀번호
  };
  try {
    const response = await apis.manager.ManagerChangePassword(send);
    if (response.data.errCode === 0) {
      setTimeout(() => {
        loading.value = false;
        visible.value = false;
        message.success(response.data.errMessage);
      }, 1000);
    }
  } catch (error) {
    console.error(error);
    loading.value = false;
  }
};

const afterClose = () => {
  formState.value['loginPassword'] = '';
  formState.value['password'] = '';
};
</script>

<template>
  <a-modal v-model:visible="visible" title="Manager Sign Up">
    <!-- layout="vertical" -->
    <a-form :model="data" @finish="onSignUp" :label-col="{ span: 6 }" :wrapper-col="{ span: 24 }">
      <a-form-item label="User Id" :rules="[{ required: true, message: 'Please input your username!' }]">
        <a-input v-model:value="data.user_Id">
          <template #prefix>
            <UserOutlined class="site-form-item-icon" />
          </template>
        </a-input>
      </a-form-item>

      <a-form-item label="Password" :rules="[{ required: true, message: 'Please input your password!' }]">
        <a-input-password v-model:value="data.password">
          <template #prefix>
            <LockOutlined class="site-form-item-icon" />
          </template>
        </a-input-password>
      </a-form-item>

      <a-form-item label="Nickname" :rules="[{ required: true, message: 'Please input your nickname!' }]">
        <a-input v-model:value="data.nick">
          <template #prefix>
            <UserOutlined class="site-form-item-icon" />
          </template>
        </a-input>
      </a-form-item>

      <a-form-item label="Grade" :rules="[{ required: true, message: 'Please select your grade!' }]">
        <a-select v-model:value="data.grade" :options="gradeList" />
      </a-form-item>

      <a-form-item label="Access" :rules="[{ required: true, message: 'Please select your access!' }]">
        <a-select v-model:value="data.rw" :options="rwList" />
      </a-form-item>

      <div>
        {{ data }}
      </div>
      <a-button type="primary" html-type="submit">
        {{ $t('common.button.sign_up') }}
      </a-button>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import type { SelectProps } from 'ant-design-vue';
import { computed, ref } from 'vue';
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

const gradeList = ref<SelectProps['options']>([
  {
    label: 'Supermaster',
    value: 100,
  },
  {
    label: 'Headseller',
    value: 90,
  },
]);

const rwList = ref<SelectProps['options']>([
  {
    label: '읽기',
    value: 1,
  },
  {
    label: '쓰기',
    value: 2,
  },
  {
    label: '읽기/쓰기',
    value: 3,
  },
]);

const data = ref<ISign>({
  user_Id: '',
  password: '',
  nick: '',
  grade: 100,
  rw: 3,
});

const onSignUp = async () => {
  console.log(data.value);
  try {
    const res = await apis.manager.SignUp(data.value);
    console.log(res);
  } catch (error) {
    console.error(error);
  }
};
</script>

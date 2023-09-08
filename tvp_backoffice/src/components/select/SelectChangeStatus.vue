<template>
  <a-select
    v-model:value="state"
    size="default"
    :options="options.memberStatus"
    :loading="loading"
    @change="confirm"
  />
</template>

<script setup lang="ts">
import { ref, PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { Modal } from 'ant-design-vue';
import { options } from '@/boot/global';
import { api } from '@/boot/axios';

//   data.list.map((e) => (e.state !== 5 && e.state !== 6 ? (e.state = 7) : ''));
const { t } = useI18n();
const props = defineProps({
  data: {
    type: Object as PropType<IMemberManagementResponse>,
    required: true,
  },
});

const emits = defineEmits(['return']);
const state = ref(props.data.state);
const loading = ref<boolean>(false);

const confirm = (value: number) => {
  loading.value = true;
  Modal.confirm({
    centered: true,
    okButtonProps: { size: 'middle' },
    cancelButtonProps: { size: 'middle' },
    title: t('modal.warning.agent_stop_1') + t('modal.warning.agent_stop_2'),
    content: t('modal.warning.proceed'),
    onOk: async () => {
      await api.auto.member.state(props.data.memberId, value);
      loading.value = false;
      emits('return', true);
    },
    onCancel: () => {
      loading.value = false;
      state.value = props.data.state;
      emits('return', false);
    },
  });
};
</script>

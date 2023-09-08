<template>
  <a-drawer
    title="Detail Manager Information"
    placement="right"
    :closable="true"
    v-model:visible="isShow"
    width="50%"
    @close="emit.close"
  >
    <ReferralPaymentHistory :sn="userSn" title="History" />
  </a-drawer>
</template>

<script setup>
import ReferralPaymentHistory from '@/components/lists/ReferralPaymentHistory.vue';
import { ref, computed, watch, onMounted } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  sendData: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(['close', 'next']);
const isShow = computed({
  get() {
    return props.show;
  },
  set(value) {
    emit('close', value);
  },
});

const send = computed({
  get() {
    return props.sendData;
  },
});

const userSn = ref(0);

const refreshDrawer = () => {
  if (sessionStorage.getItem('reloaded')) {
    sessionStorage.removeItem('reloaded', '1');
    isShow.value = false;
  } else {
    sessionStorage.setItem('reloaded', '1');
    isShow.value = false;
  }
};

watch(send, (val) => {
  userSn.value = val.sn;
});

onMounted(() => {
  refreshDrawer();
});
</script>

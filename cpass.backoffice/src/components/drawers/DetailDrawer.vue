<template>
  <a-drawer
    placement="right"
    :closable="true"
    v-model:visible="isShow"
    width="50%"
    @after-visible-change="afterVisibleChange"
    @close="onClose"
  >
    <template #title>
      <a-typography-text class="id">{{ infoVal?.user_Id ? infoVal?.user_Id : infoVal?.sender_Id }}</a-typography-text>
    </template>
    <PassqPaymentDetail
      :sn="userSn"
      :info="props.info"
      :title="'datatable.title.history'"
      v-if="props.type === 'passq'"
    />
    <IndividualPassqHistory :sn="userSn" :title="'datatable.title.history'" v-if="props.type === 'manager'" />
    <IndividualWalletHistory
      :sn="userSn"
      :info="props.info"
      :title="'datatable.title.history'"
      :type="props.type"
      @close="onClose"
      v-if="props.type === 'affiliate'"
    />
    <IndividualDisputeHistory
      :sn="userSn"
      :info="props.info"
      :title="'datatable.title.history'"
      :type="props.type"
      @close="onClose"
      v-if="props.type === 'dispute'"
    />
  </a-drawer>
</template>

<script setup>
import PassqPaymentDetail from '@/components/drawers/DetailPassqHistory.vue';
import IndividualPassqHistory from '@/components/datatable/IndividualPassqHistory.vue';
import IndividualDisputeHistory from '@/components/datatable/IndividualDisputeHistory.vue';
import IndividualWalletHistory from '@/components/datatable/IndividualWalletHistory.vue';

import { ref, computed, watch } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  info: {
    type: Object,
    required: false,
  },
});

const emit = defineEmits(['close']);

const isShow = computed({
  get() {
    return props.show;
  },
  set(value) {
    emit('close', value);
  },
});

const infoVal = computed({
  get() {
    return props.info;
  },
});

const userSn = ref(0);

const onClose = () => {
  isShow.value = false;
};

watch(infoVal, (val) => {
  if (val.grade) {
    userSn.value = val.sn;
  } else {
    userSn.value = val.user_Sn;
  }
});

const afterVisibleChange = (bool) => {
  if (bool) {
    if (infoVal.value.grade) {
      userSn.value = infoVal.value.sn;
    } else {
      userSn.value = infoVal.value.user_Sn;
    }
  } else {
    userSn.value = 0;
  }
};
</script>

<template>
  <a-modal
    width="100rem"
    v-model:visible="visible"
    :footer="null"
    :destroyOnClose="true"
    :forceRender="true"
    color="primary"
    :bodyStyle="{ padding: 0 }">
    <template #title>
      <span class="title q-mr-xs">
        {{ $t(props.title) }}
      </span>
      <q-btn flat unelevated round color="primary" icon="refresh" :class="{ 'fa-spin': loading }" @click="onRefresh" />
    </template>
    <Affiliate :isRefresh="loading" @refresh="refreshAction" />
  </a-modal>
</template>

<script setup lang="ts">
import Affiliate from 'components/datatable/Affiliate.vue';

import { computed, onMounted, onUpdated, ref } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
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

const loading = ref<boolean>(false);

const refreshAction = (e: boolean) => {
  loading.value = e;
};

const onRefresh = () => {
  loading.value = true;
};

onUpdated(() => {
  if (visible.value) {
    onRefresh();
  }
});

// onMounted(() => {
//   onRefresh();
// });
</script>

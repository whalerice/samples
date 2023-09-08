<template>
  <div class="pagination-controller">
    <div class="per-page">
      <span class="q-mr-sm">{{ $t('common.text.per_page') }}</span>
      <q-select
        dense
        options-dense
        borderless
        :model-value="props.currentPageSize"
        :options="props.currentPageSizeOptions"
        @update:model-value="
        (val:any) => [emit('update:currentPage', 1), emit('update:currentPageSize', val), emit('callback')]
      "
        :disable="loading" />
    </div>
    <!-- <template v-slot:prepend> <span class="text-h6">Page Size</span> </template> -->
    <!-- </q-select> -->
    <q-pagination
      :color="currentTheme ? 'white' : 'black'"
      :model-value="props.currentPage"
      :max="props.pageMax"
      input
      @update:model-value="(val:any) => [emit('update:currentPage', val), emit('callback')]"
      :disable="props.loading" />
    <!-- <span class="ml-10">Page Size</span> -->

    <!-- class="ml-10" -->
    <!-- :popup-content-style="{ textAlign: 'center', minHeight: 'initial', padding: '0px' }" -->
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { commonStore } from 'src/stores/common';
import { computed } from 'vue';
const props = defineProps({
  loading: Boolean,
  currentPage: { type: Number, default: 1 },
  pageMax: { type: Number, default: 1 },
  currentPageSizeOptions: Array<number>,
  currentPageSize: Number,
});

const { currentTheme } = storeToRefs(commonStore.theme());

const loading = computed(() => props.loading);

const emit = defineEmits(['callback', 'update:currentPage', 'update:currentPageSize']);
</script>

<style scoped lang="scss">
.per-page {
  display: inline-flex;
  align-items: center;
}
.pagination-controller {
  display: flex;
  align-items: center;
  flex-flow: column;
}

@media (min-width: 768px) {
  .pagination-controller {
    flex-flow: wrap;
    justify-content: flex-end;
  }
}
</style>

<template>
  <a-select
    v-model:value="value"
    style="min-width: 6rem"
    class="custom-single-select"
  >
    <a-select-option
      v-for="data in props.options"
      :value="data.value"
      :key="data.label"
      :label="data.label"
    >
      <span>{{ props.noTranslate ? data.label : $t(data.label) }}</span>
    </a-select-option>
  </a-select>

  <MemberStatusStopInfoModal
    :visible="visible"
    @update:visible="(val:boolean) =>visible = val"
    @change-status-stop="changeStatus"
  />
</template>

<script setup lang="ts">
import MemberStatusStopInfoModal from '@/components/modal/MemberStatusStopInfoModal.vue';
import { ref, computed } from 'vue';

const props = defineProps({
  options: Object,
  value: Number,
  noTranslate: Boolean,
  grade: { type: Number, default: 0 },
  record: Object,
});

const value = computed({
  get() {
    return props.value;
  },
  set() {
    if (props.grade < 5) {
      if (!value.value) {
        visible.value = true;
      } else {
        changeStatus();
      }
    } else {
      changeStatus();
    }
  },
});

const visible = ref(false);

const record = computed(() => props.record);
const emits = defineEmits(['changeStatus']);

const changeStatus = async () => {
  emits('changeStatus', { record: record.value, status: value.value });
};
</script>

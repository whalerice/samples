<template>
  <q-input
    class="text-right"
    input-class="text-right"
    :model-value="props.value"
    @update:model-value="(val) => emit('update:value', comma(String(val).replaceAll(',', '')))"
    clearable
    dense
    :placeholder="props.placeholder"
    autofocus
    tabindex="1"
    :hint="props.hint === '' ? undefined : props.hint"
    :error="error !== ''">
    <template v-slot:error>
      {{ error }}
    </template>
  </q-input>
</template>

<script setup lang="ts">
import { commonStore } from 'src/stores/common';
import { watch, computed } from 'vue';

const props = defineProps({
  value: [String, Number],
  placeholder: String,
  hint: { type: String, default: undefined },
  errMsg: String,
});

const emit = defineEmits(['update:value']);
const value = computed(() => props.value);
const error = computed(() => props.errMsg);

const { comma } = commonStore.common();

const VALUE_EXP = /[^0-9+.,]/;

watch(value, (newVal, oldVal) => {
  if (String(newVal).match(VALUE_EXP)) {
    emit('update:value', oldVal);
  }

  if (newVal === 'null') {
    emit('update:value', 0);
  }
  if (String(newVal)?.length > 1 && String(newVal)[0] === '0') {
    emit('update:value', String(newVal).replace('0', ''));
  }

  if (String(newVal)?.split('.')[1]?.length > 2) {
    emit('update:value', oldVal);
  }
});
</script>

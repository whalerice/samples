<template>
  <a-select
    mode="multiple"
    v-model:value="value"
    :maxTagCount="-1"
    option-label-prop="children"
    :show-search="props.search"
    :auto-clear-search-value="false"
    class="custom-multiple-select"
    :class="{ 'custom-search-mode': props.search }"
    dropdownClassName="custom-multiple-select-dropdown"
  >
    <template #tagRender></template>

    <template #maxTagPlaceholder>
      <a-row justify="space-around" align="middle">
        <a-col class="q-mx-sm">
          {{ $t(props.label) }}
        </a-col>

        <a-col>
          <DownOutlined style="font-size: 1.2rem" />
        </a-col>
      </a-row>
    </template>

    <a-select-option
      v-for="data in options"
      :value="data.value"
      :key="data.key"
      :label="data.label"
      :child="data.child"
      :selected="data.selected"
    >
      <span>
        <template
          v-if="
            props.label === 'common.word.step' ||
            props.label === 'common.word.grade'
          "
        >
          {{ data.label() }}
        </template>

        <template v-else>
          {{ data.label.split('.').length > 1 ? $t(data.label) : data.label }}
        </template>
      </span>
    </a-select-option>
  </a-select>
</template>

<script setup lang="ts">
import { computed, PropType } from 'vue';
import { DownOutlined } from '@ant-design/icons-vue';

const emits = defineEmits(['update:value']);

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  value: {
    type: Object,
    required: true,
  },
  options: {
    type: Array as PropType<ISelectOptions[]>,
    required: true,
  },
  search: {
    type: Boolean,
    default: false,
  },
});

const value = computed({
  get: () => props.value[props.id] || [],
  set: (value: any) => {
    emits('update:value', { ...props.value, [props.id]: value });
  },
});
</script>

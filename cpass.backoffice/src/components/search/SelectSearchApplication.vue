<template>
  <a-button class="btn-wrap" :class="{ 'btn-hover': isSelected }">
    <span class="btn-content">{{ t(propPlaceholder) }}</span>
    <fa-icon icon="fa-chevron-right" class="ico-btn" />
    <a-select
      class="search-select"
      mode="multiple"
      v-model:value="selectValueArr"
      :showSearch="false"
      :placeholder="false"
      :maxTagCount="0"
      @select="(e) => handleSelect(e, 'select')"
      @deselect="(e) => handleSelect(e, 'select')"
      @dropdownVisibleChange="handleOpen"
      :open="open"
    >
      <a-select-option v-for="item in selectOptions" :value="item.value" :key="item.value">
        {{ t(item.label) }}
      </a-select-option>
    </a-select>
  </a-button>
</template>
<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

const { t } = useI18n();
const store = useStore();
const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  placeholder: {
    type: String,
    required: false,
  },
});
const open = ref(false);
const isDeviceMobile = computed(() => store.state['common'].isDeviceMobile);
const isMobile = ref(isDeviceMobile.value);
const propData = computed(() => props.data);
const propPlaceholder = computed(() => props.placeholder);
const emits = defineEmits(['selectResult']);
const selectValueArr = ref();
const selectOptions = computed(() => propData.value);
const isSelected = computed(() => selectOptions.value.map((e) => e.checked).includes(true));

const handleSelect = (val, type) => {
  emits('selectResult', val, type);
};

const handleOpen = (val) => {
  open.value = val;
};

watch(
  propData,
  (val) => {
    const newSelectValueArr = val
      .filter((e) => e.checked === true)
      .map((e) => {
        return e.value;
      });

    selectValueArr.value = newSelectValueArr;
  },
  { deep: true },
);
</script>

<style lang="scss"></style>

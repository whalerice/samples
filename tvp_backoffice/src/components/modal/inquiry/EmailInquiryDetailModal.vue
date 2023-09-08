<template>
  <a-modal
    centered
    :footer="null"
    :title="$t('common.word.inquiry_detail')"
    :destroyOnClose="true"
  >
    <a-form layout="vertical">
      <a-form-item :label="$t('common.word.status')">
        <span class="txt">0</span>
      </a-form-item>
      <a-form-item :label="$t('common.word.title')">
        <span class="txt">0</span>
      </a-form-item>
      <a-form-item :label="$t('common.word.message')">
        <span class="txt">0</span>
      </a-form-item>
      <a-form-item :label="$t('common.word.answer')">
        <span class="txt">0</span>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
const props = defineProps({
  status: Number,
});
</script>

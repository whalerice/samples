<template>
  <!-- <a-button type="primary" class="header-btn" @click="visible = !visible">
    <a-row align="middle">
      <span class="header-btn-text"> {{ $t('route.title.notice') }}: </span>
      <NotificationOutlined style="font-size: 1.8rem" />
      <span> {{ $comma(1000) }}</span>
    </a-row>
  </a-button> -->
  <a-modal
    v-model:visible="visible"
    :title="$t('route.title.notice')"
    :footer="null"
    :destroyOnClose="true"
  >
    Lorem, ipsum dolor sit amet consectetur adipisicing elit. Velit cum maxime
    aperiam voluptas sed sit, numquam assumenda nobis culpa, ea nulla aspernatur
    expedita sunt earum est ratione, fugit illo quo!
  </a-modal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const props = defineProps({
  show: { type: Boolean },
});

const emits = defineEmits(['update:show']);

const visible = computed({
  get() {
    return props.show;
  },
  set(val) {
    emits('update:show', val);
  },
});
</script>

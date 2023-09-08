<template>
  <a-modal
    :footer="null"
    :title="$t('common.word.agent')"
    centered
    width="auto"
    @cancel="emits('update:visible', false)"
    :destroyOnClose="true"
  >
    <a-row align="middle" :gutter="[8]">
      <a-col>
        <ExclamationCircleTwoTone style="font-size: 3rem" />
      </a-col>
      <a-col>
        <div>
          {{ $t('modal.warning.agent_stop_1') }}
        </div>
        <div>
          {{ $t('modal.warning.agent_stop_2') }}
        </div>
        <div>
          {{ $t('modal.warning.proceed') }}
        </div>
      </a-col>
    </a-row>
    <a-row justify="end">
      <a-button type="primary" @click="emits('changeStatusStop')">
        {{ $t('common.word.ok') }}
      </a-button>
    </a-row>
  </a-modal>
</template>

<script setup lang="ts">
import { ExclamationCircleTwoTone } from '@ant-design/icons-vue';

const emits = defineEmits(['update:visible', 'changeStatusStop']);
</script>

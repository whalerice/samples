<template>
  <a-tooltip color="blue" @visibleChange="getHierarchy">
    <template #title>
      <a-breadcrumb>
        <template #separator><span class="text-white">></span> </template>
        <a-breadcrumb-item class="text-white" v-if="hierarchy.Investor">
          {{ hierarchy.Investor }}
        </a-breadcrumb-item>
        <a-breadcrumb-item class="text-white" v-if="hierarchy.AgentOne">
          {{ hierarchy.AgentOne }}
        </a-breadcrumb-item>
        <a-breadcrumb-item class="text-white" v-if="hierarchy.User">
          {{ hierarchy.User }}
        </a-breadcrumb-item>
      </a-breadcrumb>
    </template>
    <a-button v-if="!props.text">
      {{ $t('common.word.structure') }}
    </a-button>
    <a-typography-link v-if="props.text" class="text-blue-9">
      {{ props.text }}
    </a-typography-link>
  </a-tooltip>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { api } from '@/boot/axios';

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: false,
  },
});

const hierarchy = ref({
  AgentOne: '',
  Investor: '',
  User: '',
});

const getHierarchy = async (value: boolean) => {
  if (!value) return;
  hierarchy.value = await api.auto.member.hierarchy(props.id);
};
</script>

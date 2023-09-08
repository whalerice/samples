<template>
  <q-select v-model="current" :options="localeList" dense borderless options-dense class="select-translate">
    <template v-slot:selected>
      <i
        class="ico-flag"
        :style="{ backgroundImage: `url('//hatscripts.github.io/circle-flags/flags/${current.flag}.svg')` }"></i>
      {{ current.label }}
    </template>
    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps" class="flag-item" @click="changeLocale(scope.opt)">
        <q-item-label class="flag-label">
          <i
            class="ico-flag"
            :style="{ backgroundImage: `url('//hatscripts.github.io/circle-flags/flags/${scope.opt.flag}.svg')` }"></i>
          {{ scope.opt.label }}
        </q-item-label>
      </q-item>
    </template>
  </q-select>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount } from 'vue';

import { commonStore } from 'src/stores/common';
import { localeList } from 'src/boot/global';

const { current } = storeToRefs(commonStore.locale());
const { changeLocale } = commonStore.locale();

onBeforeMount(() => {
  changeLocale(current.value);
});
</script>

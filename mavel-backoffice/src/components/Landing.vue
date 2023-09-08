<template>
  <div class="landing" v-if="isLanding">
    <a-spin size="large" />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { commonStore } from 'src/stores/common';
// import { ref, computed } from 'vue';

const { isLanding } = storeToRefs(commonStore.ui());
</script>

<style scoped lang="scss">
.landing {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}
</style>

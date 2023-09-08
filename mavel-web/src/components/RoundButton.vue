<template>
  <q-btn to="/slot" :label="props.label" unelevated class="round-btn-controller" padding="0.8rem 2rem" />
</template>

<script setup lang="ts">
const props = defineProps({
  label: String,
});
</script>

<style scoped lang="scss">
.round-btn-controller {
  border-radius: 19px;
  border: 1px solid #fff;
  // font-size: 16px;
  font-weight: 400;
  font-style: normal;
}
</style>

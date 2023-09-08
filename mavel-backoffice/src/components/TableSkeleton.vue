<template>
  <q-markup-table flat class="full-width">
    <tbody>
      <tr v-for="n in props.row" :key="n">
        <td class="text-left" v-for="item in props.column" :key="item">
          <q-skeleton animation="blink" type="text" :width="`${Math.random() * 10}rem`" />
        </td>
      </tr>
    </tbody>
  </q-markup-table>
</template>

<script setup lang="ts">
const props = defineProps({
  column: {
    type: Number,
    default: 5,
    required: false,
  },
  row: {
    type: Number,
    default: 10,
    required: false,
  },
});
</script>
<style scoped lang="scss">
.q-markup-table {
  box-shadow: none;
}
</style>

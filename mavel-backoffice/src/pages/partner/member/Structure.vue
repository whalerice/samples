<template>
  <DrawingTable :type="UserType.Partner" />
</template>

<script setup lang="ts">
import DrawingTable from 'src/components/datatable/DrawingTable.vue';
import { UserType } from 'src/components/models/enums';
</script>

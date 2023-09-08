<template>
  <template v-if="list.length > 0">
    <Carousel
      :list="list"
      :breakpoints="{
        0: {
          itemsToShow: 2,
        },
        992: {
          itemsToShow: 5,
        },
      }"
      snapAlign="start"
      headerTitle="main.title.favorite"
      imgPlayButton />
  </template>
</template>

<script setup lang="ts">
import Carousel from 'src/components/carousel/Carousel.vue';
import { RecentPlayGameCategory } from 'src/components/models/enums';
import { onBeforeMount, ref } from 'vue';
import { apis } from 'src/stores/apis';

const list = ref<any>([]);

onBeforeMount(async () => {
  try {
    const response = await apis.MainGameContent({ solution_Idx: 1, category: RecentPlayGameCategory.Favorite });

    if (response.data.errCode === 0) {
      list.value = response.data.returnData.list;
    } else {
      console.error('error', response.data.errCode);
    }
  } catch (error) {
    console.error(error);
  }
});
</script>

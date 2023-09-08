<template>
  <template v-if="list.length > 0">
    <Carousel
      :list="list"
      :itemsToShow="list.length > 5 ? 5 : 3"
      headerTitle="main.title.hot"
      headerIcon="hot"
      snapAlign="start"
      double
      navigation
      imgPlayButton />
    <!-- wrapAround  -->
  </template>
</template>

<script setup lang="ts">
import Carousel from 'src/components/carousel/Carousel.vue';
import { RecentPlayGameCategory } from 'src/components/models/enums';
import { onBeforeMount, ref } from 'vue';
import { apis } from 'src/stores/apis';
import { useRouter } from 'vue-router';

const list = ref<IMainGameData[] | any>([]);
const currentRoute = useRouter().currentRoute;

onBeforeMount(async () => {
  try {
    const response = await apis.MainGameContent({
      solution_Idx: 1,
      category:
        currentRoute.value.path === '/slot' || currentRoute.value.path === '/live-casino'
          ? RecentPlayGameCategory.Favorite
          : RecentPlayGameCategory.Hot,
    });

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

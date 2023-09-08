<template>
  <q-img
    :src="props.data?.img"
    class="non-blur-img"
    :class="
      props.imgPlayButton &&
      !(nowLoading.includes(String(props.data?.gameCode)) || nowPlaying[String(props.data?.gameCode)])
        ? 'img-games'
        : 'img-disabled'
    "
    :ratio="1"
    @click="
      !(nowLoading.includes(String(props.data?.gameCode)) || nowPlaying[String(props.data?.gameCode)])
        ? clickGame(props.data)
        : ''
    ">
    <div
      class="carousel-bg"
      v-if="nowLoading.includes(String(props.data?.gameCode)) || nowPlaying[String(props.data?.gameCode)]">
      <q-spinner size="5rem" v-if="nowLoading.includes(String(props.data?.gameCode))" />
      <q-spinner-cube
        size="5rem"
        color="deep-purple-10"
        v-if="!nowLoading.includes(String(props.data?.gameCode)) && nowPlaying[String(props.data?.gameCode)]" />
    </div>
  </q-img>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { gamesStore } from 'src/stores/games';

const props = defineProps({
  data: {
    type: Object as () => IMainGameData,
  },
  imgPlayButton: Boolean,
});

const { playGame, pushNowLoading, removeNowLoading } = gamesStore.play();
const { nowLoading, nowPlaying } = storeToRefs(gamesStore.play());

const clickGame = async (data: IMainGameData | undefined) => {
  pushNowLoading(String(data?.gameCode));
  await playGame(data);
  setTimeout(() => {
    removeNowLoading(String(data?.gameCode));
  }, 100);
};
</script>

<template>
  <div>
    <audio ref="player" src="/notify_sound.mp3" autoplay :muted="!onSound"></audio>
    <!-- <iframe src="/notify_sound.mp3" ref="playerArea" style="display: none"></iframe> -->
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { commonStore } from 'src/stores/common';

const { onSound } = storeToRefs(commonStore.ui());
</script>

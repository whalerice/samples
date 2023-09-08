<template>
  <h4 class="text-h4 text-weight-bold">{{ $t('main.title.recent_game') }}</h4>
  <div class="row games">
    <q-intersection
      v-for="item in recentGameList"
      :key="item.order"
      once
      transition="scale"
      class="item col-6 col-md-3 col-lg-2">
      <q-card class="q-ma-sm">
        <game-img :data="item" imgPlayButton />
        <q-card-section>
          <div class="text-h6">{{ current?.value === 'ko' ? item.name_Ko : item.name_En }}</div>
        </q-card-section>
      </q-card>
    </q-intersection>
  </div>
</template>

<script setup lang="ts">
import GameImg from 'src/components/GameImg.vue';

import { storeToRefs } from 'pinia';
import { commonStore } from 'src/stores/common';
import { gamesStore } from 'src/stores/games';

const { current } = storeToRefs(commonStore.locale());
const { recentGameList } = storeToRefs(gamesStore.games());
</script>

<template>
  <div class="header-label">
    <span class="text-h4 text-weight-bold relative-position" :class="p.headerIcon">{{ $t(p.headerTitle) }}</span>
    <q-btn
      v-if="p.moreButton"
      :to="p.link"
      flat
      no-caps
      unelevated
      class="btn-more"
      icon="add"
      :label="$t('common.button.more')" />
  </div>
  <Carousel
    :settings="settings"
    :breakpoints="p?.breakpoints ? p.breakpoints : {}"
    :class="{ 'under-blur-container': p.double }">
    <Slide v-for="data in p.list" :key="data.gameCode" class="column items-start">
      <game-img :data="data" :imgPlayButton="p.imgPlayButton" />
      <q-img :src="data.img" double class="under-blur-img" v-if="p.double" :ratio="1" />
      <div class="carousel-info-area">
        <q-item-label v-if="data.name_En" :class="{ 'under-blur-text': p.double }">
          {{ current.value === 'ko' ? data.name_Ko : data.name_En }}
        </q-item-label>
        <q-item-label v-if="data.vendor_Name" caption :class="{ 'under-blur-caption': p.double }">
          {{ data.vendor_Name }}
        </q-item-label>
        <!-- <q-btn :label="$t('common.label.play_now')" v-if="p.double" unelevated padding="1rem 1.6rem" /> -->
      </div>
    </Slide>

    <template #addons>
      <Pagination v-if="p.pagination" />
      <Navigation v-if="p.navigation" />
    </template>
  </Carousel>
</template>

<script setup lang="ts">
// import { QSpinner } from 'quasar';
import { Carousel, Navigation, Slide, Pagination } from 'vue3-carousel';
import { storeToRefs } from 'pinia';
import { commonStore } from 'src/stores/common';
// import { gamesStore } from 'src/stores/games';
import GameImg from 'src/components/GameImg.vue';

type Breakpoints = { [key: number]: Partial<CarouselConfig> };

type SnapAlign = 'start' | 'end' | 'center' | 'center-even' | 'center-odd';

type Dir = 'rtl' | 'ltr';

interface CustomProps {
  headerTitle: string;
  headerIcon?: string;
  list: IMainGameData[];
  navigation?: boolean;
  pagination?: boolean;
  link?: string;
  double?: boolean;
  moreButton?: boolean;
  imgPlayButton?: boolean;
}

interface CarouselConfig extends IMainGameData, CustomProps {
  itemsToShow?: number;
  snapAlign?: SnapAlign;
  itemsToScroll?: number;
  modelValue?: number;
  transition?: number;
  autoplay?: number;
  wrapAround?: boolean;
  pauseAutoplayOnHover?: boolean;
  mouseDrag?: boolean;
  touchDrag?: boolean;
  dir?: Dir;
  settings?: Partial<CarouselConfig>;
  breakpoints?: Breakpoints;
}

// const { playGame, pushNowLoading, removeNowLoading } = gamesStore.play();
const p = defineProps<CarouselConfig>();
const { current } = storeToRefs(commonStore.locale());
// const { nowLoading, nowPlaying } = storeToRefs(gamesStore.play());

const defaults = {
  itemsToShow: p?.itemsToShow ? p.itemsToShow : 1,
  snapAlign: p?.snapAlign ? p.snapAlign : 'center',
  itemsToScroll: p?.itemsToScroll ? p.itemsToScroll : 1,
  modelValue: p?.modelValue ? p.modelValue : 0,
  transition: p?.transition ? p.transition : 300,
  autoplay: p?.autoplay ? p.autoplay : 0,
  wrapAround: p?.wrapAround ? p.wrapAround : false,
  pauseAutoplayOnHover: p?.pauseAutoplayOnHover ? p.pauseAutoplayOnHover : false,
  mouseDrag: p?.mouseDrag ? p.mouseDrag : true,
  touchDrag: p?.touchDrag ? p.touchDrag : true,
  dir: p?.dir ? p.dir : 'ltr',
};

const settings = {
  ...defaults,
};

// const clickGame = async (data: IMainGameData) => {
//   pushNowLoading(String(data.gameCode));
//   await playGame(data);
//   setTimeout(() => {
//     removeNowLoading(String(data.gameCode));
//   }, 100);
// };
</script>

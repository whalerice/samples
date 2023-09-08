<template>
  <q-dialog
    @before-show="controlIframe(true)"
    @before-hide="controlIframe(false)"
    :maximized="maximizedToggle"
    persistent
    :position="!maximizedToggle ? 'bottom' : 'standard'"
    :seamless="!maximizedToggle"
    transition-show="slide-right"
    transition-hide="slide-left">
    <q-card class="play-card">
      <q-bar class="pos-sticky-top">
        <q-space />
        <q-btn
          dense
          flat
          :icon="maximizedToggle ? 'minimize' : 'crop_square'"
          @click="maximizedToggle = !maximizedToggle">
          <q-tooltip class="bg-white text-primary">
            {{ maximizedToggle ? $t('common.label.shrink') : $t('common.label.magnification') }}
          </q-tooltip>
        </q-btn>
        <q-btn dense flat icon="exit_to_app" v-close-popup>
          <q-tooltip class="bg-white text-primary">{{ $t('common.label.close') }}</q-tooltip>
        </q-btn>
      </q-bar>

      <div class="play-area">
        <template v-if="iframeControl">
          <iframe :src="Object.values(nowPlaying)[0].url" class="iframe"></iframe>
        </template>
        <q-spinner-gears size="20%" class="absolute-center spinner" />
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref, computed } from 'vue';
import { gamesStore } from 'src/stores/games';
import { userStore } from 'src/stores/user';

const props = defineProps({
  nowPlaying: {
    type: Object as () => {
      [key: string]: {
        url: string;
      };
    },
    default: () => {
      return {
        GAME_CODE: {
          url: '',
        },
      };
    },
  },
});
const nowPlaying = computed(() => props.nowPlaying);
const iframeControl = ref(false);
const maximizedToggle = ref(true);
const { userInfo } = storeToRefs(userStore.user());
const { recentPlayGame } = gamesStore.games();

const controlIframe = (val: any) => {
  if (val) {
    setTimeout(() => {
      iframeControl.value = val;
    }, 1500);
  } else {
    iframeControl.value = false;
    recentPlayGame(userInfo.value.idx);
  }
};
</script>
<style lang="scss" scoped>
.play-card {
  display: flex;
  flex-flow: column;
  .play-area {
    width: 100%;
    height: calc(100% - 32px);
    overflow: hidden;
  }
}
.iframe {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 2;
}
.spinner {
  opacity: 0.5;
  z-index: 1;
}
</style>

<template>
  <RecentGameList v-if="loggedIn && isRecentGameList" />
  <div class="mb-main-gap"></div>

  <div class="q-mb-lg-xl">
    <HotGameList />
  </div>

  <div class="mb-main-gap">
    <FavoriteGameList />
  </div>

  <div class="mb-main-gap">
    <Carousel
      :list="casinoList"
      :breakpoints="{
        0: {
          itemsToShow: 2,
        },
        992: {
          itemsToShow: 5,
        },
      }"
      moreButton
      headerTitle="main.title.livecasino"
      headerIcon="casino"
      navigation
      imgPlayButton
      link="/live-casino" />
    <!-- wrapAround -->
  </div>
  <div>
    <div class="header-label">
      <span class="text-h4 text-weight-bold">{{ $t('main.title.slots') }}</span>
      <q-btn to="/slot" flat unelevated no-caps class="btn-more" icon="add" :label="$t('common.button.more')" />
    </div>
    <div class="row games">
      <q-intersection
        v-for="item in slotList"
        :key="item.gameCode"
        once
        transition="scale"
        class="item col-6 col-md-3 col-lg-2">
        <q-card class="q-ma-sm">
          <game-img :data="item" imgPlayButton />
          <q-card-section>
            <div class="text-h6">{{ current?.value === 'ko' ? item.name_Ko : item.name_En }}</div>
            <div class="text-subtitle2">{{ item.vendor_Name }}</div>
          </q-card-section>
        </q-card>
      </q-intersection>
    </div>
  </div>
</template>

<script setup lang="ts">
import RecentGameList from 'components/RecentGameList.vue';
import HotGameList from 'components/HotGameList.vue';
import FavoriteGameList from 'components/FavoriteGameList.vue';
import Carousel from 'src/components/carousel/Carousel.vue';
import GameImg from 'src/components/GameImg.vue';

import { onBeforeMount, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { apis } from 'src/stores/apis';
import { MainCategory } from 'src/components/models/enums';
import { userStore } from 'src/stores/user';
import { commonStore } from 'src/stores/common';
import { gamesStore } from 'src/stores/games';

const { loggedIn } = storeToRefs(userStore.sign());
const { current } = storeToRefs(commonStore.locale());
const { userInfo } = storeToRefs(userStore.user());
const { recentGameList } = storeToRefs(gamesStore.games());
const { recentPlayGame } = gamesStore.games();

const casinoList = ref<IMainGameData[]>([]);
const slotList = ref<IMainGameData[]>([]);
const isRecentGameList = ref<boolean>(false);

watch(recentGameList, (v) => {
  isRecentGameList.value = v.length === 0 ? false : true;
});

watch(userInfo, (user) => {
  if (user.idx > 0) recentPlayGame(user.idx);
});

onBeforeMount(async () => {
  if (userInfo.value.idx) await recentPlayGame(userInfo.value.idx);

  try {
    const casino = await apis.MainGameList({
      site_Idx: process.env.SITE_IDX,
      category: MainCategory.LiveCasino,
      vendor_Idx: '0',
      currentPage: 1,
      currentPageSize: 15,
      search: '',
      order: '',
      sort: '',
      user_Filter: 0,
    });

    const slot = await apis.MainGameList({
      site_Idx: process.env.SITE_IDX,
      category: MainCategory.Slots,
      vendor_Idx: '0',
      currentPage: 1,
      currentPageSize: 20,
      search: '',
      order: '',
      sort: '',
      user_Filter: 0,
    });

    if (casino.data.errCode === 0) {
      casinoList.value = casino.data.returnData.list;
    } else {
      console.error('error');
    }

    if (slot.data.errCode === 0) {
      slotList.value = slot.data.returnData.list;
    } else {
      console.error('error');
    }
  } catch (error) {
    console.error(error);
  }
});
</script>

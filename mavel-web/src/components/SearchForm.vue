<template>
  <q-btn unelevated class="no-padding header-icon" round @click="dialog = !dialog">
    <q-icon
      :name="$q.dark.isActive ? 'svguse:/icons.svg#custom-search-dm' : 'svguse:/icons.svg#custom-search'"
      size="2.4rem" />
  </q-btn>

  <q-dialog
    v-model="dialog"
    :maximized="maximizedToggle"
    transition-show="rotate"
    transition-hide="fade"
    class="custom-dialog-container search-form-container">
    <q-card class="custom-dialog-card-area">
      <div class="pos-sticky-top">
        <q-bar>
          <q-space />

          <!-- <q-btn dense flat icon="minimize" @click="maximizedToggle = false" :disable="!maximizedToggle">
          <q-tooltip v-if="maximizedToggle" class="bg-white text-primary">Minimize</q-tooltip>
        </q-btn> -->
          <q-btn dense flat icon="open_in_full" @click="maximizedToggle = !maximizedToggle">
            <q-tooltip class="bg-white text-primary">
              {{ maximizedToggle ? 'Minimize' : 'Maximize' }}
            </q-tooltip>
          </q-btn>
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip class="bg-white text-primary">{{ $t('common.label.close') }}</q-tooltip>
          </q-btn>
        </q-bar>

        <q-input
          v-model="searchValue"
          :loading="loadingState"
          outlined
          rounded
          dense
          autofocus
          class="custom-round-input-controller"
          bg-color="search-input"
          @update:model-value="(val) => getMainGameListSearch(val)"
          :debounce="300">
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <q-list separator>
        <q-item-label header class="search-label" v-if="list.length > 0">{{
          $t('dialog.label.popular_search')
        }}</q-item-label>

        <q-scroll-area
          :thumb-style="thumbStyle"
          :bar-style="barStyle"
          class="custom-dialog-area"
          :class="{ 'height-80vh': maximizedToggle }">
          <template v-if="list.length > 0">
            <q-btn
              :loading="gameLoading === i"
              class="row justify-between full-width no-padding"
              unelevated
              v-for="(data, i) in list"
              :key="data.gameCode"
              @click="gameClick(data, i)">
              <q-item class="row items-center full-width">
                <q-img :src="data.img" style="border-radius: 50%" width="5rem" height="5rem" class="mr-22" />
                <q-item-section>
                  <q-item-label class="item-label text-left">
                    {{ current.value === 'ko' ? data.name_Ko : data.name_En }}
                  </q-item-label>
                  <q-item-label caption class="text-left">{{ data.vendor_Name }}</q-item-label>
                </q-item-section>
                <q-icon name="open_in_new" size="2.2rem" :color="$q.dark.isActive ? '' : 'black'" />
              </q-item>
            </q-btn>
          </template>
          <template v-else>
            <div class="column q-gutter-md items-center mt-20">
              <q-spinner-pie size="10rem" />
              <span class="text-h4">{{ $t('common.search.no_result') }}</span>
            </div>
          </template>
        </q-scroll-area>
      </q-list>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';
import { useQuasar, QSpinnerPie } from 'quasar';
import { apis } from 'src/stores/apis';
import { MainCategory, RecentPlayGameCategory } from './models/enums';
import { gamesStore } from 'src/stores/games';
import { storeToRefs } from 'pinia';
import { commonStore } from 'src/stores/common';

const $q = useQuasar();

const searchValue = ref<string>('');
const dialog = ref<boolean>(false);
const maximizedToggle = ref<boolean>(false);
const loadingState = ref<boolean>(false);
const { playGame } = gamesStore.play();
const { current } = storeToRefs(commonStore.locale());
const gameLoading = ref<number>(-1);

const list = ref<IMainGameData[]>([]);

const thumbStyle = {
  right: '4px',
  borderRadius: '5px',
  backgroundColor: $q.dark.isActive ? '#11141b' : '#f2f2f2',
  width: '5px',
};

const barStyle = {
  right: '2px',
  borderRadius: '9px',
  backgroundColor: $q.dark.isActive ? '#11141b' : '#f2f2f2',
  width: '9px',
};

const gameClick = async (data: any, idx: number) => {
  gameLoading.value = idx;
  const res = await playGame(data);
  if (res === 0 || res === 500) {
    dialog.value = false;
  }
  gameLoading.value = -1;
};

const getMainGameContent = async () => {
  const res = await apis.MainGameContent({ solution_Idx: 1, category: RecentPlayGameCategory.Favorite });

  if (res.data.errCode === 0) {
    list.value = res.data.returnData.list;
  }
};

const getMainGameListSearch = async (val: string | number | null) => {
  loadingState.value = true;
  setTimeout(async () => {
    if (String(val).length > 0) {
      const res = await apis.MainGameList({
        site_Idx: process.env.SITE_IDX,
        category: MainCategory.All,
        vendor_Idx: '0',
        currentPage: 1,
        currentPageSize: 20,
        search: String(val),
        order: '',
        sort: '',
        user_Filter: 1,
      });

      if (res.data.errCode === 0) {
        list.value = res.data.returnData.list;
      }
    } else {
      await getMainGameContent();
    }
    loadingState.value = false;
  }, 500);
};

onBeforeMount(() => {
  getMainGameContent();
});
</script>

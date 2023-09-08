<template>
  <div class="header-label">
    <h3 class="text-h3 text-weight-bold">{{ $t('main.title.livecasino') }}</h3>
    <Provider @selected-provider="getSelectedProvider" @callback="getMainGameList" />
  </div>
  <template v-if="list?.length !== 0">
    <div class="row games">
      <q-intersection
        v-for="item in list"
        :key="item.gameCode"
        once
        transition="scale"
        class="item col-6 col-md-3 col-lg-2">
        <q-card class="q-ma-sm">
          <!-- <q-inner-loading :showing="true">
            <q-spinner-gears size="50px" color="primary" />
          </q-inner-loading> -->
          <game-img :data="item" imgPlayButton />
          <q-card-section>
            <div class="text-h6">{{ current?.value === 'ko' ? item.name_Ko : item.name_En }}</div>
            <div class="text-subtitle2">{{ item.vendor_Name }}</div>
          </q-card-section>
        </q-card>
      </q-intersection>
    </div>
    <Pagination
      @callback="getMainGameList"
      v-model:current-page="currentPage"
      :page-max="pageMax"
      v-model:current-page-size="currentPageSize"
      :current-page-size-options="currentPageSizeOptions"
      :loading="loading" />
  </template>
  <template v-else>
    <no-data />
  </template>
</template>
<script setup lang="ts">
import Provider from 'src/components/Provider.vue';
import NoData from 'src/components/NoData.vue';
import Pagination from 'src/components/Pagination.vue';
import { storeToRefs } from 'pinia';
import { onBeforeMount, ref } from 'vue';
import { commonStore } from 'src/stores/common';
// import { gamesStore } from 'src/stores/games';
import { MainCategory } from 'src/components/models/enums';
import { apis } from 'src/stores/apis';
import GameImg from 'src/components/GameImg.vue';

const { current } = storeToRefs(commonStore.locale());
// const { playGame } = gamesStore.play();

const list = ref<IMainGameData[]>();
const currentPage = ref<number>(1);
const currentPageSize = ref<number>(48);
const currentPageSizeOptions = [12, 24, 36, 48, 60];
const listCount = ref<number>(0);
const pageMax = ref<number>(1);
const loading = ref<boolean>(false);
const selectedProvider = ref<string>('0');

const getSelectedProvider = (provider: Array<number>) => {
  selectedProvider.value = provider.toString();
};

const getMainGameList = async () => {
  loading.value = true;
  try {
    const res = await apis.MainGameList({
      site_Idx: process.env.SITE_IDX,
      category: MainCategory.LiveCasino,
      vendor_Idx: selectedProvider.value.length === 0 ? '0' : selectedProvider.value,
      currentPage: currentPage.value,
      currentPageSize: currentPageSize.value,
      search: '',
      order: '',
      sort: '',
      user_Filter: 0,
    });

    loading.value = false;

    if (res.data.errCode === 0) {
      const data = res.data.returnData;
      list.value = data.list;
      if (currentPage.value === 1) {
        listCount.value = data.totalCount.count;
      }
      pageMax.value = Math.ceil(listCount.value / currentPageSize.value);
    } else {
      console.error('error');
    }
  } catch (error) {
    console.error(error);
  }
};

onBeforeMount(async () => {
  await getMainGameList();
});
</script>

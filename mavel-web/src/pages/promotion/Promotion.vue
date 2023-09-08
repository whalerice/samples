<template>
  <div class="spinner-container" v-if="!isPromotion">
    <div class="spinner-area mb-50">
      <q-spinner-gears size="10rem" />
    </div>
    <span class="text-h4 mb-40"> The current page is in preparation. </span>
    <span class="text-h5"> We apologize for the inconvenience. </span>
    <span class="text-h5"> We will look better in the near future. </span>
  </div>

  <div class="row q-col-gutter-md" v-if="isPromotion">
    <div class="col-12 col-md-4" v-for="item in rows" :key="item.idx">
      <q-card class="promo-card" @click="openDetails(item)">
        <q-img :src="item.img_Url + sasQuery" :ratio="16 / 9" />

        <q-card-section>
          <div class="text-h5 q-mt-sm q-mb-xs">{{ item.title }}</div>
          <div class="text-subtitle2 text-grey">
            {{ item.start_Date }}
            <span v-if="item.end_Date !== null"> ~ {{ item.end_Date }}</span>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
  <Pagination
    v-if="isPromotion"
    @callback="onRequest"
    v-model:current-page="pagination.page"
    :page-max="pageMax"
    v-model:current-page-size="pagination.rowsPerPage"
    :current-page-size-options="currentPageSizeOptions"
    :loading="loading" />
</template>
<script setup lang="ts">
import Pagination from 'src/components/Pagination.vue';

import { storeToRefs } from 'pinia';
import { QSpinnerGears } from 'quasar';
import { onBeforeMount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { commonStore } from 'src/stores/common';
import { apis } from 'src/stores/apis';

const router = useRouter();

const { sasQuery } = storeToRefs(commonStore.common());
const { shareSASQuery } = commonStore.common();

const currentPageSizeOptions = [10, 15, 20, 25, 30];
const pageMax = ref<number>(1);
const loading = ref<boolean>(false);

const isPromotion = ref<boolean>(false);
const rows = ref<any[]>([]);
const total = ref<number>(0);
const pagination = ref({ page: 1, rowsPerPage: 10 });

const openDetails = (data: any) => {
  router.push({ name: 'PromotionDetails', params: { idx: data.idx } });
};

const onRequest = async () => {
  const send = {
    currentPage: pagination.value.page,
    currentPageSize: pagination.value.rowsPerPage,
  };

  try {
    const response = await apis.PromotionList(send);
    if (response.data.errCode === 0) {
      const returnData = response.data.returnData;
      rows.value = returnData.list;
      if (returnData.list.length > 0) {
        isPromotion.value = true;
      }

      if (returnData.totalCount) {
        total.value = returnData.totalCount.count;
      }
      pageMax.value = Math.ceil(total.value / pagination.value.rowsPerPage);
    }
  } catch (error) {
    console.error(error);
  }
};

const onRefresh = () => {
  onRequest();
};

onBeforeMount(() => {
  shareSASQuery();
});

onMounted(() => {
  onRefresh();
});
</script>

<style scoped lang="scss">
.spinner-container {
  width: 100%;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 10rem;
  opacity: 0.4;

  .spinner-area {
    width: 100%;
    max-height: 30rem;
    display: flex;
    justify-content: center;
  }
}
</style>

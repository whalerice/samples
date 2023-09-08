<template>
  <q-toolbar class="no-padding">
    <q-toolbar-title> {{ data.title }} </q-toolbar-title>
    <div>
      {{ data.start }} <span v-if="data.end !== null"> ~ {{ data.end }}</span>
    </div>
  </q-toolbar>
  <q-img :src="data.url + sasQuery" class="q-mb-md" />
  <q-editor :toolbar="[]" v-model="data.content" height="auto" min-height="auto" :readonly="true" />

  <div class="text-right q-mt-md">
    <q-btn unelevated color="primary" :label="$t('common.button.list')" @click="router.push('/promotion')" />
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import { apis } from 'src/stores/apis';
import { commonStore } from 'src/stores/common';

const router = useRouter();
const route = useRoute();
const { sasQuery } = storeToRefs(commonStore.common());
const { shareSASQuery } = commonStore.common();

interface IData {
  url: string;
  title: string;
  content: string;
  start: string;
  end: string;
}

const data = ref<IData>({
  url: '',
  title: '',
  content: '',
  start: '',
  end: '',
});

const onRequest = async () => {
  try {
    const response = await apis.PromotionDetail({ idx: Number(route.params.idx) });
    if (response.data.errCode === 0) {
      const returnData = response.data.returnData;

      data.value['url'] = returnData.img_Url;
      data.value['title'] = returnData.title;
      data.value['content'] = returnData.content;
      data.value['start'] = returnData.start_Date;
      data.value['end'] = returnData.end_Date;
    }
  } catch (error) {
    console.error(error);
  }
};

onBeforeMount(() => {
  shareSASQuery();
  onRequest();
});
</script>

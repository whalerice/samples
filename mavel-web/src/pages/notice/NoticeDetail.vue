<template>
  <div class="notice-detail">
    <q-toolbar class="no-padding">
      <q-toolbar-title> {{ message.title }} </q-toolbar-title>
      <div>{{ $t('table.thead.views') }} {{ message.views }}</div>
    </q-toolbar>
    <div>
      <span class="text-weight-bold">{{ message.writer }}</span>
      <span class="text-grey-7 q-ml-md">{{ message.date }}</span>
    </div>
    <q-separator spaced="2rem" color="grey-9" />
    <q-editor :toolbar="[]" v-model="message.content" height="auto" min-height="30rem" :readonly="true" />
  </div>
  <div class="text-right q-mt-md">
    <q-btn unelevated color="primary" :label="$t('common.button.list')" @click="router.push('/notice')" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { apis } from 'src/stores/apis';

const route = useRoute();
const router = useRouter();

interface IData {
  title: string;
  content: string;
  writer: string;
  date: string;
  views: number;
}

const message = ref<IData>({
  title: '',
  content: '',
  writer: '',
  date: '',
  views: 0,
});

const onRequest = async () => {
  try {
    const response = await apis.BoardDetail({ idx: Number(route.params.idx) });
    if (response.data.errCode === 0) {
      const returnData = response.data.returnData;
      console.log(returnData);

      message.value['title'] = returnData.title;
      message.value['content'] = returnData.content;
      message.value['writer'] = returnData.manager_Id;
      message.value['date'] = returnData.registration_Date;
      message.value['views'] = returnData.views;
    }
  } catch (error) {
    console.error(error);
  }
};

onMounted(() => {
  onRequest();
});
</script>

<template>
  <div class="row justify-between items-center mb-10">
    <div class="col-12 col-sm-4">{{ $t('common.label.otc_bay') }}</div>
    <div class="row col-12 col-sm-8 no-wrap">
      <q-select class="col-8 mr-10" dense v-model="otcBayId" :options="chatList" />
      <q-btn
        no-caps
        class="flex-1"
        unelevated
        color="primary"
        :label="$t('common.button.go')"
        :loading="loading"
        @click="startChat()"
        :disable="props.data === null" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { apis } from 'src/stores/apis';
import { onBeforeMount, ref } from 'vue';

const $q = useQuasar();
const isDesktop = ref<boolean>($q.platform.is.desktop ? $q.platform.is.desktop : false);
const loading = ref<boolean>(false);
const otcBayId = ref<any>();
const chatList = ref<any[]>([]);

const props = defineProps({
  data: {
    type: Object,
    default: null,
    required: true,
  },
});

const deepLink = (profileId: string) => {
  const type = 30;
  let url = `https://cpass.page.link/?link=https://apps.cpass.exchange/chat/${profileId}/${type}&apn=com.digilab24.apps&ibi=com.digilab24.apps`;
  window.location.href = url;
};

const startChat = async () => {
  loading.value = true;
  try {
    if (isDesktop.value === false) {
      deepLink(otcBayId.value.profileId);
      loading.value = false;
    } else {
      const res = await apis.CpassOtcBayChatPush({
        pg_Idx: props.data.pg_Idx,
        user_Sn: props.data.user_Sn,
        user_Id: props.data.user_Id,
        profile_Id: otcBayId.value.profileId,
      });
      if (res.data.errCode === 0) {
        loading.value = false;
      }
    }
  } catch (error) {
    console.error(error);
  }
};

const otcBayList = async () => {
  try {
    const res = await apis.CpassOtcBayBoard({ Pg_Idx: 1 });
    const returnData = res.data.returnData;

    let items: any = [];
    if (res.data.errCode === 0) {
      returnData.forEach((el: any) => {
        const item = {
          label: el.userId,
          value: el.userId,
          ...el,
        };
        items.push(item);
      });

      chatList.value = items;
      otcBayId.value = chatList.value[0];
    }
  } catch (error) {
    console.error(error);
  }
};

onBeforeMount(() => {
  otcBayList();
});
</script>

<style scoped></style>

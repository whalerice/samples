<template>
  <div class="inquiry-count-row">
    <a-card size="small">
      <template #title>
        <span>{{ $t('component.title.customer_inquiries') }}</span>
        <a-button type="text" @click="onClickCountDown" class="btn-refresh">
          <span>{{ $t('common.text.last') }} {{ currentTime }}</span>
          <fa-icon icon="arrows-rotate" :spin="isRefresh" />
        </a-button>
      </template>
      <template #extra>
        <router-link to="/customer" class="btn-shortcut">
          <span>{{ $t('common.button.shortcut') }}</span>
          <fa-icon icon="arrow-up-right-from-square" />
        </router-link>
      </template>
      <ul class="inquiry-count">
        <li class="inquiry-count-item" v-for="(item, idx) in inquiryList" :key="idx">
          <a-typography-text class="title"> {{ $t(item.title) }}</a-typography-text>
          <a-typography-text class="figure"> {{ item.count }}</a-typography-text>
        </li>
      </ul>
    </a-card>
  </div>
  <vue3-autocounter
    class="txt-hide"
    :startAmount="20"
    :endAmount="0"
    :duration="20"
    @finished="countFinished"
    ref="$count"
  />
</template>
<script setup>
import Vue3Autocounter from 'vue3-autocounter';
import { ref, computed, watch, onMounted } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const inquiryCount = computed(() => store.state['common'].inquiryCount);
const errCode = computed(() => store.state['common'].errCode);

const inquiryList = ref([
  { state: 'request', title: 'component.label.request', count: 0 },
  { state: 'dev', title: 'component.label.dev', count: 0 },
  { state: 'cs', title: 'component.label.cs', count: 0 },
]);

const currentTime = ref('');
const isRefresh = ref(false);
const $count = ref(null);

const countFinished = async () => {
  if (errCode.value !== -2) {
    await store.dispatch('common/supportInquiryCount').then(() => {
      currentTime.value = inquiryCount.value[0].refesh_Time;
    });
  }
  $count.value.start();
};

const onClickCountDown = () => {
  $count.value.reset();
  isRefresh.value = true;
  countFinished();
};

watch(inquiryCount, (val) => {
  const toRequest = val.filter((e) => e.state === 1)[0];
  const toDev = val.filter((e) => e.state === 2)[0];
  const toCs = val.filter((e) => e.state === 3)[0];

  inquiryList.value[0].count = toRequest ? toRequest.count : 0;
  inquiryList.value[1].count = toDev ? toDev.count : 0;
  inquiryList.value[2].count = toCs ? toCs.count : 0;
  setTimeout(() => {
    isRefresh.value = false;
  }, 2000);
});

onMounted(() => {
  onClickCountDown();
});
</script>

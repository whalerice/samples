<template>
  <a-row :gutter="[15, 15]">
    <a-col :xs="24" :xxl="8" v-if="grade !== auth.Viewer">
      <CountCard
        href="/manager/member/partner"
        :title="$t('component.title.partners_request')"
        :time="refreshedTime.partners"
        :count="partnersCount"
        @refresh="refresh('partners')"
      />
    </a-col>
    <a-col :xs="24" :xxl="8" v-if="grade !== auth.Viewer">
      <CountCard
        :title="$t('component.title.guarantee_confirmed')"
        :time="refreshedTime.guarantee"
        href="/manager/member/partner"
        :count="guaranteeCount"
        @refresh="refresh('guarantee')"
      />
    </a-col>
    <a-col :xs="24" :xxl="grade === auth.Viewer ? 24 : 8">
      <CountCard
        :title="$t('component.title.settlement_request')"
        :time="refreshedTime.settlement"
        :count="settlementCount"
        @refresh="refresh('settlement')"
      />
    </a-col>
  </a-row>
  <vue3-autocounter
    class="txt-hide"
    :startAmount="20"
    :endAmount="0"
    :duration="20"
    @finished="countFinished"
    ref="$timer"
  />
</template>
<script setup>
import CountCard from '@/components/common/CountCard.vue';
import Vue3Autocounter from 'vue3-autocounter';
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { auth } from '@/assets/js/global';

const store = useStore();
const dashboardCounts = computed(() => store.state['sign'].dashboardCounts);
const grade = computed(() => store.state['sign'].signInfo.grade);
const $timer = ref(null);
const errCode = computed(() => store.state['common'].errCode);

const partnersCount = ref(0);
const guaranteeCount = ref(0);
const settlementCount = ref(0);
const refreshedTime = ref({ partners: '', guarantee: '', settlement: '' });

const refresh = (type) => {
  if (errCode.value === 0) {
    store.dispatch('sign/dashboardCountCSmaster').then(() => {
      switch (type) {
        case 'partners':
          partnersCount.value = dashboardCounts.value.newPartnerCount;
          refreshedTime.value.partners = dashboardCounts.value.refesh_Time;
          break;
        case 'guarantee':
          guaranteeCount.value = dashboardCounts.value.guaranteePartnerCount;
          refreshedTime.value.guarantee = dashboardCounts.value.refesh_Time;
          break;
        case 'settlement':
          settlementCount.value = dashboardCounts.value.settlementCount;
          refreshedTime.value.settlement = dashboardCounts.value.refesh_Time;
          break;
        default:
          partnersCount.value = dashboardCounts.value.newPartnerCount;
          guaranteeCount.value = dashboardCounts.value.guaranteePartnerCount;
          settlementCount.value = dashboardCounts.value.settlementCount;
          refreshedTime.value.partners = dashboardCounts.value.refesh_Time;
          refreshedTime.value.guarantee = dashboardCounts.value.refesh_Time;
          refreshedTime.value.settlement = dashboardCounts.value.refesh_Time;
          break;
      }
    });
  }
};

const countFinished = () => {
  refresh('all');
  $timer.value.start();
};

onMounted(() => {
  refresh('all');
});
</script>

<template>
  <a-card size="small">
    <template #title>
      <strong>{{ $t('nav.calendar') }}</strong>
    </template>
    <PaymentCalendar @openModal="openModal" />
    <a-modal
      class="detail-modal"
      v-model:visible="isActive"
      @ok="isActive = false"
      :closable="true"
      :footer="false"
      :width="1500"
    >
      <PaymentCalendarDetail
        :data="propData"
        :config="{
          dashBoard: false,
          loading: isLoading.partnerSalesStatsByCoin,
          fullDate: fullDate,
          fee: fee,
        }"
      />
    </a-modal>
  </a-card>
</template>

<script setup>
import { useStore } from 'vuex';
import { onBeforeMount, ref, computed } from 'vue';
import PaymentCalendar from '@/components/partner/PaymentCalendar.vue';
import PaymentCalendarDetail from '@/components/partner/PaymentCalendarDetail.vue';

const store = useStore();
const isActive = ref(false);
const lists = computed(() => store.state['partner'].partnerSalesStatsByCoin);
const isLoading = computed(() => store.state['partner'].loading.partnerSalesStatsByCoin);
const errCode = computed(() => store.state['common'].errCode);
const fullDate = ref('');
const fee = ref(false);
const propData = ref();

const openModal = async (val) => {
  val.sales_Type === 0 ? (fee.value = false) : (fee.value = true);
  await store.dispatch('partner/PartnerSalesStatsByCoin', {
    sales_Type: val.sales_Type,
    Sales_Period: val.duration ? val.duration : val.fullDate,
  });
  if (errCode.value === 0) {
    propData.value = lists.value;
    fullDate.value = val.fullDate;
    isActive.value = true;
  }
};

onBeforeMount(async () => {
  await store.dispatch('sign/currencyList');
});
</script>

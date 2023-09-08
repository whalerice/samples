<template>
  <a-card size="small" class="customer-request-container">
    <template #title>
      <span>{{ t('component.title.customer_request') }}</span>
      <a-button v-if="!isLoading" type="text" @click="onRefresh" class="btn-refresh">
        <span>{{ t('common.text.last') }} {{ currentTime }}</span>
        <fa-icon icon="arrows-rotate" :spin="isRefresh" />
      </a-button>
    </template>
    <ul v-if="lists?.refresh_Time !== null && !isLoading" class="customer-request" :class="{ hide: isLoading }">
      <li class="item total">
        <h3>
          {{
            accessName === 'Personal'
              ? t('component.label.unconfirmed_payment')
              : t('component.label.unconfirmed_withdraw')
          }}
        </h3>
        <vue3-autocounter
          class="count"
          :startAmount="0"
          :endAmount="countNum"
          :duration="2"
          separator=","
          decimalSeparator="."
          :decimals="0"
          :autoinit="true"
          ref="$count"
        />
      </li>
      <li class="item">
        <span>{{ t('component.label.completed_payment') }}</span>
        <strong>{{ lists?.payment_Count }}</strong>
      </li>
      <li class="item">
        <span>{{ t('component.label.completed_withdrawal') }}</span>
        <strong>{{ lists?.withdraw_Count }}</strong>
      </li>
    </ul>
    <a-skeleton class="skeleton-ab" :class="{ hide: !isLoading }" active />
    <a-empty v-if="lists?.refresh_Time === null && !isLoading" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
  </a-card>
</template>
<script setup>
import { computed, ref, watch, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import Vue3Autocounter from 'vue3-autocounter';
import { useI18n } from 'vue-i18n';
import { accessList } from '@/assets/js/global.js';
import { Empty } from 'ant-design-vue';

const { t } = useI18n();
const store = useStore();
const isRefresh = ref(false);
const isLoading = computed(() => store.state['partner'].loading.paymentAcceptCount);
const currentTime = ref('');
const countNum = ref(0);
const $count = ref(null);
const accessName = ref('');
const lists = computed(() => store.state['partner'].paymentAcceptCount.returnData);
const grade = computed(() => store.state['sign'].signInfo.grade);

const refresh = () => {
  currentTime.value = lists.value.refresh_Time;
  countNum.value = lists?.value?.unidentified_Count;
  isRefresh.value = true;
  setTimeout(() => {
    isRefresh.value = false;
  }, 2000);
};

const onRefresh = async () => {
  await store.dispatch('partner/PartnerPaymentAcceptCount');
  await store.dispatch('partner/PartnerPaymentUnidentifiedList');
};

watch(isLoading, () => {
  if (!isLoading.value) refresh();
});

onBeforeMount(async () => {
  accessName.value = accessList.filter((e) => e.idx === grade.value)[0].name;
});
</script>

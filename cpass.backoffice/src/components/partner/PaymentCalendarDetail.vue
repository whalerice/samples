<template>
  <a-card size="small" class="mb-gap balance-detail" :class="{ 'hide-border': !isDashBoard }">
    <template #title v-if="isDashBoard">
      <span>{{ t('component.label.balance') }}</span>
    </template>
    <template #extra v-if="isDashBoard">
      <router-link to="/partner-wallet" class="btn-shortcut">
        <span>{{ t('common.button.shortcut') }}</span>
        <fa-icon icon="arrow-up-right-from-square" />
      </router-link>
    </template>
    <a-row v-if="isDashBoard" type="flex">
      <a-col flex="auto">
        <a-radio-group v-model:value="radioTab" class="mb-15 radio-control" :disabled="isLoading">
          <a-radio-button class="select-control" :value="item.value" v-for="(item, index) in radio" :key="index">
            {{ $t(item.text, { num: item.num }) }}
          </a-radio-button>
        </a-radio-group>
      </a-col>
    </a-row>
    <div class="calendar-modal">
      <h2 class="calendar-modal-title" v-if="props.config?.fullDate && !isDashBoard">
        {{ props.config?.fullDate }}
      </h2>
      <a-row :gutter="[15, 15]" class="calendar-modal-container">
        <a-col :xs="24" v-for="(item, index) in getReturnData(propData.returnData)" :key="index">
          <a-skeleton active class="skeleton-ab" :class="{ hide: !isLoading }" />
          <div class="items-wrap" :class="{ hide: isLoading }">
            <ul class="items-total">
              <li class="flex">
                <h3 v-if="index === 0">
                  {{ isFee ? t('component.label.actual_deposit') : t('component.label.total_deposit') }} :
                </h3>
                <h3 v-if="index === 1">
                  {{ isFee ? t('component.label.actual_withdrawal') : t('component.label.total_withdrawal') }} :
                </h3>
                <h3>
                  <span v-if="!item?.isNull">{{ matchingCurrencyType(item.currency_Type) }}&nbsp;</span>
                  <span v-if="!isFee">{{ comma(item.total_Currency_Actual) }}</span>
                  <span v-if="isFee">{{ comma(item.total_Currency_Amount) }}</span>
                </h3>
              </li>
              <li class="flex indent" v-if="isFee || isDashBoard">
                <span v-if="index === 0">{{ t('component.label.total_deposit') }} :</span>
                <span v-if="index === 1">{{ t('component.label.total_withdrawal') }} :</span>

                <span>
                  <span v-if="!item?.isNull">{{ matchingCurrencyType(item.currency_Type) }}&nbsp;</span>
                  <span v-if="!isFee">{{ comma(item.total_Currency_Amount) }}</span>
                  <span v-if="isFee">{{ comma(item.total_Currency_Actual) }}</span>
                </span>
              </li>
              <li class="flex indent" v-if="isFee || isDashBoard">
                <span>{{ t('common.button.commission') }} :</span>
                <span>
                  <span v-if="!item?.isNull">{{ matchingCurrencyType(item.currency_Type) }}&nbsp;</span>
                  <span>{{ comma(item.total_Currency_Fee) }}</span>
                </span>
              </li>
            </ul>
            <div class="items-container" :class="{ 'one-child': item.salesStatsPayment.length === 1 }">
              <div v-if="!item?.isNull" class="items">
                <i class="ico-coin"></i>
                <span v-if="index === 0" class="items-top">{{ t('component.label.deposit_amount') }}</span>
                <span v-if="index === 1" class="items-top">{{ t('component.label.withdrawal_amount') }}</span>
                <span v-if="index === 1 && (isFee || isDashBoard)" class="items-top">{{
                  t('common.button.commission')
                }}</span>
                <span v-if="index === 0 && (isFee || isDashBoard)" class="items-top">{{
                  t('common.button.commission')
                }}</span>
              </div>
              <div
                v-if="!item?.isNull"
                class="items show"
                :class="{ 'one-child-header': item.salesStatsPayment.length === 1 }"
              >
                <i class="ico-coin"></i>
                <span v-if="index === 0" class="items-top">{{ t('component.label.deposit_amount') }}</span>
                <span v-if="index === 1" class="items-top">{{ t('component.label.withdrawal_amount') }}</span>
                <span v-if="index === 0 && (isFee || isDashBoard)" class="items-top">{{
                  t('common.button.commission')
                }}</span>
                <span v-if="index === 1 && (isFee || isDashBoard)" class="items-top">{{
                  t('common.button.commission')
                }}</span>
              </div>
              <div class="items" v-for="(coin, idx) in item.salesStatsPayment" :key="idx">
                <i :class="`coin coin-${coin.coin_Cd}`" />

                <div class="items-price">
                  <span
                    >{{ matchingCurrencyType(item.currency_Type) }}
                    <span v-if="!isFee"> {{ comma(coin.currency_Actual) }} </span>
                    <span v-if="isFee"> {{ comma(coin.currency_Amount) }} </span>
                  </span>
                  <span>
                    <span v-if="!isFee"> {{ comma(coin.coin_Actual) }} </span>
                    <span v-if="isFee"> {{ comma(coin.coin_Amount) }} </span>
                    {{ matchingCoinLabel(coin.coin_Cd) }}
                  </span>
                </div>
                <div class="items-price" v-if="isFee || isDashBoard">
                  <span
                    >{{ matchingCurrencyType(item.currency_Type) }}
                    <span>
                      {{ comma(coin.currency_Fee) }}
                    </span></span
                  >
                  <span
                    >{{ coin.coin_Fee }}
                    <span>
                      {{ matchingCoinLabel(coin.coin_Cd) }}
                    </span></span
                  >
                </div>
              </div>
            </div>
            <a-empty v-if="item?.isNull" class="empty" :image="simpleImage" />
          </div>
        </a-col>
      </a-row>
    </div>
  </a-card>
</template>
<script setup>
import { useStore } from 'vuex';
import { ref, computed, watch } from 'vue';
import { comma, matchingCurrencyType, matchingCoinImgByCd, matchingCoinLabel, deepCopy } from '@/assets/js/global.js';
import { useI18n } from 'vue-i18n';
import { Empty } from 'ant-design-vue';

const { t } = useI18n();
const store = useStore();
const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  config: {
    type: Object,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: false,
  },
});
const emit = defineEmits(['changeInfo']);
const propData = computed(() => props.data);
const isDashBoard = computed(() => props.config.dashBoard);
const isLoading = computed(() => props.config.loading);
const isFee = computed(() => props.config.fee);
const simpleImage = computed(() => Empty.PRESENTED_IMAGE_SIMPLE);
const radioTab = ref(0);
const radio = ref([
  { fullTitle: '1Day', shortTitle: '1D', value: 0, num: 1, text: 'common.button.day' },
  { fullTitle: '1Week', shortTitle: '1W', value: 1, num: 7, text: 'common.button.day' },
  { fullTitle: '1Month', shortTitle: '1M', value: 2, num: 1, text: 'common.button.month' },
  { fullTitle: '3Month', shortTitle: '3M', value: 3, num: 3, text: 'common.button.month' },
]);
const parameter = ref({
  select: 0,
  radio: 0,
});

const getReturnData = (val) => {
  let arr = setArrOrder(val);
  let nullData = [
    {
      total_Currency_Actual: '-',
      total_Currency_Amount: '-',
      total_Currency_Fee: '-',
      salesStatsPayment: [],
      isNull: true,
    },
    {
      total_Currency_Actual: '-',
      total_Currency_Amount: '-',
      total_Currency_Fee: '-',
      salesStatsPayment: [],
      isNull: true,
    },
  ];
  const length = arr ? Object.keys(arr)?.length : 0;
  if (arr === undefined || length <= 0) {
    return nullData;
  } else if (arr !== null && arr !== undefined) {
    if (length === 1) {
      arr[0].deal_Type === 1 ? arr.push(nullData[0]) : arr.unshift(nullData[0]);
    }
    return arr;
  }
};

const setArrOrder = (val) => {
  let arr = deepCopy(val);
  let temp = [];
  if (val?.length === 2) {
    if (arr !== undefined && arr !== null) {
      if (arr[0].deal_Type === 1) {
        return arr;
      } else if (arr[0].deal_Type === 2) {
        temp.push(arr[1]);
        temp.push(arr[0]);
        return temp;
      }
    } else {
      return arr;
    }
  }
  return arr;
};

watch(radioTab, (val) => {
  parameter.value.radio = val;
  emit('changeInfo', parameter);
});
</script>

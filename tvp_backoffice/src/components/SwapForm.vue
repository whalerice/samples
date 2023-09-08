<template>
  <a-form layout="vertical">
    <a-form-item
      :label="$t('common.word.swap_from')"
      v-bind="form.validateInfos.fromCoin"
    >
      <a-input-group compact>
        <CoinSelect
          :coin-list="filteredCoinList"
          v-model="model.fromCoin"
          @update:value="fromCoinUpdated"
        />
        <a-input-number
          size="default"
          v-model:value="model.swapAmount"
          :formatter="(value:any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
          :parser="(value:any) => value.replace(/\$\s?|(,*)/g, '')"
          :disabled="!model.fromCoin"
        >
          <template #suffix>
            {{ model.fromCoin }}
          </template>
        </a-input-number>
        <a-button size="default" :disabled="!model.fromCoin">
          {{ $t('common.word.maximum') }}
        </a-button>
      </a-input-group>

      <a-row
        align="middle"
        justify="space-between"
        :gutter="[10, 10]"
        class="q-mt-sm"
      >
        <a-col>
          {{ $t('common.word.max') }}
        </a-col>
        <a-col> {{ $comma(maxAmount) }} {{ model.fromCoin }} </a-col>
      </a-row>

      <a-row align="middle" justify="space-between" :gutter="[10, 10]">
        <a-col>
          {{ $t('common.word.min') }}
        </a-col>
        <a-col> {{ $comma(minAmount) }} {{ model.fromCoin }} </a-col>
      </a-row>
    </a-form-item>

    <a-form-item :label="$t('common.word.swap_to')">
      <CoinSelect
        :coin-list="toCoinList"
        v-model="model.toCoin"
        :disabled="!model.fromCoin"
      />
    </a-form-item>

    <!-- <a-form-item>
      <CoinIcon
        :coin="modelRef.selectSwapFromCoin"
        v-if="modelRef.selectSwapFromCoin"
      />
      <template v-if="modelRef.toCoin">
        <SwapRightOutlined class="q-mr-xs" />
        <CoinIcon :coin-code="modelRef.toCoin" />
      </template>
    </a-form-item> -->

    <a-form-item class="btn-group">
      <a-space :size="5">
        <a-button
          size="default"
          type="primary"
          :disabled="!model.toCoin || model.swapAmount === 0"
          @click.prevent="onSubmit"
        >
          {{ $t('common.word.request') }}
        </a-button>
      </a-space>
    </a-form-item>

    <!-- <a-form-item :label="$t('common.word.swap_from')"></a-form-item> -->
  </a-form>

  <!-- <a-row class="column" :gutter="[0, 20]">
    <a-row align="middle" justify="space-between" :gutter="[10, 10]">
      <a-col flex="auto">
        {{ $t('common.word.swap_from') }}
      </a-col>
      <a-col flex="auto">
        <a-row justify="end">
          <a-col>
            <CoinSelect
              :coin-list="coinList"
              :value="selectSwapFromCoin"
              @update:value="
                (val) => (
                  (selectSwapFromCoin = val),
                  selectSwapFromCoin === selectSwapToCoin
                    ? (selectSwapToCoin = undefined)
                    : ''
                )
              "
            />
          </a-col>
          <a-col>
            <a-input-number
              v-model:value="swapAmount"
              :formatter="(value:any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
              :parser="(value:any) => value.replace(/\$\s?|(,*)/g, '')"
              :disabled="!selectSwapFromCoin"
            >
              <template #prefix v-if="selectSwapFromCoin">
                <CoinIcon :coin-code="selectSwapFromCoin" />
                <template v-if="selectSwapToCoin">
                  <SwapRightOutlined class="q-mr-xs" />
                  <CoinIcon :coin-code="selectSwapToCoin" />
                </template>
              </template>
              <template #addonAfter>
                <a-button type="primary" :disabled="!selectSwapFromCoin">
                  {{ $t('common.word.maximum') }}
                </a-button>
              </template>
            </a-input-number>
          </a-col>
        </a-row>
      </a-col>
    </a-row>
    <a-row class="column" style="margin-top: -1.5rem">
      <a-row align="middle" justify="space-between" :gutter="[10, 10]">
        <a-col>
          {{ $t('common.word.max') }}
        </a-col>
        <a-col> {{ $comma('0') }} {{ selectSwapFromCoin }} </a-col>
      </a-row>
      <a-row align="middle" justify="space-between" :gutter="[10, 10]">
        <a-col>
          {{ $t('common.word.min') }}
        </a-col>
        <a-col> {{ $comma('0') }} {{ selectSwapFromCoin }} </a-col>
      </a-row>
    </a-row>

    <a-row align="middle" justify="space-between" :gutter="[10, 10]">
      <a-col>
        {{ $t('common.word.swap_to') }}
      </a-col>
      <a-col>
        <CoinSelect
          :coin-list="
            Object.values(coinList).filter((e) => e.coin !== selectSwapFromCoin)
          "
          :value="selectSwapToCoin"
          @update:value="(val) => (selectSwapToCoin = val)"
          :disabled="!selectSwapFromCoin"
        />
      </a-col>
    </a-row>
    <a-row justify="end">
      <a-button
        type="primary"
        :disabled="!selectSwapToCoin || swapAmount === 0"
        @click="swapRequestModalVisible = !swapRequestModalVisible"
      >
        {{ $t('common.word.request') }}
      </a-button>
    </a-row>
    <SwapRequestModal
      :visible="swapRequestModalVisible"
      :show="swapRequestModalVisible"
      :from-coin="selectSwapFromCoin"
      :to-coin="selectSwapToCoin"
      @update:visible="(val) => (swapRequestModalVisible = val)"
    />
  </a-row> -->

  <SwapRequestModal
    :visible="swapRequestModalVisible"
    :show="swapRequestModalVisible"
    :from-coin="model.fromCoin"
    :to-coin="model.toCoin"
    @update:visible="(val) => (swapRequestModalVisible = val)"
  />
</template>

<script setup lang="ts">
import SwapRequestModal from '@/components/modal/SwapRequestModal.vue';
import CoinSelect from '@/components/select/CoinSelect.vue';

import { onMounted, ref, PropType, computed } from 'vue';
import { Form } from 'ant-design-vue';
import { coinList } from '@/utils/constants';

const filteredCoinList = computed(() => {
  return (
    props.wallets?.reduce<ICoinMap>(
      (result, value) => ({
        ...result,
        [value.coinCode]: coinList[value.coinCode],
      }),
      {}
    ) || {}
  );
});

const toCoinList = computed(() => {
  return Object.values(filteredCoinList).filter(
    (e) => e.coin !== model.value.fromCoin
  );
});

const props = defineProps({
  wallets: Array as PropType<IWallet[]>,
});

const swapRequestModalVisible = ref(false);
const minAmount = ref(0);
const maxAmount = ref(0);

const model = ref<{
  fromCoin: CoinCode | null;
  toCoin: CoinCode | null;
  swapAmount: number | null;
}>({
  fromCoin: null,
  toCoin: null,
  swapAmount: null,
});

const form = Form.useForm(model, {
  fromCoin: [
    {
      required: true,
      message: 'Please select coin',
    },
  ],
  toCoin: [
    {
      required: true,
      message: 'Please select coin',
    },
  ],
  swapAmount: [
    {
      required: true,
      message: 'Please input amount',
    },
  ],
});

const onSubmit = async () => {
  await form.validate();

  swapRequestModalVisible.value = true;
};

const fromCoinUpdated = (value: number | null) => {
  if (value === model.value.toCoin) {
    model.value.toCoin = null;
  }
};

onMounted(() => {
  form.resetFields();
});
</script>

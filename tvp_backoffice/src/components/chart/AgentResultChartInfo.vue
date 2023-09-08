<template>
  <a-row :gutter="[10, 30]" justify="center">
    <a-col :xs="0" :md="3" align="middle">
      <a-row
        class="full-height column text-weight-bold justify-center"
        :gutter="[0, 12]"
        style="padding-top: 2.5rem"
      >
        <a-col>{{ $t('common.word.predict_amount') }}</a-col>
        <a-col>{{ $t('common.word.winning_amount') }}</a-col>
        <a-col>{{ $t('common.word.profit') }}</a-col>
        <a-col>
          {{ $t('common.word.reserve_amount') }}
        </a-col>
      </a-row>
    </a-col>
    <a-col
      :md="7"
      :sm="24"
      :xs="24"
      v-for="(option, optionIdx) in props.chartOption"
      :key="option"
    >
      <a-row
        class="full-width text-h4 text-weight-bold"
        justify="center"
        style="height: 2.5rem"
      >
        <template v-for="(data, i) in option" :key="i">
          <a-col>
            <span :class="`text-prediction-${data.name.toLowerCase()}`">
              {{ data.name }}
            </span>
            <span v-if="i === 0">/</span>
          </a-col>
        </template>
      </a-row>
      <a-row style="pointer-events: none; position: relative">
        <a-col style="width: 100%; min-height: 30rem">
          <PieChart :chart-option="option" />
        </a-col>

        <a-row
          class="column absolute-center text-weight-bold"
          :gutter="[0, 12]"
        >
          <a-col>
            <a-row align="middle">
              <CoinIcon :coin-code="CoinCode.USDT" :margin-right="2" />
              {{
                $comma(
                  Object.values(props.amountData.predictionAmountDetail)[
                    optionIdx
                  ]
                )
              }}
            </a-row>
          </a-col>
          <a-col>
            <a-row align="middle">
              <CoinIcon :coin-code="CoinCode.USDT" :margin-right="2" />
              {{
                $comma(
                  Object.values(props.amountData.winningAmountDetail)[optionIdx]
                )
              }}
            </a-row>
          </a-col>
          <a-col>
            <a-row align="middle">
              <CoinIcon :coin-code="CoinCode.USDT" :margin-right="2" />
              {{
                $comma(
                  Object.values(props.amountData.profitAmountDetail)[optionIdx]
                )
              }}
            </a-row>
          </a-col>
          <a-col>
            <a-row align="middle">
              <CoinIcon :coin-code="CoinCode.USDT" :margin-right="2" />
              {{
                $comma(
                  Object.values(props.amountData.rewardAmountDetail)[optionIdx]
                )
              }}
            </a-row>
          </a-col>
        </a-row>
      </a-row>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import PieChart from '@/components/chart/PieChart.vue';
import CoinIcon from '@/components/CoinIcon.vue';
import { CoinCode } from '@/utils/enums';
import { PropType } from 'vue';

const props = defineProps({
  chartOption: Array as PropType<IPieChartOption[][]>,
  amountData: {
    type: Object as PropType<IAmountData>,
    required: true,
  },
});
</script>

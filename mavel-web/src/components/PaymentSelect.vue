<template>
  <div class="row justify-between items-center mb-10">
    <div class="col-12 col-sm-4">{{ $t('modal.label.payment') }}</div>
    <q-select
      dense
      class="col-12 col-sm-8"
      :model-value="props.paymentSelect"
      @update:model-value="(val) => emit('update:payment-select', val)"
      :options="paymentList"
      tabindex="1">
      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section>
            <q-item-label v-if="PaymentName[scope.opt.label] !== undefined">
              <template v-if="scope.opt.value">
                <img
                  src="images/payments/cpass.svg"
                  alt="cpass"
                  v-if="scope.opt.label === 'Cpass'"
                  style="height: 2rem" />
                <img
                  src="images/payments/astropay-card.svg"
                  alt="astropay-card"
                  v-if="scope.opt.label === 'AstroPay'"
                  style="height: 3.2rem" />
              </template>
            </q-item-label>
            <q-item-label v-else>{{ scope.opt.label }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
      <template v-slot:selected>
        <img
          src="images/payments/cpass.svg"
          alt="cpass"
          v-if="props.paymentSelect.label === 'Cpass'"
          style="height: 2rem; margin-left: 1.6rem" />
        <img
          src="images/payments/astropay-card.svg"
          alt="astropay-card"
          v-if="props.paymentSelect.label === 'AstroPay'"
          style="height: 3.2rem; margin-left: 1.6rem" />
        <!-- <div
          v-if="props.paymentSelect.value === (1 || 3)"
          class="payment-logo"
          :style="{
            backgroundImage: `url(images/payments/${
              props.paymentSelect.label === 'AstroPay' ? 'astropay-card' : props.paymentSelect.label
            }.svg)`,
          }"></div> -->
        <span v-if="props.paymentSelect.label !== ('Cpass' || 'AstroPay')" style="margin-left: 1.6rem">
          {{ props.paymentSelect.label }}
        </span>
      </template>
    </q-select>
  </div>

  <div class="row justify-between items-center mb-10" v-if="props.paymentSelect.label === 'Cpass'">
    <div class="col-12 col-sm-4">
      {{
        $t(
          props.paymentSelect.label === 'Cpass'
            ? 'modal.label.payment_id'
            : props.paymentSelect.value === 2
            ? 'modal.label.bank'
            : 'modal.label.astro_pay',
        )
      }}
    </div>
    <div class="row col-12 col-sm-8 no-wrap">
      <q-input
        :model-value="props.paymentIdModelValue"
        @update:model-value="(val) => emit('update:payment-id-model-value', val)"
        class="col-12"
        clearable
        tabindex="1"
        lazy-rules
        :error="props.errMsg !== ''"
        dense>
        <template v-slot:error>
          {{ props.errMsg }}
        </template>
      </q-input>
    </div>
    <div class="guide-hint">
      <a href="https://guide.cpass.exchange/" target="_blank" class="link">{{ $t('common.text.cpass_guide') }}</a>
    </div>
  </div>
  <div class="row" v-if="props.paymentSelect.label !== 'Cpass'">
    <div class="col-4"></div>
    <div class="col-8">{{ props.paymentSelect.desc }}</div>
  </div>

  <!-- <p class="text-negative full-width">{{ serverError }}</p> -->
</template>

<script setup lang="ts">
// import OtcBayChat from 'src/components/OtcBayChat.vue';

import { computed } from 'vue';

import { PaymentName } from 'src/components/models/enums';

const props = defineProps({
  paymentSelect: {
    type: Object as () => { value: number; label: string; desc?: string },
    default: () => {
      return { value: PaymentName.Cpass, label: 'CPASS' };
    },
  },
  errMsg: String,
  paymentIdModelValue: String,
  paymentList: Array as () => Array<IPaymentGatewayList>,
});

const emit = defineEmits(['update:payment-select', 'update:payment-id-model-value']);
const paymentList = computed(() => props.paymentList);
</script>

<style lang="scss">
// .payment-img {
//   width: 100%;
//   height: 2rem;
//   background: 0% 50% no-repeat;
//   background-size: 7rem;
// }
// .ml {
//   margin-left: 1.6rem;
// }
</style>

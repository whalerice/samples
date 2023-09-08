<template>
  <q-dialog
    :model-value="props.dialogVisible"
    @update:model-value="(val) => [emit('update:dialog-visible', val), (exchangeValue = '')]"
    :maximized="maximizedToggle"
    transition-show="rotate"
    transition-hide="fade"
    class="custom-dialog-container">
    <q-card class="q-pb-lg custom-dialog-card-area">
      <q-bar class="pos-sticky-top">
        <q-space />
        <q-btn dense flat icon="open_in_full" @click="maximizedToggle = !maximizedToggle">
          <q-tooltip class="bg-white text-primary">
            {{ maximizedToggle ? $t('common.label.shrink') : $t('common.label.magnification') }}
          </q-tooltip>
        </q-btn>
        <q-btn dense flat icon="close" v-close-popup>
          <q-tooltip class="bg-white text-primary">{{ $t('common.label.close') }}</q-tooltip>
        </q-btn>
      </q-bar>
      <div class="balance-control-container q-px-md q-py-lg pt-32">
        <span class="text-h4">
          {{ category === 'point' ? $t('dialog.category_point') : $t('common.withdrawal_application') }}
        </span>
        <div class="own-balance-area mt-30 mb-30 row items-center justify-between">
          <div>
            <q-icon
              :name="
                category === 'point'
                  ? 'svguse:icons.svg#custom-point'
                  : category === 'rolling'
                  ? 'svguse:icons.svg#custom-rolling'
                  : 'svguse:icons.svg#custom-losing'
              "
              size="3.8rem"
              class="mr-12" />
            <span>{{
              category === 'point'
                ? $t('dialog.switchable_points')
                : category === 'rolling'
                ? $t('dialog.switchable_points')
                : $t('dialog.switchable_losing')
            }}</span>
          </div>
          <div
            class="fs-20 fw-500"
            :class="
              category === 'point'
                ? 'text-custom-blue-01'
                : category === 'rolling'
                ? 'text-custom-pink-01'
                : 'text-custom-purple-03'
            ">
            <template v-if="category === 'point'">P </template>
            <template v-if="category === 'rolling'">R </template>
            <template v-if="category === 'losing'">L </template>
            {{ comma(defaultBalance) }}
          </div>
        </div>

        <div class="row justify-center mb-40">
          <div class="exchange-area row items-center justify-center">
            <q-icon
              :name="$q.dark.isActive ? 'svguse:icons.svg#custom-exchange-dm' : 'svguse:icons.svg#custom-exchange'"
              size="2.4rem" />
          </div>
        </div>

        <div class="exchange-input-controller mb-5">
          <InputComma
            v-model:value="exchangeValue"
            :placeholder="
              category === 'point' ? $t('dialog.input.placeholder_point') : $t('dialog.input.placeholder_withdrawal')
            "
            :hint="
              dialogCategory === 'rolling' || dialogCategory === 'losing'
                ? `※ ${$t('dialog.input.guide_manager_check')}`
                : ''
            "
            :err-msg="errMsg" />
        </div>

        <div class="exchange-max-checker row justify-end items-center mt-10 mb-80">
          <q-btn unelevated class="no-padding" no-caps @click="onFullValue">
            <q-icon name="svguse:icons.svg#custom-check-dialog" size="2.4rem" class="mr-05" />
            <span>{{
              category === 'point' ? $t('dialog.label.exchange_point_max') : $t('dialog.label.exchange_withdrawal_max')
            }}</span>
          </q-btn>
        </div>

        <div class="balance-control-btn">
          <q-btn
            v-if="category === 'point'"
            class="full-width"
            :class="
              category === 'point'
                ? 'bg-custom-blue-01'
                : category === 'rolling'
                ? 'bg-custom-pink-01'
                : 'bg-custom-purple-03'
            "
            padding="2rem"
            unelevated
            no-caps
            :label="$t('dialog.button.switching')"
            @click="onChangeCash" />
          <q-btn
            v-if="category !== 'point'"
            class="full-width"
            :class="category === 'rolling' ? 'bg-custom-pink-01' : 'bg-custom-purple-03'"
            padding="2rem"
            unelevated
            no-caps
            :label="$t('common.withdrawal_application')"
            @click="onWithdrawal" />
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import InputComma from 'src/components/InputComma.vue';

import { storeToRefs } from 'pinia';
import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { commonStore } from 'src/stores/common';
import { userStore } from 'src/stores/user';
import { apis } from 'src/stores/apis';

const props = defineProps({
  dialogVisible: Boolean,
  dialogCategory: String,
});
const emit = defineEmits(['update:dialog-visible']);
const { userPayInfo } = userStore.user();

const $q = useQuasar();
const { comma } = commonStore.common();
const { userInfo, payInfo } = storeToRefs(userStore.user());
const category = computed(() => props.dialogCategory);

const maximizedToggle = ref<boolean>(false);
const exchangeValue = ref<string>('');
const defaultBalance = ref<string>('0');
const errMsg = ref<string>('');

const onFullValue = () => {
  exchangeValue.value = defaultBalance.value;
};

const onChangeCash = async () => {
  if (exchangeValue.value.length === 0 || exchangeValue.value === '0') {
    errMsg.value = '금액을 입력해주세요!';
  } else {
    try {
      const res = await apis.PointConvert({
        user_Idx: userInfo.value.idx,
        balance: Number(exchangeValue.value.replaceAll(',', '')),
      });

      if (res.data.errCode === 0) {
        await userPayInfo();
        exchangeValue.value = '';
        emit('update:dialog-visible', false);
        $q.notify({
          type: 'positive',
          message: 'Success',
          timeout: 10000,
        });
      }
    } catch (e) {
      console.error(e);
    }
  }
};
const onWithdrawal = async () => {
  if (exchangeValue.value.length === 0 || exchangeValue.value === '0') {
    errMsg.value = '금액을 입력해주세요!';
  } else {
    try {
      const res = await apis.RewardRequest({
        user_Idx: userInfo.value.idx,
        reward_Type: category.value === 'rolling' ? 1 : category.value === 'losing' ? 2 : 0,
        amount: Number(exchangeValue.value.replaceAll(',', '')),
      });

      if (res.data.errCode === 0) {
        await userPayInfo();
        exchangeValue.value = '';
        emit('update:dialog-visible', false);
        $q.notify({
          type: 'positive',
          message: 'Success',
          timeout: 10000,
        });
      }
    } catch (e) {
      console.error(e);
    }
  }
};

watch(exchangeValue, (v) => {
  if (v.length > 0) {
    errMsg.value = '';
  }
});

watch(props, (v) => {
  if (v.dialogVisible) {
    defaultBalance.value =
      v.dialogCategory === 'point'
        ? String(payInfo.value.point)
        : v.dialogCategory === 'rolling'
        ? String(payInfo.value.rolling)
        : String(payInfo.value.losing);
  }
});
</script>

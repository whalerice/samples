<template>
  <div class="payment-btn-group">
    <a-button @click="open(PaymentType.Plus)">
      <template #icon>
        <plus-outlined />
      </template>
    </a-button>
    <a-button @click="open(PaymentType.Minus)">
      <template #icon>
        <minus-outlined />
      </template>
    </a-button>
  </div>

  <a-modal v-model:visible="visible" centered>
    <template #footer>
      <a-button key="submit" type="primary" :loading="confirmLoading" @click="save">
        {{ currentType === PaymentType.Plus ? $t('common.button.pay') : $t('common.button.subtract') }}
      </a-button>
    </template>

    <template #title>
      {{ props.type === PromotionRewardType.Cash ? $t('common.label.cash') : $t('common.label.point') }}
      {{ currentType === PaymentType.Plus ? $t('common.button.pay') : $t('common.button.subtract') }}
    </template>

    <h5 class="text-h5 text-right text-bold q-mb-sm">
      {{
        props.type === PromotionRewardType.Cash
          ? $t('table.thead.member_holding_amount')
          : $t('table.thead.member_holding_point')
      }}: {{ comma(props.value) }}
    </h5>
    <a-input-number
      v-model:value="currentAmount"
      :min="0"
      :formatter="(value:any) => comma(value)"
      oninput="javascript: this.value = this.value.replace(/[^0-9]/g, '' );"
      class="text-right full-width"
      :style="{ color: currentType === PaymentType.Minus ? 'red' : '' }" />
  </a-modal>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { message } from 'ant-design-vue';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons-vue';
import { ref } from 'vue';

import { comma } from 'src/boot/global';
import { PromotionRewardType, UserType } from 'src/components/models/enums';
import { apis } from 'src/stores/apis';
import { userStore } from 'src/stores/user';

enum PaymentType {
  Plus = 1,
  Minus = 2,
}

const { memberType } = storeToRefs(userStore.sign());

const props = defineProps({
  type: {
    type: Number,
    required: true,
  },
  idx: {
    type: Number,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
});

const visible = ref<boolean>(false);
const confirmLoading = ref<boolean>(false);
const currentAmount = ref<number>(0);

const currentType = ref<number>(0);

const emits = defineEmits(['state']);

const close = () => {
  visible.value = false;
  emits('state', true);
};

const open = (type: number) => {
  currentType.value = type;
  visible.value = true;
};

const save = async () => {
  confirmLoading.value = true;
  let category =
    props.type === PromotionRewardType.Cash && currentType.value === PaymentType.Plus
      ? 1
      : props.type === PromotionRewardType.Point && currentType.value === PaymentType.Plus
      ? 2
      : props.type === PromotionRewardType.Cash && currentType.value === PaymentType.Minus
      ? 3
      : 4;

  const send = {
    user_Idx: props.idx,
    category: category,
    amount: currentAmount.value,
  };
  try {
    const response =
      memberType.value === UserType.Manager
        ? await apis.manager.UserSubtractionPayments(send)
        : await apis.partner.UserSubtractionPayments(send);
    if (response.data.errCode === 0) {
      setTimeout(() => {
        confirmLoading.value = false;
        close();
        message.success(response.data.errMessage);
      }, 200);
    } else {
      confirmLoading.value = false;
    }
  } catch (error) {
    confirmLoading.value = false;
    console.error(error);
  }
};
</script>
<style lang="scss" scoped>
.payment-btn-group {
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
  margin-left: 1rem;
  .ant-btn {
    &:first-of-type {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
    &:last-of-type {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      border-left: 0;
    }
  }
  .ant-input-number-input {
    color: red;
  }
}
</style>

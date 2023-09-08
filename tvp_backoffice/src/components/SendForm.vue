<template>
  <a-form layout="vertical">
    <a-form-item
      :label="$t('common.word.coin')"
      v-bind="form.validateInfos.sendCoin"
    >
      <CoinSelect
        :coin-list="filteredCoinList"
        v-model="model.sendCoin"
        @update:value="coinUpdated"
      />
    </a-form-item>

    <a-form-item :label="$t('common.word.withdrawable_amount')">
      <div class="text-right">
        <span v-if="model.sendCoin">
          {{ $comma(withdrawableAmount) }} {{ model.sendCoin }}
        </span>

        <span v-else>-</span>
      </div>
    </a-form-item>

    <a-form-item :label="$t('common.word.minimum_quantity')">
      <div class="text-right">
        <span v-if="model.sendCoin">
          {{ $comma(minimumQuantity) }} {{ model.sendCoin }}
        </span>

        <span v-else>-</span>
      </div>
    </a-form-item>

    <a-form-item
      :label="$t('common.word.withdrawal_amount')"
      v-bind="form.validateInfos.withdrawalAmount"
    >
      <a-input-group compact>
        <a-input-number
          size="default"
          v-model:value="model.withdrawalAmount"
          :formatter="numberFormatter"
          :parser="numberParser"
          :disabled="!model.sendCoin"
          :min="minimumQuantity"
          :max="withdrawableAmount"
        >
          <template #prefix v-if="model.sendCoin">
            <CoinIcon :coin-code="model.sendCoin" />
          </template>
        </a-input-number>

        <a-button size="default" :disabled="!model.sendCoin">
          {{ $t('common.word.max') }}
        </a-button>
      </a-input-group>
    </a-form-item>

    <a-form-item class="btn-group">
      <a-space :size="5">
        <a-button
          size="default"
          type="primary"
          @click.prevent="onSubmit"
          :disabled="model.withdrawalAmount.length === 0"
        >
          {{ $t('common.word.request') }}
        </a-button>
      </a-space>
    </a-form-item>
  </a-form>

  <WalletSendModal
    :select-coin="model.sendCoin"
    :visible="walletSendModalVisible"
    :send-data="sendData"
    @update:visible="(val) => (walletSendModalVisible = val)"
  />
</template>

<script setup lang="ts">
import CoinSelect from '@/components/select/CoinSelect.vue';
import WalletSendModal from '@/components/modal/WalletSendModal.vue';
import CoinIcon from '@/components/CoinIcon.vue';

import { ref, onMounted, PropType, computed } from 'vue';
import { Form } from 'ant-design-vue';
import { coinList } from '@/utils/constants';
import { api } from '@/boot/axios';

const props = defineProps({
  wallets: Array as PropType<IWallet[]>,
});

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

const sendData = ref<any>();

const model = ref<{
  sendCoin: number | undefined;
  withdrawalAmount: string;
}>({
  sendCoin: undefined,
  withdrawalAmount: '',
});

const walletSendModalVisible = ref(false);
const withdrawableAmount = ref(0);
const minimumQuantity = ref(0);

const numberFormatter = (value: any) => {
  const values = `${value}`.split('.');
  return (
    values[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') +
    (values[1] ? `.${values[1]}` : '')
  );
};

const numberParser = (value: any) => {
  return value.replace(/\$\s?|(,*)/g, '');
};

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

const getWallet = () => {
  if (!model.value.sendCoin || !props.wallets) {
    return;
  }

  const wallet = props.wallets.find(
    (e) => coinList[e.coinCode].value === model.value.sendCoin
  );

  return wallet;
};

const coinUpdated = () => {
  const wallet = getWallet();
  if (!wallet) return;

  minimumQuantity.value = wallet.minimumQuantity;
  withdrawableAmount.value = wallet.withdrawableBalance;
};

const onSubmit = async () => {
  await form.validate();

  const wallet = getWallet();
  if (!wallet) return;

  const amount = Number(model.value.withdrawalAmount);

  sendData.value = await api.auto.wallet.calculateWithdraw({
    coinCode: wallet.coinCode,
    amount: amount,
  });

  walletSendModalVisible.value = true;
};

onMounted(() => {
  form.resetFields();
});
</script>

<template>
  <a-modal
    centered
    :width="600"
    :title="$t('common.word.send')"
    :destroyOnClose="true"
  >
    <a-form layout="vertical" v-if="sendData">
      <a-form-item :label="$t('common.word.coin')">
        <a-row align="middle">
          <CoinIcon :coin-code="selectCoin" size="35" />
          <span class="txt">{{ selectCoin }}</span>
        </a-row>
      </a-form-item>

      <a-form-item :label="$t('common.word.withdrawal_fee')">
        <a-input :value="sendData.fee" readonly />
      </a-form-item>

      <a-form-item :label="$t('common.word.transfer_quantity')">
        <a-input :value="sendData.fromAmount" readonly />
      </a-form-item>

      <a-form-item :label="$t('common.word.total_quantity')">
        <a-input :value="sendData.transAmount" readonly />
      </a-form-item>

      <a-form-item :label="$t('common.word.my_wallet_link')">
        <a-input v-model:value="walletAddress">
          <template #prefix>
            <WalletOutlined />
          </template>

          <template #suffix>
            <a-tooltip placement="top" :title="$t('common.word.paste')">
              <CopyOutlined @click="pasteWalletAddress" />
            </a-tooltip>
          </template>
        </a-input>
      </a-form-item>

      <a-form-item
        :label="$t('common.word.destination_tag')"
        v-if="props.selectCoin === CoinCode.XRP"
      >
        <a-input v-model:value="destinationTag">
          <template #prefix>
            <WalletOutlined />
          </template>
          <template #suffix>
            <a-tooltip placement="top" :title="$t('common.word.paste')">
              <CopyOutlined @click="pasteDestinationTag" />
            </a-tooltip>
          </template>
        </a-input>
      </a-form-item>
    </a-form>

    <template #footer>
      <a-button
        size="default"
        type="primary"
        @click.prevent="showOtp"
        :disabled="walletAddress.length < 1"
      >
        {{ $t('common.word.request_approval') }}
      </a-button>
    </template>

    <OtpModal :visible="otpVisibility" @ok="onSubmit" />
  </a-modal>
</template>

<script setup lang="ts">
import OtpModal from '@/components/modal/OtpModal.vue';

import { ref, PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { notification } from 'ant-design-vue';
import { CopyOutlined, WalletOutlined } from '@ant-design/icons-vue';
import { CoinCode } from '@/utils/enums';
import { api } from '@/boot/axios';

const props = defineProps({
  selectCoin: Number as PropType<CoinCode>,
  sendData: Object as PropType<IWalletCalculateWithdrawResponse>,
});

const walletAddress = ref('');
const destinationTag = ref('');
const signature = ref('');
const otpVisibility = ref(false);

const { t } = useI18n();

const readClipboard = async () => {
  const result = await navigator.permissions.query({ name: 'clipboard-read' });
  if (result.state !== 'granted' && result.state !== 'prompt') {
    notification.info({
      message: t('notification.text.clipboard_access'),
    });

    return;
  }

  return await navigator.clipboard.readText();
};

const pasteWalletAddress = async () => {
  const text = await readClipboard();
  walletAddress.value = text ?? '';
};

const pasteDestinationTag = async () => {
  const text = await readClipboard();
  destinationTag.value = text ?? '';
};

const showOtp = () => {
  otpVisibility.value = true;
};

const onSubmit = async () => {
  if (!props.sendData || !props.selectCoin) {
    return;
  }

  await api.auto.wallet.executeWithdraw({
    toAddress: walletAddress.value,
    toDestinationTag: destinationTag.value,
    signature: [signature.value],
    coinCode: props.selectCoin,
    encryptionString: props.sendData.encryptionString,
    amount: props.sendData.fromAmount,
    fee: props.sendData.fee,
    currencyMoney: props.sendData.transAmount,
  });
};
</script>

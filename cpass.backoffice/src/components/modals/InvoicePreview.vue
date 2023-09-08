<template>
  <a-modal
    class="preview"
    v-model:visible="propActive"
    :title="t('component.title.invoice_preview')"
    :closable="false"
    :maskClosable="false"
  >
    <div size="small" class="preview-area">
      <ul class="invoice-container">
        <li class="invoice-partner">{{ propData?.store_Id }}</li>
        <li class="invoice-price">
          {{ propData?.currency }}
          {{ comma(propData?.price) }}
        </li>
        <li class="invoice" v-if="propData?.partner_Member_Id">
          <span class="invoice-item">{{ t('component.label.user_store_id') }}</span>
          <span class="invoice-value">{{ propData?.partner_Member_Id }}</span>
        </li>
        <li class="invoice" v-if="propData?.order_Name">
          <span class="invoice-item">{{ t('component.label.order_name') }}</span>
          <span class="invoice-value">{{ propData?.order_Name }}</span>
        </li>
        <li class="invoice">
          <span class="invoice-item">{{ t('component.label.price') }}</span>
          <span class="invoice-value">
            {{ propData?.currency }}
            {{ comma(propData?.price) }}
          </span>
        </li>
      </ul>
    </div>
    <a-typography-text v-if="propData?.type"
      >{{
        propData.type === 'cancel'
          ? t('confirm.title.cancel_request')
          : propData.type === 'resend'
          ? t('confirm.title.resend_request')
          : propData.type === 'confirm'
          ? t('confirm.title.confirm_request')
          : propData.type === 'approval'
          ? t('confirm.title.approval_request')
          : t('confirm.title.refusal_request')
      }}
    </a-typography-text>
    <template #footer>
      <a-button @click="closeInvoice()">{{ t('common.button.close') }}</a-button>
      <a-button type="primary" class="send-push-form-btn" @click="toggleOtp()">{{
        propData.type ? t('common.button.ok') : t('common.button.send')
      }}</a-button>
    </template>
  </a-modal>
  <OTP v-if="activeOtp" :type="'registerAndCertificate'" @returnOtp="returnOtp" @closeOtp="toggleOtp()" />
</template>
<script setup>
import { computed, ref } from 'vue';
import { comma } from '@/assets/js/global.js';
import { useStore } from 'vuex';
import OTP from '@/components/modals/OTP.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const store = useStore();
const props = defineProps({
  active: {
    type: Boolean,
  },
  data: {
    type: Object,
    required: true,
  },
});
const emits = defineEmits(['returnInvoice', 'close']);
const propActive = computed(() => props.active);
const propData = computed(() => props.data);
const activeOtp = ref(false);

const closeInvoice = () => {
  emits('close');
};
const toggleOtp = () => {
  if (propData.value?.type !== 'confirm') {
    activeOtp.value = !activeOtp.value;
  } else {
    emits('returnInvoice');
  }
};
const returnOtp = () => {
  emits('returnInvoice');
};
</script>

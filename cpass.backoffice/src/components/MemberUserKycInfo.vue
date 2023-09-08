<template>
  <a-descriptions bordered size="small" :column="2" :labelStyle="{ width: '24rem' }">
    <a-descriptions-item :label="$t('drawer.label.id')">
      {{ infoVal.user_Id }}
    </a-descriptions-item>
    <a-descriptions-item :label="$t('drawer.label.country')">
      <template v-if="dataChanged">
        <vue3-intl-input
          @sendCountryInfo="getCountryInfo"
          contentType="dropdown"
          noDataText="No Data!"
          title=""
          searchPlaceholder="Search"
          :effect="true"
          :clickCloseOutSide="true"
          :showTelInput="false"
          :showSearchCountryInput="true"
          :showDialCode="false"
          :bindingMode="3"
          :firstValue="{
            alpha2Code: detailInfo.alpha2Code,
            country: detailInfo.country,
            dialCode: detailInfo.dialCode,
          }"
        />
      </template>
    </a-descriptions-item>
    <a-descriptions-item :label="$t('drawer.label.first_name')">
      <a-input v-model:value="detailInfo.firstName" :placeholder="$t('drawer.placeholder.first_name')" />
    </a-descriptions-item>
    <a-descriptions-item :label="$t('drawer.label.last_name')">
      <a-input v-model:value="detailInfo.lastName" :placeholder="$t('drawer.placeholder.last_name')" />
    </a-descriptions-item>
    <a-descriptions-item :label="$t('drawer.label.birthday')">
      <a-date-picker v-model:value="detailInfo.birthday" />
    </a-descriptions-item>
    <a-descriptions-item :label="$t('drawer.label.id_number')">
      <a-input v-model:value="detailInfo.idNumber" :placeholder="$t('drawer.placeholder.id_number')" />
    </a-descriptions-item>
    <a-descriptions-item :label="$t('drawer.label.expiration_date')">
      <a-date-picker v-model:value="detailInfo.expirationDate" />
    </a-descriptions-item>
    <a-descriptions-item :label="$t('drawer.label.issuance_date')">
      <a-date-picker v-model:value="detailInfo.issuanceDate" />
    </a-descriptions-item>
    <a-descriptions-item :label="$t('drawer.label.kyc_id')">
      <div
        style="display: flex; align-items: center"
        v-if="detailInfo.imageUrls.length >= 2 && dataChanged && detailInfo.imageUrls[0].approvalDate !== null"
      >
        <vue3-image-view
          :controllerBtnText="detailInfo.imageUrls[0].approvalDate"
          :imageWrap="[detailInfo.imageUrls[0], detailInfo.imageUrls[1]]"
        />
        <fa-icon class="ml-10" icon="fa-solid fa-image" />
      </div>
    </a-descriptions-item>
    <a-descriptions-item :label="$t('drawer.label.kyc_selfie')">
      <div
        style="display: flex; align-items: center"
        v-if="detailInfo.imageUrls.length === 3 && dataChanged && detailInfo.imageUrls[2].approvalDate !== null"
      >
        <vue3-image-view :controllerBtnText="detailInfo.imageUrls[2].approvalDate" :imageWrap="detailInfo.imageUrls" />
        <fa-icon class="ml-10" icon="fa-solid fa-image" />
      </div>
    </a-descriptions-item>
    <template v-for="(data, key, idx) in detailInfo.etc" :key="idx">
      <a-descriptions-item :label="$t('drawer.label.etc') + (idx + 1)">
        <a-input v-model:value="detailInfo.etc[key]" :placeholder="$t('drawer.placeholder.etc') + (Number(idx) + 1)" />
      </a-descriptions-item>
    </template>
  </a-descriptions>

  <a-row type="flex" justify="end" class="mt-10" style="align-items: center">
    <a-button type="primary" @click="KycRequestDetailChange()">
      <fa-icon icon="save" />
      {{ $t('common.button.save') }}
    </a-button>
  </a-row>
  <KYCDataTable :userId="infoVal.user_Id" :show="isShow" :type="'wallet'" />
</template>

<script setup>
import KYCDataTable from '@/components/datatable/KYCDataTable.vue';

import { useStore } from 'vuex';
import { apis } from '@/store/api';
import { openNotificationWithIcon } from '@/assets/js/global';
import { ref, computed, watch, onBeforeMount, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const store = useStore();
const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  info: {
    type: Object,
    required: false,
  },
});

const detailInfo = computed(() => store.state['kyc'].kycRequestDetail);
const dataChanged = ref(false);
const errCode = computed(() => store.state['common'].errCode);

const isShow = computed({
  get() {
    return props.show;
  },
  set(value) {
    emit('close', value);
  },
});

const infoVal = computed({
  get() {
    return props.info;
  },
});

const emit = defineEmits(['close']);

const setDateFormat = (dateFormat) => {
  const year = String(dateFormat.$y);
  const month = String(dateFormat.$M + 1).length === 1 ? '0' + String(dateFormat.$M + 1) : String(dateFormat.$M + 1);
  const day = String(dateFormat.$D).length === 1 ? '0' + String(dateFormat.$D) : String(dateFormat.$D);

  return year + '-' + month + '-' + day;
};

const topMenuRefresh = async () => {
  await store.dispatch('manager/setTopMenuRefresh');
};
const KycRequestDetailChange = async () => {
  const response = await apis.KycRequestDetailChange({
    userId: infoVal.value.user_Id,
    alpha2Code: detailInfo.value.alpha2Code,
    firstName: detailInfo.value.firstName,
    lastName: detailInfo.value.lastName,
    birthday: detailInfo.value.birthday?.$d ? setDateFormat(detailInfo.value.birthday) : null,
    idNumber: detailInfo.value.idNumber,
    expirationDate: detailInfo.value.expirationDate?.$d ? setDateFormat(detailInfo.value.expirationDate) : null,
    issuanceDate: detailInfo.value.issuanceDate?.$d ? setDateFormat(detailInfo.value.issuanceDate) : null,
    etC1: detailInfo.value.etc.etc1,
    etC2: detailInfo.value.etc.etc2,
    etC3: detailInfo.value.etc.etc3,
    etC4: detailInfo.value.etc.etc4,
  });

  const getData = response.data;

  if (getData.errCode === 0) {
    await store.dispatch('kyc/KycRequestDetail', { userId: infoVal.value.user_Id });
    topMenuRefresh();
    openNotificationWithIcon('success', t('notification.title.success'), getData.errMessage);
  }
};

const getCountryInfo = (info) => {
  detailInfo.value.country = info.country;
  detailInfo.value.alpha2Code = info.alpha2Code;
  detailInfo.value.dialCode = info.dialCode;
};

watch(detailInfo, () => {
  dataChanged.value = true;
});

onBeforeMount(() => {
  store.dispatch('kyc/KycRequestDetail', { userId: infoVal.value.user_Id });
});
</script>

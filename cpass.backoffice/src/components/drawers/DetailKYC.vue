<template>
  <a-drawer
    placement="right"
    :closable="true"
    v-model:visible="isShow"
    width="70%"
    :destroyOnClose="true"
    @after-visible-change="afterVisibleChange"
  >
    <template #title>
      <a-typography-text class="id">{{ infoVal.id }}</a-typography-text>
    </template>
    <a-card :title="$t('drawer.card_title.user_info')" size="small" :bordered="false">
      <div class="backoffice-loading-box" v-if="!dataChanged">
        <a-spin size="large" />
      </div>
      <template #extra>
        <a-button type="primary" @click="KycRequestDetailChange()" :disabled="!dataChanged">
          <fa-icon icon="save" />
          {{ $t('common.button.save') }}
        </a-button>
      </template>

      <a-row
        class="info-box"
        :class="{ 'backoffice-loading-blur': !dataChanged }"
        :gutter="[48, 16]"
        type="flex"
        align="middle"
      >
        <a-col :span="6">
          <label class="label">{{ $t('drawer.label.id') }}</label>
        </a-col>
        <a-col :span="6">
          <span class="text">{{ infoVal.id }}</span>
        </a-col>
        <a-col :span="6">
          <label class="label">{{ $t('drawer.label.country') }}</label>
        </a-col>
        <a-col :span="6">
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
        </a-col>

        <a-col :span="6">
          <label class="label">{{ $t('drawer.label.first_name') }}</label>
        </a-col>
        <a-col :span="6">
          <a-input v-model:value="detailInfo.firstName" :placeholder="$t('drawer.placeholder.first_name')" />
        </a-col>

        <a-col :span="6">
          <label class="label">{{ $t('drawer.label.last_name') }}</label>
        </a-col>
        <a-col :span="6">
          <a-input v-model:value="detailInfo.lastName" :placeholder="$t('drawer.placeholder.last_name')" />
        </a-col>

        <a-col :span="6">
          <label class="label">{{ $t('drawer.label.birthday') }}</label>
        </a-col>
        <a-col :span="6">
          <a-date-picker v-model:value="detailInfo.birthday" />
        </a-col>

        <a-col :span="6">
          <label class="label">{{ $t('drawer.label.id_number') }}</label>
        </a-col>
        <a-col :span="6">
          <a-input v-model:value="detailInfo.idNumber" :placeholder="$t('drawer.placeholder.id_number')" />
        </a-col>

        <a-col :span="6">
          <label class="label">{{ $t('drawer.label.expiration_date') }}</label>
        </a-col>
        <a-col :span="6">
          <a-date-picker v-model:value="detailInfo.expirationDate" />
        </a-col>

        <a-col :span="6">
          <label class="label">{{ $t('drawer.label.issuance_date') }}</label>
        </a-col>
        <a-col :span="6">
          <a-date-picker v-model:value="detailInfo.issuanceDate" />
        </a-col>

        <a-col :span="6">
          <label class="label">{{ $t('drawer.label.kyc_id') }}</label>
        </a-col>
        <a-col :span="6">
          <div
            style="display: flex; align-items: center"
            v-if="detailInfo.imageUrls.length >= 2 && dataChanged && detailInfo.imageUrls[0].approvalDate !== null"
          >
            <vue3-image-view
              :controllerBtnText="detailInfo.imageUrls[0].approvalDate"
              :imageWrap="[detailInfo.imageUrls[0], detailInfo.imageUrls[1]]"
            />
            <fa-icon icon="fa-solid fa-image" style="margin-left: 10px" />
          </div>
        </a-col>

        <a-col :span="6">
          <label class="label">{{ $t('drawer.label.kyc_selfie') }}</label>
        </a-col>
        <a-col :span="6">
          <div
            style="display: flex; align-items: center"
            v-if="detailInfo.imageUrls.length === 3 && dataChanged && detailInfo.imageUrls[2].approvalDate !== null"
          >
            <vue3-image-view
              :controllerBtnText="detailInfo.imageUrls[2].approvalDate"
              :imageWrap="[detailInfo.imageUrls[2]]"
            />
            <fa-icon icon="fa-solid fa-image" style="margin-left: 10px" />
          </div>
        </a-col>

        <template v-for="(data, key, idx) in detailInfo.etc" :key="idx">
          <a-col :span="6">
            <label class="label">{{ $t('drawer.label.etc') }}{{ Number(idx) + 1 }}</label>
          </a-col>
          <a-col :span="6">
            <a-input
              v-model:value="detailInfo.etc[key]"
              :placeholder="$t('drawer.placeholder.etc') + (Number(idx) + 1)"
            />
          </a-col>
        </template>
      </a-row>
    </a-card>
    <KYCDataTable :userId="infoVal.id" :show="isShow" />
  </a-drawer>
</template>

<script setup>
import KYCDataTable from '../datatable/KYCDataTable.vue';

import { useStore } from 'vuex';
import { apis } from '@/store/api';
import { ref, computed, watch } from 'vue';
import { openNotificationWithIcon } from '@/assets/js/global';
import { useI18n } from 'vue-i18n';

const store = useStore();
const { t: $t } = useI18n();
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
const topMenuRefresh = async () => {
  await store.dispatch('manager/setTopMenuRefresh');
};
const setDateFormat = (dateFormat) => {
  const year = String(dateFormat.$y);
  const month = String(dateFormat.$M + 1).length === 1 ? '0' + String(dateFormat.$M + 1) : String(dateFormat.$M + 1);
  const day = String(dateFormat.$D).length === 1 ? '0' + String(dateFormat.$D) : String(dateFormat.$D);

  return year + '-' + month + '-' + day;
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
  const errCode = getData.errCode;
  const errMessage = getData.errMessage;

  if (errCode === 0) {
    topMenuRefresh();
    await store.dispatch('kyc/KycRequestDetail', { userId: infoVal.value.id });
    openNotificationWithIcon('success', $t('notification.title.success'), errMessage);
  }
};

const userSn = ref(0);

const getCountryInfo = (info) => {
  detailInfo.value.country = info.country;
  detailInfo.value.alpha2Code = info.alpha2Code;
  detailInfo.value.dialCode = info.dialCode;
};

const afterVisibleChange = (bool) => {
  if (bool) {
    if (infoVal.value.grade) {
      userSn.value = infoVal.value.sn;
    } else {
      userSn.value = infoVal.value.user_Sn;
    }
  } else {
    userSn.value = 0;
  }
};

watch(detailInfo, () => {
  dataChanged.value = true;
});

watch(infoVal, (val) => {
  if (val.grade) {
    userSn.value = val.sn;
  } else {
    userSn.value = val.user_Sn;
  }
});

watch(isShow, async () => {
  if (isShow.value) {
    await store.dispatch('kyc/KycRequestDetail', { userId: infoVal.value.id });
  } else {
    dataChanged.value = false;
  }
});
</script>

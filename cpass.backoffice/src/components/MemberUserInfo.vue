<template>
  <a-descriptions bordered size="small" :column="2" class="descriptions-label-width">
    <a-descriptions-item v-for="(item, idx) in userInfo" :label="item.label()" :key="idx">
      <span v-if="item.key !== 'kyc_Status' && item.key !== 'country'">
        {{ item.value }}
      </span>
      <span v-if="item.key === 'kyc_Status'">
        {{ item.value === 0 ? '' : item.value === 1 ? t('datatable.text.step_1st') : t('datatable.text.step_2nd') }}
      </span>
      <span v-if="item.key === 'country'">
        <NationalFlag :data="countryData" />
      </span>
    </a-descriptions-item>
  </a-descriptions>
  <a-descriptions bordered size="small" :labelStyle="{ width: '24rem' }" class="mt-20">
    <a-descriptions-item v-for="(item, idx) in tvpInfo" :label="item.label()" :key="idx">
      {{ item.value }}
    </a-descriptions-item>
  </a-descriptions>
</template>

<script setup>
import NationalFlag from '@/components/common/NationalFlag.vue';

import { ref, onBeforeMount } from 'vue';
import { apis } from '@/store/api';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  sn: {
    type: Number,
    required: true,
  },
});
const countryData = ref({});

const userInfo = ref([
  { label: () => t('user_info.label.id'), value: '', key: 'user_Id' },
  { label: () => t('user_info.label.nationality'), value: '', key: 'country' },
  { label: () => t('user_info.label.first_name'), value: '', key: 'first_Name' },
  { label: () => t('user_info.label.last_name'), value: '', key: 'last_Name' },
  { label: () => t('user_info.label.date_birth'), value: '', key: 'birthday' },
  { label: () => t('user_info.label.phone'), value: '', key: 'phone_Number' },
  { label: () => t('user_info.label.kyc'), value: '', key: 'kyc_Status' },
  { label: () => t('user_info.label.join_date'), value: '', key: 'sign_Up_Date' },
]);
const tvpInfo = ref([
  { label: () => t('user_info.label.otc_nick'), value: '', key: 'otc_Nick' },
  { label: () => t('user_info.label.tvp_nick'), value: '', key: 'tvp_Nick' },
  { label: () => t('user_info.label.tvp_referral_id'), value: '', key: 'tvp_Referral' },
]);
const request = async () => {
  try {
    const response = await apis.manager.UserInfo({ user_Sn: props.sn });
    const getData = response.data;

    if (getData.errCode === 0) {
      Object.keys(getData.returnData).forEach((e) => {
        const userInfoIndex = userInfo.value.findIndex((obj) => obj.key === e);
        const tvpInfoIndex = tvpInfo.value.findIndex((obj) => obj.key === e);
        if (userInfoIndex !== -1) {
          userInfo.value[userInfoIndex].value = getData.returnData[e];
        }
        if (tvpInfoIndex !== -1) {
          tvpInfo.value[tvpInfoIndex].value = getData.returnData[e];
        }
      });
      countryData.value = {
        country: getData.returnData.country,
        iso_Alpha2: getData.returnData.iso_Alpha2,
      };
    }
  } catch (error) {
    console.error(error);
  }
};
onBeforeMount(() => {
  request();
});
</script>

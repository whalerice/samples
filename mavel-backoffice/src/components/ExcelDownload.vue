<template>
  <a-button @click="download"><file-excel-outlined /></a-button>
</template>

<script setup lang="ts">
import { FileExcelOutlined } from '@ant-design/icons-vue';

import dayjs from 'dayjs';
import { dateFormat } from 'src/boot/global';
import { api } from 'src/boot/main';

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
});

const download = async () => {
  const send = {
    search: props.data.text,
    user_Filter: props.data.type,
    order: props.data.order,
    sort: props.data.sort,
    req_BeforeDate: props.data.date ? dayjs(props.data.date[0]).format(dateFormat) : '',
    req_AfterDate: props.data.date ? dayjs(props.data.date[1]).format(dateFormat) : '',
    company_Idx: 0,
    user_Idx: 0,
    reward_Type: props.data.rewardType,
  };

  try {
    const response = await api.post(`api/Excel/${props.url}`, send);
    if (response.data.errCode === 0) {
      const returnData = response.data.returnData;
      excelDownload(returnData);
      setTimeout(async () => {
        await api.post('api/Excel/DeleteFile', { fileUrl: returnData.fileUrl });
      }, 2000);
    }
  } catch (error) {
    console.error(error);
  }
};

const excelDownload = async (data: any) => {
  const url = `${data.fileUrl}${data.sasQuery}`;
  const link = document.createElement('a');
  link.href = url;
  document.body.appendChild(link);
  link.click();
};
</script>

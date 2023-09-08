<template>
  <a-modal :visible="isVisible" :title="$t('common.label.file_upload')" @cancel="close" :maskClosable="false">
    <template #footer>
      <a-button @click="close">{{ $t('common.button.cancel') }}</a-button>
      <a-button type="primary" :disabled="fileList.length === 0" :loading="isLoading" @click="handleUpload">
        {{ $t('common.button.send') }}
      </a-button>
    </template>
    <a-upload-dragger
      name="file"
      class="file-upload"
      :class="{ 'not-excel': errMessage.length > 0 || !isExcel }"
      :file-list="fileList"
      :before-upload="beforeUpload"
      :disabled="isLoading"
      :accept="null"
      :capture="none"
      multiple
      autocomplete="off"
      tabindex="-1"
      @remove="handleRemove"
    >
      <p class="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <template v-if="!errMessage.length > 0 && isExcel">
        <p class="ant-upload-text">{{ $t('common.label.file_upload_description') }}</p>
      </template>
      <a-typography-text type="danger">{{ errMessage }}</a-typography-text>
    </a-upload-dragger>
  </a-modal>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { InboxOutlined } from '@ant-design/icons-vue';
import { apis } from '@/store/api.js';
import { useI18n } from 'vue-i18n';
import { read, utils } from 'xlsx';

const { t } = useI18n();
const emits = defineEmits(['returnUpload']);
const props = defineProps({
  visible: {
    type: Boolean,
    require: true,
  },
});
const fileList = ref([]);
const isExcel = ref(true);
const isVisible = computed({
  get() {
    return props.visible;
  },
  set(val) {
    emits('returnUpload', val);
  },
});
const isLoading = ref(false);
const errMessage = ref('');

const init = () => {
  fileList.value = [];
  isExcel.value = true;
  isLoading.value = false;
  errMessage.value = '';
};
const close = () => {
  isVisible.value = false;
};
const csvFileToJSON = (file) => {
  var reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = function (e) {
      const data = read(e.target.result, {
        type: 'binary',
        cellDates: true,
        dateNF: 'yyyy-mm-dd',
      });
      const sheet = data.Sheets[data.SheetNames[0]];
      const json = utils.sheet_to_json(sheet, { raw: false });
      json.forEach((row) =>
        Object.keys(row).map((key) => {
          if (key == 'Amount (PHP)' || key === 'Fee (PHP)') {
            row[key] = Number(row[key].replaceAll(',', ''));
          }
        })
      );

      resolve(json.filter((e) => e['Payment ID']));
    };

    reader.onerror = function (e) {
      reject(e);
    };
    reader.readAsBinaryString(file);
  });
};
const beforeUpload = async (file) => {
  isExcel.value = file.type === 'text/csv';

  if (isExcel.value) {
    fileList.value.length > 0
      ? (handleRemove(), (fileList.value = [...fileList.value, file]))
      : (fileList.value = [...fileList.value, file]);
  } else {
    errMessage.value = t('component.error.not_excel');
  }
  setTimeout(() => {
    isExcel.value = true;
    errMessage.value = '';
  }, 1000);

  return false;
};
const handleUpload = async () => {
  isLoading.value = true;
  const json = await csvFileToJSON(fileList.value[0]);
  const response = await apis.GetNextPayUploadResult(json);
  const getData = response.data;

  isLoading.value = false;
  if (getData.errCode === 0) {
    isVisible.value = {
      value: true,
      returnData: getData.returnData,
    };
  } else {
    errMessage.value = getData.errMessage;
  }
};
const handleRemove = () => {
  const newFileList = fileList.value.slice();
  newFileList.splice(0, 1);
  fileList.value = newFileList;
};

watch(isVisible, () => {
  if (!isVisible.value) init();
});
</script>

<template>
  <a-button class="csv-button" @click="downloadCSV()">
    <template #icon>
      <fa-icon icon="fa-solid fa-file-csv" />
    </template>
  </a-button>
</template>

<script setup>
const props = defineProps({
  csvFile: String,
  filename: String,
});

const downloadCSV = () => {
  let file;
  let downloadLink;

  const BOM = '\uFEFF'; //한글 처리를 해주기 위해 BOM 추가하기
  let csv = BOM + props.csvFile;

  file = new Blob([csv], { type: 'text/csv' });
  downloadLink = document.createElement('a');
  downloadLink.download = props.filename;
  downloadLink.href = window.URL.createObjectURL(file);
  downloadLink.style.display = 'none';
  document.body.appendChild(downloadLink);
  downloadLink.click();
};
</script>

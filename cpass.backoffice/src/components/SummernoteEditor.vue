<template>
  <div ref="summernoteRefElement"></div>
</template>
<script setup>
import { useI18n } from 'vue-i18n';
import summernote from 'r2-summernote';
import { ref, onMounted, computed, watch } from 'vue';
import 'bootstrap';

const props = defineProps({
  insertText: {
    type: String,
    required: false,
  },
});

const emit = defineEmits(['message']);
const { t } = useI18n();
const options = ref({
  height: 500,
  placeholder: t('modal.placeholder.write_here'),
  disableDragAndDrop: true,
  dialogsInBody: false,
  shortcuts: false,
  disableResizeEditor: true,
  styleTags: [
    'p',
    { title: 'Blockquote', tag: 'blockquote', className: 'blockquote', value: 'blockquote' },
    { title: 'code', tag: 'pre', className: 'pre', value: 'pre' },
    { title: 'h1', tag: 'h1', className: 'h1', value: 'h1' },
    { title: 'h2', tag: 'h2', className: 'h2', value: 'h2' },
    { title: 'h3', tag: 'h3', className: 'h3', value: 'h3' },
    { title: 'h4', tag: 'h4', className: 'h4', value: 'h4' },
    { title: 'h5', tag: 'h5', className: 'h5', value: 'h5' },
    { title: 'h6', tag: 'h6', className: 'h6', value: 'h6' },
  ],
  toolbar: [
    ['style', ['style']],
    ['fonts', ['bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript', 'clear']],
    ['fontsize', ['fontsize']],
    ['height', ['height']],
    ['fontname', ['fontname']],
    ['color', ['color']],
    ['table', ['table']],
    ['para', ['ul', 'ol', 'paragraph']],
    ['insert', ['link', 'undo', 'redo', 'hr']],
    ['view', ['codeview', 'fullscreen']],
  ],
  tableClassName: 'table',
  callbacks: {
    onChange: function (contents, $editable) {
      insertText.value = contents;
    },
  },
});

const insertText = computed({
  get() {
    return props.insertText;
  },
  set(val) {
    emit('message', val);
  },
});

const summernoteRefElement = ref(null);
const elem = ref(null);

onMounted(() => {
  if (!window.SUMMERNOTE_DEFAULT_CONFIGS) {
    window.SUMMERNOTE_DEFAULT_CONFIGS = {};
  }

  elem.value = $(summernoteRefElement.value);
  elem.value.summernote(options.value);
  elem.value.summernote('code', insertText.value);
});

watch(props, (val) => {
  elem.value.summernote('reset');
  elem.value.summernote('code', val.insertText);
});
</script>

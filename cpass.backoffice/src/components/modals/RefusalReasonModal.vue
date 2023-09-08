<template>
  <a-modal v-model:visible="visible" :title="$t('datatable.text.refusal')" :destroyOnClose="true">
    <template #footer>
      <a-button @click="close">{{ $t('common.button.cancel') }}</a-button>
      <a-button type="primary" :disabled="content.length === 0" @click="send">{{ $t('common.button.send') }}</a-button>
    </template>
    <a-radio-group v-model:value="selectValue" class="mb-15" @change="select">
      <a-radio v-for="(item, idx) in selectOption" :key="idx" :value="item.value">{{ $t(item.label) }}</a-radio>
      <a-radio :value="999">{{ $t('datatable.text.direct_input') }}</a-radio>
    </a-radio-group>
    <a-textarea
      v-model:value="content"
      :disabled="selectValue !== 999"
      :placeholder="$t('common.label.reason_refusal')"
      :showCount="true"
      :maxlength="50"
    />
  </a-modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { Modal } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const props = defineProps({
  data: {
    type: Array,
    require: true,
  },
  visible: {
    type: Boolean,
    require: true,
  },
  label: {
    type: String,
    require: false,
    default: 'confirm.description.cpeso_refusal',
  },
});
const emits = defineEmits(['close', 'returnRefusal']);
const visible = computed({
  get() {
    return props.visible;
  },
  set() {
    emits('close', false);
  },
});
const selectOption = computed(() => props.data);
const selectValue = ref(selectOption.value ? selectOption.value[0].value : 999);
const content = ref(t(selectOption.value ? selectOption.value[0].label : ''));

const send = () => {
  Modal.confirm({
    title: t('confirm.title.confirm'),
    content: t(props.label),
    okText: t('common.button.ok'),
    cancelText: t('common.button.cancel'),
    onOk() {
      emits('returnRefusal', content.value);
    },
  });
};
const close = () => {
  visible.value = false;
};
const select = (val) => {
  const value = val.target.value;
  if (value === 999) {
    content.value = '';
  } else {
    content.value = t(selectOption.value.filter((e) => e.value === value)[0].label);
  }
};
const init = () => {
  selectValue.value = selectOption.value ? selectOption.value[0].value : 999;
  content.value = t(selectOption.value ? selectOption.value[0].label : '');
};

watch(visible, (val) => {
  if (val) {
    init();
  }
});
</script>

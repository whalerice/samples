<template>
  <a-modal
    v-model:visible="visible"
    :title="$t('common.button.register')"
    :destroyOnClose="true"
    :forceRender="true"
    :afterClose="afterClose"
    @ok="onClose">
    <template #footer>
      <a-button key="back" @click="onClose">
        {{ $t('common.button.cancel') }}
      </a-button>
      <a-button type="primary" :loading="loading" @click="onUpdate" v-if="props.data.idx !== NoticeStateType.Register">
        {{ $t('common.button.edit') }}
      </a-button>
      <a-button
        type="primary"
        :loading="loading"
        @click="onRegister"
        v-if="props.data.idx === NoticeStateType.Register">
        {{ $t('common.button.register') }}
      </a-button>
    </template>
    <a-row :gutter="[10, 10]">
      <a-col :span="24">
        <a-select
          v-model:value="selectCategory"
          label-in-value
          :options="categoryOption"
          class="full-width"
          :disabled="isDisabled" />
      </a-col>
      <a-col :span="24">
        <a-input v-model:value="title" show-count :maxlength="20" />
      </a-col>
      <a-col :span="24">
        <Editor :contents="contents" @modify="editorModify" />
      </a-col>
      <a-col>
        <a-space>
          <span>공개여부</span>
          <a-switch v-model:checked="isView" size="small" />
        </a-space>
      </a-col>
    </a-row>
  </a-modal>
</template>

<script setup lang="ts">
import Editor from 'components/Editor.vue';

import { storeToRefs } from 'pinia';
import { computed, onUpdated, ref } from 'vue';

import { commonStore } from 'src/stores/common';
import { NoticeStateType } from 'src/components/models/enums';
import { apis } from 'src/stores/apis';

const { category } = storeToRefs(commonStore.board());

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  data: {
    type: Object,
    required: true,
  },
});

const visible = computed({
  get() {
    return props.show;
  },
  set(value) {
    emits('close', value);
  },
});

const emits = defineEmits(['close']);

const loading = ref<boolean>(false);
const isView = ref<boolean>(false);
const data = ref<INoticeData>();
const title = ref<string>('');
const contents = ref<string>('');
const categoryOption = ref<any[]>([]);
const selectCategory = ref<any>({ value: 0, label: '', commonIdx: 0 });
const isDisabled = ref<boolean>(false);

const onRegister = async () => {
  loading.value = true;

  const send = {
    common_Idx: selectCategory.value.commonIdx ? selectCategory.value.commonIdx : selectCategory.value.option.commonIdx,
    title: title.value,
    content: contents.value,
    isView: isView.value,
  };

  try {
    const response = await apis.manager.NoticeRegister(send);
    console.log(response.data);
    if (response.data.errCode === 0) {
      setTimeout(() => {
        loading.value = false;
        visible.value = false;
      }, 1000);
    }
  } catch (error) {
    console.error(error);
  }
};

const onUpdate = async () => {
  loading.value = true;
  const send = {
    idx: data.value?.idx,
    title: title.value,
    content: contents.value,
    isView: isView.value,
  };
  try {
    const response = await apis.manager.NoticeModify(send);

    if (response.data.errCode === 0) {
      setTimeout(() => {
        loading.value = false;
        visible.value = false;
      }, 1000);
    }
  } catch (error) {
    console.error(error);
    loading.value = false;
  }
};

const onDetail = async () => {
  try {
    const response = await apis.manager.NoticeDetail({ Idx: props.data.idx });
    if (response.data.errCode === 0) {
      data.value = response.data.returnData;
      title.value = response.data.returnData.title;
      contents.value = response.data.returnData.content;
      selectCategory.value = categoryOption.value.filter((e) => e.commonIdx === props.data.commonIdx)[0];
    }
  } catch (error) {
    console.error(error);
  }
};

const onClose = () => {
  visible.value = false;
};
const afterClose = () => {
  title.value = '';
  contents.value = '';
  isDisabled.value = false;
};

const editorModify = (text: string) => {
  contents.value = text;
};

onUpdated(async () => {
  if (visible.value) {
    categoryOption.value = category.value.filter((e) => e.value !== 0);

    if (props.data.idx !== NoticeStateType.Register) {
      await onDetail();
      isDisabled.value = true;
    } else {
      selectCategory.value = categoryOption.value[0];
      isDisabled.value = false;
    }
  }
});
</script>

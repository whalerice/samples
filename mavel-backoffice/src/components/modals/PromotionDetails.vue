<template>
  <a-modal
    v-model:visible="visible"
    :title="props.data === null ? $t('modal.title.promotion_register') : $t('modal.title.promotion_edit')"
    :destroyOnClose="true"
    :forceRender="true"
    :afterClose="afterClose"
    centered
    width="80rem"
    :bodyStyle="{ overflowY: 'auto', 'max-height': '90vh' }"
    @ok="onClose">
    <template #footer>
      <a-button @click="reset" v-if="props.data === null">{{ $t('common.button.reset') }}</a-button>
      <a-button type="primary" @click.prevent="onSubmit" :loading="loading">
        {{ props.data !== null ? $t('common.button.edit') : $t('common.button.register') }}
      </a-button>
    </template>

    <a-form layout="vertical">
      <a-row :gutter="15">
        <a-col :span="12">
          <a-form-item :label="$t('table.thead.start_date')" name="startDate" v-bind="validateInfos.startDate">
            <a-date-picker v-model:value="formState.startDate" :format="dateFormat" class="full-width" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item :label="$t('table.thead.end_date')" name="endDate">
            <a-date-picker v-model:value="formState.endDate" :format="dateFormat" class="full-width" />
          </a-form-item>
        </a-col>
      </a-row>

      <!-- category &  rewardType 기능 구현 이후 사용할 예정 -->
      <!-- <a-row :gutter="15">
        <a-col :span="12">
          <a-form-item :label="$t('table.thead.category')" v-bind="validateInfos.category" labelAlign="left">
            <a-select
              v-model:value="formState.category"
              :options="options.promotionCategory"
              :placeholder="$t('common.placeholder.select')" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item :label="$t('table.thead.reward_type')" v-bind="validateInfos.rewardType" labelAlign="left">
            <a-select
              v-model:value="formState.rewardType"
              :options="options.promotionRewardType"
              :placeholder="$t('common.placeholder.select')" />
          </a-form-item>
        </a-col>
      </a-row> -->

      <a-form-item :label="$t('table.thead.title')" name="title" v-bind="validateInfos.title">
        <a-input v-model:value="formState.title" allowClear />
      </a-form-item>

      <a-form-item :label="$t('table.thead.img')" name="img" v-bind="validateInfos.img">
        <a-image
          fallback="/img/no_img.png"
          v-if="props.data !== null"
          :src="imgUrl + sasQuery"
          :style="{ maxHeight: '20rem' }" />
        <div class="q-mt-sm">
          <a-upload v-model:file-list="formState.img" :before-upload="beforeUpload" list-type="picture" :max-count="1">
            <a-button>
              <upload-outlined></upload-outlined>
              {{ $t('common.text.select_file') }}
            </a-button>
          </a-upload>
        </div>
      </a-form-item>

      <a-form-item :label="$t('table.thead.content')" name="content" v-bind="validateInfos.content">
        <Editor :contents="formState.content" @modify="editorModify" />
      </a-form-item>

      <a-row :gutter="15">
        <a-col :span="12">
          <a-space>
            <span>{{ $t('table.thead.is_use') }}</span>
            <a-switch v-model:checked="formState.use" size="small" />
          </a-space>
        </a-col>
        <a-col :span="12">
          <a-space>
            <span>{{ $t('table.thead.expose') }}</span>
            <a-switch v-model:checked="formState.view" size="small" />
          </a-space>
        </a-col>
      </a-row>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import Editor from 'components/Editor.vue';

import dayjs from 'dayjs';
import { storeToRefs } from 'pinia';
import { UploadOutlined } from '@ant-design/icons-vue';
import { UploadProps, Form, message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { computed, ref, onBeforeUpdate, reactive, toRaw } from 'vue';

import { dateFormat } from 'src/boot/global';
import { commonStore } from 'src/stores/common';
import { apis } from 'src/stores/apis';

const useForm = Form.useForm;
const { t } = useI18n();
const { sasQuery } = storeToRefs(commonStore.board());

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  data: {
    type: Object || null,
    required: false,
  },
});

const visible = computed({
  get() {
    return props.show;
  },
  set(value) {
    emits('update:show', value);
  },
});

const emits = defineEmits(['update:show']);

const loading = ref<boolean>(false);
const imgUrl = ref<string>('');

const formState = ref<Record<string, any>>({
  // category: null,
  // rewardType: null,
  category: 1,
  rewardType: 1,
  title: '',
  img: [],
  content: '',
  startDate: '',
  endDate: '',
  use: false,
  view: false,
});

const { resetFields, validate, validateInfos } = useForm(
  formState.value,
  reactive({
    // category: [
    //   {
    //     required: true,
    //     message: t('form.rule.empty_select'),
    //   },
    // ],
    // rewardType: [
    //   {
    //     required: true,
    //     message: t('form.rule.empty_select'),
    //   },
    // ],
    title: [
      {
        required: true,
        message: t('form.rule.empty'),
      },
    ],
    img: [
      {
        required: props.data === null ? true : false,
        message: t('form.rule.empty_image'),
      },
    ],
    content: [
      {
        required: true,
        message: t('form.rule.empty'),
      },
    ],
    startDate: [
      {
        required: true,
        message: t('form.rule.empty'),
      },
    ],
    endDate: [
      {
        required: false,
      },
    ],
  }),
);

const onSubmit = () => {
  validate()
    .then(() => {
      submit(toRaw(formState.value));
    })
    .catch((err) => {
      console.error('error', err);
    });
};

const reset = () => {
  resetFields();
};

const submit = async (data: any) => {
  loading.value = true;

  const startDate = dayjs(data.startDate).format(dateFormat);
  const endDate = data.endDate === '' || data.endDate === null ? '' : dayjs(data.endDate).format(dateFormat);

  let formData = new FormData();

  formData.append('Category', data.category);
  formData.append('Reward_Type', data.rewardType);
  formData.append('Title', data.title);
  formData.append('Content', data.content);
  formData.append('Start_Date', startDate);
  formData.append('End_Date', endDate);
  formData.append('IsView', data.view);
  formData.append('IsUse', data.use);

  if (data.img.length > 0) formData.append('Banner_Img', data.img[0].originFileObj);
  if (props.data !== null) {
    formData.append('Idx', props.data?.idx);
    formData.append('Img_Url', imgUrl.value);
  }

  try {
    const response =
      props.data !== null
        ? await apis.manager.PromotionModify(formData)
        : await apis.manager.PromotionRegister(formData);

    if (response.data.errCode === 0) {
      setTimeout(() => {
        loading.value = false;
        visible.value = false;
        message.success(t('common.text.success'));
      }, 200);
    } else {
      loading.value = false;
      message.error(t('common.text.failed'));
    }
  } catch (error) {
    loading.value = false;
    console.error(error);
  }
};

const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  formState.value.img = [file];
  return false;
};

const onClose = () => {
  visible.value = false;
};

const editorModify = (text: string) => {
  formState.value.content = text;
};

const afterClose = () => {
  setTimeout(() => {
    reset();
  }, 300);
};

onBeforeUpdate(() => {
  if (visible.value) {
    if (props.data !== null) {
      formState.value.category = props.data?.category;
      formState.value.title = props.data?.title;
      formState.value.content = props.data?.content;
      formState.value.rewardType = props.data?.reward_Type;
      formState.value.startDate = props.data?.start_Date !== null ? dayjs(props.data?.start_Date, dateFormat) : '';
      formState.value.endDate = props.data?.end_Date !== null ? dayjs(props.data?.end_Date, dateFormat) : '';
      formState.value.use = props.data?.isUse;
      formState.value.view = props.data?.isView;

      imgUrl.value = props.data?.img_Url;
    }
  }
});
</script>

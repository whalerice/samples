<template>
  <a-modal
    centered
    style="min-width: 28rem; max-width: 50rem; width: 100%"
    :title="$t('route.title.notice')"
    :destroyOnClose="true"
    >"
    <a-config-provider componentSize="middle" v-if="value">
      <a-form :model="value" layout="vertical">
        <a-form-item :label="$t('common.word.category1')" required>
          <SingleSelect
            :options="noticeCategory1Options"
            v-model:value="value.category1"
            :placeholder="$t('common.word.select')"
          />
        </a-form-item>

        <a-form-item :label="$t('common.word.category2')" required>
          <SingleSelect
            :options="noticeCategory2Options"
            v-model:value="value.category2"
          />
        </a-form-item>

        <a-tabs v-model:activeKey="activeKey">
          <a-tab-pane key="en-US" :tab="$t('common.word.english')"></a-tab-pane>
          <a-tab-pane key="ko-KR" :tab="$t('common.word.korean')"></a-tab-pane>
          <a-tab-pane key="ja-JP" :tab="$t('common.word.chinese')"></a-tab-pane>
          <a-tab-pane
            key="zh-CN"
            :tab="$t('common.word.japanese')"
          ></a-tab-pane>
        </a-tabs>

        <a-form-item :label="$t('common.word.title')" required>
          <a-input
            v-model:value="value.title[activeKey]"
            allow-clear
            show-count
            :maxlength="250"
          />
        </a-form-item>

        <a-form-item :label="$t('common.word.message')" required>
          <q-editor
            v-model="value.message[activeKey]"
            :dense="$q.screen.lt.md"
            toolbar-outline
            class="custom-editor"
            min-height="20rem"
            :toolbar="[
              [
                ['bold'],
                ['italic'],
                ['strike'],
                ['underline'],
                ['subscript'],
                ['superscript'],
                {
                  icon: $q.iconSet.editor.align,
                  fixedLabel: true,
                  list: 'only-icons',
                  options: ['left', 'center', 'right', 'justify'],
                },
                ['quote'],
                ['unordered'],
                ['ordered'],
                ['outdent'],
                ['indent'],
                ['viewsource'],
              ],

              [
                'token',
                'hr',
                'link',
                'custom_btn',
                'print',
                'fullscreen',
                'undo',
                'redo',
              ],
              [
                {
                  label: $q.lang.editor.formatting,
                  icon: $q.iconSet.editor.formatting,
                  list: 'no-icons',
                  options: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code'],
                },
                {
                  label: $q.lang.editor.fontSize,
                  icon: $q.iconSet.editor.fontSize,
                  fixedLabel: true,
                  fixedIcon: true,
                  list: 'no-icons',
                  options: [
                    'size-1',
                    'size-2',
                    'size-3',
                    'size-4',
                    'size-5',
                    'size-6',
                    'size-7',
                  ],
                },
                {
                  label: $q.lang.editor.defaultFont,
                  icon: $q.iconSet.editor.font,
                  fixedIcon: true,
                  list: 'no-icons',
                  options: [
                    'default_font',
                    'arial',
                    'arial_black',
                    'comic_sans',
                    'courier_new',
                    'impact',
                    'lucida_grande',
                    'times_new_roman',
                    'verdana',
                  ],
                },
                'removeFormat',
              ],
            ]"
            :fonts="{
              arial: 'Arial',
              arial_black: 'Arial Black',
              comic_sans: 'Comic Sans MS',
              courier_new: 'Courier New',
              impact: 'Impact',
              lucida_grande: 'Lucida Grande',
              times_new_roman: 'Times New Roman',
              verdana: 'Verdana',
            }"
          />
        </a-form-item>
      </a-form>
    </a-config-provider>

    <template #footer>
      <template v-if="props.isModify">
        <a-button danger>
          {{ $t('common.word.delete') }}
        </a-button>
        <a-button
          type="primary"
          :disabled="
            value.title[activeKey] === '' || value.message[activeKey] === ''
          "
        >
          {{ $t('common.word.modify') }}
        </a-button>
      </template>
      <a-button
        type="primary"
        :disabled="
          value.secondeCode === undefined ||
          value.title[activeKey] === '' ||
          value.message[activeKey] === ''
        "
        v-else
        @click="registerNotice"
      >
        {{ $t('common.word.register') }}
      </a-button>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import SingleSelect from '@/components/select/SingleSelect.vue';
import { ref, computed } from 'vue';
import { notification } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import {
  noticeCategory1Options,
  noticeCategory2Options,
} from '@/utils/constants';

const emits = defineEmits(['update:value']);

const props = defineProps({
  value: {
    type: Object,
    required: true,
  },
  isModify: Boolean,
  id: { type: String, required: true },
});

const activeKey = ref(useI18n().locale.value);

const value = computed({
  get: () => props.value,
  set: (data: any) => {
    emits('update:value', data);
  },
});

const registerNotice = async () => {
  if (!value.value) {
    return;
  }

  if (!props.isModify) {
    try {
      // await api.auto.notice.registerNotice({
      //   order:
      //     activeKey.value === 'en-US'
      //       ? 0
      //       : activeKey.value === 'ko-KR'
      //       ? 1
      //       : activeKey.value === 'ja-JP'
      //       ? 2
      //       : 3,
      //   category1: String(value.category1),
      //   category2: value.category2,
      //   title: value.title[activeKey.value],
      //   content: value.message[activeKey.value],
      // });
    } catch (e) {
      console.error(e);
    } finally {
      notification.success({
        message: 'The notice has been successfully registered.',
        placement: 'topRight',
      });
    }
  } else {
    try {
      // await api.auto.notice.modifyNotice(props.id, {
      //   order:
      //     activeKey.value === 'en-US'
      //       ? 0
      //       : activeKey.value === 'ko-KR'
      //       ? 1
      //       : activeKey.value === 'ja-JP'
      //       ? 2
      //       : 3,
      //   category1: String(value.category1),
      //   category2: value.category2,
      //   title: value.title[activeKey.value],
      //   content: value.message[activeKey.value],
      // });
    } catch (e) {
      console.error(e);
    } finally {
      notification.success({
        message: 'The notice has been successfully modified.',
        placement: 'topRight',
      });
    }
  }
};
</script>

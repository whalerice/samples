<template>
  <a-modal
    v-model:visible="isShow"
    :title="$t('modal.title.customer_inquiry')"
    class="customer-inquiry-box"
    centered
    :closable="false"
  >
    <a-form layout="vertical">
      <a-form-item :label="$t('modal.label.id')">
        {{ props.info?.inquirer }}
      </a-form-item>

      <a-form-item :label="$t('modal.label.email_address')">
        {{ props.info?.email }}
      </a-form-item>

      <a-form-item :label="$t('modal.label.category') + 1">
        {{ t(category[0]) }}
      </a-form-item>

      <a-form-item :label="$t('modal.label.category') + 2">
        {{ t(category[1]) }}
      </a-form-item>

      <a-form-item :label="$t('modal.label.subject')">
        {{ props.info?.subject }}
      </a-form-item>
      <a-list item-layout="vertical">
        <a-list-item class="first-ch">
          <a-comment class="comment" :author="$t('modal.label.message')" :datetime="props.info.requestDate">
            <template #content>
              <p v-html="props.info?.message"></p>
            </template>
            <template #avatar>
              <MessageOutlined />
            </template>
            <a-comment v-if="props.info?.answer === null" class="comment" :author="$t('modal.label.answer')">
              <template #avatar>
                <UserOutlined />
              </template>
              <template #content>
                <a-textarea
                  v-model:value="answer"
                  :placeholder="$t('modal.placeholder.enter_answer')"
                  show-count
                  :rows="4"
                  :maxlength="2000"
                />
              </template>
            </a-comment>
            <a-comment
              v-if="props.info?.answer !== null"
              class="comment"
              :author="$t('modal.label.answer')"
              :datetime="props.info?.processingDate"
            >
              <template #content>
                <p v-html="props.info?.answer"></p>
              </template>
              <template #avatar>
                <UserOutlined />
              </template>
            </a-comment>
          </a-comment>
        </a-list-item>
      </a-list>

      <a-list item-layout="vertical" v-if="props.info?.inquiriesAdditional.length !== 0">
        <a-list-item v-for="(data, i) in props.info?.inquiriesAdditional" :key="i" :class="{ 'first-ch': i === 0 }">
          <a-comment class="comment" :author="$t('modal.label.message') + ' ' + (i + 2)" :datetime="data.addtime">
            <template #content>
              <p v-html="data.questions"></p>
            </template>
            <template #avatar>
              <MessageOutlined />
            </template>
            <a-comment
              v-if="data.answer !== null"
              :author="$t('modal.label.answer') + ' ' + (i + 2)"
              :datetime="data.altertime"
            >
              <template #avatar>
                <UserOutlined />
              </template>
              <template #content>
                <p v-html="data.answer"></p>
              </template>
            </a-comment>
            <a-comment
              v-if="data.answer === null"
              :author="$t('modal.label.answer') + ' ' + (i + 2)"
              :datetime="data.altertime"
            >
              <template #avatar>
                <UserOutlined />
              </template>
              <template #content>
                <a-textarea
                  :auto-size="{ minRows: 4, maxRows: 6 }"
                  v-model:value="answer"
                  :placeholder="$t('modal.placeholder.enter_answer')"
                >
                </a-textarea>
              </template>
            </a-comment>
          </a-comment>
        </a-list-item>
      </a-list>
    </a-form>
    <template #footer>
      <a-button @click="handleCancel">{{ $t('common.button.cancel') }}</a-button>
      <a-button type="primary" @click="handleOk" v-if="props.info?.answer === null" :disabled="isDisabled">
        {{ $t('common.button.completed') }}
      </a-button>
      <a-button
        type="primary"
        :disabled="isDisabled"
        v-if="props.info?.inquiriesAdditional[props.info?.inquiriesAdditional.length - 1]?.answer === null"
        @click="handleAdditionalOk(props.info?.inquiriesAdditional[props.info?.inquiriesAdditional.length - 1]?.answer)"
      >
        {{ $t('common.button.completed') }}
      </a-button>
    </template>
  </a-modal>
</template>
<script setup>
import { ExclamationCircleOutlined, MessageOutlined, UserOutlined } from '@ant-design/icons-vue';
import { ref, computed, createVNode, watch } from 'vue';
import { Modal } from 'ant-design-vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const store = useStore();

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
const emit = defineEmits(['close']);

const isShow = computed({
  get() {
    return props.show;
  },
  set(value) {
    emit('close', value);
  },
});

const answer = ref('');
const isDisabled = ref(true);
const errCode = computed(() => store.state['common'].errCode);
const inquiriesCategories = computed(() => store.state['common'].inquiriesCategories);
const category = ref([]);

const topMenuRefresh = async () => {
  await store.dispatch('manager/setTopMenuRefresh');
};
const handleOk = () => {
  Modal.confirm({
    title: t('confirm.title.confirm'),
    icon: createVNode(ExclamationCircleOutlined),
    content: t('confirm.description.change_status_completed'),
    okText: t('common.button.ok'),
    cancelText: t('common.button.cancel'),
    async onOk() {
      const sendData = {
        Id: props.info.id,
        Answer: answer.value,
        ReceiveEmail: props.info.email,
        Addtime: props.info.requestDate,
        Title: props.info.subject,
        Contents: props.info.message,
      };
      await store.dispatch('common/supportAnswer', sendData);
      if (errCode.value === 0) {
        topMenuRefresh();
        isShow.value = false;
      }
    },
  });
};

const handleAdditionalOk = () => {
  Modal.confirm({
    title: t('confirm.title.confirm'),
    icon: createVNode(ExclamationCircleOutlined),
    content: t('confirm.description.change_status_completed'),
    okText: t('common.button.ok'),
    cancelText: t('common.button.cancel'),
    async onOk() {
      await store.dispatch('common/supportAnswerAdditional', {
        Id: props.info.id,
        Answer: answer.value,
        ReceiveEmail: props.info.email,
        Addtime: props.info.requestDate,
        Title: props.info.subject,
        Contents: props.info.message,
      });

      if (errCode.value === 0) {
        isShow.value = false;
      }
    },
  });
};

const handleCancel = () => {
  isShow.value = false;
};

const getCategoryList = () => {
  const c1 = props.info?.category1;
  const c2 = props.info?.category2;
  const arr = inquiriesCategories.value.filter((e) => e.value === c1)[0];
  const arr2 = arr.middleCategory.filter((e) => e.value === c2)[0];

  category.value[0] = arr.text;
  category.value[1] = arr2.text;
};

watch(isShow, (val) => {
  if (val === false) answer.value = '';
  else {
    getCategoryList();
  }
});

watch(answer, (val) => {
  if (val.length > 0) isDisabled.value = false;
  else isDisabled.value = true;
});
</script>

<style lang="scss">
.comment {
  .ant-comment-inner {
    padding: 1rem 0;
  }
  .ant-comment-nested {
    margin-left: 0;
  }
  .ant-comment-content-author-name {
    color: rgba(0, 0, 0, 0.85);
    font-size: 1.4rem;
  }
  .ant-comment-content-author-time {
    color: rgba(0, 0, 0, 0.45);
  }
  .ant-comment-content-author {
    margin-bottom: 0.8rem;
  }
}

.first-ch {
  border-top: 1px solid #f0f0f0 !important ;
}
</style>

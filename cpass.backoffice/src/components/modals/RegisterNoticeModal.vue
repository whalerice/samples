<template>
  <a-modal v-model:visible="isShow" :title="$t('modal.title.register')" centered @cancel="handleCancel">
    <template #footer>
      <a-typography-text class="mr-10" type="danger">{{ feed }}</a-typography-text>
      <a-button @click="handleCancel">{{ $t('common.button.cancel') }}</a-button>
      <a-button danger @click="handleDelete" v-if="!isNewContent">{{ $t('common.button.delete') }}</a-button>
      <a-button
        type="primary"
        :loading="loading"
        @click="handleSave"
        :disabled="btnHide && !isCategoryChanging.includes(true)"
        >{{ $t('common.button.save') }}</a-button
      >
    </template>
    <a-form layout="vertical">
      <a-form-item :label="$t('modal.label.category') + ' 1'">
        <a-select v-model:value="firstCategory" @change="changeFirstCategory">
          <a-select-option v-for="item in firstCategories" :value="item.value" :key="item.value">
            {{ $t(item.label) }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item :label="$t('modal.label.category') + ' 2'">
        <a-select v-model:value="secondCategory" :placeholder="$t('search.placeholder.select')">
          <a-select-option v-for="item in secondCategories[firstCategory - 1]" :value="item.value" :key="item.value">
            {{ $t(item.label) }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-tabs v-model:activeKey="langTab">
        <a-tab-pane v-for="items in tabPane" :key="items.key" :tab="$t(items.tab)" :disabled="items.key === 5">
          <a-form-item :label="$t('modal.label.subject')">
            <a-input v-model:value="saveData.subject[currentSubjectIndex].value" show-count :maxlength="250" />
          </a-form-item>
          <a-form-item :label="$t('modal.label.message')" class="mb-0">
            <div v-if="langTab === items.key && lazyClose">
              <SummernoteEditor :insertText="insertText[langTab]" @message="getMessage" :key="langTab" />
            </div>
          </a-form-item>
        </a-tab-pane>
      </a-tabs>
    </a-form>
  </a-modal>
</template>
<script setup>
import SummernoteEditor from '@/components/SummernoteEditor.vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { Modal, notification } from 'ant-design-vue';
import { ref, computed, watch, onUpdated, createVNode, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { NoticeTransaction } from '@/store/api';

const { t } = useI18n();
const store = useStore();
const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  content: {
    type: Object,
    required: false,
  },
});
const emit = defineEmits(['close']);
const isShow = computed({
  get() {
    return props.visible;
  },
  set(value) {
    emit('close', value);
  },
});
const content = computed({
  get() {
    return props.content;
  },
});
const categoryList = computed(() => store.state['sign'].csNoticeCategoryList.register);
const userSn = computed(() => store.state['sign'].signInfo.sn);
const currentSubjectIndex = computed(() => {
  return saveData.value.subject.findIndex((e) => e.language === langTab.value);
});
const tabPane = [
  {
    key: 1,
    tab: 'common.language.en',
  },
  {
    key: 2,
    tab: 'common.language.ko',
  },
  {
    key: 3,
    tab: 'common.language.zh',
  },
  {
    key: 4,
    tab: 'common.language.jp',
  },
  {
    key: 5,
    tab: 'common.language.ru',
  },
];
const loading = ref(false);
const btnHide = ref(true);
const isCategoryChanging = ref([false, false]);
const insertText = ref(['', '', '', '', '', '']);
const saveData = ref({
  subject: [{ value: '', language: 1 }],
  insertText: [{ value: '', language: 1 }],
});
const langTab = ref(1);
const isNewContent = ref(false);
const firstCategories = ref([]);
const secondCategories = ref([]);
const firstCategory = ref(categoryList.value.firstCategories[0].value);
const secondCategory = ref(categoryList.value.secondCategories[0][0]?.value);
const feed = ref(null);
const lazyClose = ref(false);

const getMessage = (tag) => {
  const current = saveData.value.insertText.findIndex((e) => {
    return e.language === langTab.value;
  });
  saveData.value.insertText[current].value = tag;
  feed.value = null;
};
const handleCancel = (val) => {
  if (typeof val === 'string') {
    isShow.value = val;
  } else {
    isShow.value = false;
  }
  init();
};
const handleDelete = () => {
  Modal.confirm({
    title: t('confirm.title.notice_deleted'),
    icon: createVNode(ExclamationCircleOutlined),
    content: t('confirm.description.want_continue'),
    okText: t('common.button.ok'),
    cancelText: t('common.button.cancel'),
    centered: true,
    async onOk() {
      const response = await NoticeTransaction({
        Transaction_Type: 0,
        Id: props.content?.id,
        Title: null,
        Contents: null,
      });

      const getData = response.data;

      if (getData.errCode === 0) {
        notification['success']({
          message: getData.errMessage,
          duration: 10,
        });
        handleCancel('refresh');
      }
    },
  });
};
const checkPair = () => {
  const subjectValueArr = Object.values(saveData.value.subject);
  const contentsValueArr = Object.values(saveData.value.insertText);

  let notEnoughIndexArr = [];
  let removeIndexArr = [];
  let returnData = {};

  subjectValueArr.map((item, index) => {
    const subjectItem = item.value;
    const insertTextItem = contentsValueArr[index].value;

    if ((subjectItem === '' && insertTextItem !== '') || (subjectItem !== '' && insertTextItem === '')) {
      notEnoughIndexArr.push(item.language);
    }
    if (subjectItem === '' && insertTextItem === '') {
      if (index !== 0) {
        removeIndexArr.push(item.language);
      } else if (index === 0) {
        notEnoughIndexArr.push(item.language);
      }
    }
  });

  if (content.value) {
    returnData.subject = saveData.value.subject;
    returnData.insertText = saveData.value.insertText; //  not remove empty
  } else {
    returnData.subject = saveData.value.subject.filter((e, index) => !removeIndexArr.includes(index + 1));
    returnData.insertText = saveData.value.insertText.filter((e, index) => !removeIndexArr.includes(index + 1));
    // remove empty
  }

  return { returnData: notEnoughIndexArr.length === 0 ? returnData : undefined, notEnoughIndexArr };
};
const handleSave = async () => {
  const item = checkPair();
  // let notEnoughLang = [];
  // if (item.returnData === undefined) {
  //   tabPane.forEach((e) => {
  //     if (item.notEnoughIndexArr.includes(e.key)) {
  //       notEnoughLang.push(t(e.tab));
  //     }
  //   });
  //   feed.value = notEnoughLang.join(' , ') + ' 입력해주십시오';
  // } else {
  feed.value = '';
  const type = isNewContent.value ? 1 : 2;
  const id = props.content !== null ? props.content.id : null;
  const response = await NoticeTransaction({
    Transaction_Type: type,
    Id: id,
    Title: item.returnData.subject,
    Contents: item.returnData.insertText,
    mainValue: firstCategory.value,
    subCategoryCode: secondCategory.value,
    user_Sn: userSn.value,
  });
  const getData = response.data;
  if (getData.errCode === 0) {
    notification['success']({
      message: getData.errMessage,
      duration: 10,
    });
    handleCancel('refresh');
  } else {
    feed.value = getData.errMessage;
  }
};

const changeFirstCategory = () => {
  secondCategory.value = 1;
};
const init = () => {
  setTimeout(() => {
    langTab.value = 1;
    firstCategory.value = 1;
    secondCategory.value = 1;
    insertText.value = ['', '', '', '', '', ''];
    saveData.value = {
      subject: [{ value: '', language: 1 }],
      insertText: [{ value: '', language: 1 }],
    };
    feed.value = null;
    btnHide.value = true;
    isCategoryChanging.value = [false, false];
  }, 300);
};

document.addEventListener('keyup', () => {
  const returnData = checkPair();
  returnData.notEnoughIndexArr.length > 0 ? (btnHide.value = true) : (btnHide.value = false);
});

watch(langTab, (val) => {
  const isDuplication = saveData.value.insertText.map((e) => {
    if (e.language === val) {
      return true;
    } else {
      return false;
    }
  });
  if (!isDuplication.includes(true)) {
    saveData.value.insertText.push({ value: '', language: val });
    saveData.value.subject.push({ value: '', language: val });
  }
});
watch(isShow, (val) => {
  if (!val) {
    setTimeout(() => {
      lazyClose.value = false;
    }, 300);
  }
});

watch(firstCategory, (val) => {
  if (content.value) {
    if (content.value.mainValue !== val) {
      isCategoryChanging.value[0] = true;
    } else {
      isCategoryChanging.value[0] = false;
    }
  }
});
watch(secondCategory, (val) => {
  if (content.value) {
    if (content?.value.subCategoryCode !== val) {
      isCategoryChanging.value[1] = true;
    } else {
      isCategoryChanging.value[1] = false;
    }
  }
});

onUpdated(() => {
  isNewContent.value = content.value === null ? true : false;
  lazyClose.value = true;

  if (!content.value) {
    init();
  } else {
    firstCategory.value = content.value.mainValue;
    secondCategory.value = content.value.subCategoryCode;
    saveData.value.subject = content.value.title;
    saveData.value.insertText = content.value.contents;
    const arr = saveData.value.insertText.map((e) => {
      return e.value;
    });
    arr.unshift('');
    insertText.value = arr;
  }
});
onBeforeMount(() => {
  firstCategories.value = categoryList.value.firstCategories;
  secondCategories.value = categoryList.value.secondCategories;
});
</script>

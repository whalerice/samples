<template>
  <a-modal v-model:visible="isShow" width="1000px" :footer="null">
    <a-skeleton active v-if="loading" />
    <a-row justify="center" class="mb-15" v-if="!loading">
      <a-radio-group v-model:value="radioTab">
        <a-radio-button :value="item.value" v-for="(item, index) in radio" :key="index">
          <span>
            {{ t(item.title) }}
          </span>
        </a-radio-button>
      </a-radio-group>
    </a-row>
    <a-table
      v-if="!loading"
      :columns="radioTab === 0 ? favoritesColumns : lastColumns"
      :data-source="radioTab === 0 ? favoritesData.returnData : lastData.returnData.list"
      :pagination="radioTab === 1 ? pagination : ''"
      @change="handleTableChange"
    >
      <template #headerCell="{ column }">
        <span v-if="column.title !== ''">
          {{ t(column.title) }}
        </span>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'isFavorite'">
          <a-button type="link">
            <fa-icon
              :icon="'fa-solid fa-star'"
              :color="record.isFavorite || radioTab === 0 ? 'gold' : '#eee'"
              font-size="20"
              @click="clickStar(record)"
            />
          </a-button>
        </template>
        <template v-if="column.key === 'price'">
          <span>{{ comma(record.price) }}</span>
        </template>
        <template v-if="column.key === 'cpassId'">
          <a @click="returnToPush(record)">{{ record.cpassId }}</a>
        </template>
        <template v-if="column.key === 'favoriteId'">
          <a @click="returnToPush(record)">{{ record.favoriteId }}</a>
        </template>
        <template v-if="column.key === 'transactionType'">
          {{ record.transactionType === 1 ? t('search.select.deposit') : t('common.button.withdrawal') }}
        </template>
      </template>
    </a-table>
  </a-modal>

  <a-modal v-model:visible="settingModalIsActive" :title="t('component.title.favorites_settings')">
    <a-typography-text>{{ t('datatable.thead.name') }}</a-typography-text>
    <a-input
      v-model:value="setFavoritesName"
      show-count
      :maxlength="30"
      @pressEnter="!showDeleteBtn ? addFavorites() : ''"
    />
    <a-typography-text type="danger">{{ saveFeed }}</a-typography-text>
    <template #footer>
      <a-button key="close" @click="removeFavorites()" type="primary" danger v-if="showDeleteBtn">
        {{ t('common.button.delete') }}
      </a-button>
      <a-button key="confirm" type="primary" @click="addFavorites()">{{ t('common.button.save') }}</a-button>
    </template>
  </a-modal>
</template>

<script setup>
import { Modal } from 'ant-design-vue';
import { computed, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { comma, lottieModal } from '@/assets/js/global.js';

const { t } = useI18n();
const props = defineProps({
  modalIsActive: Boolean,
});
const emit = defineEmits(['closeFavoritesModal', 'returnToPush']);
const store = useStore();
const isShow = computed({
  get() {
    return props.modalIsActive;
  },
  set() {
    emit('closeFavoritesModal', false);
  },
});
const settingModalIsActive = ref(false);
const showDeleteBtn = ref(false);
const modifyInfo = ref({});
const setFavoritesName = ref('');
const loading = ref(true);
const favoritesColumns = [
  {
    title: '',
    key: 'isFavorite',
    dataIndex: 'isFavorite',
    width: 50,
  },
  {
    title: 'datatable.thead.name',
    key: 'favoriteName',
    dataIndex: 'favoriteName',
  },
  {
    title: 'datatable.thead.cpass_id',
    key: 'favoriteId',
    dataIndex: 'favoriteId',
  },
];
const lastColumns = [
  {
    title: '',
    key: 'isFavorite',
    dataIndex: 'isFavorite',
    width: 50,
  },
  {
    title: 'datatable.thead.request_date',
    key: 'requestDate',
    dataIndex: 'requestDate',
  },
  {
    title: 'datatable.thead.cpass_id',
    key: 'cpassId',
    dataIndex: 'cpassId',
  },
  {
    title: 'datatable.thead.deal_type',
    key: 'transactionType',
    dataIndex: 'transactionType',
  },
  {
    title: 'datatable.thead.store_id',
    key: 'storeId',
    dataIndex: 'storeId',
  },
  {
    title: 'datatable.thead.order_name',
    key: 'orderName',
    dataIndex: 'orderName',
  },
  {
    title: 'datatable.thead.currency',
    key: 'currency',
    dataIndex: 'currency',
  },
  {
    title: 'datatable.thead.price',
    key: 'price',
    dataIndex: 'price',
  },
];
const radio = [
  {
    title: 'common.button.favorites',
    value: 0,
  },
  {
    title: 'component.label.latest',
    value: 1,
  },
];
const radioTab = ref(radio[0].value);
const saveFeed = ref('');
const favoritesData = computed(() => store.state['partner'].partnerSmallBusinessFavorite);
const lastData = computed(() => store.state['partner'].partnerSmallBusinessRecentList);
const errCode = computed(() => store.state['common'].errCode);
const pagination = ref({
  total: computed(() => lastData.value.returnData.totalCount.count),
  current: 1,
  pageSize: 10,
});

const clickStar = (record) => {
  modifyInfo.value = record;
  saveFeed.value = '';
  settingModalIsActive.value = true;
  record.isFavorite || radioTab.value === 0
    ? ((showDeleteBtn.value = true), (setFavoritesName.value = record.favoriteName))
    : (showDeleteBtn.value = false);
};

const addFavorites = async () => {
  if (setFavoritesName.value.length > 0) {
    saveFeed.value = '';
    await store.dispatch('partner/PartnerSmallBusinessFavoriteUpsert', {
      favoriteId: radioTab.value === 0 ? modifyInfo.value.favoriteId : modifyInfo.value.cpassId,
      favoriteName: setFavoritesName.value,
    });
    if (errCode.value === 0) {
      loading.value = true;
      settingModalIsActive.value = false;
      await lottieModal(t('confirm.description.success_saved'), 'setting', 1.5);
      await refresh();
      loading.value = false;
    }
  } else {
    saveFeed.value = t('component.error_msg.enter_name');
  }
};

const removeFavorites = async () => {
  Modal.confirm({
    okText: t('common.button.confirm'),
    cancelText: t('common.button.cancel'),
    okType: 'danger primary',
    title: t('component.description.remove_confirm'),
    onCancel() {},
    async onOk() {
      await store.dispatch('partner/PartnerSmallBusinessFavoriteDelete', {
        idx: radioTab.value === 0 ? modifyInfo.value.idx : modifyInfo.value.favoriteIdx,
      });

      if (errCode.value === 0) {
        settingModalIsActive.value = false;
        showConfirm();
        loading.value = true;
      }
    },
  });
};

const refresh = async () => {
  modifyInfo.value = {};
  await store.dispatch('partner/PartnerSmallBusinessFavorite');
  if (errCode.value === 0) {
    await store.dispatch('partner/PartnerSmallBusinessRecentList', {
      page: 1,
    });
  }
};
const showConfirm = async () => {
  Modal.success({
    title: t('confirm.title.success'),
    okText: t('common.button.confirm'),
    async onOk() {
      await refresh();
      Modal.destroyAll();
      loading.value = false;
    },
  });
};

const handleTableChange = async (val) => {
  if (radioTab.value === 1) {
    await store.dispatch('partner/PartnerSmallBusinessRecentList', {
      page: val.current,
    });
    if (errCode.value === 0) {
      pagination.value.current = val.current;
    }
  }
};

const returnToPush = (e) => {
  emit('returnToPush', radioTab.value === 0 ? e.favoriteId : e.cpassId);
};
watch(isShow, async () => {
  if (isShow.value) {
    await refresh();
    loading.value = false;
  } else {
    setTimeout(() => {
      loading.value = true;
    }, 300);
  }
});
</script>

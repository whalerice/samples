<template>
  <q-table
    flat
    ref="tableRef"
    row-key="name"
    :class="{ 'table-bottom-center': isMobile }"
    :no-data-label="$t('table.message.no_data')"
    :rows="rows"
    :rows-per-page-options="[5, 10, 15, 20, 25, 30]"
    :columns="columns"
    :loading="loading"
    :filter="filter"
    :grid="isMobile"
    binary-state-sort
    v-model:pagination="pagination"
    color="primary"
    @request="onRequest">
    <template v-slot:top-left>
      <q-btn no-caps color="primary" :label="$t(`common.button.contact`)" @click="showContactModal()" />
    </template>
    <template v-slot:top-right>
      <!-- <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input> -->

      <q-btn flat dense round icon="refresh" :class="{ 'fa-spin': loading }" @click="onRefresh" />
      <q-btn flat dense round :icon="isMobile === true ? 'list' : 'grid_view'" @click="isMobile = !isMobile" />
    </template>
    <template v-slot:header="props">
      <q-tr :props="props">
        <q-th v-for="col in props.cols" :key="col.name" :props="props">
          {{ $t(col.label) }}
        </q-th>
      </q-tr>
    </template>
    <template v-slot:no-data="{ message }">
      <div class="full-width row flex-center">
        <span> {{ message }} </span>
      </div>
    </template>
    <template v-slot:item="props">
      <div
        class="q-pa-xs col-xs-12 col-sm-6 col-md-4 col-lg-3 grid-style-transition"
        :style="props.selected ? 'transform: scale(0.95);' : ''">
        <q-card :class="props.selected ? 'bg-grey-2' : ''" flat bordered class="table-card">
          <q-list dense class="table-card-list">
            <q-item v-for="col in props.cols.filter((col:any) => col.name !== 'desc')" :key="col.name">
              <q-item-section>
                <q-item-label class="title">{{ $t(col.label) }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label class="value">{{ col.value }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </template>
    <template v-slot:body-cell-title="props">
      <q-td :props="props">
        <span class="text-link" @click="showNoteDetail(props.row)">{{ props.row.title }}</span>
        <q-badge color="red" rounded v-if="!props.row.is_Read" />
      </q-td>
    </template>
    <template v-slot:body-cell-message_Type="props">
      <q-td :props="props">
        {{ $t(messageType.filter((e) => e.key === props.row.message_Type)[0].label) }}
      </q-td>
    </template>
    <!-- <template v-slot:body-cell-content="props">
      <q-td :props="props">
        <span class="text-link" @click="showNoteDetail(props.row)">{{ props.row.content }}</span>
      </q-td>
    </template> -->
  </q-table>
  <NoteDetails :show="isNoteDetail" :data="noteData" @close="closeNoteDetail" />
  <ContactModal :show="isContactModal" @close="closeContactModal" />
</template>

<script setup lang="ts">
import NoteDetails from 'components/modals/NoteDetails.vue';
import ContactModal from 'components/modals/ContactModal.vue';

import { Platform } from 'quasar';
import { ref, onMounted } from 'vue';
import { apis } from 'src/stores/apis';
import { MessageType } from 'src/components/models/enums';

const messageType = [
  { key: MessageType.Notice, label: 'common.text.notice' },
  { key: MessageType.Event, label: 'common.text.event' },
  { key: MessageType.AdminToUser, label: 'common.text.admin_to_user' },
  { key: MessageType.UserToAdmin, label: 'common.text.user_to_admin' },
];
const isNoteDetail = ref<boolean>(false);
const noteData = ref<any>(null);
const isContactModal = ref<boolean>(false);
const isMobile = ref(Platform.is.mobile === undefined ? false : true);

const showNoteDetail = (item: any) => {
  isNoteDetail.value = true;
  noteData.value = item;
  messageInfo(item.idx);
};

const messageInfo = async (data: number) => {
  try {
    await apis.MessageInfo({ idx: data });
  } catch (error) {
    console.error(error);
  }
};

const closeNoteDetail = (e: boolean) => {
  isNoteDetail.value = e;
  onRefresh();
};

const showContactModal = () => {
  isContactModal.value = true;
};
const closeContactModal = () => {
  isContactModal.value = false;
};
// import { commonStore } from 'src/stores/common';

// const { comma, csvFile } = commonStore.common();

// format: (val, row) => val ? `${val}%` : '',
const columns = ref<any[]>([
  {
    name: 'message_Type',
    field: 'message_Type',
    required: true,
    label: 'table.thead.message_type',
    align: 'left',
    sortable: true,
    style: 'width: 12%',
  },
  {
    name: 'sender_Id',
    field: 'sender_Id',
    required: true,
    label: 'table.thead.sender',
    align: 'left',
    sortable: true,
    style: 'width: 12%',
  },
  // {
  //   name: 'is_Read',
  //   field: 'is_Read',
  //   required: true,
  //   label: '',
  //   align: 'left',
  //   sortable: true,
  // },
  {
    name: 'title',
    field: 'title',
    required: true,
    label: 'table.thead.title',
    align: 'left',
    sortable: true,
  },

  // {
  //   name: 'content',
  //   field: 'content',
  //   required: true,
  //   label: 'table.thead.content',
  //   align: 'left',
  //   sortable: true,
  // },
  {
    name: 'readTime',
    field: 'readTime',
    required: true,
    label: 'table.thead.read_time',
    align: 'left',
    sortable: true,
    style: 'width: 12%',
  },
  {
    name: 'addTime',
    field: 'addTime',
    required: true,
    label: 'table.thead.receive_time',
    align: 'left',
    sortable: true,
    style: 'width: 12%',
  },
]);

// const tableTitle = ref('tab.title.message_history');
const tableRef = ref();
const rows = ref<any[]>([]);
const filter = ref('');
const loading = ref(false);
const total = ref<number>(0);
const pagination = ref({
  sortBy: '',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 10,
});

const onRequest = async (props: any) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination;
  // const filter = props.filter;

  loading.value = true;
  const send = {
    currentPage: page,
    currentPageSize: rowsPerPage,
    order: sortBy,
    sort: descending ? 'desc' : 'asc',
    req_BeforeDate: '',
    req_AfterDate: '',
    user_Filter: 0,
    search: '',
  };

  try {
    const response = await apis.MessageHistory(send);

    if (response.data.errCode === 0) {
      const returnData = response.data.returnData;
      rows.value = returnData.list;

      if (returnData.totalCount) {
        total.value = returnData.totalCount.count;
      }
    }
    loading.value = false;
  } catch (error) {
    console.error(error);
  }

  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
  pagination.value.rowsNumber = total.value;
};

const onRefresh = () => {
  tableRef.value.requestServerInteraction();
};

onMounted(() => {
  tableRef.value.requestServerInteraction();
});
</script>

<style scoped lang="scss"></style>

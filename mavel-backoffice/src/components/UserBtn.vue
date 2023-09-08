<template>
  <a-tooltip
    placement="right"
    trigger="click"
    overlayClassName="user-tooltip"
    :visible="visible"
    @visibleChange="visibleChange">
    <template #title>
      <ul class="menu">
        <li>
          <a-typography-link @click="openDetails">
            {{ $t('common.label.view_details') }}
          </a-typography-link>
        </li>
        <li>
          <a-typography-link @click="openNote" :disabled="props.status === 1 ? false : true">
            {{ $t('common.label.send_note') }}
          </a-typography-link>
        </li>
        <li>
          <a-typography-link @click="showChangePasswordModal">
            {{ $t('common.text.change_password') }}
          </a-typography-link>
        </li>
      </ul>
    </template>
    <a-typography-link> {{ props.id }}</a-typography-link>
  </a-tooltip>
  <NoteDetails :show="isNoteDetail" :data="sendData" @close="(e:boolean) => isNoteDetail = e" />
  <ChangePasswordUser :show="isChangeModal" :idx="props.idx" @update:show="(value:boolean) => isChangeModal = value" />
</template>

<script setup lang="ts">
import NoteDetails from 'components/modals/NoteDetails.vue';
import ChangePasswordUser from 'components/modals/ChangePasswordUser.vue';

import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { ref } from 'vue';

import { userStore } from 'src/stores/user';
import { UserType } from 'src/components/models/enums';

const props = defineProps({
  idx: {
    type: Number,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
  type: {
    type: Number,
    required: false,
  },
  status: {
    type: Number,
    required: false,
  },
});
const visible = ref<boolean>(false);

const router = useRouter();
const { memberType } = storeToRefs(userStore.sign());

const isNoteDetail = ref<boolean>(false);
const sendData = ref<any>({ sender_Idx: 0 });
const isChangeModal = ref<boolean>(false);

const openDetails = () => {
  visibleChange();

  const routeData = router.resolve({
    name: memberType.value === UserType.Manager ? 'MemberDetails' : 'PartnerMemberDetails',
    params: { idx: props.idx },
    query: { user: props.id },
  });
  window.open(routeData.href, '_blank');
};

const openNote = () => {
  visibleChange();
  isNoteDetail.value = true;
  sendData.value = { sender_Idx: props.idx };
};

const visibleChange = () => {
  visible.value = !visible.value;
};

const showChangePasswordModal = () => {
  visibleChange();
  isChangeModal.value = true;
};
</script>

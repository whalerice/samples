<template>
  <a-drawer
    placement="right"
    @close="onClose"
    :width="800"
    :visible="props.show"
    :closable="false"
    :destroyOnClose="true">
    <a-descriptions
      size="small"
      :title="props.data !== null ? $t('drawer.title.manager_detail') : $t('drawer.title.manager_register')"
      :column="1"
      bordered
      :labelStyle="{ width: '24rem' }">
      <!--  -->
      <template #extra>
        <a-button type="primary" @click="editToggle" v-if="!isEdit && props.data && userInfo?.idx !== props.data.idx">
          {{ $t('common.button.edit') }}
        </a-button>
        <a-space :size="5" v-if="isEdit && props.data !== null">
          <a-button @click="editToggle">{{ $t('common.button.cancel') }}</a-button>
          <a-button type="primary" @click="onEdit" :loading="loading">
            {{ $t('common.button.confirm') }}
          </a-button>
        </a-space>
        <a-button type="primary" v-if="props.data === null" @click="onRegister" :loading="loading">
          {{ $t('common.button.register') }}
        </a-button>
      </template>
      <a-descriptions-item
        :label="$t('common.label.manager_type')"
        v-if="props.data === null && siteIdx === SiteGrade.Admin">
        <a-radio-group v-model:value="managerType" button-style="solid">
          <a-radio-button value="m">{{ $t('common.text.manager') }}</a-radio-button>
          <a-radio-button value="o">{{ $t('common.text.operator') }}</a-radio-button>
        </a-radio-group>
      </a-descriptions-item>
      <a-descriptions-item :label="$t('common.label.site')" v-if="siteIdx === SiteGrade.Admin && managerType === 'o'">
        <a-select
          v-if="props.data === null"
          v-model:value="managerSiteIdx"
          :options="site"
          class="full-width"
          :placeholder="$t('common.placeholder.select_site')" />
        <template v-if="props.data !== null">
          {{ formState.siteName }}
        </template>
      </a-descriptions-item>
      <a-descriptions-item :label="$t('table.thead.user_id')">
        <template v-if="props.data !== null">{{ formState.id }}</template>
        <a-input v-if="props.data === null" v-model:value="formState.id" allowClear autocomplete="new-id" />
        <a-typography-text type="danger" v-if="rulesRef.id">{{ $t('form.rule.empty') }}</a-typography-text>
      </a-descriptions-item>
      <a-descriptions-item :label="$t('form.label.password')">
        <a-button v-if="!isEdit && props.data !== null" @click="() => (isChangeModal = true)">
          {{ $t('common.text.change_password') }}
        </a-button>
        <a-input-password
          v-if="props.data === null"
          v-model:value="formState.password"
          allowClear
          autocomplete="new-password" />
        <a-typography-text type="danger" v-if="rulesRef.password">{{ $t('form.rule.empty') }}</a-typography-text>
      </a-descriptions-item>
      <a-descriptions-item :label="$t('table.thead.nick')">
        <template v-if="!isEdit">{{ formState.nick }}</template>
        <a-input v-if="isEdit" v-model:value="formState.nick" allowClear />
        <a-typography-text type="danger" v-if="rulesRef.nick">{{ $t('form.rule.empty') }}</a-typography-text>
      </a-descriptions-item>
      <a-descriptions-item :label="$t('table.thead.rw_permissions')">
        <template v-if="!isEdit && options.authorityRW.filter((e: any) => e.value === formState.rw).length > 0">
          {{ options.authorityRW.filter((e: any) => e.value === formState.rw)[0].label() }}
        </template>
        <a-select
          v-if="isEdit"
          v-model:value="formState.rw"
          :options="options.authorityRW"
          :placeholder="$t('common.placeholder.select')"
          class="full-width" />
        <a-typography-text type="danger" v-if="rulesRef.rw">{{ $t('form.rule.empty') }}</a-typography-text>
      </a-descriptions-item>
      <a-descriptions-item :label="$t('table.thead.status')" v-if="props.data !== null">
        <template v-if="!isEdit && options.managerStatus.filter((e: any) => e.value === formState.status).length > 0">
          {{ options.managerStatus.filter((e: any) => e.value === formState.status)[0].label() }}
        </template>
        <a-select
          v-if="isEdit"
          v-model:value="formState.status"
          :options="options.managerStatus"
          :placeholder="$t('common.placeholder.select')"
          class="full-width" />
      </a-descriptions-item>
    </a-descriptions>
  </a-drawer>
  <ChangePassword :show="isChangeModal" :idx="props.data?.idx" @update:show="(e:boolean) => isChangeModal = e" />
</template>

<script setup lang="ts">
import ChangePassword from 'components/modals/ChangePassword.vue';

import { storeToRefs } from 'pinia';
import { message } from 'ant-design-vue';
import { ref, onUpdated, reactive, watch } from 'vue';

import { commonStore } from 'src/stores/common';
import { SiteGrade } from 'src/components/models/enums';
import { options } from 'src/boot/global';
import { apis } from 'src/stores/apis';
import { userStore } from 'src/stores/user';

const { site } = storeToRefs(commonStore.board());
const { userInfo, siteIdx } = storeToRefs(userStore.user());

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  data: {
    type: Object || null,
    required: true,
  },
});

const emits = defineEmits(['update:show']);

interface IDetails {
  siteName: string;
  id: string;
  password: string;
  nick: string;
  rw: number | null;
  status: number | null;
}

const isChangeModal = ref<boolean>(false);

const isEdit = ref<boolean>(false);
const managerSiteIdx = ref<number | null>(null);
const managerType = ref<string>('m');
const loading = ref<boolean>(false);
const formState = ref<IDetails>({
  siteName: '',
  id: '',
  password: '',
  nick: '',
  rw: null,
  status: null,
});

// const siteDetail = async (idx: number) => {
//   try {
//     const response = await apis.manager.ManagerInfo({ Idx: idx });
//     if (response.data.errCode === 0) {
//       getData.value = response.data.returnData;
//       // startDate.value = dayjs(getData.value.start_Date, dateFormat);
//       // endDate.value = dayjs(getData.value.end_Date, dateFormat);
//     }
//   } catch (error) {
//     console.error(error);
//   }
// };

const rulesRef = reactive({
  id: false,
  password: false,
  nick: false,
  rw: false,
});

watch(formState.value, (v) => {
  if (v.id !== '') rulesRef.id = false;
  if (v.password !== '') rulesRef.password = false;
  if (v.nick !== '') rulesRef.nick = false;
  if (v.rw !== null) rulesRef.rw = false;
});

const onRegister = async () => {
  if (formState.value.id === '') return (rulesRef.id = true);
  if (formState.value.password === '') return (rulesRef.password = true);
  if (formState.value.nick === '') return (rulesRef.nick = true);
  if (formState.value.rw === null) return (rulesRef.rw = true);

  loading.value = true;

  let idx;

  if (managerType.value === 'o') {
    if (siteIdx.value === SiteGrade.Admin) idx = managerSiteIdx.value;
    else idx = siteIdx.value;
  } else {
    idx = 0;
  }

  const send = {
    siteIdx: idx,
    user_Id: formState.value.id,
    password: formState.value.password,
    nick: formState.value.nick,
    rw: formState.value.rw,
  };

  try {
    const response = await apis.manager.ManagerRegister(send);
    if (response.data.errCode === 0) {
      setTimeout(() => {
        loading.value = false;
        onClose();
        message.success(response.data.errMessage);
      }, 1000);
    }
  } catch (error) {
    console.error(error);
    loading.value = false;
  }
};

const onEdit = async () => {
  if (formState.value.nick === '') return (rulesRef.nick = true);

  loading.value = true;

  const send = {
    idx: props.data?.idx,
    nick: formState.value.nick,
    rw: formState.value.rw,
    status: formState.value.status,
  };

  try {
    const response = await apis.manager.ManagerModify(send);

    if (response.data.errCode === 0) {
      setTimeout(() => {
        loading.value = false;
        onClose();
        message.success(response.data.errMessage);
      }, 1000);
    }
  } catch (error) {
    console.error(error);
    loading.value = false;
  }
};

const editToggle = () => {
  isEdit.value = !isEdit.value;
};

const onClose = () => {
  emits('update:show', false);
};

onUpdated(() => {
  if (props.show) {
    managerType.value = siteIdx.value === SiteGrade.Admin ? 'm' : 'o';

    if (props.data !== null) {
      formState.value['id'] = props.data.user_Id;
      formState.value['nick'] = props.data.nick;
      formState.value['rw'] = props.data.rw;
      formState.value['status'] = props.data.status;
      formState.value['siteName'] = props.data.site_Name;
    } else {
      isEdit.value = true;
    }
  } else {
    formState.value['id'] = '';
    formState.value['password'] = '';
    formState.value['nick'] = '';
    formState.value['rw'] = null;
    formState.value['status'] = null;
    formState.value['siteName'] = '';
    isEdit.value = false;
  }
});
</script>

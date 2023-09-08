<template>
  <a-descriptions
    bordered
    title=""
    size="small"
    :column="2"
    :labelStyle="{ width: '16rem' }"
    v-if="memberData"
  >
    <template #extra>
      <a-button size="default" type="primary" @click="onSave">
        {{ $t('common.word.save') }}
      </a-button>
    </template>

    <a-descriptions-item :label="$t('common.word.id')">
      {{ memberData.email }}
    </a-descriptions-item>

    <a-descriptions-item
      :label="$t('common.word.settlement_method')"
      v-if="memberData && memberData.level !== 0 && memberData.level !== 6"
    >
      {{
        memberData.settlementMethod === RewardType.Losing
          ? $t('common.word.losing')
          : memberData.settlementMethod === RewardType.Rolling
          ? $t('common.word.rolling')
          : memberData.settlementMethod
      }}
    </a-descriptions-item>

    <a-descriptions-item :label="$t('common.word.nickname')">
      {{ memberData.nickname }}
    </a-descriptions-item>

    <a-descriptions-item
      :label="$t('common.word.settlement_rate')"
      v-if="memberData && memberData.level !== 0 && memberData.level !== 6"
    >
      <a-input
        suffix="%"
        class="text-right"
        v-model:value="memberData.feeRate"
      />
    </a-descriptions-item>

    <a-descriptions-item
      :label="$t('common.word.password')"
      v-if="memberData.level !== 0 && memberData.level !== 6"
    >
      <span class="q-mr-xs">********</span>
      <a-popconfirm
        :title="$t('modal.warning.modify_password_warning')"
        @confirm="onEdit(true)"
      >
        <a-button type="primary">
          {{ $t('common.word.modify') }}
        </a-button>
      </a-popconfirm>
    </a-descriptions-item>

    <a-descriptions-item
      :label="`${$t('common.word.losing_reserve')}(${coinType})`"
      v-if="memberData && memberData.level !== 0 && memberData.level !== 6"
    >
      {{ $comma(memberData.rewardAmount) }}
    </a-descriptions-item>

    <a-descriptions-item :label="$t('common.word.grade')">
      {{
        memberData.level === 6
          ? $t('common.word.user')
          : memberData.level === 0
          ? $t('common.word.partner')
          : $t(`common.word.agent_number`, { number: memberData.level })
      }}
    </a-descriptions-item>

    <a-descriptions-item :label="$t('common.word.signup_date')">
      {{ $dayjs(memberData.createdTime).format('YYYY-MM-DD HH:mm:ss') }}
    </a-descriptions-item>

    <a-descriptions-item :label="$t('common.word.status')" :span="2">
      <SelectChangeStatus :data="memberData" />
    </a-descriptions-item>

    <a-descriptions-item :label="$t('common.word.partner')" :span="2">
      {{ memberData.investor }}
    </a-descriptions-item>

    <a-descriptions-item :label="$t('common.word.top_agent')" :span="2">
      <span class="q-mr-xs">{{ memberData.topAgent }}</span>
      <HierarchyTooltip :id="memberData.memberId" />
    </a-descriptions-item>

    <a-descriptions-item
      :label="$t('common.word.agent_creation_permissions')"
      v-if="memberData && memberData.level !== 0 && memberData.level !== 6"
    >
      <a-radio-group v-model:value="memberData.isSubPartnerAvailable">
        <a-radio :value="false">{{ $t('common.word.no_permission') }}</a-radio>
        <a-radio :value="true">
          {{ $t('common.word.create_agent') }}
        </a-radio>
      </a-radio-group>
    </a-descriptions-item>
  </a-descriptions>

  <ChangePasswordModal
    v-if="memberData && memberData.level !== 0 && memberData.level !== 6"
    :show="isChangePasswordModal"
    @update:show="onEdit"
    :data="sendData"
  />
</template>

<script setup lang="ts">
import ChangePasswordModal from '@/components/modal/ChangePasswordModal.vue';
import HierarchyTooltip from '@/components/HierarchyTooltip.vue';
import SelectChangeStatus from '@/components/select/SelectChangeStatus.vue';

import { ref, onBeforeMount, PropType } from 'vue';
import { Modal } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { RewardType } from '@/utils/enums';
import { api } from '@/boot/axios';

const { t } = useI18n();
const props = defineProps({
  data: {
    type: Object as PropType<IMemberManagementResponse>,
    required: true,
  },
});

const memberData = ref<IMemberManagementResponse>();

const isChangePasswordModal = ref<boolean>(false);
const confirmLoading = ref<boolean>(false);
const coinType = ref<string>('USDT');
const sendData = ref<{ id: string }>({
  id: '',
});

const onSave = () => {
  Modal.info({
    centered: true,
    content: t('modal.info.save'),
    okButtonProps: { size: 'middle', loading: confirmLoading.value },
    onOk: async () => {
      if (!memberData.value) {
        return;
      }

      confirmLoading.value = true;
      await api.auto.member.modify(memberData.value.memberId, {
        state: memberData.value.state,
        feeRate: memberData.value.feeRate,
        isSubPartnerAvailable: memberData.value.isSubPartnerAvailable,
      });
      confirmLoading.value = false;
    },
  });
};

const onEdit = (value: boolean) => {
  if (!memberData.value) {
    return;
  }

  isChangePasswordModal.value = value;
  sendData.value = {
    id: memberData.value.memberId,
  };
};

const getData = async () => {
  memberData.value = await api.auto.member.memberManagementDetail(
    props.data.memberId
  );
};

onBeforeMount(async () => {
  await getData();
});
</script>

<template>
  <a-modal
    centered
    v-model:visible="visible"
    :footer="null"
    :title="$t('common.word.member_information')"
    :width="1000"
    :destroyOnClose="true"
    :afterClose="afterClose"
    :bodyStyle="{ padding: 0 }"
  >
    <a-tabs
      v-model:activeKey="activeKey"
      :destroyInactiveTabPane="true"
      :tabBarGutter="20"
      :tabBarStyle="{
        paddingLeft: '2.4rem',
        paddingRight: '2.4rem',
        marginBottom: 0,
      }"
    >
      <template v-for="item in tabs">
        <a-tab-pane
          v-if="item.levels ? item.levels.indexOf(level) !== -1 : true"
          :key="item.key"
          :tab="item.label()"
          :class="{ 'q-pa-lg': item.key === 'memberInformation' }"
        >
          <component :is="item.component" :data="props.memberData" />
        </a-tab-pane>
      </template>
    </a-tabs>
  </a-modal>
</template>

<script setup lang="ts">
import MemberInformation from '@/components/MemberInformation.vue';
import SettingSettlement from '@/components/SettingSettlement.vue';
import GameManagementUserPage from '@/pages/GameManagementUserPage.vue';
import SettlementManagementPage from '@/pages/SettlementManagementPage.vue';
import LosingRewardManagementPage from '@/pages/LosingRewardManagementPage.vue';
import SubMemberList from '@/components/SubMemberList.vue';
import LoginHistory from '@/components/LoginHistory.vue';

import { ref, computed, PropType } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const activeKey = ref<string>('memberInformation');
const props = defineProps({
  memberData: Object as PropType<IMemberManagementResponse>,
  open: Boolean,
});

const level = computed(() => props.memberData?.level);
const visible = computed(() => props.open);

const tabs = ref<any>([
  {
    key: 'memberInformation',
    label: () => t('common.word.member_information'),
    component: MemberInformation,
  },
  {
    key: 'settingSettlement',
    label: () => t('common.word.settlement_setting'),
    component: SettingSettlement,
  },
  {
    key: 'gameManagementUserPage',
    label: () => t('common.word.predict_content'),
    component: GameManagementUserPage,
    levels: [6],
  },
  {
    key: 'settlementManagementPage',
    label: () => t('common.word.settlement_list'),
    component: SettlementManagementPage,
    levels: [1, 2, 3, 4, 5],
  },
  {
    key: 'losingRewardManagementPage',
    label: () => t('common.word.losing_list'),
    component: LosingRewardManagementPage,
    levels: [1, 2, 3, 4, 5],
  },
  {
    key: 'subMemberList',
    label: () => t('common.word.sub_member_list'),
    component: SubMemberList,
    levels: [1, 2, 3, 4, 5],
  },
  {
    key: 'loginHistory',
    label: () => t('common.word.login_information'),
    component: LoginHistory,
  },
]);

const afterClose = () => {
  activeKey.value = 'memberInformation';
};
</script>

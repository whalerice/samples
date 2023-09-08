<template>
  <a-layout-header>
    <a-button type="collapse" ghost @click="collapsed = !collapsed">
      <template #icon>
        <component :is="collapsed ? MenuUnfoldOutlined : MenuFoldOutlined" />
      </template>
    </a-button>
    <a-tabs v-model:activeKey="activeKey" :destroyInactiveTabPane="true">
      <template v-for="item in btnList">
        <a-tab-pane :key="item.key" v-if="item.role.indexOf(role) !== -1">
          <template #tab>
            <span @click="visibility[item.key] = true">
              {{ item.label() }}
              <component :is="item.component" />
              <span class="value">: {{ item.value }}</span>
            </span>
          </template>

          <component
            :is="item.component"
            :show="visibility[item.key]"
            @update:show="updateVisible(item.key, $event)"
          />
        </a-tab-pane>
      </template>
    </a-tabs>

    <a-button ghost @click="logout" danger class="btn-logout">
      <template #icon><LogoutOutlined /></template>
    </a-button>
  </a-layout-header>

  <a-page-header>
    <template #title>
      <component :is="currentRoute.meta.icon" />
      {{ $t(currentRoute.meta.title) }}
    </template>

    <template #extra>
      <a-space>
        <TranslateLanguage />
        <ThemeSwitch />
        <NavFab />
      </a-space>
    </template>
  </a-page-header>
</template>

<script setup lang="ts">
import NavFab from '@/components/nav/NavFab.vue';
import ThemeSwitch from '@/components/ThemeSwitch.vue';
import TranslateLanguage from '@/components/TranslateLanguage.vue';
import CreateAgentModal from '@/components/modal/CreateAgentModal.vue';
import PartnerModal from '@/components/modal/PartnerModal.vue';
import WithdrawalModal from '@/components/modal/WithdrawalModal.vue';
import SettlementModal from '@/components/modal/SettlementModal.vue';
import InvestmentModal from '@/components/modal/InvestmentModal.vue';
import WalletBalanceModal from '@/components/modal/WalletBalanceModal.vue';
import SettlementLosingModal from '@/components/modal/SettlementLosingModal.vue';
import { LocalStorage } from 'quasar';
import { computed, onMounted, ref } from 'vue';

import {
  DollarOutlined,
  UserAddOutlined,
  WalletOutlined,
  LineChartOutlined,
  TeamOutlined,
  SwapOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  LogoutOutlined,
  TransactionOutlined,
} from '@ant-design/icons-vue';
import { useRouter } from 'vue-router';
import { role, comma } from '@/boot/global';
import { roleNames } from '@/router/routes';
import { useI18n } from 'vue-i18n';
import { api } from '@/boot/axios';

const props = defineProps({
  collapsed: { type: Boolean },
});

const emits = defineEmits(['update:collapsed']);

const collapsed = computed({
  get() {
    return props.collapsed;
  },
  set(val) {
    emits('update:collapsed', val);
  },
});

const { t } = useI18n();
const router = useRouter();
const currentRoute = router.currentRoute;

const activeKey = ref<string>('1');

const visibility = ref<Record<string, boolean>>({});
const summaryCount = ref<any>();

const updateVisible = async (key: string, value: boolean) => {
  visibility.value[key] = value;

  await load();
  eachLoad();
};

const btnList = computed((): IHeaderButtonInformation[] => [
  {
    key: 'requestPartner',
    label: () => t('common.word.request_partner'),
    component: PartnerModal,
    icon: UserAddOutlined,
    value: comma(summaryCount.value?.partner),
    role: [roleNames.master],
  },
  {
    key: 'partnerWithdrawalRequest',
    label: () => t('common.word.partner_withdrawal_request'),
    component: WithdrawalModal,
    icon: TransactionOutlined,
    value: comma(summaryCount.value?.investmentTransactionRequest),
    role: [roleNames.master],
  },
  {
    key: 'requestSettlement',
    label: () => t('common.word.request_settlement'),
    component: SettlementModal,
    icon: SwapOutlined,
    value: comma(summaryCount.value?.settlement),
    role: [roleNames.partner, roleNames.agent],
  },
  {
    key: 'createAgent',
    label: () => t('common.word.create_agent'),
    component: CreateAgentModal,
    icon: TeamOutlined,
    value: comma(summaryCount.value?.agent),
    role: [roleNames.partner],
  },
  {
    key: 'investmentStatus',
    label: () => t('route.title.investment_status'),
    component: InvestmentModal,
    icon: LineChartOutlined,
    value:
      role === roleNames.partner
        ? `${comma(summaryCount.value?.investment.balance)} / ${comma(
            summaryCount.value?.investment.originalBalance
          )} (${t('common.word.step_number', { number: step.value })})`
        : 0,
    role: [roleNames.partner],
  },
  {
    key: 'walletBalance',
    label: () => t('common.word.wallet_balance'),
    component: WalletBalanceModal,
    icon: WalletOutlined,
    value: role === roleNames.partner ? comma(summaryCount.value?.wallet) : 0,
    role: [roleNames.partner],
    load: async () => {
      const data = await api.auto.wallet.getWallets();
      wallets.value = data;
    },
  },
  {
    key: 'settlementAmountLosing',
    label: () => t('common.word.settlement_amount'),
    component: SettlementLosingModal,
    icon: DollarOutlined,
    value:
      role === roleNames.agent
        ? comma(summaryCount.value?.settlementBalance)
        : 0,
    role: [roleNames.agent],
  },
]);

const step = ref(0);
const wallets = ref<IWallet[]>([]);

const logout = () => {
  LocalStorage.remove('token');
  location.reload();
};

const load = async () => {
  summaryCount.value = await api.auto.summary.top();

  switch (role) {
    case roleNames.master:
      {
      }
      break;

    case roleNames.partner:
      {
      }
      break;

    case roleNames.agent:
      {
        Object.values(summaryCount.value.investment.stepCounts).map(
          (e: any, i) => (e > 0 ? (step.value = i) : 0)
        );
      }
      break;
  }
};

const eachLoad = () => {
  for (let i in btnList.value) {
    const item = btnList.value[i];
    if (item.role.indexOf(role) !== -1) {
      item.load && item.load();
    }
  }
};

onMounted(async () => {
  await load();

  for (let i in btnList.value) {
    const item = btnList.value[i];
    visibility.value[item.key] = false;
  }

  eachLoad();
});
</script>

import { RouteRecordRaw } from 'vue-router';
import { LocalStorage } from 'quasar';
import {
  DesktopOutlined,
  UserOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  SwapOutlined,
  FieldTimeOutlined,
  SolutionOutlined,
  SisternodeOutlined,
  PoundCircleOutlined,
  UserSwitchOutlined,
  TeamOutlined,
  NotificationOutlined,
  WalletOutlined,
  DollarOutlined,
} from '@ant-design/icons-vue';

const master = 'Administrator';
const partner = 'Partners';
const agent = 'Agents';

const roles = {
  all: [master, partner, agent],
  manager: [master],
  master: [master],
  partner: [partner],
  agent: [agent],
};

const roleNames = { master, partner, agent };

declare module 'vue-router' {
  interface RouteMeta {
    title: string;
    icon?: any;
    auth: string[];
  }
}

const token = LocalStorage.getItem('token');

const menus: RouteRecordRaw[] = [
  {
    name: 'reward-management',
    path: 'reward-management',
    component: () => import('@/pages/RewardManagementPage.vue'),
    meta: {
      title: 'route.title.reserve_management',
      icon: DollarOutlined,
      auth: [agent],
    },
  },
  {
    name: 'investment-status',
    path: 'investment-status',
    component: () => import('@/pages/InvestmentStatusPage.vue'),
    meta: {
      title: 'route.title.investment_status',
      icon: DollarOutlined,
      auth: [partner],
    },
  },
  {
    name: 'partner-status',
    path: 'partner-status',
    component: () => import('@/pages/PartnerStatusPage.vue'),
    meta: {
      title: 'route.title.partner_status',
      icon: UserOutlined,
      auth: [master],
    },
  },
  {
    name: 'partner-transaction-status',
    path: 'partner-transaction-status',
    component: () => import('@/pages/PartnerTransactionStatusPage.vue'),
    meta: {
      title: 'route.title.partner_deposit_withdrawal_status',
      icon: UserSwitchOutlined,
      auth: [master],
    },
  },
  {
    name: 'daily-status',
    path: 'daily-status',
    component: () => import('@/pages/DailyStatusPage.vue'),
    meta: {
      title: 'route.title.daily_status',
      icon: FieldTimeOutlined,
      auth: [master, partner, agent],
    },
  },
  {
    name: 'member-management-operator',
    path: 'member-management-operator',
    component: () => import('@/pages/MemberManagementPage.vue'),
    meta: {
      title: 'route.title.member_management_operator',
      icon: SolutionOutlined,
      auth: [master, partner, agent],
      type: 'operator',
    },
  },
  {
    name: 'member-management-user',
    path: 'member-management-user',
    component: () => import('@/pages/MemberManagementPage.vue'),
    meta: {
      title: 'route.title.member_management_user',
      icon: SolutionOutlined,
      auth: [master, partner, agent],
      type: 'user',
    },
  },
  {
    name: 'member-structure',
    path: 'member-structure',
    component: () => import('@/pages/MemberStructurePage.vue'),
    meta: {
      title: 'route.title.member_structure',
      icon: SisternodeOutlined,
      auth: [master, partner, agent],
    },
  },
  {
    name: 'settlement-management',
    path: 'settlement-management',
    component: () => import('@/pages/SettlementManagementPage.vue'),
    meta: {
      title: 'route.title.settlement_management',
      icon: SwapOutlined,
      auth: [master, partner, agent],
    },
  },
  {
    name: 'losing-reward-management',
    path: 'losing-reward-management',
    component: () => import('@/pages/LosingRewardManagementPage.vue'),
    meta: {
      title: 'route.title.losing_reserve_management',
      icon: PoundCircleOutlined,
      auth: [master, partner, agent],
    },
  },
  {
    name: 'game-management-partner',
    path: 'game-management-partner',
    component: () => import('@/pages/GameManagementPartnerPage.vue'),
    meta: {
      title: 'route.title.game_management_partner',
      icon: TeamOutlined,
      auth: [master],
    },
  },
  {
    name: 'game-management-agent',
    path: 'game-management-agent',
    component: () => import('@/pages/GameManagementAgentPage.vue'),
    meta: {
      title: 'route.title.game_management_agent',
      icon: TeamOutlined,
      auth: [master, partner, agent],
    },
  },
  {
    name: 'game-management-user',
    path: 'game-management-user',
    component: () => import('@/pages/GameManagementUserPage.vue'),
    meta: {
      title: 'route.title.game_management_user',
      icon: TeamOutlined,
      auth: [master, partner, agent],
    },
  },
  {
    name: 'settings',
    path: 'settings',
    component: () => import('@/pages/SettingPage.vue'),
    meta: {
      title: 'route.title.setting',
      icon: SettingOutlined,
      auth: [master],
    },
  },
  {
    name: 'wallet',
    path: 'wallet',
    component: () => import('@/pages/WalletPage.vue'),
    meta: {
      title: 'route.title.wallet',
      icon: WalletOutlined,
      auth: [partner],
    },
  },
  {
    name: 'customer-inquiry',
    path: 'customer-inquiry',
    component: () => import('@/pages/CustomerInquiryPage.vue'),
    meta: {
      title: 'common.word.customer_inquiry',
      icon: InfoCircleOutlined,
      auth: [master, partner],
    },
  },
  {
    name: 'notice',
    path: 'notice',
    component: () => import('@/pages/NoticePage.vue'),
    meta: {
      title: 'route.title.notice',
      icon: NotificationOutlined,
      auth: [master, partner],
    },
  },
];

const routes: RouteRecordRaw[] = [
  {
    path: '/',

    component: () => {
      if (token) {
        return import('@/layouts/MainLayout.vue');
      } else {
        return import('@/layouts/SignInLayout.vue');
      }
    },

    beforeEnter: (to, from, next) => {
      if (!token && to.name !== 'main') {
        next({ name: 'main' });
        return;
      }

      next();
    },

    children: [
      {
        name: 'main',
        path: '',
        meta: {
          title: 'route.title.dashboard',
          icon: DesktopOutlined,
          auth: [master, partner, agent],
        },

        component: () => {
          const token = LocalStorage.getItem('token');
          if (token) {
            return import('@/pages/DashboardPage.vue');
          } else {
            return import('@/pages/SignInPage.vue');
          }
        },
      },
      ...(token ? menus : []),
    ],
  },

  {
    path: '/:catchAll(.*)*',
    redirect: '/',
  },
];

export default routes;
export { menus, roles, roleNames };

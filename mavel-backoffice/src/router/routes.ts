import { RouteRecordRaw } from 'vue-router';
import {
  DesktopOutlined,
  UserOutlined,
  SettingOutlined,
  GiftOutlined,
  RocketOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  SwapOutlined,
  ThunderboltOutlined,
  CrownOutlined,
  DollarCircleOutlined,
  SolutionOutlined,
} from '@ant-design/icons-vue';
import { userType } from 'src/boot/global';

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth: boolean;
    title: string;
    icon?: any;
    name?: string;
    queryPage?: boolean;
    type?: string;
    grade?: number[];
    rewardType?: number;
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: userType.Manager,
    component: () => import('layouts/Layout.vue'),
    meta: { requiresAuth: true, title: '', type: userType.Manager },
    children: [
      {
        path: '/',
        name: 'Dashboard',
        meta: { requiresAuth: true, title: 'nav.dashboard', icon: DesktopOutlined },
        component: () => import('pages/manager/Dashboard.vue'),
      },
      {
        path: '/member',
        name: 'Member',
        meta: { requiresAuth: true, title: 'nav.member', icon: UserOutlined },
        redirect: '/member/management',
        children: [
          {
            path: '/member/management',
            name: 'Management',
            meta: { requiresAuth: true, title: 'nav.management' },
            component: () => import('pages/manager/member/Management.vue'),
          },
          {
            path: '/member/structure',
            name: 'Structure',
            meta: { requiresAuth: true, title: 'nav.structure' },
            component: () => import('pages/manager/member/Structure.vue'),
          },
          {
            path: '/member/application',
            name: 'Application',
            meta: { requiresAuth: true, title: 'nav.application' },
            component: () => import('pages/manager/member/Application.vue'),
          },
          {
            path: '/member/blocklist',
            name: 'BlockList',
            meta: { requiresAuth: true, title: 'nav.blocklist' },
            component: () => import('pages/manager/member/BlockList.vue'),
          },
        ],
      },
      {
        path: '/status-daily',
        name: 'StatusDaily',
        meta: { requiresAuth: true, title: 'nav.status_daily', icon: HistoryOutlined },
        component: () => import('pages/manager/status/Daily.vue'),
      },
      {
        path: '/settlement',
        name: 'RewardSettlement',
        meta: { requiresAuth: true, title: 'nav.settlement', icon: CrownOutlined },
        redirect: '/settlement/rolling',
        children: [
          {
            path: '/settlement/rolling',
            name: 'RewardSettlementRolling',
            meta: { requiresAuth: true, title: 'nav.rolling' },
            component: () => import('pages/manager/settlement/Rolling.vue'),
          },
          {
            path: '/settlement/losing',
            name: 'RewardSettlementLosing',
            meta: { requiresAuth: true, title: 'nav.losing' },
            component: () => import('pages/manager/settlement/Losing.vue'),
          },
        ],
      },
      {
        path: '/charging',
        name: 'Charging',
        meta: { requiresAuth: true, title: 'nav.charging', icon: ThunderboltOutlined },
        component: () => import('pages/manager/Charging.vue'),
      },
      {
        path: '/exchange',
        name: 'Exchange',
        meta: { requiresAuth: true, title: 'nav.exchange', icon: SwapOutlined },
        component: () => import('pages/manager/Exchange.vue'),
      },
      {
        path: '/cash',
        name: 'Cash',
        meta: { requiresAuth: true, title: 'nav.cash', icon: DollarCircleOutlined },
        component: () => import('pages/manager/Cash.vue'),
      },
      {
        path: '/point',
        name: 'Point',
        meta: { requiresAuth: true, title: 'nav.point', icon: GiftOutlined },
        component: () => import('pages/manager/Point.vue'),
      },
      {
        path: '/betting',
        name: 'Betting',
        meta: { requiresAuth: true, title: 'nav.betting', icon: SolutionOutlined },
        component: () => import('pages/manager/Betting.vue'),
      },
      {
        path: '/games',
        name: 'GameManagement',
        meta: { requiresAuth: true, title: 'nav.game_management', icon: RocketOutlined },
        redirect: '/games/list',
        children: [
          {
            path: '/games/list',
            name: 'GamesList',
            meta: { requiresAuth: true, title: 'nav.game_list' },
            component: () => import('pages/manager/games/GameList.vue'),
          },
          {
            path: '/games/designation',
            name: 'GamesDesignation',
            meta: { requiresAuth: true, title: 'nav.game_designation' },
            component: () => import('pages/manager/games/Designation.vue'),
          },
          {
            path: '/games/vendor',
            name: 'GamesVendor',
            meta: { requiresAuth: true, title: 'nav.vendor' },
            component: () => import('pages/manager/games/Vendor.vue'),
          },
        ],
      },
      {
        path: '/support',
        name: 'Support',
        meta: { requiresAuth: true, title: 'nav.support', icon: InfoCircleOutlined },
        redirect: '/support/notice',
        children: [
          {
            path: '/support/notice',
            name: 'SupportNotice',
            meta: { requiresAuth: true, title: 'nav.notice_faq' },
            component: () => import('pages/manager/support/Notice.vue'),
          },
          {
            path: '/support/inquiry-note',
            name: 'SupportInquiryNote',
            meta: { requiresAuth: true, title: 'nav.inquiry_note' },
            component: () => import('pages/manager/support/InquiryNote.vue'),
          },
          {
            path: '/support/promotion',
            name: 'SupportPromotionList',
            meta: { requiresAuth: true, title: 'nav.promotion' },
            component: () => import('pages/manager/support/PromotionList.vue'),
          },
        ],
      },
      {
        path: '/setting',
        name: 'Setting',
        meta: { requiresAuth: true, title: 'nav.setting', icon: SettingOutlined },
        redirect: '/setting/site',
        children: [
          {
            path: '/setting/site',
            name: 'SettingSite',
            meta: { requiresAuth: true, title: 'nav.site' },
            component: () => import('pages/manager/setting/Site.vue'),
          },
          {
            path: '/setting/payment',
            name: 'SettingPayment',
            meta: { requiresAuth: true, title: 'nav.payment' },
            component: () => import('pages/manager/setting/Payments.vue'),
          },
          {
            path: '/setting/product',
            name: 'SettingProductList',
            meta: { requiresAuth: true, title: 'nav.product_list' },
            component: () => import('pages/manager/setting/ProductList.vue'),
          },
          {
            path: '/setting/solution',
            name: 'SettingSolutionList',
            meta: { requiresAuth: true, title: 'nav.solution_list', grade: [0] },
            component: () => import('pages/manager/setting/SolutionList.vue'),
          },
          {
            path: '/setting/manager',
            name: 'SettingManagerList',
            meta: { requiresAuth: true, title: 'nav.manager' },
            component: () => import('pages/manager/setting/ManagerList.vue'),
          },
          {
            path: '/setting/resource',
            name: 'SettingResourceList',
            meta: { requiresAuth: true, title: 'nav.resource', grade: [0] },
            component: () => import('pages/manager/setting/ResourceList.vue'),
          },
        ],
      },
      {
        path: '/member/details/:idx',
        name: 'MemberDetails',
        meta: { requiresAuth: true, queryPage: true, title: '', icon: UserOutlined },
        component: () => import('pages/manager/member/MemberDetails.vue'),
        children: [
          {
            path: '',
            name: 'UserInfo',
            meta: { requiresAuth: true, queryPage: true, title: 'tab.title.member_info' },
            component: () => import('components/member/UserInfo.vue'),
          },
          {
            path: 'reward',
            name: 'UserReward',
            meta: { requiresAuth: true, queryPage: true, title: 'tab.title.settlement_set' },
            component: () => import('components/member/UserReward.vue'),
          },
          {
            path: 'betting-history',
            name: 'BettingHistory',
            meta: { requiresAuth: true, queryPage: true, title: 'tab.title.betting_history' },
            component: () => import('components/member/BettingHistory.vue'),
          },
          {
            path: 'settlement-history',
            name: 'SettlementHistory',
            meta: { requiresAuth: true, queryPage: true, title: 'tab.title.settlement_history' },
            component: () => import('components/member/SettlementHistory.vue'),
          },
          {
            path: 'rolling-history',
            name: 'RollingHistory',
            meta: { requiresAuth: true, queryPage: true, title: 'tab.title.rolling_history' },
            component: () => import('components/member/RollingHistory.vue'),
          },
          {
            path: 'losing-history',
            name: 'LosingHistory',
            meta: { requiresAuth: true, queryPage: true, title: 'tab.title.losing_history' },
            component: () => import('components/member/LosingHistory.vue'),
          },
          {
            path: 'point-history',
            name: 'PointHistory',
            meta: { requiresAuth: true, queryPage: true, title: 'tab.title.point_history' },
            component: () => import('components/member/PointHistory.vue'),
          },
          {
            path: 'cash-history',
            name: 'CashHistory',
            meta: { requiresAuth: true, queryPage: true, title: 'tab.title.cash_history' },
            component: () => import('components/member/CashHistory.vue'),
          },
          {
            path: 'submember-list',
            name: 'SubMemberList',
            meta: { requiresAuth: true, queryPage: true, title: 'tab.title.sub_member_list' },
            component: () => import('components/member/SubMemberList.vue'),
          },
        ],
      },
    ],
  },
  {
    path: '/p',
    name: userType.Partner,
    component: () => import('layouts/Layout.vue'),
    meta: { requiresAuth: true, title: '', type: userType.Partner },
    children: [
      {
        path: '/p',
        name: 'PartnerDashboard',
        meta: { requiresAuth: true, title: 'nav.dashboard', icon: DesktopOutlined },
        component: () => import('pages/partner/Dashboard.vue'),
      },
      {
        path: '/p/member',
        name: 'PartnerMember',
        meta: { requiresAuth: true, title: 'nav.member', icon: UserOutlined },
        redirect: '/member/management',
        children: [
          {
            path: '/p/member/management',
            name: 'PartnerManagement',
            meta: { requiresAuth: true, title: 'nav.management' },
            component: () => import('pages/partner/member/Management.vue'),
          },
          {
            path: '/p/member/structure',
            name: 'PartnerStructure',
            meta: { requiresAuth: true, title: 'nav.structure' },
            component: () => import('pages/partner/member/Structure.vue'),
          },
        ],
      },
      {
        path: '/p/status-daily',
        name: 'PartnerStatusDaily',
        meta: { requiresAuth: true, title: 'nav.status_daily', icon: HistoryOutlined },
        component: () => import('pages/partner/status/Daily.vue'),
      },
      {
        path: '/p/settlement',
        name: 'PartnerRewardSettlement',
        meta: { requiresAuth: true, title: 'nav.settlement', icon: CrownOutlined },
        redirect: '/p/settlement/rolling',
        children: [
          {
            path: '/p/settlement/rolling',
            name: 'PartnerRewardSettlementRolling',
            meta: { requiresAuth: true, title: 'nav.rolling', rewardType: 1 },
            component: () => import('pages/partner/settlement/Rolling.vue'),
          },
          {
            path: '/p/settlement/losing',
            name: 'PartnerRewardSettlementLosing',
            meta: { requiresAuth: true, title: 'nav.losing', rewardType: 2 },
            component: () => import('pages/partner/settlement/Losing.vue'),
          },
        ],
      },
      {
        path: '/p/cash',
        name: 'PartnerCash',
        meta: { requiresAuth: true, title: 'nav.cash', icon: DollarCircleOutlined },
        component: () => import('pages/partner/Cash.vue'),
      },
      {
        path: '/p/point',
        name: 'PartnerPoint',
        meta: { requiresAuth: true, title: 'nav.point', icon: GiftOutlined },
        component: () => import('pages/partner/Point.vue'),
      },
      {
        path: '/p/betting',
        name: 'PartnerBetting',
        meta: { requiresAuth: true, title: 'nav.betting', icon: SolutionOutlined },
        component: () => import('pages/partner/Betting.vue'),
      },
      {
        path: '/p/member/details/:idx',
        name: 'PartnerMemberDetails',
        meta: { requiresAuth: true, queryPage: true, title: '', icon: UserOutlined },
        component: () => import('pages/partner/member/MemberDetails.vue'),
        children: [
          {
            path: '',
            name: 'PartnerUserInfo',
            meta: { requiresAuth: true, queryPage: true, title: 'tab.title.member_info' },
            component: () => import('components/member/UserInfo.vue'),
          },
          {
            path: 'reward',
            name: 'PartnerUserReward',
            meta: { requiresAuth: true, queryPage: true, title: 'tab.title.settlement_set' },
            component: () => import('components/member/UserReward.vue'),
          },
          {
            path: 'betting-history',
            name: 'PartnerBettingHistory',
            meta: { requiresAuth: true, queryPage: true, title: 'tab.title.betting_history' },
            component: () => import('components/member/BettingHistory.vue'),
          },
          {
            path: 'settlement-history',
            name: 'PartnerSettlementHistory',
            meta: { requiresAuth: true, queryPage: true, title: 'tab.title.settlement_history' },
            component: () => import('components/member/SettlementHistory.vue'),
          },
          {
            path: 'point-history',
            name: 'PartnerPointHistory',
            meta: { requiresAuth: true, queryPage: true, title: 'tab.title.point_history' },
            component: () => import('components/member/PointHistory.vue'),
          },
          {
            path: 'cash-history',
            name: 'PartnerCashHistory',
            meta: { requiresAuth: true, queryPage: true, title: 'tab.title.cash_history' },
            component: () => import('components/member/CashHistory.vue'),
          },
          {
            path: 'login-info',
            name: 'PartnerUserLoginInfo',
            meta: { requiresAuth: true, queryPage: true, title: 'tab.title.login_info' },
            component: () => import('components/member/UserLoginInfo.vue'),
          },
        ],
      },
    ],
  },
  {
    path: '/sign-in',
    name: 'SignIn',
    component: () => import('pages/SignIn.vue'),
    meta: { requiresAuth: false, title: 'Sign In' },
  },
  {
    path: '/:catchAll(.*)*',
    redirect: '/',
    meta: { requiresAuth: false, title: '' },
    // component: () => import('pages/NotFound.vue'),
  },
];

export default routes;

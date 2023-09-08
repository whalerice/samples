import { RouteRecordRaw } from 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    title: string;
    icon?: string;
    activeIcon?: string;
    name?: string;
    topNav?: boolean;
    bottomNav?: boolean;
    requiresAuth?: boolean;
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('pages/Home.vue'),
    meta: {
      requiresAuth: false,
      title: 'nav.home',
      icon: 'svguse:/icons.svg#custom-house',
      activeIcon: 'img:/icons/active-icons/house-active.svg',
      topNav: true,
    },
  },
  {
    path: '/slot',
    component: () => import('pages/Slot.vue'),
    meta: {
      requiresAuth: false,
      title: 'nav.slots',
      icon: 'svguse:/icons.svg#custom-puzzle',
      activeIcon: 'img:/icons/active-icons/puzzle-active.svg',
      topNav: true,
    },
  },
  {
    path: '/live-casino',
    component: () => import('pages/LiveCasino.vue'),
    meta: {
      requiresAuth: false,
      title: 'nav.livecasino',
      icon: 'svguse:/icons.svg#custom-chip',
      activeIcon: 'img:/icons/active-icons/chip-active.svg',
      topNav: true,
    },
  },
  {
    path: '/promotion',
    component: () => import('pages/promotion/Promotion.vue'),
    meta: {
      requiresAuth: false,
      title: 'nav.promotion',
      icon: 'svguse:/icons.svg#custom-present',
      activeIcon: 'img:/icons/active-icons/present-active.svg',
      topNav: true,
    },
  },
  {
    path: '/promotion/detail/:idx',
    name: 'PromotionDetails',
    component: () => import('pages/promotion/PromotionDetail.vue'),
    meta: {
      requiresAuth: false,
      title: 'nav.promotion',
      icon: 'svguse:/icons.svg#custom-present',
      activeIcon: 'img:/icons/active-icons/present-active.svg',
    },
  },
  {
    path: '/how',
    component: () => import('pages/HowToPlay.vue'),
    meta: {
      requiresAuth: false,
      title: 'nav.how_to_play',
      icon: 'svguse:/icons.svg#custom-game',
      activeIcon: 'img:/icons/active-icons/game-active.svg',
      bottomNav: true,
    },
  },

  {
    path: '/account',
    component: () => import('pages/Account.vue'),
    meta: {
      requiresAuth: true,
      title: 'nav.account',
      icon: 'svguse:/icons.svg#custom-account',
      activeIcon: 'img:/icons/active-icons/account-active.svg',
      bottomNav: true,
    },
    children: [
      {
        path: '/account',
        component: () => import('pages/account/MyProfile.vue'),
        meta: {
          requiresAuth: true,
          title: 'tab.title.my_profile',
          icon: 'account_balance_wallet',
          name: 'balance',
        },
      },
      {
        path: '/account/payment-history',
        component: () => import('pages/account/PaymentHistory.vue'),
        meta: {
          requiresAuth: true,
          title: 'tab.title.payment_history',
          icon: 'credit_card',
          name: 'payment',
        },
      },
      {
        path: '/account/betting-history',
        component: () => import('pages/account/BettingHistory.vue'),
        meta: { requiresAuth: true, title: 'tab.title.betting_history', icon: 'casino', name: 'betting-history' },
      },
      {
        path: '/account/point-history',
        component: () => import('pages/account/PointHistory.vue'),
        meta: { requiresAuth: true, title: 'tab.title.point_history', icon: 'casino', name: 'point-history' },
      },
      {
        path: '/account/cash-history',
        component: () => import('pages/account/CashHistory.vue'),
        meta: { requiresAuth: true, title: 'tab.title.cash_history', icon: 'casino', name: 'cash-history' },
      },
      {
        path: '/account/message-history',
        component: () => import('pages/account/MessageHistory.vue'),
        meta: { requiresAuth: true, title: 'tab.title.message_history', icon: 'casino', name: 'message-history' },
      },
    ],
  },
  {
    path: '/sp',
    component: () => import('pages/SecurityPrivacy.vue'),
    meta: {
      requiresAuth: false,
      title: 'nav.sp',
      icon: 'svguse:/icons.svg#custom-shield',
      activeIcon: 'img:/icons/active-icons/shield-active.svg',
      bottomNav: true,
    },
  },
  {
    path: '/faq',
    component: () => import('pages/Faq.vue'),
    meta: {
      requiresAuth: false,
      title: 'nav.faq',
      icon: 'svguse:/icons.svg#custom-help',
      activeIcon: 'img:/icons/active-icons/help-active.svg',
      bottomNav: true,
    },
  },
  {
    path: '/notice',
    component: () => import('pages/notice/Notice.vue'),
    meta: {
      requiresAuth: false,
      title: 'nav.notice',
      icon: 'svguse:/icons.svg#custom-notice',
      activeIcon: 'img:/icons/active-icons/notice-active.svg',
      bottomNav: true,
    },
  },
  {
    path: '/notice/detail/:idx',
    name: 'NoticeDetails',
    component: () => import('pages/notice/NoticeDetail.vue'),
    meta: {
      requiresAuth: false,
      title: 'nav.notice',
      icon: 'svguse:/icons.svg#custom-notice',
      activeIcon: 'img:/icons/active-icons/notice-active.svg',
    },
  },
  {
    path: '/affiliate',
    component: () => import('pages/Affiliate.vue'),
    meta: {
      requiresAuth: false,
      title: 'nav.affiliate',
      icon: 'svguse:/icons.svg#custom-affiliate',
      activeIcon: 'img:/icons/active-icons/affiliate-active.svg',
      bottomNav: true,
    },
  },
  {
    path: '/checking',
    component: () => import('pages/SiteCheck.vue'),
    meta: {
      requiresAuth: false,
      title: 'nav.checking',
    },
  },
  {
    path: '/:catchAll(.*)*',
    redirect: '/',
    meta: {
      title: 'nav.not.found',
    },
    // component: () => import('pages/NotFound.vue'),
  },
];

export default routes;

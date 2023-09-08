import { createRouter, createWebHistory } from 'vue-router';
import { auth, admin, manager, partner, seller } from '@/assets/js/global.js';
import {
  UserOutlined,
  HomeOutlined,
  WalletOutlined,
  ShopOutlined,
  SoundOutlined,
  SolutionOutlined,
  DollarCircleOutlined,
  BarChartOutlined,
  CreditCardOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  CalendarOutlined,
  MessageOutlined,
} from '@ant-design/icons-vue';

const routes = [
  {
    path: '/',
    component: () => import('@/views/Home.vue'),
    meta: { needLogin: true },
    children: [
      {
        path: '/',
        name: 'Dashboard',
        meta: {
          title: 'nav.home',
          icon: HomeOutlined,
          grade: [...admin, ...manager, ...partner, ...seller],
        },
        component: () => import('@/views/dashboard/Index.vue'),
      },
      {
        path: '/manager/member/',
        name: 'ManagerMember',
        meta: {
          title: 'nav.members',
          icon: UserOutlined,
          grade: [...admin, ...manager],
        },
        children: [
          {
            path: '/manager/member/wallet',
            name: 'ManagerMemberWallet',
            meta: {
              title: 'nav.wallet',
              icon: '',
            },
            component: () => import('@/views/manager/member/Wallet.vue'),
          },
          {
            path: '/manager/member/partner',
            name: 'ManagerMemberPartner',
            meta: {
              title: 'nav.partners',
              icon: '',
            },
            component: () => import('@/views/manager/member/Partners.vue'),
          },
          {
            path: '/manager/member/kyc',
            name: 'ManagerMemberKYC',
            meta: {
              title: 'nav.kyc',
              icon: '',
            },
            component: () => import('@/views/manager/member/KYC.vue'),
          },
        ],
      },
      {
        path: '/manager/wallet/',
        name: 'ManagerWallet',
        meta: {
          title: 'nav.wallet',
          icon: WalletOutlined,
          grade: [...admin, ...manager],
        },
        children: [
          {
            path: '/manager/wallet/transaction-history',
            name: 'ManagerWalletTransactionHistory',
            meta: {
              title: 'nav.transaction_history',
              icon: '',
            },
            component: () => import('@/views/manager/wallet/TransactionHistory.vue'),
          },
          {
            path: '/manager/wallet/external-transaction',
            name: 'ManagerWalletExternalTransaction',
            meta: {
              title: 'nav.external_transaction',
              icon: '',
            },
            component: () => import('@/views/manager/wallet/ExternalTransaction.vue'),
          },
          {
            path: '/manager/wallet/cpeso-deposit',
            name: 'ManagerWalletCpesoDeposit',
            meta: {
              title: 'nav.cpeso_deposit',
              icon: '',
            },
            component: () => import('@/views/manager/wallet/CpesoDeposit.vue'),
          },
          {
            path: '/manager/wallet/cpeso-withdrawal',
            name: 'ManagerWalletCpesoWithdrawal',
            meta: {
              title: 'nav.cpeso_withdraw',
              icon: '',
            },
            component: () => import('@/views/manager/wallet/CpesoWithdrawal.vue'),
          },
          {
            path: '/manager/wallet/dispute',
            name: 'ManagerWalletDispute',
            meta: {
              title: 'nav.dispute_adjustment',
              icon: '',
            },
            component: () => import('@/views/manager/wallet/Dispute.vue'),
          },
        ],
      },
      {
        path: '/manager/partner/',
        name: 'ManagerPartner',
        meta: {
          title: 'nav.partners',
          icon: ShopOutlined,
          grade: [...admin, ...manager],
        },
        children: [
          {
            path: '/manager/partner/deposit',
            name: 'ManagerPartnerDeposit',
            meta: {
              title: 'nav.deposit',
              icon: '',
            },
            component: () => import('@/views/manager/partner/Deposit.vue'),
          },
          {
            path: '/manager/partner/withdrawal',
            name: 'ManagerPartnerWithdrawal',
            meta: {
              title: 'nav.withdraw',
              icon: '',
            },
            component: () => import('@/views/manager/partner/Withdrawal.vue'),
          },
        ],
      },
      {
        path: '/customer',
        name: 'Customer',
        meta: {
          title: 'nav.customer_inquiries',
          icon: SolutionOutlined,
          grade: [...admin, ...manager],
        },
        component: () => import('@/views/manager/Customer.vue'),
      },
      {
        path: '/notice',
        name: 'Notice',
        meta: {
          title: 'nav.notice',
          icon: SoundOutlined,
          grade: [...admin, ...manager],
        },
        component: () => import('@/views/manager/Notice.vue'),
      },
      {
        path: '/hot-wallet',
        name: 'HotWallet',
        meta: {
          title: 'nav.hot_wallet',
          icon: DollarCircleOutlined,
          grade: [auth.Supervisor, auth.Supermaster],
        },
        component: () => import('@/views/manager/HotWallet.vue'),
      },

      //  partner nav-------------------------------------
      {
        path: '/partner/report',
        name: 'PartnerReport',
        meta: {
          title: 'nav.report',
          icon: BarChartOutlined,
          grade: [...partner],
        },
        component: () => import('@/views/partner/Report.vue'),
      },
      {
        path: '/partner/calendar',
        name: 'PartnerCalendar',
        meta: {
          title: 'nav.calendar',
          icon: CalendarOutlined,
          grade: [...partner],
        },
        component: () => import('@/views/partner/Calendar.vue'),
      },
      {
        path: '/partner/e-payment-history',
        name: 'PartnerPaymentHistoryEnterprise',
        meta: {
          title: 'datatable.thead.user_payment',
          icon: CreditCardOutlined,
          grade: [auth.Enterprise],
        },
        component: () => import('@/views/partner/paymentHistory/Enterprise.vue'),
      },

      {
        path: '/partner/e-withdrawal-request',
        name: 'PartnerWithdrawRequestEnterprise',
        meta: {
          title: 'nav.user_withdrawal',
          icon: MinusCircleOutlined,
          grade: [auth.Enterprise],
        },
        component: () => import('@/views/partner/withdrawRequest/Enterprise.vue'),
      },
      {
        path: '/partner/p-payment-history',
        name: 'PartnerPaymentHistoryPersonal',
        meta: {
          title: 'datatable.thead.user_payment',
          icon: PlusCircleOutlined,
          grade: [auth.Personal],
        },
        component: () => import('@/views/partner/paymentHistory/Personal.vue'),
      },
      {
        path: '/partner/p-withdraw-request',
        name: 'PartnerWithdrawRequestPersonal',
        meta: {
          title: 'nav.user_withdrawal',
          icon: MinusCircleOutlined,
          grade: [auth.Personal],
        },
        component: () => import('@/views/partner/withdrawRequest/Personal.vue'),
      },

      {
        path: '/partner/wallet',
        name: 'PartnerWallet',
        meta: {
          title: 'nav.wallet',
          icon: WalletOutlined,
          grade: [...partner],
        },
        component: () => import('@/views/partner/Wallet.vue'),
      },
      {
        path: '/partner/support',
        name: 'PartnerSupport',
        meta: {
          title: 'nav.support',
          icon: SolutionOutlined,
          grade: [...partner],
        },
        component: () => import('@/views/partner/Support.vue'),
      },
      {
        path: '/partner/otc-bay-add',
        name: 'PartnerOtcBayAdd',
        meta: {
          title: 'nav.otc_bay_add',
          icon: MessageOutlined,
          grade: [auth.Enterprise],
        },
        component: () => import('@/views/partner/OtcBayAdd.vue'),
      },
    ],
  },
  {
    path: '/sign-in',
    name: 'Sign In',
    component: () => import('@/views/SignIn.vue'),
    meta: { needLogin: false, ...admin, ...manager, ...partner, ...seller },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  linkExactActiveClass: 'active',
});

export default router;

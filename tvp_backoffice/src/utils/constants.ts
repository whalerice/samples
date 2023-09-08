import { CoinCode } from './enums';

export const depWitOptions: ISelectOptions[] = [
  {
    value: 0,
    label: 'common.word.withdrawal',
    key: 'common.word.withdrawal',
  },
  {
    value: 1,
    label: 'common.word.deposit',
    key: 'common.word.deposit',
  },
];

export const depWitStatusOptions: ISelectOptions[] = [
  {
    value: 0,
    label: 'common.word.proceeding',
    key: 'common.word.proceeding',
  },
  {
    value: 1,
    label: 'common.word.complete',
    key: 'common.word.complete',
  },
  {
    value: 2,
    label: 'common.word.refusal',
    key: 'common.word.refusal',
  },
];

export const depWitStatus3Options: ISelectOptions[] = [
  {
    value: 0,
    label: 'common.word.proceeding',
    key: 'common.word.proceeding',
  },
  {
    value: 1,
    label: 'common.word.complete',
    key: 'common.word.complete',
  },
  {
    value: 2,
    label: 'common.word.refusal',
    key: 'common.word.refusal',
  },
];

export const memberStatusOptions: ISelectOptions[] = [
  {
    value: 7,
    label: 'common.word.status_normal',
    key: 'common.word.status_normal',
  },
  {
    value: 6,
    label: 'common.word.status_stop',
    key: 'common.word.status_stop',
  },
];

export const gradeOptions: ISelectOptions[] = [
  {
    value: 1,
    label: 'common.word.agent1',
    key: 'common.word.agent1',
  },
  {
    value: 2,
    label: 'common.word.agent2',
    key: 'common.word.agent2',
  },
  {
    value: 3,
    label: 'common.word.agent3',
    key: 'common.word.agent3',
  },
  {
    value: 4,
    label: 'common.word.agent4',
    key: 'common.word.agent4',
  },
  {
    value: 5,
    label: 'common.word.agent5',
    key: 'common.word.agent5',
  },
  {
    value: 6,
    label: 'common.word.user',
    key: 'common.word.user',
  },
];

export const settlementMethodOptions: ISelectOptions[] = [
  {
    value: 1,
    label: 'common.word.losing',
    key: 'common.word.losing',
  },
];

export const roundOptions: ISelectOptions[] = [];

[...Array(1440)].map((_, i) => {
  roundOptions.push({
    value: i + 1,
    label: String(i + 1),
    key: String(i + 1),
  });
});

export const noticeCategory1Options: ISelectOptions2[] = [
  {
    value: 'all',
    label: 'common.word.all',
    key: 'common.word.all',
  },
  {
    value: 'partner',
    label: 'common.word.partner',
    key: 'common.word.partner',
  },
  {
    value: 'user',
    label: 'common.word.user',
    key: 'common.word.user',
  },
];
export const noticeCategory2Options: ISelectOptions2[] = [
  {
    value: 'notification',
    label: 'common.word.notification',
    key: 'common.word.notification',
  },
  {
    value: 'patch',
    label: 'common.word.patch',
    key: 'common.word.patch',
  },
  {
    value: 'important',
    label: 'common.word.important',
    key: 'common.word.important',
  },
  {
    value: 'news',
    label: 'common.word.news',
    key: 'common.word.news',
  },
  {
    value: 'eventS',
    label: 'common.word.event',
    key: 'common.word.event',
  },
];

export const noticeStatusOptions: ISelectOptions[] = [
  {
    value: 0,
    label: 'common.word.latest',
    key: 'common.word.latest',
  },
  {
    value: 1,
    label: 'common.word.post',
    key: 'common.word.post',
  },
  {
    value: 2,
    label: 'common.word.hide',
    key: 'common.word.hide',
  },
];
export const noticeDetailSearchOptions: ISelectOptions[] = [
  {
    value: 0,
    label: 'common.word.title',
    key: 'common.word.title',
  },
  {
    value: 1,
    label: 'common.word.id_name',
    key: 'common.word.id_name',
  },
];

export const walletSeparationOptions: ISelectOptions[] = [
  {
    value: 0,
    label: 'common.word.send',
    key: 'common.word.send',
  },
  {
    value: 1,
    label: 'common.word.receive',
    key: 'common.word.receive',
  },
  {
    value: 2,
    label: 'common.word.swap',
    key: 'common.word.swap',
  },
  {
    value: 3,
    label: 'common.word.withdrawal_pay',
    key: 'common.word.withdrawal_pay',
  },
  {
    value: 4,
    label: 'common.word.deposit_pay',
    key: 'common.word.deposit_pay',
  },
];
export const walletStatusOptions: ISelectOptions[] = [
  {
    value: 0,
    label: 'common.word.waiting_for_approval',
    key: 'common.word.waiting_for_approval',
  },
  {
    value: 1,
    label: 'common.word.waiting_for_transmission',
    key: 'common.word.waiting_for_transmission',
  },
  {
    value: 2,
    label: 'common.word.success',
    key: 'common.word.success',
  },
  {
    value: 3,
    label: 'common.word.fail',
    key: 'common.word.fail',
  },
  {
    value: 4,
    label: 'common.word.1st_approval_rejected',
    key: 'common.word.1st_approval_rejected',
  },
  {
    value: 5,
    label: 'common.word.2st_approval_rejected',
    key: 'common.word.2st_approval_rejected',
  },
];

export const detailSearchOptions: ISelectOptions[] = [
  {
    value: 0,
    label: 'common.word.title',
    key: 'common.word.title',
  },
  {
    value: 1,
    label: 'common.word.email',
    key: 'common.word.email',
  },
];

export const coinList: ICoinMap = {
  [CoinCode.BTC]: {
    value: CoinCode.BTC,
    label: 'BTC',
    fullName: 'Bitcoin',
  },
  [CoinCode.ETH]: {
    value: CoinCode.ETH,
    label: 'ETH',
    fullName: 'Ethereum',
  },
  [CoinCode.USDT]: {
    value: CoinCode.USDT,
    label: 'USDT',
    fullName: 'TetherUS',
  },
  [CoinCode.XRP]: {
    value: CoinCode.XRP,
    label: 'XRP',
    fullName: 'Ripple',
  },
  [CoinCode.TRX]: {
    value: CoinCode.TRX,
    label: 'TRX',
    fullName: 'Tron',
  },
  [CoinCode.CPESO]: {
    value: CoinCode.CPESO,
    label: 'CPESO',
    fullName: 'CPESO',
  },
};

export const inquiryStatusOptions: ISelectOptions[] = [
  {
    value: 0,
    label: 'common.word.request',
    key: 'common.word.request',
  },
  {
    value: 1,
    label: 'common.word.dev',
    key: 'common.word.dev',
  },
  {
    value: 2,
    label: 'common.word.customer_center',
    key: 'common.word.customer_center',
  },
  {
    value: 3,
    label: 'common.word.complete',
    key: 'common.word.complete',
  },
];

export const routeOptions: ISelectOptions[] = [
  {
    value: 0,
    label: 'common.word.web',
    key: 'common.word.web',
  },
  {
    value: 1,
    label: 'common.word.app',
    key: 'common.word.app',
  },
  {
    value: 2,
    label: 'common.word.franchise',
    key: 'common.word.franchise',
  },
];

export const inquiryCategory1Options: ISelectOptions[] = [
  {
    value: 0,
    label: 'common.word.cpass_wallet',
    key: 'common.word.cpass_wallet',
    child: [
      {
        value: 0,
        label: 'common.word.create_wallet',
        key: 'common.word.create_wallet',
        selected: false,
      },
      {
        value: 1,
        label: 'common.word.receive',
        key: 'common.word.receive',
        selected: false,
      },
      {
        value: 2,
        label: 'common.word.send',
        key: 'common.word.send',
        selected: false,
      },
      {
        value: 3,
        label: 'common.word.swap',
        key: 'common.word.swap',
        selected: false,
      },
      {
        value: 4,
        label: 'common.word.safety_transaction_dispute',
        key: 'common.word.safety_transaction_dispute',
        selected: false,
      },
      {
        value: 5,
        label: 'common.word.etc',
        key: 'common.word.etc',
        selected: false,
      },
    ],
  },
  {
    value: 1,
    label: 'common.word.cpass_payment',
    key: 'common.word.cpass_payment',
    child: [
      {
        value: 0,
        label: 'common.word.request_franchise',
        key: 'common.word.request_franchise',
        selected: false,
      },
      {
        value: 1,
        label: 'common.word.payment_history',
        key: 'common.word.payment_history',
        selected: false,
      },
      {
        value: 2,
        label: 'common.word.withdrawal',
        key: 'common.word.withdrawal',
        selected: false,
      },
      {
        value: 3,
        label: 'common.word.payment',
        key: 'common.word.payment',
        selected: false,
      },
      {
        value: 4,
        label: 'common.word.withdrawal_franchise',
        key: 'common.word.withdrawal_franchise',
        selected: false,
      },
      {
        value: 5,
        label: 'common.word.etc',
        key: 'common.word.etc',
        selected: false,
      },
    ],
  },
  {
    value: 2,
    label: 'common.word.tvp',
    key: 'common.word.tvp',
  },
];

export const inquiryTvpOptions: ISelectOptions[] = [
  {
    value: 0,
    label: 'common.word.tvp',
    key: 'common.word.tvp',
  },
];

export const optionList = {
  route: ['common.word.web', 'common.word.app', 'common.word.franchise'],
  inquiryCategory: {
    parent: [
      'common.word.cpass_wallet',
      'common.word.cpass_payment',
      'common.word.tvp',
    ],
    child: [
      'common.word.create_wallet',
      'common.word.receive',
      'common.word.send',
      'common.word.swap',
      'common.word.safety_transaction_dispute',
      'common.word.etc',
      'common.word.request_franchise',
      'common.word.payment_history',
      'common.word.withdrawal',
      'common.word.payment',
      'common.word.withdrawal_franchise',
      'common.word.etc',
      'common.word.tvp',
    ],
  },
  noticeCategory: {
    category1: ['common.word.all', 'common.word.partner', 'common.word.user'],
    category2: [
      'common.word.notification',
      'common.word.patch',
      'common.word.important',
      'common.word.news',
      'common.word.event',
    ],
  },
};

export const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

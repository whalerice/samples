import { boot } from 'quasar/wrappers';
import { exportFile } from 'quasar';
import {
  Role,
  UserStatus,
  RewardType,
  BlockType,
  BlockState,
  DefaultState,
  GameCategory,
  GameDesignation,
  UserType,
  CurrencyType,
  UseCategory,
  PaymentName,
  PromotionCategory,
  PromotionRewardType,
  FilterDefault,
  AuthorityLevel,
  AuthorityRW,
  ManagerStatus,
  PointUseType,
  PaymentType,
  GameResultType,
} from 'src/components/models/enums';
import type { SelectProps } from 'ant-design-vue';
import enUS from 'ant-design-vue/es/locale/en_US';
import koKR from 'ant-design-vue/es/locale/ko_KR';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import jaJP from 'ant-design-vue/es/locale/ja_JP';

const comma = (e: number | string) => {
  const num = String(e).split('.');
  num[0] = num[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return num.join('.');
};

// const parserNumber = (e: number | string) => {
//   return String(e).replace(/[^0-9]/g, '');
// };

const csvFile = (columns: any, rows: any, title: string) => {
  function wrapCsvValue(val: string | number | boolean, formatFn: any, row: object) {
    let formatted = formatFn !== void 0 ? formatFn(val, row) : val;

    formatted = formatted === void 0 || formatted === null ? '' : String(formatted);

    formatted = formatted.split('"').join('""');
    return `"${formatted}"`;
  }

  // naive encoding to csv format
  const thead = [columns.map((col: any) => col.label)];
  const text = rows.map((row: any) =>
    columns
      .map((col: any) =>
        wrapCsvValue(
          typeof col.field === 'function' ? col.field(row) : row[col.field === void 0 ? col.name : col.field],
          col.format,
          row,
        ),
      )
      .join(','),
  );

  const content = thead.concat(text).join('\r\n');

  exportFile(`${title}.csv`, content, 'text/csv');
};

const onTree = (list: any) => {
  const map: any = {};
  let node: any;
  const roots: any = [];
  let i: any;
  const idxList: any = [];

  for (i = 0; i < list.length; i += 1) {
    map[list[i].idx] = i; // initialize the map
    list[i].children = []; // initialize the children
    idxList.push(list[i].idx);
  }

  for (i = 0; i < list.length; i += 1) {
    node = list[i];
    const min = Math.min.apply(null, idxList);

    if (list[map[node.referral_Idx]] !== undefined && node.referral_Idx >= min) {
      list[map[node.referral_Idx]].children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
};

const useFilter = (use: number[], filterList: any[], custom?: any[]) => {
  const items: any[] = [];

  for (let i = 0; i < use.length; i++) {
    const el = use[i];
    items.push(filterList[el]);
  }
  if (custom !== undefined) {
    for (let i = 0; i < custom.length; i++) {
      const el = custom[i];
      items.push(el);
    }
  }

  return items;
};

const userType = { Manager: UserType.Manager, Partner: UserType.Partner };

const localeList: ILocaleList[] = [
  { value: 'en', label: 'English', flag: 'us', code: 'En', pack: enUS },
  { value: 'ko', label: 'Korean', flag: 'kr', code: 'Ko', pack: koKR },
  { value: 'zh', label: 'Chinese', flag: 'cn', code: 'Cn', pack: zhCN },
  { value: 'ja', label: 'Japanese', flag: 'jp', code: 'Jp', pack: jaJP },
  // { value: 'ph', label: 'Filipino', flag: 'ph', code: 'Ph' },
  // { value: 'th', label: 'Taiwanese', flag: 'th', code: 'Th' },
  // { value: 'ru', label: 'Russian', flag: 'ru', code: 'Ru' },
];
const pageOptions = [10, 15, 20, 25, 30];
const dateFormat = 'YYYY-MM-DD';
const pages = { sortBy: '', descending: true, page: 1, rowsPerPage: 10 };
const idRegex = /^[A-Za-z0-9]{6,16}$/;
const passwordRegex = /^.*(?=^.{6,16}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[~!@#$%^&*()=+|/:;?<>']).*$/;

const options: any = {};

export default boot(({ app }) => {
  const t = app.config.globalProperties.$t;

  const blockType: SelectProps['options'] = [
    { value: BlockType.ID, label: () => t('common.label.id') },
    { value: BlockType.IP, label: () => t('common.label.ip') },
  ];
  const blockState: SelectProps['options'] = [
    { value: BlockState.Block, label: () => t('common.label.block') },
    { value: BlockState.Unblock, label: () => t('common.label.unblock') },
  ];

  const rewardType: SelectProps['options'] = [
    // { value: RewardType.None, label: () => t('common.label.none') },
    { value: RewardType.Rolling, label: () => t('common.label.rolling') },
    { value: RewardType.Losing, label: () => t('common.label.losing') },
  ];
  const defaultState: SelectProps['options'] = [
    { value: DefaultState.Request, label: () => t('common.text.request') },
    { value: DefaultState.Approval, label: () => t('common.text.approval') },
    { value: DefaultState.Waiting, label: () => t('common.text.waiting') },
    { value: DefaultState.Refusal, label: () => t('common.text.refusal') },
    { value: DefaultState.Fail, label: () => t('common.text.failed') },
  ];

  const gameCategory: SelectProps['options'] = [
    { value: GameCategory.All, label: () => t('common.label.all') },
    { value: GameCategory.Casino, label: () => t('common.label.casino') },
    { value: GameCategory.Slot, label: () => t('common.label.slot') },
  ];

  const gameDesignation: SelectProps['options'] = [
    { value: GameDesignation.All, label: () => t('common.label.all') },
    { value: GameDesignation.Hot, label: () => t('common.label.hot') },
    { value: GameDesignation.Favorite, label: () => t('common.label.favorite') },
  ];

  const useCategory: SelectProps['options'] = [
    { value: UseCategory.Betting, label: () => t('common.text.betting') },
    { value: UseCategory.Exchange, label: () => t('common.text.exchange') },
    { value: UseCategory.PointSwitching, label: () => t('common.text.point_switching') },
    { value: UseCategory.Charging, label: () => t('common.text.charging') },
    { value: UseCategory.Reward, label: () => t('common.text.reward') },
    { value: UseCategory.AdminDeduct, label: () => t('common.text.admin_deduct') },
    { value: UseCategory.AdminProvide, label: () => t('common.text.admin_provide') },
    { value: UseCategory.UserTransferDeduct, label: () => t('common.text.user_transfer_deduct') },
    { value: UseCategory.UserTransferProvide, label: () => t('common.text.user_transfer_provide') },
    { value: UseCategory.ChargingCancel, label: () => t('common.text.charging_cancel') },
    { value: UseCategory.Calculate, label: () => t('common.text.calculate') },
    { value: UseCategory.BelowProvide, label: () => t('common.text.below_provide') },
    { value: UseCategory.BelowWithdraw, label: () => t('common.text.below_withdraw') },
  ];

  const pointUseType: SelectProps['options'] = [
    { value: PointUseType.CashSwitching, label: () => t('common.text.cash_switching') },
    { value: PointUseType.EventAcquiring, label: () => t('common.text.event_gain') },
    { value: PointUseType.AdminDeduct, label: () => t('common.text.admin_deduct') },
    { value: PointUseType.AdminProvide, label: () => t('common.text.admin_provide') },
    { value: PointUseType.BelowPointProvide, label: () => t('common.text.below_point_provide') },
    { value: PointUseType.BelowPointWithdraw, label: () => t('common.text.below_point_withdraw') },
  ];

  const role: SelectProps['options'] = [
    { value: Role.HeadOffice, label: () => t('role.head_office') },
    { value: Role.Subsidiary, label: () => t('role.subsidiary') },
    { value: Role.ExclusiveDistributor, label: () => t('role.exclusive_distributor') },
    { value: Role.Shop, label: () => t('role.shop') },
    { value: Role.User, label: () => t('role.user') },
  ];

  const userStatus: SelectProps['options'] = [
    { value: UserStatus.Normal, label: () => t('common.label.normal') },
    { value: UserStatus.StandBy, label: () => t('common.label.stand_by') },
    { value: UserStatus.Stop, label: () => t('common.label.stop') },
    { value: UserStatus.Withdrawal, label: () => t('common.label.withdrawal') },
    { value: UserStatus.NoBetting, label: () => t('common.label.no_betting') },
  ];

  const currencyType: SelectProps['options'] = [
    { value: CurrencyType.USD, label: 'USD', symbol: '$' },
    { value: CurrencyType.KRW, label: 'KRW', symbol: '₩' },
    { value: CurrencyType.EUR, label: 'EUR', symbol: '€' },
    { value: CurrencyType.JPY, label: 'JPY', symbol: '¥' },
    { value: CurrencyType.CNY, label: 'CNY', symbol: '¥' },
    { value: CurrencyType.PHP, label: 'PHP', symbol: '₱' },
  ];

  const paymentType: SelectProps['options'] = [
    { value: PaymentName.Cpass, label: () => t('common.label.cpass') },
    { value: PaymentName.AstroPay, label: () => t('common.label.astropay') },
    { value: PaymentName.Custom, label: () => t('common.label.custom') },
  ];

  const promotionCategory: SelectProps['options'] = [
    { value: PromotionCategory.Event, label: '출석이벤트' },
    { value: PromotionCategory.Betting, label: '베팅' },
    { value: PromotionCategory.Reward, label: '리워드' },
  ];
  const promotionRewardType: SelectProps['options'] = [
    { value: PromotionRewardType.Cash, label: () => t('table.thead.cash') },
    { value: PromotionRewardType.Point, label: () => t('table.thead.point') },
  ];

  const filterDefault: SelectProps['options'] = [
    { value: FilterDefault.All, label: () => t('common.label.all') },
    { value: FilterDefault.SiteName, label: () => t('common.label.site_name') },
    { value: FilterDefault.IDNick, label: () => t('common.label.id_nick') },
    { value: FilterDefault.RecommendID, label: () => t('common.label.recommend_id') },
  ];
  const authorityLevel: SelectProps['options'] = [
    { value: AuthorityLevel.Impossible, label: () => t('common.label.impossible') },
    { value: AuthorityLevel.Possible, label: () => t('common.label.possible') },
  ];

  const authorityRW: SelectProps['options'] = [
    { value: AuthorityRW.Reading, label: () => t('common.label.reading') },
    { value: AuthorityRW.Writing, label: () => t('common.label.writing') },
    { value: AuthorityRW.All, label: () => t('common.label.all') },
  ];
  const managerStatus: SelectProps['options'] = [
    { value: ManagerStatus.Normal, label: () => t('common.label.normal') },
    { value: ManagerStatus.Stop, label: () => t('common.label.stop') },
  ];
  const paymentInquireType: SelectProps['options'] = [
    { value: PaymentType.Cash, label: () => t('table.thead.cash') },
    { value: PaymentType.Point, label: () => t('table.thead.point') },
    { value: PaymentType.Charging, label: () => t('common.text.charging') },
    { value: PaymentType.Exchange, label: () => t('common.text.exchange') },
  ];
  const gameResultType: SelectProps['options'] = [
    { value: GameResultType.Lose, label: () => t('common.text.lose') },
    { value: GameResultType.Win, label: () => t('common.text.win') },
    { value: GameResultType.Done, label: () => t('common.text.done') },
  ];

  options.blockType = blockType;
  options.blockState = blockState;
  options.rewardType = rewardType;
  options.defaultState = defaultState;
  options.gameCategory = gameCategory;
  options.gameDesignation = gameDesignation;
  options.useCategory = useCategory;
  options.pointUseType = pointUseType;
  options.role = role;
  options.userStatus = userStatus;
  options.currencyType = currencyType;
  options.paymentType = paymentType;
  options.promotionCategory = promotionCategory;
  options.promotionRewardType = promotionRewardType;
  options.filterDefault = filterDefault;
  options.authorityLevel = authorityLevel;
  options.authorityRW = authorityRW;
  options.managerStatus = managerStatus;
  options.paymentInquireType = paymentInquireType;
  options.gameResultType = gameResultType;
});

export {
  comma,
  csvFile,
  onTree,
  useFilter,
  options,
  localeList,
  pageOptions,
  userType,
  dateFormat,
  pages,
  idRegex,
  passwordRegex,
};

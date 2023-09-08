import { Locale as antLocale } from 'ant-design-vue/lib/vc-picker/interface';
import {
  CoinCode,
  MemberLevelType,
  MemberStatusType,
  RewardType,
  RoleType,
  SettlementStatus,
  SettlementType,
  TransactionStatus,
  TransactionType,
  UserStateType,
  VerificationMethod,
} from './utils/enums';

export {};

declare global {
  interface FormState {
    email: string;
    password: string;
    remember: boolean;
  }
  type SendParams = {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    data?: object;
    params?: object;
    isForm?: boolean;
    isRefreshToken?: boolean;
  };

  interface IDateRange {
    start: string;
    end: string;
  }

  type PredictType = {
    UpDown: number;
    EvenOdd: number;
    BigSmall: number;
  };

  type ITableSort = {
    column: string;
    sortType?: 1 | -1;
  };

  interface ITabelRequest extends ITableSort {
    skip: number;
    take: number;
  }

  type TablePagination = {
    current: number;
    pageSize: number;
    total: number;
  };

  type Sort = {
    field: string;
    order: 'ascend' | 'descend';
  };

  interface IQueryDataParams extends Sort {
    page: number;
    results: number;
  }

  interface IPageTableModel<T> {
    total: number;
    list: T[];
  }

  interface IPieChartOption {
    key: keyof PredictType;
    value: number;
    name: string;
    color?: string;
  }

  type IAmountData = Record<string, PredictType>;

  interface ICommonStore {
    signInfo: ISignInfo;
    currentLocale: antLocale | IAppLanguages;
    darkMode: boolean;
  }

  interface ISignInfo {
    email: string;
    auth: string;
    authGrade?: number;
  }

  interface IAppLanguages {
    isoName: string | 'en-US' | 'ja' | 'ko-KR' | 'zh-CN';
    nativeName: string;
    flag?: string;
    locale?: antLocale | any;
  }

  interface ISelectOptions {
    value: number;
    label: any;
    key: string;
    selected?: boolean;
    child?: ISelectOptions[];
  }
  interface ISelectOptions2 {
    value: string;
    label: string;
    key: string;
    selected?: boolean;
    child?: ISelectOptions[];
  }

  interface ISelectDate {
    [key: string]: {
      start: string;
      end: string;
    };
  }

  interface ISelectStatus {
    [key: string]: ISelectOptions[];
  }

  interface INoticeCategoryOptions {
    [key: string]: ISelectOptions;
  }

  interface ICoinInformation {
    value: CoinCode;
    label: string;
    fullName: string;
  }

  type ICoinMap = Record<CoinCode, ICoinInformation>;

  interface IGameSummaries {
    startTime: string;
    endTime: string;
    memberLevel?: number[];
    partners?: string[];
  }

  interface IInvestment extends ITabelRequest {
    id?: string;
    transactionType: number[];
    transactionStatus: number[];
    searchText: string;
    createdTime: IDateRange;
    completedTime: IDateRange;
  }

  interface IInvestmentResponse {
    transactionId: string;
    investmentPoolTransactionId: string;
    email: string;
    nickname: string;
    status: number;
    beforeBalance: number;
    requestAmount: number;
    afterBalance: number;
    type: number;
    createdTime: string;
    completedTime: string;
  }

  interface IInvestmentEarnings extends ITabelRequest {
    searchText: string;
    investmentStep: number[];
    memberState: number[];
  }

  interface IInvestmentEarningsResponse {
    operatorId: string;
    email: string;
    nickname: string;
    coinCode: CoinCode;
    step: number;
    originalBalance: number;
    balance: number;
    predictionAmount: number;
    winningAmount: number;
    netProfitAmount: number;
    depositAmount: number;
    withdrawalAmount: number;
    state: number;
    createdTime: string;
    wallet?: any[];
  }

  interface IGameSummariesResponse {
    [key: string]: any;
    predictionAmountDetail: PredictType;
    winningAmountDetail: PredictType;
    profitAmountDetail: PredictType;
    feeAmountDetail: PredictType;
    rewardAmountDetail: PredictType;
    predictionAmount: number;
    winningAmount: number;
    profitAmount: number;
    feeAmount: number;
    rewardAmount: number;
    netProfitAmount: number;
    visitedToday: number;
    predictedToday: number;
    newOfToday: number;
    createdTime: string;
  }

  interface ISummaryInvestmentResponse {
    stepCounts: {
      four: number;
      three: number;
      two: number;
      one: number;
      zero: number;
    };
    partnerTotalCount: number;
    originalBalance: number;
    balance: number;
  }

  interface ISummaryInvestmentDetailResponse {
    [key: string]: number;
    netProfitAmount: number;
    predictionAmount: number;
    profitAmount: number;
    settlementAmount: number;
    depositAmount: number;
    withdrawalAmount: number;
  }

  interface ISummaryMemberResponse {
    [key: string]: number;
    investorCount: number;
    agentCount: number;
    userCount: number;
    newOfMonthCount: number;
    newOfTodayCount: number;
    visitedTodayCount: number;
    onlineCount: number;
    predictedTodayCount: number;
    disconnectedForTwoWeeksCount: number;
  }

  interface IGamePredictionResponseDetail {
    predictionAmountDetail: PredictType;
    winningAmountDetail: PredictType;
    profitAmountDetail: PredictType;
    feeAmountDetail: PredictType;
    rewardAmountDetail: PredictType;
    netProfitAmountDetail: PredictType;
  }

  interface IGamePredictionResponse extends IGamePredictionResponseDetail {
    [key: string]: number | any;
    predictedCount: number;
    predictionAmount: number;
    winningAmount: number;
    profitAmount: number;
    feeAmount: number;
    netProfitAmount: number;
    round: number;
  }

  interface ISummarySettlementResponse extends ITabelRequest {
    rewardAmount: number;
    predictionAmount: number;
    profitAmount: number;
    settlementAmount: number;
  }

  interface IGameManagementPartner extends ITabelRequest {
    id?: string;
    createdTime: IDateRange;
    round: number[];
    searchText: string;
  }

  interface IGameManagementPartnerResponse {
    round: number;
    createdTime: string;
    investor: string;
    coinCode: CoinCode;
    predictionAmounts: PredictType;
    winningAmounts: PredictType;
    profitAmounts: PredictType;
    predictionAmountTotal: number;
    winningAmountTotal: number;
    profitAmountTotal: number;
    netProfitAmountTotal: number;
    fee: number;
    investmentAmount: number;
  }

  interface IGameManagementUser extends ITabelRequest {
    id?: string;
    createdTime: IDateRange;
    round: number[];
    searchText: string;
  }

  interface IGameManagementUserResponse {
    round: number;
    createdTime: string;
    investor: string;
    coinCode: CoinCode;
    predictionAmounts: PredictType;
    winningAmounts: PredictType;
    predictionAmountTotal: number;
    winningAmountTotal: number;
    topAgent: string;
    email: string;
    nickname: string;
  }

  interface ISettingGameResponse {
    coinCode: CoinCode;
    createdTime: string;
    gameId: string;
    isEnabled: boolean;
    maxAmount: number;
    minAmount: number;
    updatedTime: string;
  }

  interface IMemberManagement {
    role: 0 | 1 | null;
    memberLevel: number[];
    settlementMethod: number[];
    memberState: number[];
    column:
      | ''
      | 'investor'
      | 'topAgent'
      | 'email'
      | 'nickname'
      | 'password'
      | 'feeRate'
      | 'isSubPartnerAvailable'
      | 'level'
      | 'role'
      | 'coinCode'
      | 'settlementMethod'
      | 'rewardAmount'
      | 'state'
      | 'createdTime'
      | 'lastChallengedTime'
      | 'lastPredictedTime';
    sortType?: 1 | -1;
    skip: number;
    take: number;
    searchText: string;
  }

  interface IMemberManagementResponse {
    memberId: string;
    investor: string;
    topAgent: string;
    email: string;
    nickname: string;
    password: string;
    feeRate: number;
    isSubPartnerAvailable: true;
    level: number;
    role: number | null;
    coinCode: CoinCode;
    settlementMethod: number;
    rewardAmount: number;
    state: number;
    createdTime: string;
    lastChallengedTime: string;
    lastPredictedTime: string;
  }

  interface IInvestmentInfoResponse {
    operatorId: string;
    email: string;
    nickName: string;
    password: number;
    coinCode: CoinCode;
    originalBalance: number;
    step: number;
    createdTime: string;
  }

  interface ISubMembersResponse {
    memberId: string;
    investor: string;
    topAgent: string;
    email: string;
    nickname: string;
    password: number;
    feeRate: number;
    isSubPartnerAvailable: boolean;
    level: number;
    role: number;
    coinCode: CoinCode;
    settlementMethod: number;
    rewardAmount: number;
    state: number;
    createdTime: string;
    lastChallengedTime: string;
    lastPredictedTime: string;
  }

  interface IStructureMap extends ITableSort {
    settlementMethod: number[];
    memberState: number[];
    searchText: string;
  }

  interface IStructureResponse {
    memberId: string;
    topMemberId: string;
    topMemberIds: string[];
    referralId: string;
    email: string;
    nickname: string;
    level: number;
    settlementMethod: number;
    rewardAmount: number;
    predictionAmount: number;
    winningAmount: number;
    state: number;
    createdTime: string;
    partner: string;
    agent1: string;
    agent2: string;
    agent3: string;
    agent4: string;
    agent5: string;
    user: string;
    children: IStructureResponse[];
  }

  interface ICreateAgent {
    operatorId?: string;
    identity: string;
    password: string;
    nickname: string;
    settlementMethod: number;
    feeRate: number;
    isSubPartnerAvailable: boolean;
  }

  interface INotice {
    order: number;
    category1: string;
    category2: string;
    title: string;
    content: string;
  }

  interface INoticeResponse extends INotice {
    id: string;
  }

  interface ILoginInfo {
    sn: string;
    isLogin: boolean;
    userId: string;
    isPin: boolean;
    isPassword: boolean;
    isExternal: boolean;
    isBiometric: boolean;
    isOtp: boolean;
    userState: string;
    currencySymbol: string;
    currencyType: string;
    countryCode?: string;
    alpha2Code?: string;
    countryNumber?: string;
    countryAlphaCode?: string;
    phone?: string;
    kycStatus1: number;
    kycStatus2: number;
    kycStatus3: number;
    language: number;
    languageCode: string;
    timezone?: string;
    utcOffset?: string;
    kycIsoNumber?: string;
    apiToken: string;
  }

  interface ISearchType {
    date: Record<string, { start: string; end: string }>;
    status: ISelectStatus;
    text: string;
  }

  interface ISettlement extends ITabelRequest {
    id?: string;
    searchText?: string;
    createdTime?: IDateRange;
    updatedTime?: IDateRange;
    settlementStatus?: number[];
  }
  interface ISettlementResponse {
    settlementId: string;
    coinCode: CoinCode;
    beforeBalance: number;
    afterBalance: number;
    requestAmount: number;
    status: number;
    createdTime: string;
    completedTime: string;
  }

  interface IWallet {
    coinAmount: number;
    coinCode: CoinCode;
    currencyAmount: number;
    currencyPrice: number;
    destinationTag: string;
    minimumQuantity: number;
    walletAddress: string;
    withdrawableBalance: number;
  }

  interface IWalletTransactionRequest {
    currentPage: number;
    currentPageSize: number;
    requestBeforeDate?: string;
    requestAfterDate?: string;
    processingBeforeDate?: string;
    processingAfterDate?: string;
    activity?: string;
    state?: string;
    search?: string;
    searchType?: string;
    order?: string;
    sort?: string;
  }

  interface IWalletTransaction {
    dealId: number;
    coinCode: CoinCode;
    state: number;
    address: string;
    txId: string;
    requestDate: string;
    processingDate: string;
    paymentType: number;
    actual: string;
    purpose: string;
    fromCoinCode?: CoinCode;
    toCoinCode?: CoinCode;
    fromAddress: string;
    toAddress: string;
    fromAmount: string;
    toAmount: string;
  }

  interface IHeaderButtonInformation {
    key: string;
    label: () => string;
    load?: () => void | Promise<void>;
    component: any;
    icon: any;
    value: any;
    role: string[];
  }

  interface IChangePasswordRequest {
    id: string;
    role: number | null;
    password?: string;
  }

  interface IMemberPartnerSimple {
    id: string;
    nickname: string;
    email: string;
  }

  interface IRewardResponse {
    settlementId: string;
    coinCode: CoinCode;
    beforeBalance: number;
    afterBalance: number;
    requestAmount: number;
    status: number;
    createdTime: string;
    completedTime: string;
  }

  interface IWalletCalculateWithdraw {
    coinCode: CoinCode;
    amount: number;
  }

  interface IWalletCalculateWithdrawResponse {
    fromAmount: number;
    transAmount: number;
    fee: number;
    encryptionString: string;
    usdtAmount: number;
    usdtFee: number;
  }

  interface IWalletExecuteWithdraw {
    coinCode: CoinCode;
    currencyMoney: number;
    amount: number;
    fee: number;
    toAddress: string;
    toDestinationTag: string | null;
    encryptionString: string;
    signature: string[];
  }

  interface IOtpVerify {
    value: string;
    method: VerificationMethod;
  }

  interface IFilter {
    id: string;
    label: string;
    type: 'date' | 'select' | 'search';
    placeholder?: string;
    default?: any;
    options?: any[];
    search?: boolean;
  }

  interface ISettlementSetting {
    memberId: string;
    referralId: string;
    email: string;
    nickname: string;
    settlementMethod: RewardType;
    settlementRate: number;
    children: ISettlementSetting[];
  }

  type RewardType = (typeof RewardType)[keyof typeof RewardType];
  type SettlementType = (typeof SettlementType)[keyof typeof SettlementType];
  type MemberLevelType = (typeof MemberLevelType)[keyof typeof MemberLevelType];
  type RoleType = (typeof RoleType)[keyof typeof RoleType];
  type CoinCode = (typeof CoinCode)[keyof typeof CoinCode];
  type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];
  type MemberStatusType =
    (typeof MemberStatusType)[keyof typeof MemberStatusType];
  type TransactionStatus =
    (typeof TransactionStatus)[keyof typeof TransactionStatus];
  type SettlementStatus =
    (typeof SettlementStatus)[keyof typeof SettlementStatus];
  type VerificationMethod =
    (typeof VerificationMethod)[keyof typeof VerificationMethod];
  type UserStateType = (typeof UserStateType)[keyof typeof UserStateType];
}

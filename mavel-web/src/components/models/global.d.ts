import { QuasarLanguage } from 'quasar';

export {};

type CATEGORY = { category?: 1 | 2 | 3 };
type USER_INFO = {
  user_Id: string;
  password: string;
};
type VENDOR = { vendor_Idx?: string; vendor_Key?: number; vendor_Name?: string };

declare global {
  type IVendor = CATEGORY;
  interface INav {
    activeIcon: string;
    bottomNav: boolean;
    icon: string;
    requiresAuth: boolean;
    title: string;
    path: string;
  }
  interface ILocaleList {
    value: string;
    label: string;
    flag: string;
    langPack: QuasarLanguage;
    code: string;
  }
  interface ICountriesList {
    id: string;
    text: string;
    dialCode: string;
    language?: string;
  }
  interface IUser {
    nickname: string;
  }
  interface ISignIn {
    user_Id: string | null;
    password: string | null;
  }
  interface ISignUp {
    user_Id: string;
    password: string;
    nick: string;
    birthDate: string;
    moreInformation: string;
    referral_Id: string;
    role?: number;
  }
  interface IUserRecentPlayGame extends CATEGORY {
    solution_Idx: number;
  }
  interface IMainGameList extends CATEGORY, VENDOR {
    site_Idx: number;
    currentPage: number;
    currentPageSize: number;
    search: string;
    order: string;
    sort: string;
    user_Filter: number;
  }

  interface IBanks {
    idx: number;
    code_Name: string;
    explain: string;
    sort: number;
    title: string;
  }
  interface IUserInfo {
    [key: string]: string | number;
    idx: number;
    user_Id: string;
    password: string;
    token: string;
    site_Idx: number;
    compnay_Idx: number;
    referral_Id: string;
    nick: string;
    hp: string;
    level: number;
    role: number;
    referral_Cnt: number;
    rewardType: number;
    lower_Payment_Authority: number;
    lower_Create_Permission: number;
    memo: string;
    status: number;
    last_Login_Time: string;
    withdrawal_Time: string;
    suspend_Time: string;
    addTime: string;
    cash: number;
    losing: number;
    point: number;
    rolling: number;
    casino_Fee: number;
    slot_Fee: number;
    losing_Fee: number;
  }
  interface IGameUrl {
    vendor: string;
    gameCode: string;
    userId: string;
    platform: string;
  }
  interface IUserCheckId {
    root: number;
    user_Value: string;
  }
  interface IVendorList {
    idx: number;
    imgUrl: string;
    name: string;
    name_Eng: string;
    state: boolean;
  }
  interface IMainGameData extends CATEGORY, VENDOR {
    gameCode?: string;
    img?: string;
    name_En?: string;
    name_Ko?: string;
    state?: boolean;
  }
  interface IPaymentGatewayList {
    value: number;
    label: string;
    desc?: string;
  }
  interface IPaymentSignature {
    pg_Idx: number;
    sign_Key?: string;
    payment_Type: number;
    order_Name: string | undefined;
    order_Number: string | undefined;
    currency_Type: number;
    price: number;
  }
  interface IPaymentRequest extends IPaymentSignature {
    signature: string;
    timeStamp: number;
    isWindow?: boolean;
  }
  interface IWithdrawal {
    user_Key: string | undefined;
    pg_Idx: number;
    currency_Type: number;
    price: number;
  }
  interface IPaymentDefault {
    type: number;
    paymentValue: string;
    paymentSelect: { value: number; label: string; desc?: string };
    paymentId: string;
    // paymentId: { modelValue: string; hashKey: string };
    signature: { timeStamp: number; signature: string };
    orderNumber?: string;
    orderName?: string;
  }
  interface IPaymentHistory {
    CurrentPage: number;
    CurrentPageSize: number;
    Order: string;
    Sort: string;
    Req_BeforeDate: string;
    Req_AfterDate: string;
    Use_Type: number;
  }
  interface IPaymentState {
    pg_Idx: number;
    signature: string;
  }
  interface IPointConvert {
    user_Idx: number;
    balance: number;
  }
  interface IRewardRequest {
    user_Idx: number;
    reward_Type: number;
    amount: number;
  }
  interface IPayInfo {
    [key: string]: string | number;
    cash: number | string;
    point: number | string;
    rolling: number | string;
    losing: number | string;
  }
  interface ILogout {
    user_Idx: number;
    api_Token: string;
    role: number;
  }
  interface IChangePassword extends USER_INFO {
    user_Idx: number;
  }
  interface IPaymentGatewayUser {
    User_Key: string;
    Pg_Idx: number;
    Payment_Type: number;
  }

  interface IDataTable {
    currentPage: number;
    currentPageSize: number;
    order?: string;
    sort?: string;
    req_BeforeDate?: string;
    req_AfterDate?: string;
  }

  interface IDataTable2 {
    CurrentPage: number;
    CurrentPageSize: number;
    Order?: string;
    Sort?: string;
    Req_BeforeDate?: string;
    Req_AfterDate?: string;
    Game_Type?: number;
  }

  interface INotify {
    message: string | any;
    color: string;
    textColor: string;
    position: string | any;
    spinnerSize: string;
    timeout: number;
  }
  interface IPaymentReOrder {
    signature: string;
    pg_Idx: number;
    order_Number: string;
    timeStamp: number;
    isWindow: boolean;
  }
  interface IMessageHistory extends IDataTable {
    user_Filter?: number;
    search?: string;
  }
  interface IMessageInfo {
    idx: number;
  }

  interface IPaymentDecline {
    pg_Idx: number;
    pg_Request_No: string;
    signature: any;
  }
  interface ICpassOtcBayChatPush {
    pg_Idx?: number;
    user_Sn?: string;
    user_Id?: string;
    profile_Id?: string;
  }
  interface IProduct {
    addTime: string;
    descount: number;
    idx: number;
    isUse: boolean;
    operator: number;
    price: number;
    productName: string;
    site_Idx: number;
  }

  interface IProfile {
    birthDate: string;
    level: number;
    nick: string;
    referral_Id: string;
    role: number | string;
    user_Id: string;
  }
  interface INowPlaying {
    [key: string]: {
      url: string;
    };
  }
}

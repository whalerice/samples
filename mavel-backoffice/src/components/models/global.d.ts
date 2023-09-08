import type { Dayjs } from 'dayjs';
type RangeValue = [Dayjs, Dayjs];
export {};

export type GlobalColors = 'Red' | 'Blue' | 'Green' | 'Black';

declare global {
  interface ISummary {
    key: string;
    label: any;
    value: number;
    unit?: any;
    color?: string;
  }

  interface ILocaleList {
    value: string;
    label: string;
    flag: string;
    code: string;
    pack: object;
  }
  interface ICountriesList {
    id: string;
    text: string;
    dialCode: string;
    language?: string;
  }
  interface ISign {
    user_Id: string;
    password: string;
    nick?: string;
    grade?: number;
    rw?: number;
    type?: number;
  }
  interface IUserInfo {
    addTime: string;
    grade?: number;
    idx: number;
    rw: string;
    token: string;
    user_Id: string;
    site_Idx: number;
    password: null;
    rewardType?: number;
    lower_Create_Permission?: number;
    lower_Payment_Authority?: number;
    // birthDate: null;
    // cash: 30;
    // casino_Fee: 1.6;
    // compnay_Idx: 0;
    // last_Login_Time: '2023-01-08T04:26:59';
    // level: 10;
    // losing: 0;
    // losing_Fee: 0;
    // memo: null;
    // moreInformation: null;
    // nick: 'rolling1';
    // point: 0;
    // referral_Cnt: 0;
    // referral_Id: '';
    // role: 1;
    // rolling: 24753.5;
    // slot_Fee: 1.2;
    // status: 1;
    // suspend_Time: '0001-01-01T00:00:00';
    // withdrawal_Time: '0001-01-01T00:00:00';
  }
  interface IDataTable {
    currentPage: number;
    currentPageSize: number;
    order?: string;
    sort?: string;
    req_BeforeDate?: string;
    req_AfterDate?: string;
    company_Idx?: number;
    user_Filter?: number;
    search?: string;
    user_Idx?: number;
    Reward_Type?: number;
    Category?: number;
  }
  interface IDataTableDetail {
    user_Idx: number;
  }

  interface IAffiliate {
    idx: number;
    rewardType: number;
    isApproval: boolean;
  }
  interface IResultType {
    value: boolean | number;
    label: any;
  }
  interface IGameState {
    idx: number;
    state?: boolean;
    IsView?: boolean;
  }
  interface IGameDesignation {
    game_Idx: number;
    solution_Idx: number;
    category: number;
  }

  interface IChangState {
    pg_Idx: number;
    user_Idx: number;
    user_Id: string;
    payment_Type: number;
    currency_Type: number;
    price: number;
    signature: string;
    approval_State: number;
    pg_Request_No?: string;
    order_Name?: string;
    order_Number?: string;
  }

  interface INoticeData {
    idx: number;
    site_Idx: number;
    common_Idx: number;
    code: number;
    second_Code: number;
    third_Code: number;
    code_Name: string;
    title: string;
    content: string;
    isView: boolean;
    views: number;
    order: number;
    manager_Idx: number;
    manager_Id: string;
    registration_Date: string;
  }

  interface IProduct {
    idx?: number;
    productName: string;
    price: number;
    descount: number;
    isUse: boolean;
  }

  interface ISolution {
    idx?: number;
    name: string;
    api_Key: string;
    api_Url: string;
  }
  interface IResource {
    resource_Key: string;
    ko: string;
    cn: string;
    en: string;
    ph: string;
    jp: string;
    ru: string;
    th: string;
  }
  interface ISearch {
    type: number;
    date?: RangeValue | null;
    text: string;
    category?: number;
    designation?: number;
    order?: string | undefined;
    sort?: string | undefined;
    rewardType?: number | undefined;
  }
  interface ISiteAllowIp {
    idx?: number;
    site_Idx: number;
    ipAddress: string;
    memo: string;
    isallow: boolean;
  }
  interface IExcel {
    search: string;
    user_Filter: number;
    order: string | undefined;
    sort: string | undefined;
    req_BeforeDate: string;
    req_AfterDate: string;
    company_Idx: number;
  }

  interface ICreateUser {
    user_Id: string;
    name: string;
    nickname: string;
    affiliate: string;
    birthDay: string;
    password: string;
    confirmPassword?: string;
    rewardType: number;
    casinoFee: number;
    slotFee: number;
    losingFee: number;
    memo: string;
  }

  interface IUserChangePassword {
    user_Idx?: number;
    password: string;
    confirmPassword?: string;
  }

  interface ISetAffiliateByAdminRequest {
    user_Id: string;
    password: string;
    confirmPassword?: string;
    nick: string;
    name: string;
    reward_Type: number;
    casino_Fee: number;
    slot_Fee: number;
    losing_Fee: number;
  }

  interface ICheckAffiliate {
    Affiliate: string;
  }
}

import axios from 'axios';
import store from './index';
import i18n from '@/assets/i18n';
import { Modal, notification } from 'ant-design-vue';

const prolong = () => {
  Modal.confirm({
    content: i18n.global.t('confirm.description.token_expired_extend'),
    cancelText: i18n.global.t('common.button.no'),
    okText: i18n.global.t('common.button.yes'),
    async onOk() {
      await store.dispatch('sign/refreshToken');
      window.location.reload();
    },
    async onCancel() {
      await store.dispatch('sign/signOut');
      Modal.destroyAll();
    },
  });
};

const errorConfirmation = (errMessage) => {
  const type = 'error';
  const text = errMessage;

  notification[type]({
    message: text,
    duration: 10,
  });
};

const apiUrl = axios.create();
const paymentUrl = axios.create();

fetch('/config.json')
  .then((response) => response.json())
  .then((config) => {
    apiUrl.defaults.baseURL = config.API;
    paymentUrl.defaults.baseURL = config.PAYMENT_API;
  });

apiUrl.interceptors.request.use(
  function (config) {
    const token = JSON.parse(sessionStorage.getItem('_token'));
    config.headers['Authorization'] = `Bearer ${token}`;
    config.headers['Accept-Language'] = JSON.parse(sessionStorage.getItem('_lang'));
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

paymentUrl.interceptors.request.use(
  function (config) {
    const token = JSON.parse(sessionStorage.getItem('_token'));
    const paymentToken = JSON.parse(sessionStorage.getItem('_paymentToken'));
    config.headers['Authorization'] = `Bearer ${token}`;
    config.headers['Accept-Language'] = JSON.parse(sessionStorage.getItem('_lang'));
    if (paymentToken !== null) {
      config.headers['PaymentToken'] = `Bearer ${paymentToken}`;
    }

    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

apiUrl.interceptors.response.use(async (response) => {
  const url = response.config.url;
  const errCode = response.data.errCode;
  const errMessage = response.data.errMessage;
  if (
    url !== '/Gmail/GoogleTokenDirCheck' &&
    url !== '/Gmail/GmailAlarm' &&
    url !== 'Support/CategoryList' &&
    url !== '/CoinList' &&
    url !== '/CurrencyList' &&
    url !== 'Manager/ManagerAlarmList' &&
    url !== 'Support/InquiryCount' &&
    url !== 'DashboardCountCSmaster' &&
    url !== 'Partner/DashboardCountPartner' &&
    url !== 'Partner/UnconfirmedCustomerRequest' &&
    url !== 'Partner/partner/UnconfirmedPaymentLis' &&
    url !== 'Partner/PartnerWalletInfo' &&
    url !== '/LanguageSetting'
  ) {
    store.commit('common/SET_ERR', { errCode, errMessage });
    // if (errCode < 0 && errMessage.length > 0) {
    //   errorConfirmation(errMessage);
    // }
  }

  if (errCode === -4 || errCode === -1) {
    await store.dispatch('sign/signOut');

    if (!store.state['common'].stopRequest) {
      errorConfirmation(errMessage);
    }
    store.commit('common/SET_STOP_REQUEST', true);
  } else if (errCode === -2) {
    if (!store.state['common'].stopRequest) {
      prolong();
      store.commit('common/SET_STOP_REQUEST', true);
    }
  } else if (errCode === -5) {
    store.commit('common/GET_SUPPORT_STATE', response.data);
  } else {
    return response;
  }
});

export function Login(data) {
  return apiUrl.post('/Manager/Login', data);
}
export function Logout() {
  return apiUrl.post('/Manager/ManagerLogout');
}

export function ManagerRefreshToken() {
  return apiUrl.post('/Refresh/ManagerRefreshToken');
}

export function SupportCategoryList(data) {
  return apiUrl.post('Support/CategoryList', data);
}

export function SupportStateChange(data) {
  return apiUrl.post('Support/SupportStateChange', data);
}

export function SupportMessage(data) {
  return apiUrl.post('Support/SupportMessage', data);
}

export function SupportInquiryManagerList(data) {
  return apiUrl.post('Support/InquiryManagerList', data);
}

export function SupportAnswer(data) {
  return apiUrl.post('Support/SupportAnswer', data);
}

export function SupportAnswerAdditional(data) {
  return apiUrl.post('Support/SupportAnswerAdditional', data);
}

export function SupportInquiryCount() {
  return apiUrl.post('Support/InquiryCount');
}

export function NoticeList(data) {
  return apiUrl.post('Support/CSNoticeList', data);
}

export function NoticeTransaction(data) {
  return apiUrl.post('Support/CSNoticeTransaction', data);
}

export function NoticePosting(data) {
  return apiUrl.post('Support/CSNoticePosting', data);
}

export function ManagerAlarmList(data) {
  return apiUrl.post('Manager/ManagerAlarmList', data);
}

export function Register(data) {
  return apiUrl.post('/Manager/Register', data);
}

export function GetDashboardChart(data) {
  return apiUrl.post('/Manager/GetDashboardChart', data);
}

export function SetFollowerInformation(data) {
  return apiUrl.post('/Manager/SetFollowerInformation', data);
}

export function GetFollwerList(data) {
  return apiUrl.post('/Manager/GetFollwerList', data);
}

export function GetPassqPaymentHistory(data) {
  return apiUrl.post('Manager/Trade/GetPassqPaymentHistory', data);
}

export function GetPaymentValue(data) {
  return apiUrl.post('Manager/Trade/GetPaymentValue', data);
}

export function GetPaymentValuelChart(data) {
  return apiUrl.post('Manager/Trade/GetPaymentValuelChart', data);
}

export function GetPaymentList(data) {
  return apiUrl.post('Manager/Trade/GetPaymentValuelList', data);
}

export function GetRecentPaymentList(data) {
  return apiUrl.post('Manager/Trade/GetRecentPaymentList', data);
}
export function GetPassqPaymentDetail(data) {
  return apiUrl.post('Manager/Trade/GetPassqPaymentDetail', data);
}
export function GetManagerWithdrawList(data) {
  return apiUrl.post('Manager/Trade/GetManagerWithdrawList', data);
}
export function WithdrawStateChange(data) {
  return apiUrl.post('Manager/Trade/WithdrawStateChange', data);
}
export function CheckHardWallet() {
  return apiUrl.post('/Manager/Trade/CheckHardWallet');
}

export function RecentWithdrawList() {
  return apiUrl.post('/Manager/Trade/RecentWithdrawList');
}

export function ReferralPaymentHistory(data) {
  return apiUrl.post('/Manager/Trade/ReferralPaymentHistory', data);
}

export function GetAffiliateList(data) {
  return apiUrl.post('/Manager/Trade/GetAffiliateList', data);
}

export function SafetyDisputeList(data) {
  return apiUrl.post('/Manager/Trade/SafetyDisputeList', data);
}

export function SafetyDetailList(data) {
  return apiUrl.post('/Manager/Trade/SafetyDetailList', data);
}

export function SafetyTransaction(data) {
  return apiUrl.post('/Support/SafetyTransaction', data);
}

export function CoinList() {
  return apiUrl.post('/CoinList');
}
export function CurrencyList() {
  return apiUrl.post('/CurrencyList');
}

export function PartnerMyInfo(token) {
  apiUrl.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  return apiUrl.post('/Partner/PartnerMyInfo');
}
export function PartnerWalletInfo() {
  return apiUrl.post('/Partner/PartnerWalletInfo');
}
export function DashboardCountPartner() {
  return apiUrl.post('Partner/DashboardCountPartner');
}
export function PaymentAlarmList(data) {
  return apiUrl.post('/Partner/PaymentAlarmList', data);
}
export function PartnerPaymentInformationList(data) {
  return apiUrl.post('/Partner/PaymentInformationList', data);
}
export function PartnerSettlementList(data) {
  return apiUrl.post('Partner/SettlementList', data);
}
export function PartnerWithdraw(data) {
  return apiUrl.post('/Partner/PartnerWithdraw', data);
}
export function WithdrawPrice(data) {
  return apiUrl.post('/Partner/WithdrawPrice', data);
}
export function PaymentConfirm(data) {
  return apiUrl.post('/Partner/PaymentConfirm', data);
}
export function PartnerWithdrawalRequestList(data) {
  return apiUrl.post('/Partner/WithdrawalRequestList', data);
}
export function PaymentAmountChart(data) {
  return apiUrl.post('/Partner/PaymentAmountChart', data);
}

export function DashboardCountCSmaster() {
  return apiUrl.post('CSmaster/DashboardCountCSmaster');
}

export function CSmasterPaymentInformationList(data) {
  return apiUrl.post('/CSmaster/PaymentInformationList', data);
}
export function CSmasterWithdrawalRequestList(data) {
  return apiUrl.post('/CSmaster/WithdrawalRequestList', data);
}
export function CSmasterSettlementList(data) {
  return apiUrl.post('CSmaster/SettlementList', data);
}
export function CSmasterWithdrawUser(data) {
  return apiUrl.post('/CSmaster/CSmasterWithdrawUser', data);
}
export function PartnerApproval(data) {
  return apiUrl.post('/CSmaster/PartnerApproval', data);
}
export function PartnerApprovalGuaranteeMailSend(data) {
  return apiUrl.post('/CSmaster/PartnerApprovalGuaranteeMailSend', data);
}
export function PartnerName() {
  return apiUrl.post('/CSmaster/PartnerName');
}
export function PartnerList(data) {
  return apiUrl.post('/CSmaster/PartnerList', data);
}
export function PartnerRefusal(data) {
  return apiUrl.post('/CSmaster/PartnerRefusal', data);
}
export function PartnerUpdate(data) {
  return apiUrl.post('/CSmaster/PartnerUpdate', data);
}

export function PaymentSwapTransaction(data) {
  return apiUrl.post('/Payment/SwapTransaction', data);
}
export function PaymentSwapPrice(data) {
  return apiUrl.post('/Payment/SwapPrice', data);
}
export function PaymentSwapWalletInfo(data) {
  return apiUrl.post('/Payment/SwapWalletInfo', data);
}

export function PartnerInquiryList(data) {
  return apiUrl.post('Support/PartnerInquiryList', data);
}
export function PartnerInquiryDetail(data) {
  return apiUrl.post('Support/InquiryDetail', data);
}
export function SendInquiry(data) {
  return apiUrl.post('Support/SendInquiry', data);
}
export function PartnerPartnerPaymentRequestListPush(data) {
  return apiUrl.post('Partner/PartnerPaymentRequestListPush', data);
}

export const apis = {
  GetSubManager: (data) => apiUrl.post('/Manager/GetSubManager', data),
  KycRequestList: (data) => apiUrl.post('Kyc/KycRequestList', data),
  KycRequestDetail: (data) => apiUrl.post('Kyc/KycRequestDetail', data),
  KycRequestDetailChange: (data) => apiUrl.post('Kyc/KycRequestDetailChange', data),
  KycRequestHistory: (data) => apiUrl.post('Kyc/KycRequestHistory', data),
  KycConfirmation: (data) => apiUrl.post('Kyc/KycConfirmation', data),
  KycConfirmMemo: (data) => apiUrl.post('/Kyc/KycConfirmMemo', data),
  CSmasterDashboardChart: (data) => apiUrl.post('CSmaster/CSmasterDashboardChart', data),
  CSmasterPaymentRequestListPush: (data) => apiUrl.post('/CSmaster/CSmasterPaymentRequestListPush', data),
  PartnerPaymentInformationList: (data) => apiUrl.post('/Partner/PaymentInformationList', data),
  PartnerWithdrawalRequestList: (data) => apiUrl.post('/Partner/WithdrawalRequestList', data),
  PartnerWithdrawStateChange: (data) => apiUrl.post('/Partner/WithdrawStateChange', data),
  PartnerPaymentRequestListPush: (data) => apiUrl.post('/Partner/PartnerPaymentRequestListPush', data),
  PaymentDeclineApp: (data) => apiUrl.post('/Payment/PaymentDeclineApp', data),
  PartnerWithdrawalRequestListPush: (data) => apiUrl.post('/Partner/PartnerWithdrawalRequestListPush', data),
  GetShareSASQuery: () => apiUrl.post('Kyc/GetShareSASQuery'),
  // PaymentVerifyAccount: (data) => apiUrl.post('Payment/VerifyAccount', data),
  // PaymentOrderSign: (data) => apiUrl.post('Payment/OrderSign', data),
  // PaymentRequestPay: (data) => apiUrl.post('Payment/RequestPay', data),
  // PaymentWithdrawal: (data) => apiUrl.post('Payment/Withdrawal', data),
  // PartnerWithdrawalPrice: (data) => apiUrl.post('Payment/WithdrawalPrice', data),
  OtpIsRegister: () => apiUrl.post('Otp/IsRegister'),
  OtpRegisterUri: () => apiUrl.post('Otp/RegisterUri'),
  OtpRegister: (data) => apiUrl.post('Otp/BackOfficeRegister', data),
  OtpVerify: (data) => apiUrl.post('Otp/Verify', data),
  OtpDelete: () => apiUrl.post('Otp/Delete'),
  // PaymentRequestPayAgain: (data) => apiUrl.post('Payment/RequestPayAgain', data),
  PaymentRequestConfirm: (data) => apiUrl.post('Partner/PaymentRequestConfirm', data),
  MemberMailCertification: (data) => apiUrl.post('Member/MailCertification', data),
  MemberMailCertificationConfirm: (data) => apiUrl.post('Member/MailCertificationConfirm', data),
  PartnerChangePassword: (data) => apiUrl.post('Partner/ChangePassword', data),
  PartnerSmallBusinessRecentList: (data) => apiUrl.post('Partner/SmallBusinessRecentList', data),
  PartnerSmallBusinessFavorite: () => apiUrl.post('Partner/SmallBusinessFavorite'),
  PartnerSmallBusinessFavoriteUpsert: (data) => apiUrl.post('Partner/SmallBusinessFavoriteUpsert', data),
  PartnerSmallBusinessFavoriteDelete: (data) => apiUrl.post('Partner/SmallBusinessFavoriteDelete', data),
  TimezoneList: (data) => apiUrl.post('/TimezoneList', data),
  LanguageSetting: () => apiUrl.post('/LanguageSetting'),
  PartnerPaymentAcceptCount: () => apiUrl.post('Partner/PaymentAcceptCount'),
  PartnerPaymentUnidentifiedList: () => apiUrl.post('Partner/PaymentUnidentifiedList'),
  PartnerSalesStatsByCoin: (data) => apiUrl.post('Partner/SalesStatsByCoin', data),
  PartnerSalesStatsByDate: (data) => apiUrl.post('Partner/SalesStatsByDate', data),
  PartnerSalesStatsByMonth: (data) => apiUrl.post('Partner/SalesStatsByMonth', data),
  PartnerDealStatsByCoin: (data) => apiUrl.post('Partner/DealStatsByCoin', data),
  PartnerDealStatsByPayment: (data) => apiUrl.post('Partner/DealStatsByPayment', data),
  SystemBoard: (data) => apiUrl.post('/System/Board', data),
  SystemProfileSearch: (data) => apiUrl.post('/System/Profile/Search', data),
  SystemProfileAdd: (data) => apiUrl.post('/System/Profile/Add', data),
  SystemProfileRemove: (data) => apiUrl.post('/System/Profile/Remove', data),
  PartnerTransactionList: (data) => apiUrl.post('/Partner/TransactionList', data),
  PartnerSwapTransaction: (data) => apiUrl.post('Partner/SwapTransaction', data),
  CsNoticeCategoryList: () => apiUrl.post('/Support/CSNoticeCategoryList'),
  CSNoticeDetail: (data) => apiUrl.post('Support/CSNoticeDetail', data),
  PaymentRecentPaymentList: (data) => apiUrl.post('Payment/RecentPaymentList', data),
  PaymentSalesStatus: () => apiUrl.post('Payment/SalesStatus'),
  PartnerPartnerWalletTotal: () => apiUrl.post('/Partner/PartnerWalletTotal'),
  PaymentSalesStatusCoin: () => apiUrl.post('Payment/SalesStatusCoin'),
  PartnerAvailableCoin: () => apiUrl.post('Partner/AvailableCoin'),
  PartnerAvailableCoinSetting: (data) => apiUrl.post('Partner/AvailableCoinSetting', data),
  CSmasterPaymentPartnerDepositList: (data) => apiUrl.post('CSmaster/PaymentPartnerDepositList', data),
  SignatureValidation: (data) => apiUrl.post('Verification/SignatureValidation', data),
  MemberResetPassword: (data) => apiUrl.post('Member/ResetPassword', data),
  ConfirmPassword: (data) => apiUrl.post('Manager/ConfirmPassword', data),
  ManagerTopMenuCount: () => apiUrl.post('Manager/TopMenuCount'),
  //nextPay
  GetNextPayDepositList: (data) => apiUrl.post('CSMaster/CryptoCurrencyBuy', data),
  GetNextPayUploadResult: (data) => apiUrl.post('CSmaster/CryptoCurrencyBuy/checkData', data),
  SetNextPayUpload: (data) => apiUrl.post('CSmaster/CryptoCurrencyBuy/saveData', data),
  GetNextPayWithdrawList: (data) => apiUrl.post('CSmaster/CryptoCurrencySell', data),
  SetNextPaymentApproval: (data) => apiUrl.post('CSmaster/ExternalPaymentApproval', data),

  CpesoBuyConfirmMemo: (data) => apiUrl.post('CSmaster/CryptoCurrencyBuy/ConfirmMemo', data),
  CpesoSellConfirmMemo: (data) => apiUrl.post('CSmaster/CryptoCurrencySell/ConfirmMemo', data),

  //start -- "PAYMENT_API": "//dev.payment.cpass.exchange/"
  PaymentVerifyAccount: (data) => paymentUrl.post('Payment/VerifyAccount', data),
  PaymentOrderSign: (data) => paymentUrl.post('Payment/OrderSign', data),
  PaymentRequestPay: (data) => paymentUrl.post('Payment/RequestPay', data),
  PaymentRequestPayAgain: (data) => paymentUrl.post('Payment/RequestPayAgain', data),
  PartnerWithdrawalPrice: (data) => paymentUrl.post('Payment/WithdrawalPrice', data),
  PaymentWithdrawal: (data) => paymentUrl.post('Payment/Withdrawal', data),
  //----end ///

  manager: {
    SafetyDisputeCheck: (data) => apiUrl.post('/Manager/Trade/SafetyDisputeCheck', data),
    UserTransactionList: (data) => apiUrl.post('/Manager/Trade/UserTransactionList', data),
    WithdrawConfirmMemo: (data) => apiUrl.post('/Manager/Trade/WithdrawConfirmMemo', data),
    UserInfo: (data) => apiUrl.post('/Manager/Trade/UserInfo', data),
    UserList: (data) => apiUrl.post('/Manager/Trade/UserList', data),
    WalletIndicators: () => apiUrl.post('/Manager/Trade/UserIndicators'),
    UserExternalDealList: (data) => apiUrl.post('/Manager/Trade/UserExternalDealList', data),
    PartnerIndicators: () => apiUrl.post('/CSmaster/PartnerIndicators'),
    CSmasterPartnerInformation: (data) => apiUrl.post('/CSmaster/PartnerInformation', data),
  },
  notify: {
    GoogleTokenDirCheck: () => apiUrl.post('/Gmail/GoogleTokenDirCheck'),
    GmailAlarm: () => apiUrl.post('/Gmail/GmailAlarm'),
  },
};

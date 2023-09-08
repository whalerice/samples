import { SessionStorage } from 'quasar';
import { api, siteIdx } from 'src/boot/main';
import { notify } from 'src/boot/main';
import { userStore } from 'src/stores/user';

const currentLang = () => {
  const lang: any = SessionStorage.getItem('lang');
  // const currentLang = lang !== null ? lang.replace(/^[a-z]/, (char: string) => char.toUpperCase()) : 'En';
  const currentLang = lang !== null ? lang : 'En';
  return currentLang;
};

// const site = () => {
//   const siteIdx: any = SessionStorage.getItem('site');
//   const value = site !== null ? siteIdx : 1;
//   return value;
// };

api.interceptors.request.use(
  function (config: any) {
    // 요청이 전달되기 전에 작업 수행
    config.headers['Language'] = currentLang();
    // config.headers['Site'] = process.env.SITE_IDX;
    config.headers['Site'] = siteIdx;
    config.headers['Client_IP'] = SessionStorage.getItem('ip');
    config.headers['Token'] = SessionStorage.getItem('tk');
    config.headers['Authorization'] = `Bearer ${SessionStorage.getItem('tk')}`;

    return config;
  },
  function (error) {
    // 요청 오류가 있는 작업 수행
    console.error(error);
    return Promise.reject(error.response.data);
  },
);

api.interceptors.response.use(
  function (res) {
    if (res.data.errCode !== 0) {
      notify({
        message: res.data.errMessage,
        color: 'red-12',
        textColor: 'white',
        position: 'top',
        spinnerSize: '4rem',
        timeout: 5000,
      });
    }
    return res;
  },

  function (error) {
    const { onSignOut } = userStore.sign();
    const data = JSON.parse(error.response.data);

    if (data.ErrCode === 400) {
      onSignOut(data.ErrMessage);
    }
    // // 2xx 외의 범위에 있는 상태 코드는 이 함수를 트리거 합니다.
    // // 응답 오류가 있는 작업 수행
    return Promise.reject(error.response.data);
  },
);

export const apis = {
  BankCode: () => api.get('api/Common/GetCommonCode/100'),
  Profile: () => api.get('api/Account/Profile'),
  ProductList: () => api.get('api/Account/ProductList'),
  WithdrawPaymentList: () => api.get('api/Account/WithdrawPaymentList'),
  AccountActionInfoList: () => api.get('api/Account/ActionInfoList'),
  BoardCategory: () => api.get('api/Manager/BoardCategory'),
  GetShareSASQuery: () => api.get('api/Common/GetShareSASQuery'),

  PayInfo: (data: any) => api.get('api/Account/PayInfo', data),
  BettingHistory: (data: IDataTable2) => api.get('api/Account/BettingHistory', { params: data }),
  PointHistory: (data: IDataTable2) => api.get('api/Account/PointHistory', { params: data }),
  CashHistory: (data: IDataTable2) => api.get('api/Account/CashHistory', { params: data }),
  PaymentGatewayUser: (data: IPaymentGatewayUser) => api.get('api/Payment/PaymentGatewayUser', { params: data }),
  SitePaymentInfoList: (data: number) => api.get(`api/Common/SitePaymentInfoList/${data}`),
  CpassOtcBayBoard: (data: any) => api.get('api/Payment/CpassOtcBayBoard', { params: data }),
  NoticeList: (data: any) => api.get('api/site/NoticeList', { params: data }),
  BoardDetail: (data: any) => api.get('api/site/BoardDetail', { params: data }),
  PromotionList: (data: IDataTable) => api.get('api/Site/PromotionList', { params: data }),
  PromotionDetail: (data: IMessageInfo) => api.get('api/Site/PromotionDetail', { params: data }),

  SignIn: (data: ISignIn) => api.post('api/User/Login', data),
  SignUp: (data: ISignUp) => api.post('api/User/SignUp', data),
  Logout: (data: ILogout) => api.post('api/Account/Logout', data),
  MainGameContent: (data: IUserRecentPlayGame) => api.post('api/Game/MainGameContent', data),
  UserRecentPlayGame: (data: any) => api.post('api/game/UserRecentPlayGame', data),
  MainGameList: (data: IMainGameList) => api.post('api/Game/MainGameList', data),
  GameUrl: (data: IGameUrl) => api.post('api/Solution/GameUrl', data),
  UserCheckId: (data: IUserCheckId) => api.post('/api/User/UserCheckId', data),
  GameVender: (data: IVendor) => api.post('api/Game/GameVendor', data),
  PaymentSignature: (data: IPaymentSignature) => api.post('api/Payment/PgSignature', data),
  PaymentRequest: (data: IPaymentRequest) => api.post('api/Payment/PaymentRequest', data),
  Withdrawal: (data: IWithdrawal) => api.post('api/Payment/Withdrawal', data),
  PaymentState: (data: IPaymentState) => api.post('api/Payment/PaymentState', data),
  PointConvert: (data: IPointConvert) => api.post('api/Account/PointConvert', data),
  RewardRequest: (data: IRewardRequest) => api.post('api/Account/RewardRequest', data),
  ChangePassword: (data: IChangePassword) => api.post('api/Account/ChangePassword', data),
  PaymentReOrder: (data: IPaymentReOrder) => api.post('api/Payment/PaymentReOrder', data),
  PaymentHistory: (data: IDataTable) => api.post('api/Account/PaymentHistory', data),
  PaymentDecline: (data: IPaymentDecline) => api.post('api/Payment/PaymentDecline', data),
  MessageHistory: (data: IMessageHistory) => api.post('api/Account/MessageHistory', data),
  MessageInfo: (data: IMessageInfo) => api.post('api/Account/MessageInfo', data),
  CpassOtcBayChatPush: (data: ICpassOtcBayChatPush) => api.post('api/Payment/CpassOtcBayChatPush', data),
  CallbackPayment: (data: any) => api.post('api/Callback/Payment', data),
  SendMessage: (data: any) => api.post('api/Message/SendMessage', data),
  AffiliateRegister: (data: any) => api.post('api/Affiliate/Register', data),
  PaymentCheckPosible: (data: any) => api.post('api/payment/PaymentCheckPosible', data),
};

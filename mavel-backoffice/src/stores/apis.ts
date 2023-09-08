import { Modal, notification } from 'ant-design-vue';
import { SessionStorage } from 'quasar';
import { api } from 'src/boot/main';

const openNotification = (msg: string) => {
  notification.error({
    message: msg,
    placement: 'bottomRight',
  });
};

const currentLang = () => {
  const locale: string | null = SessionStorage.getItem('lang');
  return locale !== null ? locale : 'En';
};

const clientIp = () => {
  const sign: string | null = SessionStorage.getItem('sign');
  if (sign !== null) return JSON.parse(sign).clientIp;
};

const token = () => {
  const user: string | null = SessionStorage.getItem('user');
  if (user !== null) return JSON.parse(user).token;
};

const site = () => {
  const user: string | null = SessionStorage.getItem('user');
  if (user !== null) return JSON.parse(user).siteIdx;
};

api.interceptors.request.use(
  function (config: any) {
    config.headers['Site'] = site();
    config.headers['Client_IP'] = clientIp();
    config.headers['Language'] = currentLang();
    config.headers['Authorization'] = `Bearer ${token()}`;

    return config;
  },
  function (error) {
    // console.log(error);

    // 요청 오류가 있는 작업 수행
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  function (response) {
    if (response.data.errCode < 0) {
      openNotification(response.data.errMessage);
      // 공통 에러 처리 공간
    }
    return response;
  },
  function (error) {
    const data = JSON.parse(error.response.data);
    if (data.ErrCode === 400) {
      SessionStorage.remove('sign');
      SessionStorage.remove('user');

      Modal.warning({
        title: 'This is a warning message',
        content: data.ErrMessage,
        onOk() {
          window.location.href = '/';
        },
      });
    } else {
      openNotification(data.ErrMessage);
    }

    // 2xx 외의 범위에 있는 상태 코드는 이 함수를 트리거 합니다.
    // 응답 오류가 있는 작업 수행
    return Promise.reject(error.response.data);
  },
);

export const apis = {
  manager: {
    SignUp: (data: ISign) => api.post('api/Manager/SignUp', data),
    SignIn: (data: ISign) => api.post('api/Manager/Login', data),
    UserInfoList: (data: IDataTable) => api.post('api/Manager/UserInfoList', data),
    UserDetail: (data: IDataTableDetail) => api.post('api/Manager/UserDetail', data),
    AffiliateList: (data: IDataTable) => api.post('api/Affiliate/GetAffiliateList', data),
    AffiliateApproval: (data: IAffiliate) => api.post('api/Affiliate/Approval', data),
    BlockList: (data: IDataTable) => api.post('api/Manager/BlockList', data),
    BlockUser: (data: any) => api.post('api/Manager/BlockUser', data),
    UserRewardList: (data: IDataTableDetail) => api.post('api/Manager/UserRewardList', data),
    UserRewardSetting: (data: any) => api.post('api/Manager/UserRewardSetting', data),
    BettingHistory: (data: IDataTable) => api.get('api/Manager/BettingHistory', { params: data }),
    UserCalculateHistory: (data: any) => api.get('api/Manager/UserCalculateHistory', { params: data }),
    UserCalculateSetting: (data: any) => api.post('api/Manager/UserCalculateSetting', data),
    RewardHistory: (data: IDataTable) => api.get('api/Manager/RewardHistory', { params: data }),
    UserLowerMemberList: (data: IDataTable) => api.get('api/Manager/UserLowerMemberList', { params: data }),
    CalculateHistory: (data: IDataTable) => api.get('api/Manager/CalculateHistory', { params: data }),
    ChargeList: (data: IDataTable) => api.get('api/Manager/ChargeList', { params: data }),
    ChargeApproval: (data: IChangState) => api.post('api/Manager/ChargeApproval', data),
    ExchangeList: (data: IDataTable) => api.get('api/Manager/ExchangeList', { params: data }),
    ExchangeApproval: (data: IChangState) => api.post('api/Manager/ExchangeApproval', data),
    Cashhistory: (data: IDataTable) => api.get('api/manager/Cashhistory', { params: data }),
    Pointhistory: (data: IDataTable) => api.get('api/manager/Pointhistory', { params: data }),
    VendorList: (data: IDataTable) => api.get('api/Manager/VendorList', { params: data }),
    VendorState: (data: IGameState) => api.post('api/Manager/VendorState', data),
    GameList: (data: IDataTable) => api.get('api/Manager/GameList', { params: data }),
    GameState: (data: IGameState) => api.post('api/Manager/GameState', data),
    GameHotHitModify: (data: IGameDesignation) => api.post('api/Manager/GameHotHitModify', data),
    MainOpenGameList: (data: any) => api.post('api/Manager/MainOpenGameList', data),
    SelectionGameState: (data: IGameState) => api.post('api/Manager/SelectionGameState', data),
    BoardCategory: () => api.get('api/Manager/BoardCategory'),
    NoticeList: (data: any) => api.get('api/Manager/NoticeList', { params: data }),
    NoticeDetail: (data: any) => api.get('api/Manager/BoardDetail', { params: data }),
    NoticeRegister: (data: any) => api.post('api/Manager/BoardRegister', data),
    NoticeModify: (data: any) => api.post('api/Manager/BoardModify', data),
    MessageList: (data: any) => api.get('api/Manager/MessageList', { params: data }),
    SendMessage: (data: any) => api.post('api/Message/SendMessage', data),
    SiteList: () => api.get('api/Manager/SiteList'),
    SiteStatistics: () => api.get('api/Manager/SiteStatistics'),
    SiteDetail: (data: any) => api.get('api/Manager/SiteDetail', { params: data }),
    SiteModify: (data: any) => api.post('api/Manager/SiteModify', data),
    SiteRegister: (data: any) => api.post('api/Manager/SiteRegister', data),
    SiteBlockIpList: (data: IDataTable) => api.get('api/Manager/SiteBlockIpList', { params: data }),
    BackOfficeAllowIpList: (data: IDataTable) => api.get('api/Manager/BackOfficeAllowIpList', { params: data }),
    PaymentList: () => api.get('api/Manager/PaymentList'),
    SitePaymentRegister: (data: any) => api.post('api/Manager/SitePaymentRegister', data),
    SitePaymentModify: (data: any) => api.post('api/Manager/SitePaymentModify', data),
    ProductList: (data: IDataTable) => api.post('api/Manager/ProductList', data),
    ProductUpdate: (data: IProduct) => api.post('api/Manager/ProductUpdate', data),
    SolutionList: () => api.get('api/Manager/SolutionList'),
    SolutionRegister: (data: ISolution) => api.post('api/Manager/SolutionRegister', data),
    SolutionModify: (data: ISolution) => api.post('api/Manager/SolutionModify', data),
    MemberStructuralDiagram: (data: IDataTable) => api.post('api/Manager/MemberStructuralDiagram', data),
    PromotionRegister: (data: any) => api.post('api/Manager/PromotionRegister', data),
    PromotionModify: (data: any) => api.post('api/Manager/PromotionModify', data),
    PromotionList: (data: IDataTable) => api.get('api/Manager/PromotionList', { params: data }),
    ResourceList: (data: IDataTable) => api.get('api/Manager/ResourceList', { params: data }),
    ResourceSetting: (data: IResource) => api.post('api/Manager/ResourceSetting', data),
    SiteCalendar: (data: any) => api.get('api/Manager/SiteCalendar', { params: data }),
    SiteCalendarDetail: (data: any) => api.get('api/Manager/SiteCalendarDetail', { params: data }),
    RecentCashReport: () => api.get('api/manager/RecntCashReport'),
    SummaryTable: () => api.get('api/manager/Summary'),
    DashboardPaymentChart: (data: any) => api.get('api/Manager/DashboardPaymentChart', { params: data }),
    DashboardBettingChart: (data: any) => api.get('api/Manager/DashboardBettingChart', { params: data }),
    UserModify: (data: any) => api.post('api/Manager/UserModify', data),
    UserSubtractionPayments: (data: any) => api.post('api/Manager/UserSubtractionPayments', data),
    ManagerList: (data: IDataTable) => api.get('api/manager/ManagerList', { params: data }),
    ManagerModify: (data: any) => api.post('api/Manager/ManagerModify', data),
    ManagerRegister: (data: any) => api.post('api/Manager/ManagerRegister', data),
    ManagerInfo: (data: any) => api.get('api/Manager/ManagerInfo', { params: data }),
    ManagerChangePassword: (data: any) => api.post('api/Manager/ManagerChangePassword', data),
    SiteAllowIpRegister: (data: ISiteAllowIp) => api.post('api/Manager/SiteAllowIpRegister', data),
    SiteAllowIpUpdate: (data: ISiteAllowIp) => api.post('api/Manager/SiteAllowIpUpdate', data),
    GameUpdate: () => api.post('api/Manager/GameUpdate'),
    DashboardCalendar: (data: any) => api.get('api/Manager/DashboardCalendar', { params: data }),
    SetAffiliateByAdmin: (data: ISetAffiliateByAdminRequest) => api.post('api/Affiliate/SetAffiliateByAdmin', data),
    CheckAffiliate: (data: ICheckAffiliate) => api.get('api/Manager/CheckAffiliate', { params: data }),
    RegisterUser: (data: ICreateUser) => api.post('api/Manager/RegisterUser', data),
    UserChangePassword: (data: IUserChangePassword) => api.post('api/Manager/ChangePassword', data),
  },
  partner: {
    SignIn: (data: ISign) => api.post('api/Partner/Login', data),
    UserInfoList: (data: IDataTable) => api.post('api/Partner/UserInfoList', data),
    UserDetail: (data: any) => api.post('api/Partner/UserDetail', data),
    UserRewardList: (data: any) => api.post('api/Partner/UserRewardList', data),
    UserRewardSetting: (data: any) => api.post('api/Partner/UserRewardSetting', data),
    BettingHistory: (data: IDataTable) => api.get('api/Partner/BettingHistory', { params: data }),
    UserCalculateHistory: (data: IDataTable) => api.get('api/Partner/UserCalculateHistory', { params: data }),
    CalculateHistory: (data: IDataTable) => api.get('api/Partner/CalculateHistory', { params: data }),
    Pointhistory: (data: IDataTable) => api.get('api/Partner/Pointhistory', { params: data }),
    Cashhistory: (data: IDataTable) => api.get('api/partner/Cashhistory', { params: data }),
    UserCalculateSetting: (data: any) => api.post('api/Partner/UserCalculateSetting', data),
    UserConnectList: (data: any) => api.post('api/partner/UserConnectList', data),
    MemberStructuralDiagram: (data: IDataTable) => api.post('api/Partner/MemberStructuralDiagram', data),
    SiteStatistics: () => api.get('api/partner/SiteStatistics'),
    RecentCashReport: () => api.get('api/partner/RecntCashReport'),
    DashboardPaymentChart: (data: any) => api.get('api/Partner/DashboardPaymentChart', { params: data }),
    DashboardBettingChart: (data: any) => api.get('api/Partner/DashboardBettingChart', { params: data }),
    UserModify: (data: any) => api.post('api/Partner/UserModify', data),
    UserSubtractionPayments: (data: any) => api.post('api/Partner/UserSubtractionPayments', data),
    SiteCalendar: (data: any) => api.get('api/Partner/SiteCalendar', { params: data }),
    SiteCalendarDetail: (data: any) => api.get('api/Partner/SiteCalendarDetail', { params: data }),
  },
  common: {
    GetShareSASQuery: () => api.get('api/Common/GetShareSASQuery'),
  },
};

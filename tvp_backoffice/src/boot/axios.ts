import { boot } from 'quasar/wrappers';
import axios, { AxiosInstance } from 'axios';
import { LocalStorage } from 'quasar';
import qs from 'qs';
import { role } from './global';
import { roleNames } from '@/router/routes';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
  }
}

export const hostname =
  process.env.NODE_ENV === 'development'
    ? 'http://zhkrk.nortina.io:8050'
    : 'http://zhkrk.nortina.io:8050';

const baseURL = `${hostname}/api/`;
const client = axios.create({
  baseURL: baseURL,
  paramsSerializer: (value) =>
    qs.stringify(value, {
      arrayFormat: 'repeat',
      allowDots: true,
    }),
});

const send = async <T = any>(options: SendParams): Promise<T> => {
  const { url, method, data, params, isForm } = options;

  try {
    const token = LocalStorage.getItem('token');
    const response = await client.request({
      url,
      method,
      data,
      params,
      headers: {
        ...(token ? { Authorization: `bearer ${token}` } : {}),
        ...(isForm
          ? {
              'Content-Type': 'multipart/form-data',
            }
          : {}),
      },
    });

    if (response.status !== 200) {
      throw response;
    }

    return response.data as T;
  } catch (error) {
    throw error;
  }
};

const request = {
  get: async <T = any>(url: string, params?: object | undefined) =>
    await send<T>({ url, method: 'GET', data: undefined, params }),
  delete: async <T = any>(url: string, params?: object | undefined) =>
    await send<T>({ url, method: 'DELETE', data: undefined, params }),
  post: async <T = any>(
    url: string,
    data?: object | undefined,
    params?: object | undefined,
    isForm?: boolean
  ) =>
    await send<T>({
      url,
      method: 'POST',
      data,
      params,
      isForm,
    }),
  put: async <T = any>(
    url: string,
    data?: object | undefined,
    params?: object | undefined,
    isForm?: boolean
  ) => await send<T>({ url, method: 'PUT', data, params, isForm }),
};

const root =
  role === roleNames.master
    ? 'admin'
    : role === roleNames.agent || role === roleNames.partner
    ? 'operator'
    : '';

const api = {
  admin: {
    auth: {
      login: (userId: string, password: string) =>
        request.post<ILoginInfo>('admin/v1/Auth/Login', { userId, password }),
      self: () => request.get<ILoginInfo>('admin/v1/Auth/Self'),
    },
    member: {
      simple: () =>
        request.get<IMemberPartnerSimple[]>('admin/v1/Member/Partner/Simple'),
    },
    setting: {
      game: () => request.get<ISettingGameResponse[]>('admin/v1/Setting/Game'),
      gameState: (id: string, isEnabled: boolean) =>
        request.post<ISettingGameResponse>(
          `admin/v1/Setting/Game/${id}/State`,
          {
            isEnabled,
          }
        ),
    },
  },
  operator: {
    auth: {
      login: (userId: string, password: string) =>
        request.post<ILoginInfo>('operator/v1/auth/login', {
          userId,
          password,
        }),
      loginAgent: (identity: string, password: string) =>
        request.post<ILoginInfo>('operator/v1/auth/login/agent', {
          identity,
          password,
        }),
      self: () => request.get<ILoginInfo>('operator/v1/auth/self'),
      canUseIdentity: (identity: string) =>
        request.get<boolean>(`operator/v1/auth/canUseIdentity/${identity}`),
    },
    settlement: {
      reward: (data: ISettlement) =>
        request.get<IPageTableModel<IRewardResponse[]>>(
          'operator/v1/Settlement/RewardRequest',
          data
        ),
      request: (coinCode: number, amount: any) =>
        request.put('operator/v1/Settlement/RewardRequest', {
          coinCode,
          amount,
        }),
    },
  },
  auto: {
    game: {
      summaries: (data: IGameSummaries) =>
        request.get<IGameSummariesResponse[]>(
          `${root}/v1/Game/Summaries`,
          data
        ),
    },
    settlement: {
      settlement: (data: ISettlement) =>
        request.get<IPageTableModel<ISettlementResponse[]>>(
          `${root}/v1/Settlement`,
          data
        ),
      status: (id: string, data: any) =>
        request.post<string>(`${root}/v1/Settlement/${id}/Status`, data),
      reward: (type: number, filter: any) =>
        request.get<IPageTableModel<ISettlementResponse[]>>(
          `${root}/v1/Settlement/reward/${type}`,
          filter
        ),
    },
    investment: {
      earnings: (data: IInvestmentEarnings) =>
        request.get<IPageTableModel<IInvestmentEarningsResponse>>(
          `${root}/v1/Investment/Earnings`,
          data
        ),
      earningWallet: (id: string) =>
        request.get<any[]>(`${root}/v1/Investment/Earnings/${id}/Wallets`),
      investment: (data: IInvestment) =>
        request.get<IPageTableModel<IInvestmentResponse>>(
          `${root}/v1/Investment`,
          data
        ),
      transaction: (type: number, amount: number, coinCode: number) =>
        request.put(`${root}/v1/Investment/Transaction/${type}`, {
          amount,
          coinCode,
        }),
      managerTransaction: (id: string, isApproved: boolean) =>
        request.post(`${root}/v1/Investment/Transaction/${id}`, {
          isApproved,
        }),
      partners: (filter: any) =>
        request.get<any>(`${root}/v1/Investment/Partners`, filter),
    },
    summary: {
      top: () => request.get<any>(`${root}/v1/summary/top`),
      investment: () =>
        request.get<ISummaryInvestmentResponse>(
          `${root}/v1/Summary/Investment`
        ),
      investmentDetail: (type: number) =>
        request.get<ISummaryInvestmentDetailResponse>(
          `${root}/v1/Summary/Investment/Detail/${type}`
        ),
      member: () =>
        request.get<ISummaryMemberResponse>(`${root}/v1/Summary/Member`),

      gamePrediction: (type: number) =>
        request.get<IGamePredictionResponse>(
          `${root}/v1/Summary/GamePrediction/${type}`
        ),
      settlement: (type: number) =>
        request.get<ISummarySettlementResponse>(
          `${root}/v1/Summary/Settlement/${type}`
        ),
    },
    gameManagement: {
      partner: (data: IGameManagementPartner) =>
        request.get<IPageTableModel<IGameManagementPartnerResponse>>(
          `${root}/v1/GameManagement/Partner`,
          data
        ),

      agent: (data: IGameManagementPartner) =>
        request.get<IPageTableModel<IGameManagementPartnerResponse>>(
          `${root}/v1/GameManagement/Agent`,
          data
        ),

      user: (data: IGameManagementUser) =>
        request.get<IPageTableModel<IGameManagementUserResponse>>(
          `${root}/v1/GameManagement/User`,
          data
        ),
    },

    member: {
      operators: (data: IMemberManagement) =>
        request.get<IPageTableModel<IMemberManagementResponse>>(
          `${root}/v1/Member/Operator`,
          data
        ),
      users: (data: IMemberManagement) =>
        request.get<IPageTableModel<IMemberManagementResponse>>(
          `${root}/v1/Member/User`,
          data
        ),
      memberManagementDetail: (id: string) =>
        request.get<IMemberManagementResponse>(`${root}/v1/Member/${id}`),
      hierarchy: (id: string) =>
        request.get<{ AgentOne: string; Investor: string; User: string }>(
          `${root}/v1/Member/${id}/Hierarchy`
        ),
      password: (id: string, password: string) =>
        request.post<IMemberManagementResponse>(
          `${root}/v1/Member/${id}/Password`,
          {
            password,
          }
        ),
      investmentInfo: (id: string) =>
        request.get<IInvestmentInfoResponse>(
          `${root}/v1/Member/${id}/InvestmentInfo`
        ),
      state: (id: string, state: number) =>
        request.post(`${root}/v1/Member/${id}/State`, { state }),
      subMembers: (data: { id: string; skip: number; take: number }) =>
        request.get<IPageTableModel<ISubMembersResponse>>(
          `${root}/v1/Member/${data.id}/SubMembers`,
          {
            skip: data.skip,
            take: data.take,
          }
        ),
      loginHistory: (data: { id: string; skip: number; take: number }) =>
        request.get<IPageTableModel<ISubMembersResponse>>(
          `${root}/v1/Member/${data.id}/LoginHistory`,
          {
            skip: data.skip,
            take: data.take,
          }
        ),
      modify: (
        id: string,
        data: { state: number; isSubPartnerAvailable: boolean; feeRate: number }
      ) => request.post(`${root}/v1/Member/${id}`, data),
      structureMap: (id: string, data: any) =>
        request.get<IStructureResponse[]>(
          `${root}/v1/Member/StructureMap/${id ?? ''}`,
          data
        ),
      agent: (data: ICreateAgent) =>
        request.put(`${root}/v1/Member/Agent`, data),
      settlementSetting: (id: string) =>
        request.get<ISettlementSetting>(
          `${root}/v1/Member/${id}/SettlementSetting`
        ),
      updateSettlementSetting: (
        id: string,
        settlementRate: Record<string, number>
      ) =>
        request.post<ISettlementSetting>(
          `${root}/v1/Member/${id}/SettlementSetting`,
          { settlementRate }
        ),
    },
    notice: {
      getNotice: (data: any) =>
        request.get<IPageTableModel<INotice>>(`${root}/v1/Notice`, data),
      registerNotice: (data: INotice) => request.put(`${root}/v1/Notice`, data),
      modifyNotice: (id: string, data: INotice) =>
        request.post(`Notice/${id}`, data),
      getDetailNotice: (id: string) => request.get(`${root}/v1/Notice/${id}`),
      deleteNotice: (id: string) => request.post(`${root}/v1/Notice/${id}`),
      setStateNotice: (id: string) =>
        request.post(`${root}/v1/Notice/${id}/State`),
    },
    wallet: {
      getWallets: () => request.get<IWallet[]>(`${root}/v1/Wallet`),
      getWalletTransactions: (filter: IWalletTransactionRequest) =>
        request.get<IPageTableModel<IWalletTransaction>>(
          `${root}/v1/Wallet/Transaction`,
          filter
        ),
      getWalletStats: () => request.get(`${root}/v1/Wallet/Stats`),
      swap: () => request.post(`${root}/v1/Wallet/swap`),
      calculateWithdraw: (data: IWalletCalculateWithdraw) =>
        request.post<IWalletCalculateWithdrawResponse>(
          `${root}/v1/wallet/Withdraw/Calculate`,
          data
        ),
      executeWithdraw: (data: IWalletExecuteWithdraw) =>
        request.post(`${root}/v1/wallet/Withdraw/Execute`, data),
    },

    otp: {
      verify: (data: IOtpVerify) => request.post(`${root}/v1/Otp/Verify`, data),
    },
  },
};

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };

import { GetPaymentValuelChart, WithdrawStateChange, GetPaymentValue, CheckHardWallet } from '@/store/api';

const defaultState = () => {
  return {
    chartPaymentValue: [],
    paymentValueData: {},
    walletsInfo: [],
    walletsRowVal: 24,
  };
};

export const trade = {
  namespaced: true,
  state: defaultState(),
  getters: {},
  mutations: {
    TRADE_RESET(state) {
      Object.assign(state, defaultState());
    },
    USER_INFO_DETAILS(state, data) {
      state.userInfoDetails = data;
    },
    PAYMENT_VALUE(state, data) {
      state.paymentValueData = data;
    },
    WALLETS_INFO(state, data) {
      state.walletsInfo = data;
      state.walletsRowVal = 24 / data.length;
      sessionStorage.setItem('_walletsInfo', JSON.stringify(state.walletsInfo));
    },
  },
  actions: {
    async getPaymentValuelChart({ rootState, state }, data) {
      const send = {
        User_Sn: rootState['sign'].followersSn,
        Manager_Sn: rootState['sign'].signInfo.sn,
        ChartDate: data.date,
        Chartype: data.type,
      };
      try {
        const response = await GetPaymentValuelChart(send);
        if (response?.data.errCode === 0) {
          state.chartPaymentValue = response.data.returnData;
        }
      } catch (error) {
        console.error(error);
      }
    },
    async withdrawStateChange({ commit }, data) {
      try {
        const response = await WithdrawStateChange(data);
      } catch (error) {
        console.error(error);
      }
    },
    async getPaymentValue({ commit }, data) {
      try {
        const response = await GetPaymentValue(data);
        if (response?.data.errCode === 0) {
          commit('PAYMENT_VALUE', response.data.returnData);
        }
      } catch (error) {
        console.error(error);
      }
    },
    async checkHardWallet({ commit }) {
      try {
        const response = await CheckHardWallet();
        if (response?.data.errCode === 0) {
          commit('WALLETS_INFO', response.data.returnData);
        }
      } catch (error) {
        console.error(error);
      }
    },
  },
};

import { Register, SetFollowerInformation, apis } from '@/store/api';

const defaultState = () => {
  return {
    usersChartData: {},
    formSubmitError: {},
    memoModifyState: {},
    csMasterDashboardChart: {},
    csMasterPartnerPaymentRequestListPush: {},
    cSmasterPaymentPartnerDepositList: {},
    managerTopMenuRefresh: false,
    managerTopMenu: {
      exTransacion: false,
      kyc: false,
      partner: false,
      dispute: false,
      cpesoBuy: false,
      cpesoSell: false,
      inquiry: false,
    },
  };
};

export const manager = {
  namespaced: true,
  state: defaultState(),
  getters: {},
  mutations: {
    MANAGER_RESET(state) {
      Object.assign(state, defaultState());
    },
    GET_DASHBOARD_CHART(state, data) {
      let labels = data[0].labels;
      let datasets = [];
      for (let i = 0; i < data.length; i++) {
        const item = {
          label: data[i].label,
          fill: false,
          tension: 0.1,
          borderColor: state.chartColors[i],
          backgroundColor: state.chartColors[i],
          data: data[i].data,
          borderWidth: 2,
          borderJoinStyle: 'bevel',
        };
        datasets.push(item);
      }
      state.usersChartData = { labels, datasets };
    },
    GET_ERROR_MESSAGE(state, data) {
      state.formSubmitError = data;
    },
    GET_MEMO_MODIFY(state, data) {
      if (data.errCode < 0) {
        state.memoModifyState = { type: 'error', title: 'Error', msg: data.errMessage };
      } else {
        state.memoModifyState = { type: 'success', title: 'Success', msg: data.returnData };
      }
    },
    SET_CS_MASTER_DASHBOARD_CHART(state, data) {
      state.csMasterDashboardChart = data;
    },
    SET_CS_MASTER_PARTNER_PAYMENT_REQUEST_LIST_PUSH(state, data) {
      state.csMasterPartnerPaymentRequestListPush = data;
    },
    SET_CS_PAYMENT_DEPOSIT_LIST(state, data) {
      state.cSmasterPaymentPartnerDepositList = data;
    },
  },
  actions: {
    async register({ rootState, commit }, info) {
      try {
        const sendData = {
          Register_Sn: rootState['sign'].signInfo.sn,
          Register_Grade: rootState['sign'].signInfo.grade,
          Target_Grade: info.type.value,
          User_Id: info.id,
          Password: info.password,
          Memo: info.memo,
          Referral_Code: info.referralCode,
          Referral_Desc: info.referralDescription,
          Referral_Rate: Number(info.referralRate.higher),
        };
        const response = await Register(sendData);
        if (response?.data.errCode === 0) {
          commit('GET_ERROR_MESSAGE', response.data);
        }
      } catch (error) {
        console.error(error);
      }
    },
    async setFollowerInformation({ commit }, data) {
      try {
        const response = await SetFollowerInformation(data);
        if (response?.data.errCode === 0) {
          commit('GET_MEMO_MODIFY', response.data);
        }
      } catch (error) {
        console.error(error);
      }
    },

    async CSmasterDashboardChart({ commit }, data) {
      try {
        const response = await apis.CSmasterDashboardChart(data);
        if (response?.data.errCode === 0) {
          commit('SET_CS_MASTER_DASHBOARD_CHART', response.data.returnData);
        }
      } catch (e) {
        console.error(e);
      }
    },
    async CSmasterPaymentRequestListPush({ commit }, data) {
      try {
        const response = await apis.CSmasterPaymentRequestListPush(data);
        if (response?.data.errCode === 0) {
          commit('SET_CS_MASTER_PARTNER_PAYMENT_REQUEST_LIST_PUSH', response.data.returnData);
        }
      } catch (e) {
        console.error(e);
      }
    },
    async CSmasterPaymentPartnerDepositList({ commit }, data) {
      try {
        const response = await apis.CSmasterPaymentPartnerDepositList(data);
        if (response?.data.errCode === 0) {
          commit('SET_CS_PAYMENT_DEPOSIT_LIST', response.data.returnData);
        }
      } catch (e) {
        console.error(e);
      }
    },
    async setTopMenuTrigger({ state }, data) {
      return new Promise((resolve, reject) => {
        if (data.length > 0) {
          data.forEach((name) => {
            state.managerTopMenu[name] = true;
            setTimeout(() => {
              state.managerTopMenu[name] = false;
            }, 1);
          });
        }
        resolve(true);
      });
    },
    async setTopMenuRefresh({ state }) {
      return new Promise((resolve, reject) => {
        state.managerTopMenuRefresh = true;
        setTimeout(() => {
          state.managerTopMenuRefresh = false;
        }, 1);
        resolve(true);
      });
    },
  },
};

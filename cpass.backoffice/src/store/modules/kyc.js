import { apis } from '@/store/api';
import dayjs from 'dayjs';

const dateFormat = 'YYYY-MM-DD';

const setDateFormat = (date) => {
  return dayjs(
    `${date.split(' ')[0].split('/')[2]}-${date.split(' ')[0].split('/')[0]}-${date.split(' ')[0].split('/')[1]}`,
    dateFormat,
  );
};

const setDetailSASQuery = (data, SASQuery) => {
  for (let i in data.imageUrls) {
    data.imageUrls[i].url = data.imageUrls[i].url + SASQuery;
  }
  return data;
};

const setHistorySASQuery = (data, SASQuery) => {
  for (let i in data) {
    for (let j in data[i].imageUrls) {
      data[i].imageUrls[j].url = data[i].imageUrls[j].url + SASQuery;
    }
  }
  return data;
};

const defaultState = () => {
  return {
    kycRequestList: {},
    kycRequestListCount: [0, 0, 0, 0],
    kycRequestDetail: {
      id: '',
      firstName: '',
      lastName: '',
      birthday: null,
      expirationDate: null,
      alpha2Code: 'us',
      country: 'United States',
      dialCode: '1',
      idNumber: '',
      issuanceDate: null,
      imageUrls: [],
      etc: {
        etc1: '',
        etc2: '',
        etc3: '',
        etc4: '',
      },
    },
    kycRequestHistory: [],
    kycConfirmation: '',
  };
};

export const kyc = {
  namespaced: true,
  state: defaultState(),
  getters: {},
  mutations: {
    KYC_RESET(state) {
      Object.assign(state, defaultState());
    },
    SET_KYC_REQUEST_LIST(state, data) {
      state.kycRequestList = data;
      const mutationCount = [
        data.waiting1stListCount.count,
        data.waiting2ndListCount.count,
        data.approvalListCount.count,
        data.refusalListCount.count,
      ];
      state.kycRequestListCount = mutationCount;
    },
    SET_KYC_REQUEST_DETAIL(state, data) {
      data.alpha2Code = data.alpha2Code.toLowerCase();
      data.birthday = data.birthday === null ? null : setDateFormat(data.birthday);
      data.expirationDate = data.expirationDate === null ? null : setDateFormat(data.expirationDate);
      data.issuanceDate = data.issuanceDate === null ? null : setDateFormat(data.issuanceDate);
      data.etc = {
        etc1: data.etC1,
        etc2: data.etC2,
        etc3: data.etC3,
        etc4: data.etC4,
      };

      state.kycRequestDetail = data;
    },
    SET_KYC_REQUEST_DETAIL_NO_DATA(state, data) {
      state.kycRequestDetail = data;
    },
    SET_KYC_REQUEST_HISTORY(state, data) {
      for (let i in data) {
        if (data[i].type === 'ID' && data[i].imageUrls.length === 3) {
          data[i].imageUrls = [data[i].imageUrls[0], data[i].imageUrls[1]];
        }
      }
      state.kycRequestHistory = data;
    },
    SET_KYC_CONFIRMATION(state, data) {
      state.kycConfirmation = data;
    },
  },
  actions: {
    async KycRequestList({ commit }, data) {
      try {
        const response = await apis.KycRequestList(data);
        if (response?.data.errCode === 0) {
          const returnData = response.data.returnData;
          commit('SET_KYC_REQUEST_LIST', returnData);
        }
      } catch (e) {
        console.error(e);
      }
    },

    async KycRequestDetail({ rootState, commit }, data) {
      try {
        const response = await apis.KycRequestDetail(data);
        if (response?.data.errCode === 0) {
          if (response.data.errMessage === 'No details found.') {
            const data = {
              id: '',
              firstName: '',
              lastName: '',
              birthday: null,
              expirationDate: null,
              alpha2Code: 'us',
              country: 'United States ',
              dialCode: '1',
              idNumber: '',
              issuanceDate: null,
              imageUrls: [],
              etc: {
                etc1: '',
                etc2: '',
                etc3: '',
                etc4: '',
              },
            };
            commit('SET_KYC_REQUEST_DETAIL_NO_DATA', data);
          } else {
            const returnData = response.data.returnData;
            const data = setDetailSASQuery(returnData, rootState['sign'].shareSASQuery);
            commit('SET_KYC_REQUEST_DETAIL', data);
          }
        }
      } catch (e) {
        console.error(e);
      }
    },

    async KycRequestDetailChange({ commit }, data) {
      try {
        await apis.KycRequestDetailChange(data);
      } catch (e) {
        console.error(e);
      }
    },

    async KycRequestHistory({ rootState, commit }, data) {
      try {
        const response = await apis.KycRequestHistory(data);
        if (response?.data.errCode === 0) {
          const data = setHistorySASQuery(response.data.returnData, rootState['sign'].shareSASQuery);
          commit('SET_KYC_REQUEST_HISTORY', data);
        }
      } catch (e) {
        console.error(e);
      }
    },
    async KycConfirmation({ commit }, data) {
      try {
        const response = await apis.KycConfirmation(data);
        if (response?.data.errCode === 0) {
          const returnData = response.data.returnData;
          commit('SET_KYC_CONFIRMATION', returnData);
        }
      } catch (e) {
        console.error(e);
      }
    },
  },
};

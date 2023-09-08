import {
  SupportCategoryList,
  SupportStateChange,
  SupportMessage,
  SupportAnswer,
  SupportInquiryCount,
  SupportAnswerAdditional,
  NoticeTransaction,
  NoticePosting,
} from '@/store/api';

const defaultState = () => {
  return {
    errCode: 0,
    errMessage: '',
    currentLocale: undefined,
    stopRequest: false,
    isSidebar: false,
    memberType: [
      { value: 10, text: 'Activation', color: 'co-success' },
      { value: 20, text: 'Dormancy', color: '' },
      { value: 30, text: 'Suspended', color: '' },
      { value: 40, text: 'Withdrawal', color: 'co-danger' },
      { value: 50, text: 'Conflict', color: 'co-danger' },
    ],
    subordinateUserGrades: [
      {
        value: 100,
        label: 'SuperMaster',
      },
      {
        value: 90,
        label: 'Master',
      },
      {
        value: 80,
        label: 'HeadSeller',
      },
      {
        value: 70,
        label: 'Agent',
      },
      {
        value: 1,
        label: 'User',
      },
    ],
    pageSize: [
      { value: 10, label: '10' },
      { value: 25, label: '25' },
      { value: 50, label: '50' },
    ],
    inquiriesCategories: [],
    supportStateValue: {},
    inquiryCount: [],
    noticeTransactionState: {},
    isDeviceMobile: false,
  };
};

export const common = {
  namespaced: true,
  state: defaultState(),
  getters: {
    gradeList: (state, getters, rootState) => {
      const subordinateUserGrades = rootState['common'].subordinateUserGrades;
      const grade = rootState['sign'].signInfo.grade;
      if (grade === 70) {
        return subordinateUserGrades.filter((each) => each.value < grade);
      } else {
        return subordinateUserGrades.filter((each) => each.value < grade && each.value !== 1);
      }
    },
  },
  mutations: {
    COMMON_RESET(state) {
      Object.assign(state, defaultState());
    },
    SET_ERR(state, val) {
      state.errCode = val.errCode;
      state.errMessage = val.errMessage;
    },
    SET_STOP_REQUEST(state, val) {
      state.stopRequest = val;
    },
    TOGGLE_SIDEBAR(state) {
      state.isSidebar = !state.isSidebar;
    },
    INQUIRIES_CATEGORIES(state, value) {
      const categoryTextValue = [
        { value: 'CPASS Wallet', key: 'search.select.cpass_wallet' },
        { value: 'Receive', key: 'search.select.receive' },
        { value: 'Send', key: 'common.button.send' },
        { value: 'Swap', key: 'common.button.swap' },
        { value: 'Safe Transaction dispute', key: 'search.select.transaction_dispute' },
        { value: 'etc', key: 'search.select.etc' },
        { value: 'CPASS Payment', key: 'search.select.cpass_payment' },
        { value: 'Become a Partner', key: 'search.select.become_partner' },
        { value: 'Payment', key: 'common.button.payment' },
        { value: 'Withdrawal', key: 'common.button.withdrawal' },
        { value: 'Settlement', key: 'common.button.settlement' },
        { value: 'Withdrawal of Partners', key: 'search.select.withdrawal_partners' },
        { value: 'Create wallet', key: 'search.select.create_wallet' },
        { value: 'TVP', key: 'common.text.tvp' },
      ];
      let items = [];
      value.forEach((el) => {
        let middle = [];
        el.middleCategory.forEach((m) => {
          const item = {
            value: m.middleValue,
            label: m.middleLabel,
            text: categoryTextValue.filter((e) => e.value.toLocaleLowerCase() === m.middleLabel.toLocaleLowerCase())[0]
              ?.key,
            checked: false,
          };
          middle.push(item);
        });
        const item = {
          value: el.mainValue,
          label: el.mainLabel,
          text: categoryTextValue.filter((e) => e.value.toLocaleLowerCase() === el.mainLabel.toLocaleLowerCase())[0]
            ?.key,
          middleCategory: middle,
          checked: false,
        };
        items.push(item);
      });
      state.inquiriesCategories = items;
    },
    GET_SUPPORT_STATE(state, value) {
      state.supportStateValue = value;
    },
    GET_INQUIRY_COUNT(state, value) {
      state.inquiryCount = value.returnData;
    },
    GET_NOTICE_TRANSACTION_STATE(state, value) {
      state.noticeTransactionState = value;
    },
    CHANGE_LOCALE(state, val) {
      state.currentLocale = val;
      sessionStorage.setItem('_lang', JSON.stringify(val));
    },
  },
  actions: {
    async inquiriesCategories({ commit }) {
      try {
        const response = await SupportCategoryList({ Type: 0 });

        if (response?.data.errCode === 0) {
          commit('INQUIRIES_CATEGORIES', response.data.returnData);
        }
      } catch (error) {
        console.error(error);
      }
    },
    async supportStateChange({ commit }, data) {
      try {
        const response = await SupportStateChange(data);

        if (response?.data.errCode === 0) {
          commit('GET_SUPPORT_STATE', response.data);
        }
      } catch (error) {
        console.error(error);
      }
    },
    async supportMessage({ commit }, data) {
      try {
        const response = await SupportMessage(data);

        if (response?.data.errCode === 0) {
          commit('GET_SUPPORT_STATE', response.data);
        }
      } catch (error) {
        console.error(error);
      }
    },
    async supportAnswer({ commit }, data) {
      try {
        const response = await SupportAnswer(data);

        if (response?.data.errCode === 0) {
          commit('GET_SUPPORT_STATE', response.data);
        }
      } catch (error) {
        console.error(error);
      }
    },

    async supportAnswerAdditional({ commit }, data) {
      try {
        const response = await SupportAnswerAdditional(data);

        if (response?.data.errCode === 0) {
          commit('GET_SUPPORT_STATE', response.data);
        }
      } catch (error) {
        console.error(error);
      }
    },

    async supportInquiryCount({ commit }) {
      try {
        const response = await SupportInquiryCount();

        if (response?.data.errCode === 0) {
          commit('GET_INQUIRY_COUNT', response.data);
        }
      } catch (error) {
        console.error(error);
      }
    },

    async noticeTransaction({ commit }, data) {
      try {
        const response = await NoticeTransaction(data);
        if (response?.data.errCode === 0) {
          commit('GET_NOTICE_TRANSACTION_STATE', response.data);
        }
      } catch (error) {
        console.error(error);
      }
    },
    async noticePosting({ commit }, data) {
      try {
        const response = await NoticePosting(data);
        if (response?.data.errCode === 0) {
          commit('GET_NOTICE_TRANSACTION_STATE', response.data);
        }
      } catch (error) {
        console.error(error);
      }
    },
  },
};

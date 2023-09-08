import {
  Login,
  ManagerRefreshToken,
  ManagerAlarmList,
  PaymentAlarmList,
  PartnerMyInfo,
  CoinList,
  PartnerWalletInfo,
  CurrencyList,
  DashboardCountPartner,
  DashboardCountCSmaster,
} from '@/store/api';

import { comma } from '@/assets/js/global.js';

import router from '@/router';
import { auth, storageSetItem, storageSetItems, storageGetItem } from '@/assets/js/global.js';
import store from '../index';
import { apis } from '../api';
import { notification } from 'ant-design-vue';

const errorConfirmation = (errMessage) => {
  const type = 'error';
  const text = errMessage;

  notification[type]({
    message: text,
    duration: 10,
  });
};

const defaultState = () => {
  return {
    beforeRequest: () => {},
    token: null,
    signInfo: {
      sn: 0,
      grade: 1,
    },
    userInfo: {},
    tokenExpiredError: {},
    subordinateUsersList: [],
    followersSn: [],
    allUsersList: [],
    error: {},
    remember: false,
    usersFigureList: [],
    managers: [{ value: 'all', label: 'All' }],
    copiedAddress: '',
    overlapLogin: {},
    managerAlarms: { isAlarm: false, list: [] },
    paymentAlarms: { isAlarm: false, list: [] },
    gmailAlarms: { isAlarm: false, list: [] },
    partnerInfo: {},
    notification: true,
    coinList: [],
    coin_cd: '',
    swapCoinList: [],
    partnerWallets: [],
    partnerCoinList: [],
    currencyList: [],
    dashboardCounts: {},
    shareSASQuery: '',
    timezoneList: [],
    loading: {
      PartnerWalletInfo: true,
    },
    csNoticeCategoryList: {},
    partnerChartData: {},
  };
};

export const sign = {
  namespaced: true,
  state: defaultState(),
  getters: {},
  mutations: {
    SET_BEFORE_REQUEST(state, val) {
      state.beforeRequest = val;
    },
    SET_MANAGERS(state, value) {
      let items = [];
      for (let i = 0; i < value?.length; i++) {
        const el = value[i];
        const item = {
          value: el.user_Id,
          label: el.user_Id,
        };
        items.push(item);
      }
      let list = [{ value: 'all', label: 'common.select.all' }, ...items];
      state.managers = list;

      storageSetItem('_managers', state.managers);
    },
    SET_USERS_INFO(state, values) {
      state.subordinateUsersList = values;
      values.forEach((item) => {
        if (item.followers.length > 0) {
          for (let i = 0; i < item.followers.length; i++) {
            const el = item.followers[i];
            state.followersSn.push(el.sn);
          }
        }
      });
      storageSetItems(['_subordinateUsersList', '_followersSn'], [state.subordinateUsersList, state.followersSn]);
    },
    SIGN_IN_DATA(state, values) {
      store.commit('common/SET_STOP_REQUEST', false);
      state.token = values.returnData.api_Token;
      state.loggedInUserSn = values.returnData.sn;

      state.signInfo = {
        sn: values.returnData.sn,
        grade: values.returnData.grade,
      };
      state.userInfo = {
        base_Rate: values.returnData.base_Rate,
        master_Rate: values.returnData.master_Rate,
        referral_Code: values.returnData.referral_Code,
        user_Id: values.returnData.user_Id,
      };
      storageSetItems(['_token', '_signInfo', '_userInfo'], [state.token, state.signInfo, state.userInfo]);
      router.push('/');
    },
    SET_USERS_FIGURE(state, values) {
      const type = values.type;
      const list = values.list === undefined ? state.subordinateUsersList : values.list;
      let items = [
        {
          title: 'component.label.users',
          value: 0,
          icon: 'users',
        },
        {
          title: 'component.label.active_users',
          value: 0,
          icon: 'user-clock',
        },
        {
          title: 'component.label.new_users',
          value: 0,
          icon: 'totalNewMember',
        },
        {
          title: 'component.label.expired_users',
          value: 0,
          icon: 'expiredTotalMember',
        },
      ];

      let tempCount = [0, 0, 0, 0];

      if (type === 'all') {
        list?.forEach((each) => {
          tempCount[0] = tempCount[0] + each.totalFollowers;
          tempCount[1] = tempCount[1] + each.activeFollowers;
          tempCount[2] = tempCount[2] + each.newFollowers;
          tempCount[3] = tempCount[3] + each.expiredFollowers;
        });
      } else {
        list.forEach((each) => {
          if (each.user_Id === values.type) {
            tempCount[0] = each.totalFollowers;
            tempCount[1] = each.activeFollowers;
            tempCount[2] = each.newFollowers;
            tempCount[3] = each.expiredFollowers;
          }
        });
      }

      for (let i = 0; i < items.length; i++) {
        const el = items[i];
        el.value = tempCount[i];
      }
      state.usersFigureList = items;
    },
    async SIGN_OUT(state, value) {
      const navigationResult = await router.push('/sign-in');
      if (navigationResult) {
        // errorConfirmation('please refresh');
      } else {
        const lang = storageGetItem('_lang');
        await store.dispatch('sign/setSignOut');

        sessionStorage.clear();
        storageSetItem('_lang', lang);
      }
    },
    SET_ALL_USERS_LIST(state, values) {
      let allUsers = [];

      values.forEach((each) => {
        each.followers.forEach((each) => {
          allUsers.push(each);
        });
      });

      state.allUsersList = allUsers;
      storageSetItem('_allUsersList', state.allUsersList);
    },
    GET_REFRESH_TOKEN(state, value) {
      if (value.errCode === 0) {
        state.tokenExpiredError = value;
        state.token = value.returnData.api_Token;
        storageSetItem('_token', state.token);
        store.commit('common/SET_STOP_REQUEST', false);
      } else {
        state.tokenExpiredError = value;
      }
    },
    MANAGER_ALARM_LIST(state, value) {
      state.managerAlarms.isAlarm = false;
      state.managerAlarms.list = [];
      const items = [
        {
          type: 'dispute',
          date: value.disputeDT,
          msg: value.disputeMsg,
          link: '/dispute-adjustment',
        },
        // {
        //   type: 'support',
        //   date: value.supportDT,
        //   msg: value.supportMsg,
        //   link: '/customer-inquiries',
        // },
      ];
      items.forEach((e) => {
        if (e.date !== '') {
          state.managerAlarms.list.push(e);
        }
      });
      if (state.managerAlarms.list.length > 0) {
        state.managerAlarms.isAlarm = true;
      }
    },
    PAYMENT_ALARM_LIST(state, value) {
      state.paymentAlarms.isAlarm = false;
      state.paymentAlarms.list = [];

      let depositLink =
        state.signInfo.grade === 40
          ? '/partner-e-payment-history'
          : state.signInfo.grade === 41
          ? '/partner-p-payment-history'
          : '/user-payment-history';
      // let settlementLink = state.signInfo.grade === auth.Enterprise ? '/partner-settlement' : '/settlement-request';
      let withdrawLink =
        state.signInfo.grade === 40
          ? '/partner-e-withdrawal-request'
          : state.signInfo.grade === 41
          ? '/partner-p-withdrawal-request'
          : '/withdrawal-request';
      let supportLink = state.signInfo.grade === auth.Enterprise ? '/partner-support' : '/customer-inquiries';

      const items = [
        {
          type: 'deposit',
          date: value.depositDT,
          msg: value.depositMsg,
          link: depositLink,
        },
        {
          type: 'newPartner',
          date: value.newPartnerDT,
          msg: value.newPartnerMsg,
          link: '/partners',
        },
        // {
        //   type: 'settlement',
        //   date: value.settlementDT,
        //   msg: value.settlementMsg,
        //   link: settlementLink,
        // },
        {
          type: 'withdraw',
          date: value.withdrawDT,
          msg: value.withdrawMsg,
          link: withdrawLink,
        },
        {
          type: 'support',
          date: value.supportDT,
          msg: value.supportMsg,
          link: supportLink,
        },
      ];

      items.forEach((e) => {
        if (e.date !== '' && e.date !== null) {
          state.paymentAlarms.list.push(e);
        }
      });

      if (state.paymentAlarms.list.length > 0) {
        state.paymentAlarms.isAlarm = true;
      }
    },

    GET_DASHBOARD_COUNTS(state, value) {
      state.dashboardCounts = value;
      storageSetItem('_dashboardCounts', state.dashboardCounts);
    },
    GET_GMAIL_ALARMS_LIST(state, value) {
      const countList = value.returnData.filter((e) => e.unReadMailCount > 0);

      if (value.errCode === 0) {
        state.gmailAlarms.isAlarm = countList.length > 0 ? true : false;
        state.gmailAlarms.list = value.returnData;
      }
    },
    // payment
    PARTNER_INFO(state, value) {
      state.partnerInfo = value;
    },
    GET_COINLIST(state, value) {
      let items = [];
      state.coin_cd = '';
      value.forEach((el) => {
        const item = {
          value: el.coin_Cd,
          label: el.symbol,
          checked: true,
          disabled: false,
          ...el,
        };
        state.coin_cd += el.coin_Cd;
        items.push(item);
      });
      state.coin_cd = state.coin_cd.split('').join(',');
      state.coinList = items;
      state.swapCoinList = items.filter((data) => data.label !== 'CPESO');
      storageSetItem('_coinList', state.coinList);
    },
    GET_PARTNER_WALLET_INFO(state, value) {
      state.partnerWallets = value;
      storageSetItem('_partnerWallets', state.partnerWallets);
    },
    SET_PARTNER_COIN_LIST(state, value) {
      state.partnerCoinList = state.coinList;
      let partnerCoinArr = [];
      value.filter((e) => {
        partnerCoinArr.push(e.coin_Cd);
      });

      state.partnerCoinList.map((e) => {
        if (!partnerCoinArr.includes(e.coin_Cd)) {
          e.disabled = true;
        }
      });
    },
    GET_CURRENCYLIST(state, value) {
      let items = [];
      value.forEach((e) => {
        const item = {
          value: e.coin_Cd,
          label: e.symbol,
          ...e,
        };
        items.push(item);
      });

      state.currencyList = items;
      storageSetItem('_currencyList', state.currencyList);
    },
    SET_SHARE_SAS_QUERY(state, value) {
      state.shareSASQuery = value;
      storageSetItem('_shareSASQuery', state.shareSASQuery);
    },
    GET_TIMEZONE_LIST(state, value) {
      state.timezoneList = value;
      storageSetItem('_timezoneList', state.timezoneList);
    },
    SET_NOTIFICATION(state, data) {
      if (data === 'toggle') {
        state.notification = !state.notification;
      } else {
        state.notification = data;
      }
      storageSetItem('_notification', state.notification);
    },
    GET_CS_NOTICE_CATEGORY_LIST(state, val) {
      const register = {
        firstCategories: [],
        secondCategories: [],
      };
      const search = {
        firstCategories: [{ value: 0, label: 'search.select.all' }],
        secondCategories: [[], []],
      };

      const firstCategoryText = [
        [
          {
            value: 1,
            label: 'search.select.notice',
          },
          {
            value: 2,
            label: 'search.select.faq',
          },
        ],
        [
          {
            value: 0,
            label: 'search.select.all',
          },
          {
            value: 1,
            label: 'search.select.notice',
          },
          {
            value: 2,
            label: 'search.select.faq',
          },
        ],
      ];
      const secondCategoryText = [
        [
          [
            {
              value: 1,
              label: 'search.select.notification',
            },
            {
              value: 2,
              label: 'search.select.patch',
            },
            {
              value: 3,
              label: 'search.select.important',
            },
            {
              value: 4,
              label: 'search.select.news',
            },
            {
              value: 5,
              label: 'search.select.event',
            },
          ],
          [
            {
              value: 1,
              label: 'search.select.cpass_wallet',
            },
            {
              value: 2,
              label: 'search.select.cpass_payment',
            },
            {
              value: 3,
              label: 'search.select.otc_bay',
            },
            {
              value: 4,
              label: 'search.select.cpass_partners',
            },
            {
              value: 5,
              label: 'search.select.other_topics',
            },
          ],
        ],
        [
          [],
          [],
          [
            {
              value: 0,
              label: 'search.select.all',
            },
            {
              value: 1,
              label: 'search.select.cpass_wallet',
            },
            {
              value: 2,
              label: 'search.select.cpass_payment',
            },
            {
              value: 3,
              label: 'search.select.otc_bay',
            },
            {
              value: 4,
              label: 'search.select.cpass_partners',
            },
            {
              value: 5,
              label: 'search.select.other_topics',
            },
          ],
        ],
      ];

      val.forEach((e) => {
        if (e.type === 0) {
          e.category.forEach((item, index) => {
            const firstObj = firstCategoryText[e.type].filter((e) => e.value === item.mainValue)[0];
            const secondObj = item.subCategoryCode.map((subValue) => {
              return secondCategoryText[e.type][index].filter((e) => e.value === subValue)[0];
            });
            register.firstCategories.push(firstObj);
            register.secondCategories.push(secondObj);
          });
        } else if (e.type === 1) {
          e.category.forEach((item, index) => {
            const firstObj = firstCategoryText[e.type].filter((e) => e.value === item.mainValue)[0];
            if (index === 1) {
              const secondValue = item.subCategoryCode.map((subValue) => {
                return secondCategoryText[e.type][index + 1].filter((e) => e.value === subValue)[0];
              });
              secondValue.unshift({ value: 0, label: 'search.select.all' });
              search.secondCategories.push(secondValue);
            }
            // search.firstCategories[0].label = 'search.select.all';
            search.firstCategories.push(firstObj);
          });
        }
      });

      state.csNoticeCategoryList = { register: register, search: search };
      storageSetItem('_csNoticeCategoryList', state.csNoticeCategoryList);
    },

    GET_ALL_PARTNER_WALLET_INFO(state, { commit }) {
      commit('GET_PARTNER_WALLET_INFO', state.partnerWallets);
      commit('SET_PARTNER_COIN_LIST', state.partnerWallets);
    },
    GET_ALL_COIN_INFO(state, { commit }) {
      commit('GET_COINLIST', state.coinList);
    },
  },
  actions: {
    async setSignIn({ commit }, data) {
      const user = { User_Id: data.email, Password: data.password };
      try {
        const response = await Login(user);
        if (response?.data.errCode === 0) {
          commit('SIGN_IN_DATA', response.data);
        }
      } catch (error) {
        console.error(error);
      }
    },

    async setSignOut({ commit, state }) {
      await Object.assign(state, defaultState());
    },

    async GetSubManager({ commit }, data) {
      try {
        const response = await apis.GetSubManager(data);
        const getData = response.data.returnData;

        if (response?.data.errCode === 0) {
          commit('SET_USERS_INFO', getData);
          commit('SET_USERS_FIGURE', { type: 'all', list: getData });
          commit('SET_ALL_USERS_LIST', getData);
        }
      } catch (error) {
        console.error(error);
      }
    },
    async signOut({ commit }) {
      try {
        commit('SIGN_OUT');
      } catch (e) {
        console.error(e);
      }
    },
    async refreshToken({ commit, dispatch }) {
      try {
        const response = await ManagerRefreshToken();
        if (response?.data.errCode === 0) {
          commit('GET_REFRESH_TOKEN', response.data);
          await dispatch(GetShareSASQuery);
        }
      } catch (error) {
        console.error(error);
      }
    },
    async managerAlarmList({ commit }) {
      try {
        const response = await ManagerAlarmList();
        if (response?.data.errCode === 0) {
          commit('MANAGER_ALARM_LIST', response.data.returnData);
        }
      } catch (error) {
        console.error(error);
      }
    },
    async paymentAlarmList({ commit }) {
      try {
        const response = await PaymentAlarmList();
        if (response?.data.errCode === 0) {
          commit('PAYMENT_ALARM_LIST', response.data.returnData);
        }
      } catch (error) {
        console.error(error);
      }
    },
    // payment
    async partnerMyInfo({ commit }) {
      try {
        const response = await PartnerMyInfo();
        if (response?.data.errCode === 0) {
          commit('PARTNER_INFO', response.data.returnData);
          storageSetItem('_partnerInfo', response.data.returnData);
        }
      } catch (error) {
        console.error(error);
      }
    },
    async coinList({ commit }) {
      try {
        const response = await CoinList();
        if (response?.data.errCode === 0) {
          commit('GET_COINLIST', response.data.returnData);
        }
      } catch (error) {
        console.error(error);
      }
    },
    async partnerWalletInfo({ state, commit }) {
      state.loading.PartnerWalletInfo = true;
      try {
        const response = await PartnerWalletInfo();
        if (response?.data.errCode === 0) {
          commit('GET_PARTNER_WALLET_INFO', response.data.returnData);
          commit('SET_PARTNER_COIN_LIST', response.data.returnData);
          state.loading.PartnerWalletInfo = false;
        }
      } catch (error) {
        console.error(error);
      }
    },
    async currencyList({ commit }) {
      try {
        const response = await CurrencyList();
        if (response?.data.errCode === 0) {
          commit('GET_CURRENCYLIST', response.data.returnData);
        }
      } catch (error) {
        console.error(error);
        0;
      }
    },
    async dashboardCountPartner({ commit }) {
      try {
        const response = await DashboardCountPartner();
        if (response?.data.errCode === 0) {
          commit('GET_DASHBOARD_COUNTS', response.data.returnData);
        }
      } catch (error) {
        console.error(error);
      }
    },
    async dashboardCountCSmaster({ commit }) {
      try {
        const response = await DashboardCountCSmaster();
        if (response?.data.errCode === 0) {
          commit('GET_DASHBOARD_COUNTS', response.data.returnData);
        }
      } catch (error) {
        console.error(error);
      }
    },
    async ShareSASQuery({ commit }) {
      try {
        const response = await apis.GetShareSASQuery();
        if (response?.data.errCode === 0) {
          commit('SET_SHARE_SAS_QUERY', response.data.returnData);
        }
      } catch (e) {
        console.error(e);
      }
    },
    async TimezoneList({ commit }, data) {
      try {
        const response = await apis.TimezoneList(data);
        if (response?.data.errCode === 0) {
          commit('GET_TIMEZONE_LIST', response.data.returnData);
        }
      } catch (error) {
        console.error(error);
      }
    },
    async CsNoticeCategoryList({ commit }, data) {
      try {
        const response = await apis.CsNoticeCategoryList();
        if (response?.data.errCode === 0) {
          commit('GET_CS_NOTICE_CATEGORY_LIST', response.data.returnData);
        }
      } catch (error) {
        console.error(error);
      }
    },
  },
};

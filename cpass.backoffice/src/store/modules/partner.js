import {
  PartnerApproval,
  PartnerRefusal,
  PartnerUpdate,
  PartnerName,
  PaymentConfirm,
  WithdrawPrice,
  PartnerWithdraw,
  PartnerApprovalGuaranteeMailSend,
  SendInquiry,
  PaymentSwapPrice,
  PaymentSwapWalletInfo,
  PaymentSwapTransaction,
  CSmasterWithdrawUser,
  apis,
} from '@/store/api';

const defaultState = () => {
  return {
    refusalSuccess: '',
    refusalError: '',
    errData: '',
    partnerNames: [],
    dashboardChart: [],
    userPaymentConfirmMsg: {},
    withdrawStateMsg: {},
    withdrawPrice: {},
    partnerWithdrawMsg: {},
    approvalGuaranteeMainMsg: '',
    approvalGuaranteeMsg: {
      type: '',
      message: '',
    },
    emailInquiryRes: {},
    swapPriceInfo: {},
    swapWalletInfo: {},
    swapTransactionMsg: {},
    partnerWithdrawalInfo: { isPartnerWithdrawed: false, rejectReason: '' },
    partnerPaymentInformationList: {},
    partnerWithdrawalRequestList: {},
    partnerPaymentRequestListPush: {},
    paymentVerifyAccount: {},
    paymentOrderSign: {},
    paymentRequestPay: {},
    partnerWithdrawalPrice: {},
    paymentRequestPayAgain: {},
    partnerWithdrawStateChange: {},
    memberMailCertificationConfirm: {},
    // memberResetPassword: {},
    partnerSmallBusinessFavorite: {},
    partnerSmallBusinessFavoriteUpsert: {},
    partnerSmallBusinessRecentList: {},
    partnerSmallBusinessFavoriteDelete: {},
    //
    paymentAcceptCount: {},
    paymentUnidentifiedList: {},
    partnerSalesStatsByCoin: {},
    salesStatsByMonth: {},
    salesStatsByDate: {},
    dealStatsByCoin: {},
    dealStatsByPayment: {},

    otcBayNicknameData: null,
    otcBayUpdate: false,
    changePassword: {},
    loading: {
      paymentAcceptCount: true,
      paymentUnidentifiedList: true,
      partnerSalesStatsByCoin: true,
      salesStatsByMonth: true,
      salesStatsByDate: true,
      dealStatsByCoin: true,
      dealStatsByPayment: true,
    },
    //headerInfo
    headerInfo: {},
    headerModalInfo: {},
    headerPreviousData: {},
    isRefresh: {
      paymentAcceptCount: false,
      paymentSalesStatus: false,
      partnerWalletTotal: false,
      recentPaymentList: false,
    },
    undefinedCurrentSn: null,
    remoteRefresh: false,
    //dashboard
    paymentRequestConfirm: {},
    paymentWithdrawal: {},
    paymentDeclineApp: {},
  };
};

export const partner = {
  namespaced: true,
  state: defaultState(),
  getters: {},
  mutations: {
    PARTNER_RESET(state) {
      Object.assign(state, defaultState());
    },
    GET_PARTNER_APPROVAL(state, value) {
      state.errData = value;

      switch (value.errCode) {
        case 0:
          state.refusalSuccess = value.errMessage;
          break;
        default:
          state.refusalError = value.errMessage;
          break;
      }
    },
    GET_PARTNER_REFUSAL(state, value) {
      state.errData = value;
      switch (value.errCode) {
        case 0:
          state.refusalSuccess = value.returnData;
          break;
        default:
          state.refusalError = value.errMessage;
          break;
      }
    },
    GET_PARTNER_UPDATE(state, value) {
      state.errData = value;
      switch (value.errCode) {
        case 0:
          state.refusalSuccess = 'Successfully saved.';
          break;
        default:
          state.refusalError = 'Error.';
          break;
      }
    },
    GET_PARTNER_NAME(state, value) {
      state.partnerNames = value;
    },
    GET_PAYMENT_CONFIRM(state, value) {
      state.userPaymentConfirmMsg = value;
    },
    GET_WITHDRAW_STATE(state, value) {
      state.withdrawStateMsg = value;
    },
    GET_WITHDRAW_PRICE(state, value) {
      state.withdrawPrice = value.returnData;
    },
    GET_PARTNER_WITHDRAW(state, value) {
      state.partnerWithdrawMsg = value;
    },
    SEND_APPROVAL_GUARANTEE_MAIL(state, value) {
      if (value.errCode < 0) {
        state.approvalGuaranteeMsg.type = 'error';
        state.approvalGuaranteeMsg.message = value.errMessage;
      } else {
        state.approvalGuaranteeMsg.type = 'success';
        state.approvalGuaranteeMsg.message = value.errMessage;
      }
    },
    SEND_INQUIRY(state, value) {
      state.emailInquiryRes = value;
    },
    GET_SWAP_PRICE(state, value) {
      state.swapPriceInfo = value.returnData;
    },
    GET_SWAP_WALLET(state, value) {
      state.swapWalletInfo = value.returnData;
    },
    GET_SWAP_TRANSACTION(state, value) {
      state.swapTransactionMsg = value;
    },
    CHECK_PARTNER_CANCELLATION(state, value) {
      state.partnerWithdrawalInfo.isPartnerWithdrawed = false;
      state.partnerWithdrawalInfo.rejectReason = '';

      if (value.errCode === 0) {
        state.partnerWithdrawalInfo.isPartnerWithdrawed = true;
        state.partnerWithdrawalInfo.rejectReason = value.errMessage;
      } else {
        state.partnerWithdrawalInfo.isPartnerWithdrawed = false;
        state.partnerWithdrawalInfo.rejectReason = value.errMessage;
      }
    },
    SET_PARTNER_PAYMENT_INFORMATION_LIST(state, data) {
      state.partnerPaymentInformationList = data;
    },
    SET_PARTNER_WITHDRAWAL_REQUEST_LIST(state, data) {
      state.partnerWithdrawalRequestList = data;
    },

    SET_PARTNER_PAYMENT_REQUEST_LIST_PUSH(state, data) {
      state.partnerPaymentRequestListPush = data;
    },

    SET_PARTNER_WITHDRAWAL_REQUEST_LIST_PUSH(state, data) {
      state.partnerWithdrawalRequestListPush = data;
    },
    SET_PAYMENT_VERIFY_ACCOUNT(state, data) {
      state.paymentVerifyAccount = data;
      if (data.errCode === 0 && data.returnData.paymentToken !== null) {
        sessionStorage.setItem('_paymentToken', JSON.stringify(data.returnData.paymentToken));
      }
    },
    RESET_PAYMENT_VERIFY_ACCOUNT(state) {
      state.paymentVerifyAccount = {};
      sessionStorage.removeItem('_paymentToken');
    },
    SET_PAYMENT_ORDER_SIGN(state, data) {
      state.paymentOrderSign = data;
    },
    SET_PARTNER_WITHDRAWAL_PRICE(state, data) {
      state.partnerWithdrawalPrice = data;
    },
    SET_PAYMENT_REQUEST_PAY_AGAIN(state, data) {
      state.paymentRequestPayAgain = data;
      if (data.returnData !== null && data.errCode === 0) {
        sessionStorage.setItem('_paymentToken', JSON.stringify(data.returnData.paymentToken));
      }
    },
    SET_PARTNER_WITHDRAW_STATE_CHANGE(state, data) {
      state.partnerWithdrawStateChange = data;
    },
    SET_MEMBER_MAIL_CERTIFICATION_CONFIRM(state, data) {
      state.memberMailCertificationConfirm = data;
    },
    SET_PARTNER_SMALL_BUSINESS_FAVORITE(state, data) {
      state.partnerSmallBusinessFavorite = data;
    },
    SET_PARTNER_SMALL_BUSINESS_FAVORITE_UPSERT(state, data) {
      state.partnerSmallBusinessFavoriteUpsert = data;
    },
    SET_PARTNER_SMALL_BUSINESS_RECENT_LIST(state, data) {
      state.partnerSmallBusinessRecentList = data;
    },
    SET_PARTNER_SMALL_BUSINESS_FAVORITE_DELETE(state, data) {
      state.partnerSmallBusinessFavoriteDelete = data;
    },

    //
    SET_PAYMENT_UNIDENTIFIED_LIST(state, data) {
      state.paymentUnidentifiedList = data;
    },
    SET_SALES_STATS_BY_COIN(state, data) {
      state.partnerSalesStatsByCoin = data;
    },
    SET_PAYMENT_ACCEPT_COUNT(state, data) {
      if (state.headerInfo.paymentAcceptCount === undefined) {
        state.headerPreviousData.paymentAcceptCount = data.returnData;
      }
      state.headerInfo.paymentAcceptCount = data;

      // const Json = (val) => {
      //   return JSON.stringify(Object.entries(val));
      // };
      const pre = state.headerPreviousData.paymentAcceptCount.unidentified_Count;
      const after = state.headerInfo.paymentAcceptCount.returnData.unidentified_Count;

      if (pre !== after) {
        state.isRefresh.paymentAcceptCount = true;
      }
    },
    SET_SALES_STATS_BY_MONTH(state, data) {
      state.salesStatsByMonth = data;
      state.salesStatsByMonth.returnData.map((e) => {
        e.totalDeposit = Number(e.totalDeposit);
        e.totalWithdraw = Number(e.totalWithdraw);
        e.totalFee = Number(e.totalFee);
      });
    },
    SET_SALES_STATS_BY_DATE(state, data) {
      state.salesStatsByDate = data;
    },
    SET_DEAL_STATS_BY_COIN(state, data) {
      state.dealStatsByCoin = data;
    },
    SET_DEAL_STATS_BY_PAYMENT(state, data) {
      state.dealStatsByPayment = data;
    },
    SET_SYSTEM_PROFILE_SEARCH(state, data) {
      if (data.errCode === 0) {
        state.otcBayNicknameData = data.returnData.boards;
      }
    },
    SET_OTC_BAY_UPDATE(state, data) {
      if (data.errCode === 0) {
        state.otcBayUpdate = true;
      }
    },

    SET_PARTNER_CHANGE_PASSWORD(state, data) {
      state.changePassword = data;
    },
    SET_PAYMENT_SALES_STATUS(state, data) {
      if (state.headerInfo.paymentSalesStatus === undefined) {
        state.headerPreviousData.paymentSalesStatus = data.returnData;
      }
      state.headerInfo.paymentSalesStatus = data;

      const Json = (val) => {
        return JSON.stringify(Object.entries(val));
      };
      const pre = Json(state.headerPreviousData.paymentSalesStatus);
      const after = Json(state.headerInfo.paymentSalesStatus.returnData);

      if (pre !== after) {
        state.isRefresh.paymentSalesStatus = true;
      }
    },
    SET_PARTNER_WALLET_TOTAL(state, data) {
      if (state.headerInfo.partnerWalletTotal === undefined) {
        state.headerPreviousData.partnerWalletTotal = data.returnData;
      } else {
        state.headerInfo.partnerWalletTotal = data;
        const Json = (val) => {
          return JSON.stringify(Object.entries(val));
        };
        const pre = Json(state.headerPreviousData.partnerWalletTotal?.total_Balance);
        const after = Json(state.headerInfo.partnerWalletTotal.returnData?.total_Balance);

        if (pre !== after) {
          state.isRefresh.partnerWalletTotal = true;
        }
      }
      state.headerInfo.partnerWalletTotal = data;
    },
    SET_PAYMENT_RECENT_PAYMENT_LIST(state, data) {
      if (state.headerInfo.recentPaymentList === undefined) {
        state.headerPreviousData.recentPaymentList = data.returnData;
      }
      state.headerInfo.recentPaymentList = data;

      const Json = (val) => {
        return JSON.stringify(Object.entries(val));
      };

      const pre = Json(state.headerPreviousData.recentPaymentList);
      const after = Json(state.headerInfo.recentPaymentList.returnData);
    },
    SET_PAYMENT_RECENT_PAYMENT_LIST_MODAL(state, data) {
      state.headerModalInfo.recentPaymentList = data;
    },
    SET_REFRESH(state, data) {
      state.isRefresh[data.data] = data.value;
      if (data.data === 'paymentAcceptCount') {
        state.headerPreviousData.paymentAcceptCount.unidentified_Count =
          state.headerInfo.paymentAcceptCount.returnData.unidentified_Count;
      } else if (data.data === 'paymentSalesStatus') {
        state.headerPreviousData.paymentSalesStatus = state.headerInfo.paymentSalesStatus.returnData;
      } else if (data.data === 'partnerWalletTotal') {
        state.headerPreviousData.partnerWalletTotal = state.headerInfo.partnerWalletTotal.returnData;
      }
    },
    SET_UNDEFINED_LIST_CURRENT_SN(state, data) {
      state.undefinedCurrentSn = Number(state.paymentUnidentifiedList?.returnData[data - 1]?.user_Id.split('||')[0]);
    },
    SET_TOGGLE_REMOTE_REFRESH(state, data) {
      state.remoteRefresh = true;
      setTimeout(() => {
        state.remoteRefresh = false;
      }, 10);
    },
    SET_PAYMENT_REQUEST_PAY(state, data) {
      state.paymentRequestPay = data;
    },
    SET_PAYMENT_REQUEST_CONFIRM(state, data) {
      state.paymentRequestConfirm = data;
    },
    SET_PAYMENT_WITHDRAWAL(state, data) {
      state.paymentWithdrawal = data;
    },
    SET_PAYMENT_DECLINE_APP(state, data) {
      state.paymentDeclineApp = data;
    },
  },
  actions: {
    async partnerApproval({ commit }, data) {
      try {
        const response = await PartnerApproval(data);
        if (response?.data.errCode === 0) {
          commit('GET_PARTNER_APPROVAL', response.data);
        }
      } catch (error) {
        console.error(error);
      }
    },
    async partnerRefusal({ commit }, data) {
      try {
        const response = await PartnerRefusal(data);
        if (response?.data.errCode === 0) {
          commit('GET_PARTNER_REFUSAL', response.data);
        }
      } catch (error) {
        console.error(error);
      }
    },
    async partnerUpdate({ commit }, data) {
      try {
        const response = await PartnerUpdate(data);
        if (response?.data.errCode === 0) {
          commit('GET_PARTNER_UPDATE', response.data);
        }
      } catch (error) {
        console.error(error);
      }
    },
    async partnerName({ commit }) {
      try {
        const response = await PartnerName();

        if (response?.data.errCode === 0) {
          commit('GET_PARTNER_NAME', response.data.returnData);
        }
      } catch (error) {
        console.error(error);
      }
    },
    async paymentConfirm({ commit }, data) {
      try {
        const response = await PaymentConfirm(data);
        if (response?.data.errCode === 0) {
          commit('GET_PAYMENT_CONFIRM', response.data);
        }
      } catch (error) {
        console.error(error);
      }
    },

    async withdrawPrice({ commit }, data) {
      try {
        const response = await WithdrawPrice(data);
        if (response?.data.errCode === 0) {
          commit('GET_WITHDRAW_PRICE', response.data);
        }
      } catch (error) {
        console.error(error);
      }
    },
    async partnerWithdraw({ commit }, data) {
      try {
        const response = await PartnerWithdraw(data);
        commit('GET_PARTNER_WITHDRAW', response.data);
      } catch (error) {
        console.error(error);
      }
    },
    async partnerApprovalGuaranteeMailSend({ commit }, data) {
      try {
        const response = await PartnerApprovalGuaranteeMailSend(data);
        if (response?.data.errCode === 0) {
          commit('SEND_APPROVAL_GUARANTEE_MAIL', response.data);
        }
      } catch (error) {
        console.error(error);
      }
    },
    async sendInquiry({ commit }, data) {
      try {
        const response = await SendInquiry(data);
        if (response?.data.errCode === 0) {
          commit('SEND_INQUIRY', response.data);
        }
      } catch (error) {
        console.error(error);
      }
    },
    async paymentSwapPrice({ commit }, data) {
      try {
        const response = await PaymentSwapPrice(data);
        if (response?.data.errCode === 0) {
          commit('GET_SWAP_PRICE', response.data);
        }
      } catch (error) {
        console.error(error);
      }
    },
    async paymentSwapWalletInfo({ commit }, data) {
      try {
        const response = await PaymentSwapWalletInfo(data);
        if (response?.data.errCode === 0) {
          commit('GET_SWAP_WALLET', response.data);
        }
      } catch (error) {
        console.error(error);
      }
    },
    async paymentSwapTransaction({ commit }, data) {
      try {
        const response = await PaymentSwapTransaction(data);
        if (response?.data.errCode === 0) {
          commit('GET_SWAP_TRANSACTION', response.data);
        }
      } catch (error) {
        console.error(error);
      }
    },
    async cSmasterWithdrawUser({ commit }, data) {
      try {
        const response = await CSmasterWithdrawUser(data);
        if (response?.data.errCode === 0) {
          commit('CHECK_PARTNER_CANCELLATION', response.data);
        }
      } catch (error) {
        console.error(error);
      }
    },

    async PartnerPaymentInformationList({ commit }, data) {
      try {
        const response = await apis.PartnerPaymentInformationList(data);
        if (response?.data.errCode === 0) {
          commit('SET_PARTNER_PAYMENT_INFORMATION_LIST', response.data.returnData);
        }
      } catch (e) {
        console.error(e);
      }
    },

    async PartnerWithdrawalRequestList({ commit }, data) {
      try {
        const response = await apis.PartnerWithdrawalRequestList(data);
        if (response?.data.errCode === 0) {
          commit('SET_PARTNER_WITHDRAWAL_REQUEST_LIST', response.data.returnData);
        }
      } catch (e) {
        console.error(e);
      }
    },

    async PartnerWithdrawStateChange({ commit }, data) {
      try {
        const response = await apis.PartnerWithdrawStateChange(data);
        if (response?.data.errCode === 0) {
          commit('SET_PARTNER_WITHDRAW_STATE_CHANGE', response.data);
        }
      } catch (e) {
        console.error(e);
      }
    },

    async PartnerPaymentRequestListPush({ commit, state }, data) {
      try {
        const response = await apis.PartnerPaymentRequestListPush(data);
        if (response?.data.errCode === 0) {
          commit('SET_PARTNER_PAYMENT_REQUEST_LIST_PUSH', response.data.returnData);
        }
      } catch (e) {
        console.error(e);
      }
    },

    async PaymentDeclineApp({ commit }, data) {
      try {
        const response = await apis.PaymentDeclineApp(data);
        if (response?.data.errCode === 0) {
          commit('SET_PAYMENT_DECLINE_APP', response.data);
        }
      } catch (e) {
        console.error(e);
      }
    },

    async PartnerWithdrawalRequestListPush({ commit, state }, data) {
      try {
        const response = await apis.PartnerWithdrawalRequestListPush(data);
        if (response?.data.errCode === 0) {
          commit('SET_PARTNER_WITHDRAWAL_REQUEST_LIST_PUSH', response.data.returnData);
        }
      } catch (e) {
        console.error(e);
      }
    },

    async PaymentVerifyAccount({ commit }, data) {
      try {
        const response = await apis.PaymentVerifyAccount(data);
        commit('SET_PAYMENT_VERIFY_ACCOUNT', response.data);
      } catch (e) {
        console.error(e);
      }
    },
    async PaymentOrderSign({ commit }, data) {
      try {
        const response = await apis.PaymentOrderSign(data);
        commit('SET_PAYMENT_ORDER_SIGN', response.data);
      } catch (e) {
        console.error(e);
      }
    },
    async PaymentRequestPay({ commit }, data) {
      try {
        const response = await apis.PaymentRequestPay(data);
        commit('SET_PAYMENT_REQUEST_PAY', response.data);
      } catch (e) {
        console.error(e);
      }
    },
    async PartnerWithdrawalPrice({ commit }, data) {
      try {
        const response = await apis.PartnerWithdrawalPrice(data);
        if (response.data.errCode === 0) {
          commit('SET_PARTNER_WITHDRAWAL_PRICE', response.data.returnData);
        }
      } catch (e) {
        console.error(e);
      }
    },
    async PaymentWithdrawal({ commit }, data) {
      try {
        const response = await apis.PaymentWithdrawal(data);
        commit('SET_PAYMENT_WITHDRAWAL', response.data);
      } catch (e) {
        console.error(e);
      }
    },
    async PaymentRequestPayAgain({ commit }, data) {
      try {
        const response = await apis.PaymentRequestPayAgain(data);
        commit('SET_PAYMENT_REQUEST_PAY_AGAIN', response.data);
      } catch (e) {
        console.error(e);
      }
    },
    async PaymentRequestConfirm({ commit }, data) {
      try {
        const response = await apis.PaymentRequestConfirm(data);
        commit('SET_PAYMENT_REQUEST_CONFIRM', response.data);
      } catch (e) {
        console.error(e);
      }
    },
    async MemberMailCertification({ commit }, data) {
      try {
        const response = await apis.MemberMailCertification(data);
      } catch (e) {
        console.error(e);
      }
    },
    async MemberMailCertificationConfirm({ commit }, data) {
      try {
        const response = await apis.MemberMailCertificationConfirm(data);
        commit('SET_MEMBER_MAIL_CERTIFICATION_CONFIRM', response.data);
      } catch (e) {
        console.error(e);
      }
    },
    async PartnerChangePassword({ commit }, data) {
      try {
        const response = await apis.PartnerChangePassword(data);
        commit('SET_PARTNER_CHANGE_PASSWORD', response.data);
      } catch (e) {
        console.error(e);
      }
    },
    async PartnerSmallBusinessRecentList({ commit }, data) {
      try {
        const response = await apis.PartnerSmallBusinessRecentList(data);
        commit('SET_PARTNER_SMALL_BUSINESS_RECENT_LIST', response.data);
      } catch (e) {
        console.error(e);
      }
    },
    async PartnerSmallBusinessFavorite({ commit }, data) {
      try {
        const response = await apis.PartnerSmallBusinessFavorite(data);
        commit('SET_PARTNER_SMALL_BUSINESS_FAVORITE', response.data);
      } catch (e) {
        console.error(e);
      }
    },
    async PartnerSmallBusinessFavoriteUpsert({ commit }, data) {
      try {
        const response = await apis.PartnerSmallBusinessFavoriteUpsert(data);
        commit('SET_PARTNER_SMALL_BUSINESS_FAVORITE_UPSERT', response.data);
      } catch (e) {
        console.error(e);
      }
    },
    async PartnerSmallBusinessFavoriteDelete({ commit }, data) {
      try {
        const response = await apis.PartnerSmallBusinessFavoriteDelete(data);
        commit('SET_PARTNER_SMALL_BUSINESS_FAVORITE_DELETE', response.data);
      } catch (e) {
        console.error(e);
      }
    },
    //dashBoard
    async PartnerSalesStatsByCoin({ commit, state }, data) {
      state.partnerSalesStatsByCoin = {};
      state.loading.partnerSalesStatsByCoin = true;
      try {
        const response = await apis.PartnerSalesStatsByCoin(data);
        state.loading.partnerSalesStatsByCoin = false;
        // commit('SET_PARTNER_TRANSACTION_PRICE', response.data);
        if (response.data.returnData !== [] && response.data.returnData.length > 0) {
          commit('SET_SALES_STATS_BY_COIN', response.data);
        } else {
          //error
        }
      } catch (e) {
        console.error(e);
      }
    },
    async PartnerPaymentAcceptCount({ commit, state }) {
      try {
        const response = await apis.PartnerPaymentAcceptCount();
        if (response.data.errCode === 0) {
          commit('SET_PAYMENT_ACCEPT_COUNT', response.data);
        }
      } catch (e) {
        console.error(e);
      }
    },
    async PartnerPaymentUnidentifiedList({ commit, state }) {
      try {
        state.loading.paymentUnidentifiedList = true;
        const response = await apis.PartnerPaymentUnidentifiedList();
        if (response.data.errCode === 0) {
          commit('SET_PAYMENT_UNIDENTIFIED_LIST', response.data);
          state.loading.paymentUnidentifiedList = false;
        }
      } catch (e) {
        console.error(e);
      }
    },

    async PartnerSalesStatsByDate({ commit, state }, data) {
      state.loading.salesStatsByDate = true;
      try {
        const response = await apis.PartnerSalesStatsByDate(data);
        commit('SET_SALES_STATS_BY_DATE', response.data);
        state.loading.salesStatsByDate = false;
      } catch (e) {
        console.error(e);
      }
    },
    async PartnerSalesStatsByMonth({ commit, state }, data) {
      state.loading.salesStatsByMonth = true;
      try {
        const response = await apis.PartnerSalesStatsByMonth(data);
        commit('SET_SALES_STATS_BY_MONTH', response.data);
        state.loading.salesStatsByMonth = false;
      } catch (e) {
        console.error(e);
      }
    },
    async PartnerDealStatsByCoin({ commit, state }, data) {
      state.loading.dealStatsByCoin = true;
      try {
        const response = await apis.PartnerDealStatsByCoin(data);
        commit('SET_DEAL_STATS_BY_COIN', response.data);
        state.loading.dealStatsByCoin = false;
      } catch (e) {
        console.error(e);
      }
    },
    async PartnerDealStatsByPayment({ commit, state }, data) {
      state.loading.dealStatsByPayment = true;
      try {
        const response = await apis.PartnerDealStatsByPayment(data);
        commit('SET_DEAL_STATS_BY_PAYMENT', response.data);
        state.loading.dealStatsByPayment = false;
      } catch (e) {
        console.error(e);
      }
    },
    async PartnerSystemProfileSearch({ commit, state }, data) {
      state.loading.salesStatsByMonth = true;
      try {
        const response = await apis.SystemProfileSearch(data);
        commit('SET_SYSTEM_PROFILE_SEARCH', response.data);
        state.loading.salesStatsByMonth = false;
      } catch (e) {
        console.error(e);
      }
    },
    async PartnerSystemProfileAdd({ commit, state }, data) {
      state.loading.salesStatsByMonth = true;
      try {
        const response = await apis.SystemProfileAdd(data);
        commit('SET_OTC_BAY_UPDATE', response.data);
        state.loading.salesStatsByMonth = false;
      } catch (e) {
        console.error(e);
      }
    },
    async PartnerSystemProfileRemove({ commit, state }, data) {
      state.loading.salesStatsByMonth = true;
      try {
        const response = await apis.SystemProfileRemove(data);
        commit('SET_OTC_BAY_UPDATE', response.data);
        state.loading.salesStatsByMonth = false;
      } catch (e) {
        console.error(e);
      }
    },
    async PartnerPaymentSalesStatus({ commit, state }, data) {
      try {
        const response = await apis.PaymentSalesStatus();
        commit('SET_PAYMENT_SALES_STATUS', response.data);
      } catch (e) {
        console.error(e);
      }
    },
    async PartnerPartnerWalletTotal({ commit, state }, data) {
      try {
        const response = await apis.PartnerPartnerWalletTotal();
        commit('SET_PARTNER_WALLET_TOTAL', response.data);
      } catch (e) {
        console.error(e);
      }
    },
    async PartnerPaymentRecentPaymentList({ commit, state }, data) {
      try {
        const response = await apis.PaymentRecentPaymentList(data);
        commit('SET_PAYMENT_RECENT_PAYMENT_LIST', response.data);
      } catch (e) {
        console.error(e);
      }
    },
    async PartnerPaymentRecentPaymentListModal({ commit, state }, data) {
      try {
        const response = await apis.PaymentRecentPaymentList(data);
        commit('SET_PAYMENT_RECENT_PAYMENT_LIST_MODAL', response.data);
      } catch (e) {
        console.error(e);
      }
    },
  },
};

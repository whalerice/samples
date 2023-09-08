import { apis } from '../api';
import { notification, Modal } from 'ant-design-vue';
import i18n from '@/assets/i18n';

const openNotification = (val) => {
  notification['success']({
    message: i18n.global.t('notification.title.success'),
    description: val,
  });
};

const openNotificationError = (val) => {
  notification['error']({
    message: i18n.global.t('notification.title.error'),
    description: val,
  });
};

const defaultState = () => {
  return {
    otpVerify: {},
    otpIsRegister: false,
    otpSignatureCode: {},
    otpRegisterUri: {},
    otpDelete: {},
    otpRegister: {},
  };
};

export const otp = {
  namespaced: true,
  state: defaultState(),
  mutations: {
    OTP_RESET(state) {
      Object.assign(state, defaultState());
    },
    SET_OTP_VERIFY(state, data) {
      state.otpVerify = data;
    },
    SET_OTP_IS_REGISTER(state, value) {
      state.otpIsRegister = value;
      sessionStorage.setItem('_otpIsRegister', state.otpIsRegister);
    },
    SET_OTP_SIGNATURE_CODE(state, value) {
      state.otpSignatureCode = value;
    },
    SET_OTP_REGISTER_URI(state, data) {
      state.otpRegisterUri = data;
    },
    SET_OTP_DELETE(state, data) {
      state.OtpDelete = data;
    },
    SET_OTP_REGISTER(state, data) {
      state.otpRegister = data;
    },

    RESET_STATE(state) {
      state.otpVerify = {};
      state.otpDelete = {};
      state.otpRegister = {};
      state.otpReturn = '';
      state.otpSignatureCode = {};
    },
  },
  actions: {
    async OtpVerify({ commit }, data) {
      try {
        commit('SET_OTP_SIGNATURE_CODE', '');
        const response = await apis.OtpVerify(data);
        commit('SET_OTP_VERIFY', response.data);
        if (response.data.returnData !== null) {
          commit('SET_OTP_SIGNATURE_CODE', response.data);
        }
      } catch (e) {
        console.error(e);
      }
    },
    async OtpIsRegister({ commit }) {
      try {
        const response = await apis.OtpIsRegister();
        if (response.data.errCode === 0) {
          commit('SET_OTP_IS_REGISTER', response.data.returnData);
        } else {
          openNotificationError(response.data.errMessage);
        }
      } catch (e) {
        console.error(e);
      }
    },
    async OtpDelete({ commit }) {
      try {
        const response = await apis.OtpDelete();
        commit('SET_OTP_DELETE', response.data);
        if (response.data.returnData) {
          commit('SET_OTP_IS_REGISTER', false);
          commit('SET_OTP_SIGNATURE_CODE', '');
          openNotification();
        } else {
          openNotificationError('Delete Error');
        }
      } catch (e) {
        console.error(e);
      }
    },
    async OtpRegisterUri({ commit }) {
      try {
        const response = await apis.OtpRegisterUri();
        commit('SET_OTP_REGISTER_URI', response.data);
        if (response.data.returnData === null) {
          openNotificationError('Please log in again');
        }
      } catch (e) {
        console.error(e);
      }
    },
    async OtpRegister({ commit }, data) {
      try {
        const response = await apis.OtpRegister(data);
        commit('SET_OTP_REGISTER', response.data);
        if (response.data.errCode === 0) {
          commit('SET_OTP_IS_REGISTER', true);
        }
      } catch (e) {
        console.error(e);
      }
    },
  },
};

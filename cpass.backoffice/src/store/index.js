import { createStore } from 'vuex';
import { sign } from './modules/sign';
import { common } from './modules/common';
import { trade } from './modules/trade';
import { manager } from './modules/manager';
import { partner } from './modules/partner';
import { kyc } from './modules/kyc';
import { otp } from './modules/otp';

export default createStore({
  modules: {
    sign,
    common,
    trade,
    manager,
    partner,
    kyc,
    otp,
  },
});

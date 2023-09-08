import { defineStore } from 'pinia';
import { LocalStorage, SessionStorage } from 'quasar';

export const useCommonStore = defineStore('commonStore', {
  state: (): ICommonStore => ({
    signInfo: SessionStorage.getItem<ISignInfo>('signInfo'),
    currentLocale: LocalStorage.getItem<IAppLanguages>('lang')?.locale,
    darkMode: LocalStorage.getItem<boolean>('dm') ? true : false,
  }),
  actions: {
    setSignInfo(signInfo: ISignInfo) {
      this.signInfo = signInfo;
      SessionStorage.set('signInfo', signInfo);
    },

    setCurrentLocale(val: IAppLanguages) {
      this.currentLocale = val;
    },

    setDarkMode(val: boolean) {
      this.darkMode = val;
    },
  },
});

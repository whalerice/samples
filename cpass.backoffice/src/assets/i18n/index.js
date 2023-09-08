import { createI18n } from 'vue-i18n';
import en from '@/assets/i18n/en.json';
import ko from '@/assets/i18n/ko.json';
import zh from '@/assets/i18n/zh.json';
import jp from '@/assets/i18n/jp.json';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: en,
    ko: ko,
    zh: zh,
    jp: jp,
  },
});

export default i18n;

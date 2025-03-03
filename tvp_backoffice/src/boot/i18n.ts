import { boot } from 'quasar/wrappers';
import { createI18n } from 'vue-i18n';
import { LocalStorage, Quasar } from 'quasar';

import messages from '@/i18n';

const locale = Quasar.lang.getLocale();

export type MessageLanguages = keyof typeof messages;
// Type-define 'en-US' as the master schema for the resource
export type MessageSchema = (typeof messages)['en-US'];

// See https://vue-i18n.intlify.dev/guide/advanced/typescript.html#global-resource-schema-type-definition
/* eslint-disable @typescript-eslint/no-empty-interface */
declare module 'vue-i18n' {
  // define the locale messages schema
  export interface DefineLocaleMessage extends MessageSchema {}

  // define the datetime format schema
  export interface DefineDateTimeFormat {}

  // define the number format schema
  export interface DefineNumberFormat {}
}
/* eslint-enable @typescript-eslint/no-empty-interface */

export const i18n = createI18n({
  locale: LocalStorage.getItem<IAppLanguages>('lang')
    ? LocalStorage.getItem<IAppLanguages>('lang')?.isoName
    : locale,
  legacy: false,
  globalInjection: true,
  messages,
  fallbackLocale: 'en-US',
});

export default boot(({ app }) => {
  // Set i18n instance on app
  app.use(i18n);
});

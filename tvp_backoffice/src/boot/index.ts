import { boot } from 'quasar/wrappers';
import dayjs, { Dayjs } from 'dayjs';
import * as antd from 'ant-design-vue';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    console: Console;
    $comma: (change: number | string) => void;
    $dayjs: (date: string) => Dayjs;
  }
}

export const comma = (
  change?: number | string | null,
  maximumFractionDigits = 8
) => {
  return Number(change ?? 0).toLocaleString(undefined, {
    maximumFractionDigits: maximumFractionDigits,
  });
};

export default boot(({ app }) => {
  app.config.globalProperties.console = console;
  app.config.globalProperties.$comma = comma;
  app.config.globalProperties.$dayjs = dayjs;

  app.use(antd);
});

import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { defineStore } from 'pinia';
import { axios } from 'src/boot/main';
import { Dark, SessionStorage, exportFile, useQuasar } from 'quasar';
import { LocaleCode } from 'src/components/models/enums';
import { apis } from 'src/stores/apis';
import langEn from 'quasar/lang/en-US';
import langKo from 'quasar/lang/ko-KR';
import langZh from 'quasar/lang/zh-CN';
import langJa from 'quasar/lang/ja';

const common = defineStore('common', () => {
  const sasQuery = ref<string>('');

  const shareSASQuery = async () => {
    try {
      const response = await apis.GetShareSASQuery();

      if (response.data.errCode === 0) {
        sasQuery.value = response.data.returnData;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const comma = (e: number | string) => {
    const num = String(e).split('.');
    num[0] = num[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return num.join('.');
  };

  const csvFile = (columns: any, rows: any, title: string) => {
    function wrapCsvValue(val: string | number | boolean, formatFn: any, row: object) {
      let formatted = formatFn !== void 0 ? formatFn(val, row) : val;

      formatted = formatted === void 0 || formatted === null ? '' : String(formatted);

      formatted = formatted.split('"').join('""');
      return `"${formatted}"`;
    }

    // naive encoding to csv format
    const thead = [columns.map((col: any) => col.label)];
    const text = rows.map((row: any) =>
      columns
        .map((col: any) =>
          wrapCsvValue(
            typeof col.field === 'function' ? col.field(row) : row[col.field === void 0 ? col.name : col.field],
            col.format,
            row,
          ),
        )
        .join(','),
    );

    const content = thead.concat(text).join('\r\n');

    exportFile(`${title}.csv`, content, 'text/csv');
  };

  return { sasQuery, comma, csvFile, shareSASQuery };
});

const countries = defineStore('countries', () => {
  const countryOptions = ref<ICountriesList[]>([]);
  const getCountryOptions = async () => {
    await axios
      .get('countries.json')
      .then((response) => {
        countryOptions.value = response.data;
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return { countryOptions, getCountryOptions };
});

const locale = defineStore('locale', () => {
  const $q = useQuasar();
  const lang = SessionStorage.getItem('lang');
  const { locale } = useI18n({ useScope: 'global' });

  const localeList = ref<ILocaleList[]>([
    { value: 'en', label: 'English', flag: 'us', langPack: langEn, code: LocaleCode.En },
    { value: 'ko', label: 'Korean', flag: 'kr', langPack: langKo, code: LocaleCode.Ko },
    { value: 'zh', label: 'Chinese', flag: 'cn', langPack: langZh, code: LocaleCode.Zh },
    { value: 'ja', label: 'Japanese', flag: 'jp', langPack: langJa, code: LocaleCode.Ja },
  ]);

  const current = ref<ILocaleList>(localeList.value[0]);

  if (lang !== null) {
    current.value = localeList.value.filter((e) => e.code == lang)[0];
  }

  const changeLocale = async (val: ILocaleList) => {
    current.value = val;
    document.documentElement.lang = val.value;
    locale.value = val.value;
    SessionStorage.set('lang', val.code);
    $q.lang.set(val.langPack);
  };

  return { current, localeList, changeLocale };
});

const ui = defineStore('ui', () => {
  const miniState = ref<boolean>(false);
  const showSideBar = ref<boolean>(false);
  const showSignInModal = ref<boolean>(false);
  const showRegisterModal = ref<boolean>(false);
  const siteChecking = ref<boolean>(false);
  const windowWidth = ref<number>(window.innerWidth);

  function changeSideBar() {
    showSideBar.value = !showSideBar.value;
  }

  const windowResize = () => {
    windowWidth.value = window.innerWidth;
  };

  return {
    miniState,
    showSideBar,
    showSignInModal,
    showRegisterModal,
    windowWidth,
    siteChecking,
    changeSideBar,
    windowResize,
  };
});

const theme = defineStore('theme', () => {
  const $q = useQuasar();
  const mode = SessionStorage.getItem('theme');
  const currentTheme = ref<boolean>(true);

  if (mode !== null) {
    currentTheme.value = !mode ? false : true;
  }

  Dark.set(currentTheme.value);
  $q.addressbarColor.set(currentTheme.value ? '#16191c' : '#ffffff');

  const changeMode = () => {
    currentTheme.value = !currentTheme.value;
    Dark.set(currentTheme.value);
    SessionStorage.set('theme', currentTheme.value);
    $q.addressbarColor.set(currentTheme.value ? '#16191c' : '#ffffff');
  };

  return { currentTheme, changeMode };
});

export const commonStore = { ui, locale, countries, theme, common };

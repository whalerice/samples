import { defineStore } from 'pinia';
import { SessionStorage } from 'quasar';
import type { SelectProps } from 'ant-design-vue';
import { ref, watch } from 'vue';

import { axios } from 'src/boot/main';
import { useI18n } from 'vue-i18n';
import { localeList } from 'src/boot/global';
import { apis } from 'src/stores/apis';

const countries = defineStore('countries', () => {
  const countryOptions = ref<ICountriesList[]>([]);
  const getCountryOptions = async () => {
    await axios
      .get('countries.json')
      .then((response) => {
        countryOptions.value = response.data;
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return { countryOptions, getCountryOptions };
});

const locale = defineStore('locale', () => {
  const lang = SessionStorage.getItem('lang');
  const { locale } = useI18n({ useScope: 'global' });

  const current = ref<ILocaleList>(localeList[0]);

  if (lang !== null) {
    current.value = localeList.filter((e) => e.code == lang)[0];
  }

  const changeLocale = (val: ILocaleList) => {
    current.value = val;
    document.documentElement.lang = val.value;
    locale.value = val.value;
    SessionStorage.set('lang', val.code);
  };

  return { current, changeLocale };
});

const ui = defineStore(
  'ui',
  () => {
    const showSideBar = ref<boolean>(true);
    const isMiniMode = ref<boolean>(false);
    const sideWidth = ref<string>('30rem');
    const isLanding = ref<boolean>(false);
    const onSound = ref<boolean>(true);

    function changeSideBar() {
      showSideBar.value = !showSideBar.value;
    }

    function sideBarCollapse() {
      isMiniMode.value = !isMiniMode.value;
    }

    watch(showSideBar, (v) => {
      if (v === false) {
        sideWidth.value = isMiniMode.value ? '8rem' : '30rem';
      } else {
        sideWidth.value = '0';
      }
    });

    return { showSideBar, isMiniMode, sideWidth, isLanding, onSound, changeSideBar, sideBarCollapse };
  },
  {
    persist: {
      paths: ['isMiniMode'],
    },
  },
);

const board = defineStore(
  'board',
  () => {
    const { t } = useI18n();
    const category = ref<any[]>([]);
    const site = ref<SelectProps['options']>([]);
    const solution = ref<SelectProps['options']>([]);
    const sasQuery = ref<string>('');

    const getCategory = async () => {
      try {
        const response = await apis.manager.BoardCategory();
        const data = response.data.returnData;
        // console.log(response.data);
        if (response.data.errCode === 0) {
          const items: any[] = [
            { value: 0, label: () => t('common.label.all'), commonIdx: data[0].idx, code: data[0].code },
          ];

          data.forEach((el: any) => {
            const item = {
              value: el.second_Code,
              label: () => (el.second_Code === 1 ? t('common.text.notice') : t('common.text.faq')),
              commonIdx: el.idx,
              code: el.code,
            };
            items.push(item);
          });

          category.value = items;
        }
      } catch (error) {
        console.error(error);
      }
    };

    const getSolution = async () => {
      try {
        const response = await apis.manager.SolutionList();

        if (response.data.errCode === 0) {
          const items: SelectProps['options'] = [];
          response.data.returnData.forEach((e: any) => {
            const item = {
              value: e.idx,
              label: e.name,
            };
            items.push(item);
          });
          solution.value = items;
        }
      } catch (error) {
        console.error(error);
      }
    };

    const getSite = async () => {
      try {
        const response = await apis.manager.SiteList();

        if (response.data.errCode === 0) {
          const items: SelectProps['options'] = [];
          response.data.returnData.forEach((e: any) => {
            const item = {
              value: e.idx,
              label: e.name,
            };
            items.push(item);
          });
          site.value = items;
        }
      } catch (error) {
        console.error(error);
      }
    };

    const shareSASQuery = async () => {
      try {
        const response = await apis.common.GetShareSASQuery();

        // console.log(response.data);

        if (response.data.errCode === 0) {
          sasQuery.value = response.data.returnData;
        }
      } catch (error) {
        console.error(error);
      }
    };

    return { category, solution, sasQuery, site, getCategory, getSolution, getSite, shareSASQuery };
  },
  {
    persist: {
      paths: ['category'],
    },
  },
);

export const commonStore = { ui, locale, countries, board };

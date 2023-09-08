<template>
  <a-dropdown :trigger="['click']" placement="bottomRight">
    <a-button @click.prevent class="btn-lang">
      <i
        v-if="bindingLanguage?.flag"
        class="flag"
        :style="{
          backgroundImage: `url('//hatscripts.github.io/circle-flags/flags/${bindingLanguage?.flag}.svg')`,
        }"
      ></i>
      <span class="txt">{{ bindingLanguage?.nativeName }}</span>
      <CaretDownOutlined />
    </a-button>
    <template #overlay>
      <div class="language-list-box">
        <div v-for="data in appLanguages" :key="data.isoName">
          <a-button
            type="link"
            @click="changeLocale(data)"
            class="no-border full-width text-left"
          >
            <i
              v-if="data.flag"
              class="flag"
              :style="{
                backgroundImage: `url('//hatscripts.github.io/circle-flags/flags/${data.flag}.svg')`,
              }"
            ></i>
            <span class="txt">{{ data.nativeName }}</span>
          </a-button>
        </div>
      </div>
    </template>
  </a-dropdown>
</template>
<script setup lang="ts">
import enUS from 'ant-design-vue/es/locale/en_US';
import koKR from 'ant-design-vue/es/locale/ko_KR';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import jaJP from 'ant-design-vue/es/locale/ja_JP';

import { onMounted, ref } from 'vue';
import { LocalStorage, useQuasar } from 'quasar';
import quasarLanguages from 'quasar/lang/index.json';
import { useI18n } from 'vue-i18n';
import language from '@/i18n/index';
import { useCommonStore } from '@/stores/common-store';
import { CaretDownOutlined } from '@ant-design/icons-vue';

const { locale } = useI18n();
const $q = useQuasar();
const flag = ['us', 'jp', 'kr', 'cn'];
const supportLocale = [enUS, jaJP, koKR, zhCN];

const appLanguages: IAppLanguages[] = quasarLanguages.filter((lang) =>
  [...Object.keys(language)].includes(lang.isoName)
);

appLanguages.forEach((e, i) => {
  e.flag = flag[i];
  e.locale = supportLocale[i];
});

const bindingLanguage = ref<any>();

const changeLocale = (data: IAppLanguages) => {
  locale.value = data.isoName;
  bindingLanguage.value = data;
  document.documentElement.lang = data.isoName;
  LocalStorage.set('lang', data);
  useCommonStore().setCurrentLocale(data.locale);
};

onMounted(() => {
  const browserLang =
    $q.lang.getLocale() === 'ko' ? 'ko-KR' : [$q.lang.getLocale()];

  bindingLanguage.value = LocalStorage.getItem<IAppLanguages>('lang')
    ? appLanguages.find(
        (lang) =>
          lang.isoName === LocalStorage.getItem<IAppLanguages>('lang')?.isoName
      )
    : appLanguages.find((lang) => browserLang.includes(lang.isoName));

  changeLocale(bindingLanguage.value);
});
</script>

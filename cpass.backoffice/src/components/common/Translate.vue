<template>
  <a-dropdown :trigger="['click']" class="language-dropdown" placement="bottom">
    <a class="ant-dropdown-link" :class="{ wd100: isHeader }" @click.prevent>
      <i :class="['flag', `flag-${currentCountry.lang}`]"></i>
      <span class="txt">{{ $t(currentCountry.country) }}</span>
      <fa-icon v-if="!isHeader" icon="fa-solid fa-chevron-down" />
    </a>
    <template #overlay>
      <ul class="language-list">
        <li v-for="item in translateList" :key="item.lang" class="language-item">
          <a-button
            type="link"
            @click="change(item.lang)"
            :class="['language-item-link', { active: currentCountry.lang === item.lang }]"
          >
            <i :class="['flag', `flag-${item.lang}`]"></i>
            <span class="txt">{{ $t(item.country) }}</span>
          </a-button>
        </li>
      </ul>
    </template>
  </a-dropdown>
</template>
<script setup>
import { ref, onBeforeMount, computed } from 'vue';
import { useStore } from 'vuex';
import i18n from '@/assets/i18n';
import { apis } from '@/store/api';

const store = useStore();
const setLocale = computed(() => store.state['common'].currentLocale);
const token = computed(() => store.state['sign'].token);

const props = defineProps({
  colorType: {
    type: String,
    required: false,
  },
  header: {
    type: Boolean,
    required: false,
    default: false,
  },
});
const isHeader = computed(() => props.header);

const translateList = ref([
  { lang: 'en', country: 'common.language.en' },
  { lang: 'ko', country: 'common.language.ko' },
  { lang: 'zh', country: 'common.language.zh' },
  { lang: 'jp', country: 'common.language.jp' },
  // { lang: 'ru', country: 'Russian' },
  // { lang: 'es', country: 'Spanish' },
  // { lang: 'tl', country: 'Filipino' },
  // { lang: 'th', country: 'Thailand' },
]);

const currentCountry = ref(null);

const change = (item) => {
  currentCountry.value = translateList.value.filter((e) => e.lang === item)[0];
  i18n.global.locale.value = item;
  document.documentElement.lang = item;
  store.commit('common/CHANGE_LOCALE', item);
  if (token.value !== null) {
    apis.LanguageSetting();
  }
};

const mountChange = (item) => {
  currentCountry.value = translateList.value.filter((e) => e.lang === item)[0];
  i18n.global.locale.value = item;
  document.documentElement.lang = item;
  store.commit('common/CHANGE_LOCALE', item);
};

onBeforeMount(() => {
  mountChange(setLocale.value);
});
</script>

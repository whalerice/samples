<template>
  <q-toolbar class="middle-header justify-between">
    <div class="header-logo-area">
      <!-- <router-link to="/home" class="logo"></router-link> -->
      <router-link to="/home">
        <img src="/images/logo.png" alt="Mavel Games" class="logo-img" />
      </router-link>
    </div>
    <q-form class="row float-right header-hide-area items-center">
      <SearchForm />
      <div class="row point-area radius-200 is-mb-f ml-20 cursor" v-if="loggedIn" @click="router.push('/account')">
        <template v-for="data in $BALANCE_LIST" :key="data.label">
          <div class="mr-10 ml-10" v-if="data.state === 0 || data.state === userInfo.rewardType">
            <q-icon :name="`svguse:/icons.svg#custom-${data.label}`" class="mr-06" size="2rem" />
            {{ comma(payInfo[data.label]) }}
          </div>
        </template>
      </div>

      <!-- <div class="header-icon-area notify row justify-center items-center is-mb-f" v-if="loggedIn"> -->
      <!-- 알림 -->
      <!-- <q-btn unelevated class="header-icon mr-10 is-mb-f" round v-if="loggedIn" to="/account/message-history">
        <q-icon
          :name="$q.dark.isActive ? 'svguse:/icons.svg#custom-bell-dm' : 'svguse:/icons.svg#custom-bell'"
          size="2.4rem" />
      </q-btn> -->
      <!-- </div> -->

      <q-btn-dropdown
        v-if="loggedIn"
        no-caps
        unelevated
        :label="nickname"
        padding="1rem"
        class="mr-10 is-mb"
        dropdown-icon="expand_more"
        :menu-offset="[0, 10]">
        <q-list>
          <q-item :to="data.path" clickable v-close-popup v-for="data in userMenuOptions" :key="data.path">
            <q-item-section>
              <q-item-label>{{ $t(data.meta?.title) }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>

      <q-btn
        color="casino-default"
        :label="$t('common.button.sign_in')"
        unelevated
        no-caps
        padding="1rem 2rem"
        class="radius-200 ml-20 is-mb"
        @click="showModal"
        v-if="!loggedIn" />
    </q-form>
  </q-toolbar>
</template>
<script setup lang="ts">
import SearchForm from 'src/components/SearchForm.vue';

import { storeToRefs } from 'pinia';
// import { useQuasar } from 'quasar';
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { commonStore } from 'src/stores/common';
import { userStore } from 'src/stores/user';

// const $q = useQuasar();
const { showSignInModal } = storeToRefs(commonStore.ui());
const { loggedIn } = storeToRefs(userStore.sign());
const { userInfo, payInfo } = storeToRefs(userStore.user());
const { comma } = commonStore.common();

const router = useRouter();
const userMenuOptions = ref<any>([]);

const nickname = ref<string | undefined>(userInfo.value ? userInfo.value?.nick : '');

watch(userInfo, (val) => {
  nickname.value = val?.nick;
});

const showModal = () => {
  showSignInModal.value = true;
};

onMounted(() => {
  userMenuOptions.value = router.options.routes.filter((record) => record.path === '/account')[0].children;
});
</script>

<template>
  <q-btn
    @click="[windowWidth < 992 ? toggleLeftDrawer() : miniStateChange()]"
    class="fixed-top-left drawer-controller"
    unelevated>
    <q-icon
      :name="
        miniState
          ? 'img:/icons/active-icons/menu-active.svg'
          : $q.dark.isActive
          ? 'svguse:/icons.svg#custom-menu-dm'
          : 'svguse:/icons.svg#custom-menu'
      " />
  </q-btn>
  <q-drawer
    v-model="leftDrawerOpen"
    :breakpoint="0"
    :mini="!miniState && windowWidth > 991"
    :show-if-above="windowWidth > 991"
    :mini-to-overlay="windowWidth > 991"
    :overlay="windowWidth < 992"
    persistent
    :mini-width="70">
    <template v-if="!loggedIn">
      <q-btn unelevated no-caps class="full-width no-padding" @click="openModal()">
        <q-item clickable class="nav-btn-controller full-width">
          <q-item-section avatar>
            <q-icon name="fa-solid fa-right-to-bracket" class="default-custom-icon" />
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ $t('common.button.sign_in') }}</q-item-label>
          </q-item-section>
          <div class="hover-info" v-show="!miniState && windowWidth > 991">
            {{ $t('common.button.sign_in') }}
          </div>
        </q-item>
      </q-btn>

      <q-separator v-if="windowWidth > 991 ? miniState : leftDrawerOpen" />
    </template>
    <template v-if="loggedIn">
      <div class="my-wallet-area" v-if="windowWidth > 991 ? miniState : leftDrawerOpen">
        <div class="wallet-top">
          <q-separator spaced="1.5rem" v-if="windowWidth > 991 ? miniState : leftDrawerOpen"> </q-separator>
          <h5 class="wallet-text text-h5 text-weight-bolder">{{ $t('common.title.my_wallet') }}</h5>
        </div>
        <div class="wallet-list">
          <template v-for="data in $BALANCE_LIST" :key="data.label">
            <div class="wallet-item" v-if="data.state === 0 || data.state === userInfo.rewardType">
              <q-icon :name="`svguse:icons.svg#custom-${data.label}`" size="2rem" />

              <div class="price">
                {{ $t(`common.label.${data.label}`) }}
                <span :class="`num text-custom-${data.textColor}`">
                  {{ comma(payInfo[data.label]) }}
                </span>
              </div>
              <div v-if="data.label === 'cash'" class="btn-group">
                <q-btn
                  dense
                  no-caps
                  unelevated
                  round
                  class="bg-custom-yellow-01"
                  icon="img:/icons/payment.svg"
                  @click="showDeposit" />

                <q-btn
                  dense
                  no-caps
                  unelevated
                  round
                  class="q-ml-xs bg-custom-green-01"
                  icon="img:/icons/withdrawal.svg"
                  @click="showWithdrawal">
                </q-btn>
              </div>
              <div class="btn-group" v-if="data.label !== 'cash'">
                <q-btn
                  dense
                  no-caps
                  unelevated
                  round
                  v-if="data.label === 'point'"
                  class="bg-custom-blue-01"
                  icon="img:/icons/exchange.svg"
                  @click="showDialog('point')" />
                <q-btn
                  dense
                  no-caps
                  unelevated
                  round
                  v-if="data.label === 'rolling' || data.label === 'losing'"
                  class="bg-custom-pink-01"
                  icon="img:/icons/exchange.svg"
                  @click="showDialog(data.label)" />
              </div>
            </div>
          </template>
        </div>
      </div>
      <q-separator spaced="1.5rem" v-if="windowWidth > 991 ? miniState : leftDrawerOpen" />
    </template>
    <q-scroll-area :thumb-style="thumbStyle" :bar-style="barStyle" class="sidebar-middle">
      <q-list>
        <essential-link-container />
        <q-btn unelevated no-caps class="full-width no-padding" @click="signOut" v-if="loggedIn">
          <q-item clickable class="nav-btn-controller full-width">
            <q-item-section avatar>
              <q-icon name="fa-solid fa-right-from-bracket" class="default-custom-icon" />
            </q-item-section>

            <q-item-section>
              <q-item-label>{{ $t('common.button.log_out') }}</q-item-label>
            </q-item-section>
            <div class="hover-info" v-show="!miniState && windowWidth > 991">
              {{ $t('common.button.log_out') }}
            </div>
          </q-item>
        </q-btn>
        <!-- <q-item class="full-width" v-if="windowWidth > 991 ? miniState : leftDrawerOpen">
          <img
            src="https://img.twin.com/resources/get-app/app-badges/android/en-US.png"
            class="download-link"
            @click.prevent="download" />
        </q-item> -->
      </q-list>
    </q-scroll-area>
    <div class="sidebar-bottom">
      <ThemeMode />
      <Translate />
    </div>
  </q-drawer>
  <div
    class="draw-backdrop"
    :class="{ show: windowWidth > 991 ? miniState : leftDrawerOpen }"
    @click="[windowWidth < 992 ? toggleLeftDrawer() : miniStateChange()]"></div>
</template>

<script setup lang="ts">
import EssentialLinkContainer from 'src/components/EssentialLinkContainer.vue';
import Translate from 'src/components/Translate.vue';
import ThemeMode from 'components/ThemeMode.vue';

import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { commonStore } from 'src/stores/common';
import { userStore } from 'src/stores/user';
import { paymentStore } from 'src/stores/payment';

const $q = useQuasar();
const { miniState, windowWidth, showSignInModal } = storeToRefs(commonStore.ui());
const { loggedIn } = storeToRefs(userStore.sign());
const { userInfo, payInfo } = storeToRefs(userStore.user());
const { showDeposit, showWithdrawal, showDialog } = paymentStore.payment();
const { destroyUserInfo } = userStore.user();
const { comma } = commonStore.common();

const leftDrawerOpen = ref<boolean>(false);
const currentRoute = useRouter().currentRoute;

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const miniStateChange = () => {
  miniState.value = !miniState.value;
};

const signOut = () => {
  loggedIn.value = false;
  destroyUserInfo();
};

const thumbStyle = {
  left: '0',
};

const barStyle = {
  left: '0.4rem',
};

const openModal = () => {
  showSignInModal.value = true;
  $q.platform.is.desktop ? (miniState.value = false) : (leftDrawerOpen.value = false);
};

watch(windowWidth, (val) => {
  if (val < 992) {
    leftDrawerOpen.value = false;
    miniState.value = false;
  } else {
    leftDrawerOpen.value = true;
    miniState.value = false;
  }
});

watch(currentRoute, () => {
  windowWidth.value > 991 ? (miniState.value = false) : (leftDrawerOpen.value = false);
});
</script>

<style scoped lang="scss">
.draw-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
  height: 100vh;
  z-index: 2000;
  width: 100%;
  position: fixed;
  transition: 0.3s ease-in;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;

  &.show {
    opacity: 1;
    visibility: visible;
    pointer-events: all;
  }
}
</style>

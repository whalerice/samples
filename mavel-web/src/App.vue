<template>
  <q-layout view="lHh Lpr lff" v-if="!siteChecking">
    <q-header>
      <div class="container header-padding">
        <Header />
      </div>
    </q-header>

    <SideBar />
    <q-page-container>
      <q-page class="container">
        <div class="main-carousel-wrap">
          <q-carousel navigation swipeable animated v-model="slide" infinite :autoplay="5000">
            <q-carousel-slide :name="1" img-src="/images/carousel/s1_bg.png" class="s1">
              <div class="s-img s1-img-1"></div>
              <img src="/images/carousel/s1_img_2.png" class="s-img s1-img-2" />
              <div class="carousel-text-area">
                <span class="carousel-title waggle-title">
                  {{ $t('carousel.mavel_games.title') }}
                </span>
                <!-- <span class="carousel-subtitle">
                  {{ $t('carousel.mavel_games.subtitle') }}
                </span> -->
              </div>
            </q-carousel-slide>
            <q-carousel-slide :name="2" img-src="/images/carousel/s2_bg.png" class="s2">
              <img src="/images/carousel/s2_img_1.png" class="s-img s2-img-1" />
              <!-- <div class="s-img s2-img-1"></div> -->
              <div class="carousel-text-area">
                <div class="carousel-cpass-logo row items-center justify-center">
                  <q-icon name="img:/icons/cpass-logo.svg" class="logo-control" />
                </div>
                <span class="carousel-title">
                  {{ $t('carousel.cpass.title') }}
                </span>
                <q-btn outline :label="$t('common.button.go_to_cpass')" no-caps class="carousel-button" />
              </div>
            </q-carousel-slide>
            <q-carousel-slide :name="3" img-src="/images/carousel/s3_bg.png" class="s3">
              <img src="/images/carousel/s3_img_1.png" class="s-img s3-img-1" />
              <img src="/images/carousel/s3_img_2.png" class="s-img s3-img-2" />
              <img src="/images/carousel/s3_img_3.png" class="s-img s3-img-3" />
              <div class="carousel-text-area s3">
                <span class="carousel-title">
                  {{ $t('carousel.tvp.title') }}
                </span>
                <q-btn outline :label="$t('common.button.play_now')" no-caps class="carousel-button" />
              </div>
            </q-carousel-slide>
          </q-carousel>

          <q-toolbar class="navigate-toolbar no-padding">
            <MobileNav />
          </q-toolbar>
        </div>
        <router-view />
        <q-btn
          icon="expand_less"
          class="fixed-bottom-right z-top shadow-12 transition-02-ease"
          :class="scrollTopBtnVisible ? 'visible' : 'hide'"
          round
          v-if="!$q.platform.is.ios"
          size="2.3rem"
          glossy
          style="bottom: 2rem; right: 2rem"
          padding="1rem"
          :loading="scrollLoading"
          flat
          @click="scrollTop(true)" />
      </q-page>
    </q-page-container>

    <q-footer>
      <div class="q-mt-xl"></div>
      <div class="container">
        <Footer />
      </div>
    </q-footer>
  </q-layout>
  <SignModal />
  <DepositModal :show="isShowDeposit" @close="(e:boolean) => (isShowDeposit = e)" />
  <WithdrawModal :show="isShowWithdrawal" @close="(e:boolean) => (isShowWithdrawal = e)" />
  <BalanceControl v-model:dialog-visible="dialogVisible" :dialog-category="dialogCategory" />
  <!-- :payment-list="paymentList" -->

  <q-layout view="lHh Lpr lff" v-if="siteChecking">
    <router-view />
  </q-layout>
</template>

<script setup lang="ts">
import Header from 'layouts/Header.vue';
import Footer from 'layouts/Footer.vue';
import SideBar from 'layouts/SideBar.vue';
import MobileNav from 'layouts/MobileNav.vue';
import SignModal from 'components/modals/Sign.vue';
import DepositModal from 'components/modals/Deposit.vue';
import WithdrawModal from 'components/modals/Withdraw.vue';
import BalanceControl from 'components/BalanceControl.vue';

import { SessionStorage, useQuasar, debounce } from 'quasar';
import { onBeforeMount, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { commonStore } from 'src/stores/common';
import { userStore } from 'src/stores/user';
import { paymentStore } from 'src/stores/payment';
import { axios } from 'src/boot/main';
// import { Carousel, Pagination, Slide } from 'vue3-carousel';

const $q = useQuasar();
const { loggedIn } = storeToRefs(userStore.sign());
const { siteChecking } = storeToRefs(commonStore.ui());
const { userPayInfo } = userStore.user();
const { isShowDeposit, isShowWithdrawal, dialogVisible, dialogCategory } = storeToRefs(paymentStore.payment());

const router = useRouter();
const scrollTopBtnVisible = ref<boolean>(false);
const scrollLoading = ref<boolean>(false);
const slide = ref<number>(1);

const scrollTop = (smooth: boolean) => {
  scrollLoading.value = true;
  smooth ? window.scrollTo({ top: 0, left: 0, behavior: 'smooth' }) : window.scrollTo(0, 0);
  setTimeout(() => {
    scrollLoading.value = false;
  }, 1000);
};

router.beforeEach((to, from, next) => {
  if (siteChecking.value) {
    if (!(to.fullPath.indexOf('checking') > -1)) {
      next({ path: '/checking' });
    }
  } else {
    if (to.fullPath.indexOf('checking') > -1) {
      next({ path: '/' });
    }
  }

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!loggedIn.value) {
      next({ path: '/' });
    } else {
      next();
    }
  } else {
    next();
  }
  scrollTop(false);
});

watch(loggedIn, (val) => {
  if (val) userPayInfo();
});

onBeforeMount(async () => {
  try {
    // const response = await axios.get('https://api.ipify.org?format=string');
    const response = await axios.get('https://jsonip.com');
    SessionStorage.set('ip', response.data.ip);
  } catch (error) {
    console.error(error);
  }

  if (loggedIn.value) userPayInfo();
});

window.addEventListener(
  'resize',
  debounce(function () {
    commonStore.ui().windowResize();
  }, 200),
);
onMounted(() => {
  window.addEventListener(
    'scroll',
    debounce(function () {
      if (window.scrollY > 200) {
        scrollTopBtnVisible.value = true;
      } else {
        scrollTopBtnVisible.value = false;
      }
    }, 200),
  );
});
</script>

<template>
  <q-dialog v-model="showSignInModal" class="sign-dialog" transition-hide="slide-up" @before-hide="afterClose">
    <q-card>
      <q-btn icon="close" flat round dense v-close-popup class="btn-close" />
      <q-card-section>
        <div class="section section-lt">
          <div class="text">
            <div class="logo">Mavel Games</div>
            <div class="caption text-center" v-html="$t('modal.description.welcome_msg')"></div>
          </div>
          <div class="sign-btn-group">
            <q-btn
              v-for="item in state"
              :key="item.idx"
              no-caps
              :class="['btn-sign-tab', { active: activeBtn === item.idx }]"
              unelevated
              :label="$t(item.title)"
              @click="activeBtn = item.idx" />
          </div>
        </div>
        <div class="section section-rt">
          <SignIn v-if="activeBtn === SignType.SignIn" />
          <SignUp v-if="activeBtn === SignType.SignUp" @success="onSuccess" />
          <div class="sign-bottom">
            <template v-if="activeBtn === SignType.SignIn">
              <span>{{ $t('modal.text.no_account') }}</span>
              <q-btn
                unelevated
                flat
                no-caps
                color="primary"
                :label="$t('common.button.sign_up')"
                @click="activeBtn = SignType.SignUp" />
            </template>

            <template v-if="activeBtn === SignType.SignUp">
              <span>{{ $t('modal.text.already_account') }}</span>
              <q-btn
                unelevated
                flat
                no-caps
                color="primary"
                :label="$t('common.button.sign_in')"
                @click="activeBtn = SignType.SignIn" />
            </template>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
  <!-- <a-modal
    centered
    :destroyOnClose="true"
    @cancel="closeModal"
    v-model:visible="showSignInModal"
    :footer="null"
    class="sign-form-container full-width"
    :afterClose="afterClose">
    <template #closeIcon>
      <q-icon name="close" />
    </template>
    <div class="row">
      <div class="sign-form-left">
        <div class="img-text absolute-center">
          <div class="logo">Mavel Games</div>
          <div class="caption text-center" v-html="$t('modal.description.welcome_msg')"></div>
        </div>
      </div>

      <div class="sign-controller-container">
        <div class="sign-btn-controller">
          <q-btn
            v-for="item in state"
            :key="item.idx"
            no-caps
            :class="['btn-sign-tab', { active: activeBtn === item.idx }]"
            unelevated
            :label="$t(item.title)"
            @click="activeBtn = item.idx" />
        </div>

        <q-icon
          name="img:/icons/waggle-big-opacity.svg"
          size="19.7rem"
          class="waggle-img absolute-bottom-left"
          v-show="activeBtn === SignType.SignIn" />

        <SignIn v-if="activeBtn === SignType.SignIn" />
        <SignUp v-if="activeBtn === SignType.SignUp" @success="onSuccess" />

        <div class="sign-bottom-area">
          <template v-if="activeBtn === SignType.SignIn">
            <span>{{ $t('modal.text.no_account') }}</span>
            <q-btn
              unelevated
              flat
              no-caps
              color="primary"
              :label="$t('common.button.sign_up')"
              @click="activeBtn = SignType.SignUp" />
          </template>

          <template v-if="activeBtn === SignType.SignUp">
            <span>{{ $t('modal.text.already_account') }}</span>
            <q-btn
              unelevated
              flat
              no-caps
              color="primary"
              :label="$t('common.button.sign_in')"
              @click="activeBtn = SignType.SignIn" />
          </template>
        </div>
      </div>
    </div>
  </a-modal> -->
</template>
<script setup lang="ts">
import SignIn from 'components/SignIn.vue';
import SignUp from 'components/SignUp.vue';

import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { commonStore } from 'src/stores/common';
import { userStore } from 'src/stores/user';
import { Modal } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const { loggedIn } = storeToRefs(userStore.sign());

enum SignType {
  SignIn = 0,
  SignUp = 1,
}

const state = [
  {
    idx: SignType.SignIn,
    title: 'common.button.sign_in',
  },
  {
    idx: SignType.SignUp,
    title: 'common.button.sign_up',
  },
];
const { showSignInModal } = storeToRefs(commonStore.ui());
const activeBtn = ref<number>(SignType.SignIn);

watch(loggedIn, (val) => {
  if (val) closeModal();
});

const closeModal = () => {
  showSignInModal.value = false;
};
const onSuccess = () => {
  showSignInModal.value = false;
  Modal.success({
    title: t('common.text.success'),
    content: t('modal.msg.success'),
    centered: true,
  });
};

const afterClose = () => {
  if (activeBtn.value !== SignType.SignIn) activeBtn.value = SignType.SignIn;
};
</script>

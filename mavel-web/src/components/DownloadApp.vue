<template>
  <div class="download-area">
    <q-btn no-caps outline color="grey-6" href="https://apps.apple.com/pl/app/cpass/id1617764947" target="_blank">
      <q-icon left name="fa-brands fa-apple" />
      <span class="text">
        <small>{{ $t('common.button.cpass_ios_top') }}</small>
        <strong>{{ $t('common.button.cpass_ios_bottom') }}</strong>
      </span>
    </q-btn>
    <q-btn
      no-caps
      outline
      color="grey-6"
      href="https://play.google.com/store/apps/details?id=com.digilab24.apps"
      target="_blank">
      <q-icon left name="fa-brands fa-google-play" />
      <span class="text">
        <small>{{ $t('common.button.cpass_android_top') }}</small>
        <strong>{{ $t('common.button.cpass_android_bottom') }}</strong>
      </span>
    </q-btn>
  </div>
</template>

<style scoped lang="scss">
.download-area {
  display: flex;
  align-items: center;
  margin-right: -0.5rem;
  margin-left: -0.5rem;
  .q-btn {
    width: 50%;
    padding-top: 0.8rem;
    padding-bottom: 0.8rem;
    .text {
      display: flex;
      flex-flow: column;
      align-items: flex-start;
      line-height: 1.2;
    }
    margin-right: 0.5rem;
    margin-left: 0.5rem;
  }
}
.fa-apple {
  font-size: 1.6rem;
}
.fa-google-play {
  font-size: 1rem;
}
@media (min-width: 768px) {
  .fa-apple {
    font-size: 2.6rem;
  }
  .fa-google-play {
    font-size: 2rem;
  }
  // .game-item {
  //   width: calc(100% / 3);
  // }
}
</style>

<template>
  <div class="site-check-area">
    <h3 class="text-h3">{{ $t('checking.title') }}</h3>
    <Vue3Lottie :animationData="Lottie.checking" class="lottie" />
    <p>안정적이고 효율적인 서비스 제공을 위하여 홈페이지와 모바일 서비스가 아래와 같이 점검 예정입니다.</p>
    <p>아래의 내용을 참고 하시어, 서비스 이용에 착오 없으시기 바랍니다.</p>
    <ul>
      <li>※ 일시: 2020.06.29 20:00~24:00</li>
      <li>※ 내용: 홈페이지 및 모바일 서비스 네트워크 점검</li>
    </ul>

    <p>*시스템 점검으로 인한 작업 완료 유무는 서비스 점검 진행 결과에 따라 변동될 수 있습니다.</p>
    <p>*시스템 점검 시간 변경 혹은 완료시. 재공지 하겠습니다.</p>
    <Translate />
    <ThemeMode />
  </div>
</template>

<script setup lang="ts">
import Translate from 'src/components/Translate.vue';
import ThemeMode from 'components/ThemeMode.vue';
import { Vue3Lottie } from 'vue3-lottie';
import { Lottie } from 'src/assets/lottie';
</script>
<style lang="scss" scoped>
.lottie {
  width: 100%;
  max-width: 50rem;
}
.site-check-area {
  min-height: 100vh;
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  padding: 1.5rem;
}
</style>

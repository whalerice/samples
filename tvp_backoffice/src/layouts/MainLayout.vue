<template>
  <div
    class="sider-backdrop"
    @click="collapsed = !collapsed"
    v-show="!collapsed"
  ></div>

  <a-layout>
    <a-layout-sider
      v-model:collapsed="collapsed"
      :trigger="null"
      collapsible
      breakpoint="xl"
      :class="{ show: !collapsed }"
      :width="sideBarWidth"
    >
      <div class="logo">
        <RouterLink to="/">
          <q-icon
            name="img:/icons/logo-icon.svg"
            size="3.4rem"
            class="symbol"
          />
          <q-icon name="img:/icons/logo-text.svg" size="5rem" />
        </RouterLink>
      </div>

      <EssentialLink />
    </a-layout-sider>

    <a-layout class="custom-layout" :class="{ slide: !collapsed }">
      <Header
        :collapsed="collapsed"
        @update:collapsed="(e) => (collapsed = e)"
      />

      <a-layout-content>
        <router-view :key="$route.fullPath" />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import Header from '@/layouts/Header.vue';
import EssentialLink from '@/components/nav/EssentialLink.vue';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

const collapsed = ref<boolean>(false);
const router = useRouter();
const sideBarWidth = '25rem';

router.beforeEach((to, from, next) => {
  if (window.innerWidth < 768) {
    collapsed.value = true;
  }
  next();
});
</script>

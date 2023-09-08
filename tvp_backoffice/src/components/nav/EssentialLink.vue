<template>
  <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline">
    <a-menu-item key="main">
      <DesktopOutlined />
      <span>
        <router-link :to="{ name: 'main' }" class="text-white">
          {{ $t('route.title.dashboard') }}
        </router-link>
      </span>
    </a-menu-item>

    <a-menu-item v-for="item in menuList" :key="item.name">
      <component :is="item.meta?.icon" />
      <span>
        <router-link :to="{ name: item.name }" class="text-white">
          {{ $t(item.meta?.title ?? '') }}
        </router-link>
      </span>
    </a-menu-item>
  </a-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { DesktopOutlined } from '@ant-design/icons-vue';
import { useRouter } from 'vue-router';
import { menus } from '@/router/routes';
import { role } from '@/boot/global';

const router = useRouter();
const selectedKeys = computed(() => [router.currentRoute.value.name]);

const menuList = computed(() => {
  return menus.filter((a) => a.meta?.auth.indexOf(role) !== -1);
});
</script>

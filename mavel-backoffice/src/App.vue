<template>
  <router-view />
  <Landing />
  <a-back-top>
    <q-icon name="north" />
  </a-back-top>
</template>

<script setup lang="ts">
import Landing from 'components/Landing.vue';

import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { onBeforeMount } from 'vue';
import { userStore } from 'src/stores/user';
import { UserType } from 'src/components/models/enums';

const { loggedIn, memberType } = storeToRefs(userStore.sign());
const { getClientIp } = userStore.sign();

const router = useRouter();

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!loggedIn.value) {
      next({ path: '/sign-in' });
    } else {
      if (to.meta?.type !== memberType.value) {
        if (memberType.value === UserType.Manager) {
          next({ path: '/' });
        } else {
          next({ path: '/p' });
        }
      } else {
        next();
      }
    }
  } else {
    next();
  }
});

onBeforeMount(() => {
  getClientIp();
});
</script>

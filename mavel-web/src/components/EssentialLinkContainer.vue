<template>
  <q-item
    clickable
    v-ripple
    :to="data.path"
    class="nav-btn-controller full-width"
    v-for="data in topNav"
    :key="data.title">
    <div class="active-round" :class="{ mini: !miniState }"></div>
    <essential-link
      :icon="data.path === currentRoute.path ? data.activeIcon : $q.dark.isActive ? `${data.icon}-dm` : data.icon"
      :title="data.title" />
    <div class="hover-info" v-show="data.path !== currentRoute.path && !miniState && windowWidth > 991">
      {{ $t(data.title) }}
    </div>
  </q-item>

  <q-separator spaced="20px" v-show="miniState" />

  <div v-for="data in bottomNav" :key="data.title">
    <q-item
      clickable
      :to="data.path"
      v-ripple
      class="nav-btn-controller full-width"
      v-if="!loggedIn && data.path === '/account' ? false : true">
      <div class="active-round" :class="{ mini: !miniState }"></div>
      <essential-link
        :icon="
          data.path === `/${currentRoute.path.split('/')[1]}`
            ? data.activeIcon
            : $q.dark.isActive
            ? `${data.icon}-dm`
            : data.icon
        "
        :title="data.title" />
      <div
        class="hover-info"
        v-show="data.path !== `/${currentRoute.path.split('/')[1]}` && !miniState && windowWidth > 991">
        {{ $t(data.title) }}
      </div>
    </q-item>
  </div>
</template>

<script setup lang="ts">
import EssentialLink from './EssentialLink.vue';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { onBeforeMount, ref } from 'vue';
import { commonStore } from 'src/stores/common';
import { useRouter } from 'vue-router';
import { userStore } from 'src/stores/user';

const $q = useQuasar();
const { miniState, windowWidth } = storeToRefs(commonStore.ui());
const { loggedIn } = storeToRefs(userStore.sign());

const currentRoute = useRouter().currentRoute;
const routes = useRouter().options.routes;

const topNav = ref<INav[]>([]);
const bottomNav = ref<INav[]>([]);

onBeforeMount(() => {
  Object.values(routes.filter((e) => e.meta?.topNav)).map((e: any) => {
    e.meta['path'] = e.path;
    topNav.value.push(e.meta);
  });
  Object.values(routes.filter((e) => e.meta?.bottomNav)).map((e: any) => {
    e.meta['path'] = e.path;
    bottomNav.value.push(e.meta);
  });
});
</script>

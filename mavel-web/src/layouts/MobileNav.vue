<template>
  <q-list class="row justify-between">
    <q-item v-for="item in nav" :key="item.meta.title" :to="item.path" class="h-nav-item justify-center" exact>
      <q-item-section class="no-padding column items-center" avatar v-ripple>
        <q-icon
          :name="
            item.path === currentRoute.path
              ? item.meta.activeIcon
              : $q.dark.isActive
              ? `${item.meta.icon}-dm`
              : item.meta.icon
          "
          class="default-custom-icon" />
        <span> {{ $t(item.meta.title) }}</span>
      </q-item-section>
    </q-item>
  </q-list>
</template>
<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
const router = useRouter();
const nav = ref();
const $q = useQuasar();

const currentRoute = router.currentRoute;

// interface Props {
//   dense?: boolean;
//   addClass?: string;
// }

// const props = withDefaults(defineProps<Props>(), {
//   dense: false,
//   addClass: '',
// });

onBeforeMount(() => {
  nav.value = router.options.routes.filter((e) => e.meta?.topNav);
});
</script>

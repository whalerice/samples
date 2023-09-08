<template>
  <q-list>
    <q-item
      v-for="item in footerNav"
      :key="item.meta.title"
      :to="item.path"
      :dense="props.dense"
      :class="addClass"
      active-class="active"
      exact>
      <q-item-section avatar>
        <q-icon :name="item.meta.icon" />
      </q-item-section>
      <q-item-section> {{ $t(item.meta.title) }}</q-item-section>
    </q-item>
  </q-list>
</template>
<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const footerNav = ref();

interface Props {
  dense?: boolean;
  addClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  dense: false,
  addClass: '',
});

onBeforeMount(() => {
  footerNav.value = router.options.routes.filter((e) => e.meta?.bottomNav);
  footerNav.value = footerNav.value.filter((e: any) => e.path !== '/account');
});
</script>

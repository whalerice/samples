<template>
  <div class="sidebar" :class="{ active: show }">
    <div class="sidebar-logo-area">
      <router-link to="/" class="logo">sidebar</router-link>
    </div>
    <NavBar />
    <div class="sidebar-bottom"><p class="copy">© CPASS.LTD</p></div>
  </div>
  <div class="sidebar-backdrop" v-if="show" @click="closeSidebar"></div>
</template>

<script setup>
import NavBar from '@/components/layout/NavBar.vue';
import { computed, ref, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import { partner } from '@/assets/js/global.js';

const store = useStore();
const show = computed(() => store.state['common'].isSidebar);
const grade = computed(() => store.state['sign'].signInfo.grade);
const isDeviceMobile = computed(() => store.state['common'].isDeviceMobile);
const isMobile = ref(isDeviceMobile.value);
const isPartner = ref(false);

const closeSidebar = () => {
  store.state['common'].isSidebar = false;
};

onBeforeMount(() => {
  isPartner.value = [...partner].filter((e) => e === grade.value).length > 0;
});
</script>

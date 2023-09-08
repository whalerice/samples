<template>
  <a-menu v-model:selectedKeys="selectedKeys" v-model:openKeys="openKeys" mode="inline">
    <template v-for="item in menu">
      <template v-if="!item.children && condition(item.meta.grade).length > 0">
        <a-menu-item :key="item.name">
          <RouterLink :to="item.path">
            <component :is="item.meta?.icon" />
            <span>{{ $t(item.meta.title) }}</span>
          </RouterLink>
        </a-menu-item>
      </template>
      <template v-if="item.children && condition(item.meta.grade).length > 0">
        <a-sub-menu :key="item.name">
          <template #title>
            <component :is="item.meta?.icon" />
            <span>{{ $t(item.meta.title) }}</span>
          </template>
          <a-menu-item v-for="sub in item.children" :key="sub.name">
            <RouterLink :to="sub.path">
              <span>{{ $t(sub.meta.title) }}</span>
            </RouterLink>
          </a-menu-item>
        </a-sub-menu>
      </template>
    </template>
  </a-menu>
</template>
<script setup>
import { ref, computed, onBeforeMount, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

const store = useStore();
const router = useRouter();
const menu = ref(router.options.routes[0].children);
const selectedKeys = ref([]);
const openKeys = ref([]);
const grade = computed(() => store.state['sign'].signInfo.grade);
const currentRoute = computed(() => router.currentRoute.value.name);

const condition = (gradeList) => gradeList.filter((each) => each === grade.value);

onBeforeMount(() => {
  for (let i = 0; i < menu.value.length; i++) {
    const element = menu.value[i];
    if (condition(element.meta.grade).length > 0 && element.children) {
      openKeys.value.push(element.name);
    }
    if (router.currentRoute.value.path === element.path) {
      selectedKeys.value.push(element.name);
    }

    if (element.children) {
      for (let j = 0; j < element.children.length; j++) {
        const el = element.children[j];
        if (router.currentRoute.value.path === el.path) {
          selectedKeys.value.push(el.name);
        }
      }
    }
  }
});

watch(currentRoute, (val) => {
  selectedKeys.value = [val];
});
</script>

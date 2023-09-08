<template>
  <q-drawer v-model="showSideBar" :width="320" class="sidebar-area" :mini="isMiniMode">
    <div class="sidebar-header cursor-pointer" @click="router.push('/')">
      <span :class="['logo', { mini: isMiniMode }]"></span>
    </div>
    <!-- <a-divider /> -->
    <Summary />
    <a-divider v-if="!isMiniMode" />
    <q-scroll-area dark :thumb-style="thumbStyle">
      <a-layout-sider v-model:collapsed="isMiniMode" :trigger="null" width="100%" collapsedWidth="57px">
        <a-menu v-model:selectedKeys="selectedKeys" mode="inline" theme="dark">
          <template v-for="item in menu" :key="item.name">
            <template v-if="item.meta && !item.meta?.queryPage">
              <a-menu-item :key="item.name" v-if="!item.children">
                <component :is="item.meta?.icon" />
                <span>
                  <router-link :to="item.path">{{ $t(item.meta?.title) }}</router-link>
                </span>
              </a-menu-item>
              <a-sub-menu :key="item.name" v-if="item.children">
                <template #title>
                  <span>
                    <component :is="item.meta?.icon" />
                    <span>{{ $t(item.meta?.title) }}</span>
                  </span>
                </template>
                <a-menu-item
                  v-for="sub in item.children"
                  :key="sub.name"
                  :class="{
                    hide:
                      (sub.meta?.grade && sub.meta?.grade?.filter((e) => e === siteIdx).length === 0) ||
                      (sub.meta?.rewardType && sub.meta?.rewardType !== userInfo?.rewardType),
                  }">
                  <router-link :to="sub.path" v-if="sub.meta">{{ $t(sub.meta?.title) }}</router-link>
                </a-menu-item>
              </a-sub-menu>
            </template>
          </template>
          <a-menu-item @click="[signOut(), router.push('/sign-in')]">
            <component :is="LogoutOutlined" />
            <span> {{ $t('common.button.log_out') }} </span>
          </a-menu-item>
        </a-menu>
      </a-layout-sider>
    </q-scroll-area>
  </q-drawer>
</template>

<script setup lang="ts">
import Summary from 'components/Summary.vue';

// import Translate from 'components/Translate.vue';
import { LogoutOutlined } from '@ant-design/icons-vue';
import { storeToRefs } from 'pinia';
import { RouteRecordRaw, useRoute, useRouter } from 'vue-router';
import { onMounted, ref, watch } from 'vue';
import { commonStore } from 'src/stores/common';
import { userStore } from 'src/stores/user';

const { showSideBar, isMiniMode } = storeToRefs(commonStore.ui());
const { memberType } = storeToRefs(userStore.sign());
const { userInfo, siteIdx } = storeToRefs(userStore.user());
const { signOut } = userStore.sign();

const router = useRouter();
const route = useRoute();
const menu = ref<RouteRecordRaw[]>();

const currentPage = ref();
const selectedKeys = ref<any[]>([]);
const thumbStyle = ref<any>({
  right: 0,
  borderRadius: '0.5rem',
  width: '0.5rem',
});

watch(route, (e) => {
  selectedKeys.value = [e.name];
});

onMounted(() => {
  menu.value = router.options.routes.filter((e) => e.name === memberType.value)[0].children;

  currentPage.value = router.currentRoute.value;
  selectedKeys.value = [currentPage.value?.name];
});
</script>

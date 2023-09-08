<template>
  <q-btn
    :label="$t('common.label.provider')"
    unelevated
    no-caps
    icon="tune"
    class="option-btn-controller provider"
    padding="0.8rem 2rem"
    @click="getProvider()"
    :loading="loading" />

  <q-dialog
    v-model="dialog"
    transition-show="jump-up"
    :maximized="maximizedToggle"
    transition-hide="jump-down"
    class="provider-container">
    <q-card class="card-area">
      <q-bar>
        <q-item-label header> {{ $t('dialog.label.filter_by_provider') }}</q-item-label>
        <q-space />
        <q-btn dense flat icon="open_in_full" @click="maximizedToggle = !maximizedToggle">
          <q-tooltip class="bg-white text-primary">
            {{ maximizedToggle ? $t('common.label.shrink') : $t('common.label.magnification') }}
          </q-tooltip>
        </q-btn>
        <q-btn dense flat icon="close" v-close-popup>
          <q-tooltip class="bg-white text-primary">{{ $t('common.label.close') }}</q-tooltip>
        </q-btn>
      </q-bar>

      <q-scroll-area :thumb-style="thumbStyle" :bar-style="barStyle" class="provider-area">
        <q-list class="row q-gutter-sm justify-between q-pa-md">
          <q-item
            clickable
            v-ripple
            class="col-3 items-center relative-position border-06"
            :class="{ selected: selectProvider.includes(data.idx), 'col-5': isMobile }"
            v-for="data in providerLists"
            :key="data?.name"
            @click="providerSelectControl(data.idx)">
            <span class="game-name" v-if="data.idx === 129 || data.idx === 109">{{ data?.name }}</span>
            <q-img v-else :src="`/images/games_logo/${data?.name}.png`" spinner-color="white" width="100%" />
            <q-icon
              name="check"
              class="absolute-top-right"
              style="top: 0.2rem"
              v-if="selectProvider.includes(data.idx)" />
          </q-item>
        </q-list>

        <div class="column q-gutter-sm q-pa-sm" style="width: 20rem; margin: auto">
          <q-btn
            no-caps
            :label="$t('common.button.select_provider')"
            unelevated
            color="pink-10"
            size="14px"
            padding="1.5rem 0"
            @click="[(dialog = false), emit('selectedProvider', selectProvider), emit('callback')]" />
          <q-btn no-caps flat :label="$t('common.button.reset')" @click="selectProvider = []" />
        </div>
      </q-scroll-area>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { apis } from 'src/stores/apis';
import { MainCategory } from './models/enums';
import { useRouter } from 'vue-router';
import { Platform } from 'quasar';

const emit = defineEmits(['selectedProvider', 'callback']);

const $q = useQuasar();
const currentRoute = useRouter().currentRoute;
const dialog = ref<boolean>(false);
const maximizedToggle = ref<boolean>(false);
const loading = ref<boolean>(false);
const providerLists = ref<IVendorList[]>();
const selectProvider = ref<Array<number>>([]);
const isMobile = ref(Platform.is.mobile === undefined ? false : true);

const thumbStyle = {
  right: '2px',
  borderRadius: '3px',
  backgroundColor: $q.dark.isActive ? '#11141b' : '#333',
  width: '5px',
};

const barStyle = {
  right: '0',
  borderRadius: '0',
  backgroundColor: $q.dark.isActive ? '#11141b' : '#333',
  width: '9px',
};

const getProvider = async () => {
  loading.value = true;
  const res = await apis.GameVender({
    category: currentRoute.value.path === '/slot' ? MainCategory.Slots : MainCategory.LiveCasino,
  });
  loading.value = false;
  if (res.data.errCode === 0) {
    dialog.value = true;
    providerLists.value = res.data.returnData.list;
  }
};

const providerSelectControl = (idx: number) => {
  if (selectProvider.value.includes(idx)) {
    selectProvider.value = selectProvider.value.filter((e) => e !== idx);
  } else {
    selectProvider.value.push(idx);
  }
};
</script>

<template>
  <a-modal :visible="visible" @cancel="close()" @ok="save()" cancelText="취소" okText="저장">
    <template #title> {{ $t('common.title.available_coin') }} </template>
    <a-row :gutter="[16, 16]">
      <a-col :span="6" v-for="(item, index) in data" :key="index">
        <a-card class="set-coin-card" :class="{ selected: item.possible }" hoverable @click="changeCoin(index)">
          <template #cover>
            <i :class="`coin mt-10 coin-${item.coin_Cd}`" style="width: 5rem; height: 5rem" />
          </template>
          <a-card-meta :title="item.symbol"> </a-card-meta>
        </a-card>
      </a-col>
    </a-row>
  </a-modal>
</template>
<script setup>
import { computed, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { deepCopy } from '@/assets/js/global.js';
import { apis } from '@/store/api';

const store = useStore();
const props = defineProps({
  show: {
    type: Boolean,
    require: true,
  },
});
const emit = defineEmits(['close']);
const visible = computed({
  get() {
    return props.show;
  },
  set(value) {
    emit('close', value);
  },
});
const partnerCoinList = computed(() => store.state['sign'].partnerCoinList);
const partnerCode = computed(() => store.state['sign'].partnerInfo.partner_Code);
const data = ref([]);

const close = () => {
  visible.value = false;
  setTimeout(() => {
    data.value = [];
  }, 300);
};
const process = () => {
  return data.value.filter((e) => e.possible === true).map((e) => e.value);
};
const save = async () => {
  await apis.PartnerAvailableCoinSetting({
    partner_Code: partnerCode.value,
    available_Coin_Cd: process(),
  });
  close();
};
const changeCoin = (index) => {
  data.value[index].possible = !data.value[index].possible;
};
const setCoin = (val) => {
  if (val === null) {
    data.value.map((e, index) => {
      e.possible = false;
    });
  } else {
    data.value.map((e, index) => {
      if (val.includes(e.value)) {
        e.possible = true;
      } else {
        e.possible = false;
      }
    });
  }
};

watch(visible, async () => {
  if (visible.value) {
    data.value = [];
    const getData = await apis.PartnerAvailableCoin();
    const returnData = getData.data;

    if (returnData.errCode === 0) {
      const availableCoin = returnData.returnData.availableCoin;
      data.value = deepCopy(partnerCoinList.value);
      setCoin(availableCoin);
    }
  }
});
</script>

<style lang="scss">
.set-coin-card {
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  border-radius: 1rem;
  opacity: 0.5;
  transition: 0.2s;
  .ant-card-body {
    padding: 0;
  }
  .ant-card-meta-title {
    padding: 1rem 0;
  }
  &.selected {
    opacity: 1;
    &.ant-card {
      border-color: transparent;
      box-shadow: 0 1px 2px -2px rgb(0 0 0 / 16%), 0 3px 6px 0 rgb(0 0 0 / 12%), 0 5px 12px 4px rgb(0 0 0 / 9%);
    }
  }
  &.disabled {
    &.ant-card {
      opacity: 0.5;
    }
  }
}
</style>

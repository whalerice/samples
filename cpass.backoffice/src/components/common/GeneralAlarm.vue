<template>
  <a-dropdown :trigger="['click']">
    <a-badge class="notification-alarm" @click.prevent :dot="isAlarm">
      <fa-icon icon="bell" />
    </a-badge>
    <template #overlay>
      <div class="alarm-layer">
        <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" v-if="!isAlarm" />
        <ul class="alarm-list" v-else>
          <li class="alarm-item" v-for="(item, idx) in managerAlarms.list" :key="idx">
            <router-link :to="item.link" class="link">
              <span>{{ item.date }}</span>
              <strong v-if="item.msg === 'Payment confirmation not yet done'">{{
                t('alarm.text.payment_confirmation')
              }}</strong>
              <strong v-if="item.msg === 'Unhandled dispute reports have been found'">{{
                t('alarm.text.unhandled_dispute')
              }}</strong>
              <strong v-if="item.msg === 'Partner approval confirmation not yet'">{{
                t('alarm.text.partner_approval')
              }}</strong>
              <strong v-if="item.msg === 'Customer Inquiries not yet done'">{{
                t('alarm.text.customer_inquiries')
              }}</strong>
              <strong v-if="item.msg === 'Withdrawal confirmation not yet done'">{{
                t('alarm.text.withdrawal_confirmation')
              }}</strong>
            </router-link>
          </li>
          <template v-for="(item, idx) in paymentAlarms.list" :key="idx">
            <li class="alarm-item">
              <router-link :to="item.link" class="link">
                <span>{{ item.date }}</span>
                <strong v-if="item.msg === 'Payment confirmation not yet done'">{{
                  t('alarm.text.payment_confirmation')
                }}</strong>
                <strong v-if="item.msg === 'Unhandled dispute reports have been found'">{{
                  t('alarm.text.unhandled_dispute')
                }}</strong>
                <strong v-if="item.msg === 'Partner approval confirmation not yet'">{{
                  t('alarm.text.partner_approval')
                }}</strong>
                <strong v-if="item.msg === 'Customer Inquiries not yet done'">{{
                  t('alarm.text.customer_inquiries')
                }}</strong>
                <strong v-if="item.msg === 'Withdrawal confirmation not yet done'">{{
                  t('alarm.text.withdrawal_confirmation')
                }}</strong>
              </router-link>
            </li>
          </template>
        </ul>
      </div>
    </template>
  </a-dropdown>
  <vue3-autocounter
    class="txt-hide"
    :startAmount="20"
    :endAmount="0"
    :duration="20"
    @finished="alarmAction"
    ref="$timer"
  />
</template>
<script setup>
import Vue3Autocounter from 'vue3-autocounter';
import { ref, computed, onBeforeMount, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { Empty } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { partner } from '@/assets/js/global.js';

const { t } = useI18n();
const store = useStore();
const grade = computed(() => store.state['sign'].signInfo.grade);
const managerAlarms = computed(() => store.state['sign'].managerAlarms);
const paymentAlarms = computed(() => store.state['sign'].paymentAlarms);
const errCode = computed(() => store.state['common'].errCode);
const notification = computed(() => store.state['sign'].notification);

const $timer = ref(null);
const isAlarm = ref(false);
const isPartner = ref(false);

const action = async () => {
  if (errCode.value === 0) {
    if (isPartner.value) {
      store.dispatch('sign/paymentAlarmList').then(() => {
        isAlarm.value = paymentAlarms.value.isAlarm;
      });
    } else {
      if (errCode.value === 0) {
        store.dispatch('sign/managerAlarmList').then(() => {
          isAlarm.value = managerAlarms.value.isAlarm || paymentAlarms.value.isAlarm;
        });
      }
    }
  }
};

const alarmAction = () => {
  isAlarm.value = false;
  action();
  $timer.value.start();
};

watch(isAlarm, (e) => {
  // if (
  //   e === true &&
  //   notification.value &&
  //   (managerAlarms.value.list.length > 0 || paymentAlarms.value.list.length > 0)
  // ) {
  //   Notification.requestPermission().then(function (permission) {
  //     if (permission === 'granted') {
  //       new Notification('CPASS BACKOFFICE', {
  //         body: t('alarm.notifications', { count: managerAlarms.value.list.length + paymentAlarms.value.list.length }),
  //       });
  //     }
  //   });
  // }
});

onBeforeMount(() => {
  isPartner.value = [...partner].filter((e) => e === grade.value).length > 0;
});

onMounted(() => {
  setTimeout(() => {
    action();
  }, 100);
});
</script>

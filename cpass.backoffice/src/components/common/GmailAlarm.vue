<template>
  <a-dropdown :trigger="['click']">
    <a-badge class="gmail-alarm" @click.prevent :dot="isAlarm">
      <fa-icon icon="envelope" />
    </a-badge>
    <template #overlay>
      <div class="alarm-layer" v-if="alarmList.length === 0">
        <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" />
      </div>
      <div class="gmail-alarm-layer" v-else>
        <ul class="gmail-alarm-list">
          <li class="gmail-alarm-item" v-for="(item, index) in alarmList" :key="index">
            <a-typography-link
              class="gmail-alarm-link"
              :href="`https://mail.google.com/mail/u/${item.mailId}/#inbox`"
              target="_blank"
            >
              <span>{{ item.mailId }}</span>
              <a-badge :count="item.unReadMailCount" show-zero />
            </a-typography-link>
          </li>
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
import { ref, onMounted, onBeforeMount } from 'vue';
import { Empty } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { apis } from '@/store/api';

const { t } = useI18n();
const alarmList = ref([]);
const isAlarm = ref(false);
const $timer = ref(null);

const alarmAction = async () => {
  try {
    const response = await apis.notify.GmailAlarm();
    if (response.data.errCode === 0) {
      if (response.data.returnData.length > 0) isAlarm.value = true;
      alarmList.value = response.data.returnData;
      if (alarmList.value[0].unReadMailCount > 0) {
        Notification.requestPermission().then(function (permission) {
          if (permission === 'granted') {
            new Notification('CPASS BACKOFFICE', {
              body: t('alarm.gmail', {
                count: alarmList.value[0].unReadMailCount,
              }),
            });
          }
        });
      }
    }
    $timer.value.start();
  } catch (error) {
    console.error(error);
  }
};

onBeforeMount(async () => {
  try {
    await apis.notify.GoogleTokenDirCheck().then((response) => {
      if (response.data.errCode === 0) alarmAction();
    });
  } catch (error) {
    console.error(error);
  }
});

onMounted(() => {});
</script>

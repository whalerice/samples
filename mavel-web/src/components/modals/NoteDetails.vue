<template>
  <q-dialog v-model="visible">
    <q-card class="note-card" flat>
      <q-bar>
        <span class="bar-title">
          {{ $t('dialog.title.note', { SENDER: message.sender }) }}
        </span>
        <q-space />
        <q-btn dense flat icon="close" v-close-popup>
          <q-tooltip class="bg-white text-primary">{{ $t('common.label.close') }}</q-tooltip>
        </q-btn>
      </q-bar>
      <q-card-section align="right" class="message-top">
        <div class="time">{{ message.time }}</div>
      </q-card-section>
      <q-card-section class="message-box">
        <div class="title">{{ message.title }}</div>
        <div class="content">{{ message.content }}</div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn unelevated :label="$t('common.button.ok')" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
    required: true,
  },
  data: {
    type: Object,
    required: false,
  },
});

const visible = computed({
  get() {
    return props.show;
  },
  set(value) {
    emits('close', value);
  },
});

const emits = defineEmits(['close']);

const message = ref<any>({
  title: '',
  content: '',
  sender: '',
  time: '',
});

watch(props, (val) => {
  message.value['title'] = val.data?.title;
  message.value['content'] = val.data?.content;
  message.value['sender'] = val.data?.sender_Id;
  message.value['time'] = val.data?.addTime;
});
</script>

<style scoped lang="scss">
.note-card {
  width: 100%;
  max-width: 50rem;
  .bar-title {
    font-size: 1.4rem;
    font-weight: 300;
    strong {
      color: $blue;
    }
  }
  .q-btn {
    height: 3.2rem;
  }
  .message-top {
    padding-top: 1rem;
    padding-bottom: 0;
    .time {
      color: $grey;
    }
  }
  .message-box {
    .title {
      font-size: 1.6rem;
      margin-bottom: 2rem;
    }

    .content {
      font-size: 1.4rem;
      font-weight: 300;
    }
  }
  .q-card__actions {
    padding: 0 1.6rem 1.6rem;
  }
}
</style>

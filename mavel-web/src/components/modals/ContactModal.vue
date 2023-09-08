<template>
  <q-dialog v-model="visible">
    <q-card class="note-card" flat>
      <q-bar>
        <span class="bar-title">{{ $t('common.button.contact') }}</span>
        <q-space />
        <q-btn dense flat icon="close" v-close-popup> </q-btn>
      </q-bar>

      <q-card-section class="message-top">
        <q-input v-model="contactData.title" :label="$t('table.thead.title')" />
      </q-card-section>
      <q-card-section class="message-top">
        <q-input v-model="contactData.content" :label="$t('table.thead.content')" filled type="textarea" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          class="transition"
          unelevated
          :label="$t('common.text.submit')"
          color="primary"
          :disable="activeSend"
          :loading="loading"
          @click="onSend()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { apis } from 'src/stores/apis';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
    required: true,
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
const activeSend = ref<boolean>(true);
const contactData = ref({
  title: '',
  content: '',
});
const loading = ref(false);

const onSend = async () => {
  try {
    loading.value = true;
    const res = await apis.SendMessage({
      messageType: 4,
      title: contactData.value.title,
      content: contactData.value.content,
    });
    loading.value = false;
    if (res.data.errCode == 0) {
      $q.notify({
        type: 'positive',
        message: res.data.errMessage,
        timeout: 10000,
      });
      visible.value = false;
    }
  } catch (error) {
    console.error(error);
  }
};
watch(contactData.value, (val) => {
  if (val.content !== '' && val.title !== '') {
    activeSend.value = false;
  } else {
    activeSend.value = true;
  }
});
watch(visible, (val) => {
  if (!val) {
    contactData.value.title = '';
    contactData.value.content = '';
    activeSend.value = true;
  }
});
</script>

<style scoped lang="scss">
.transition {
  transition: 0.3s;
}
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
    padding: 1.6rem;
  }
}
</style>

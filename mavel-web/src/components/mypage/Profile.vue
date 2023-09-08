<template>
  <div class="header-label">
    <h4>{{ $t('mypage.label.profile_info') }}</h4>
  </div>
  <div class="row justify-center profile-info-container mb-60">
    <div class="col-12 col-sm-3 column justify-center items-center">
      <div class="img-area relative-position mb-20">
        <q-img src="/images/profile-example.png" width="14.8rem" />
        <div class="profile-image-modify-controller">
          <q-icon name="svguse:icons.svg#custom-pencil" />
        </div>
      </div>
      <span class="profile-user-name">{{ my.user_Id }}</span>
    </div>
    <div class="col-12 col-sm-9 info-area row justify-between">
      <div class="col-12 col-sm-4 column justify-between items-center">
        <q-input v-model="my.nick" :label="$t('common.label.nickname')" stack-label dense class="user-info-input" />

        <q-input v-model="my.level" :label="$t('common.label.level')" stack-label dense class="user-info-input" />
      </div>
      <div class="col-12 col-sm-4 column justify-between items-center">
        <q-input v-model="my.role" :label="$t('common.label.role')" stack-label dense class="user-info-input" />
        <q-input
          v-model="my.referral_Id"
          :label="$t('modal.label.referral_id')"
          stack-label
          dense
          class="user-info-input" />
      </div>
      <div class="col-12 col-sm-4 column justify-between items-center">
        <q-input v-model="my.birthDate" :label="$t('common.label.birth')" stack-label dense class="user-info-input" />
        <ChangePwdForm />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ChangePwdForm from 'components/PwdChangeForm.vue';

import { storeToRefs } from 'pinia';
import { onBeforeMount, ref, watch } from 'vue';
import { userStore } from 'src/stores/user';
import { UserRole } from 'src/components/models/enums';

const { profile } = storeToRefs(userStore.user());
const { userProfile } = userStore.user();

const userRoleType = ref<{ value: number; label: string }[]>([
  { value: UserRole.HeadOffice, label: 'Head Office' },
  { value: UserRole.Subsidiary, label: 'Subsidiary' },
  { value: UserRole.ExclusiveDistributor, label: 'Exclusive Distributor' },
  { value: UserRole.Shop, label: 'Shop' },
  { value: UserRole.User, label: 'User' },
]);

const my = ref<IProfile>({
  birthDate: '',
  level: 0,
  nick: '',
  referral_Id: '',
  role: 0,
  user_Id: '',
});

watch(profile, (item: IProfile | null) => {
  if (item !== null) {
    my.value.birthDate = item.birthDate;
    my.value.level = item.level;
    my.value.nick = item.nick;
    my.value.referral_Id = item.referral_Id;
    my.value.role = userRoleType.value.filter((e) => e.value === item.role)[0].label;
    my.value.user_Id = item.user_Id;
  }
});

onBeforeMount(async () => {
  await userProfile();
});
</script>
<style lang="scss">
.profile-info-container {
  padding: 2rem;
  border-radius: 0.6rem;

  .profile-image-modify-controller {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    background-color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    bottom: 0;
    left: 10.5rem;
    display: none;
  }

  .user-info-input {
    width: 80%;
    pointer-events: none;
    font-size: 1.6rem;
    margin-bottom: 2.5rem;
  }

  .change-form {
    pointer-events: all;
  }

  .profile-user-name {
    font-weight: 500;
    font-size: 1.6rem;
    margin-bottom: 5rem;
  }

  .change-pwd-controller {
    font-size: 1.2rem;
    border-radius: 6px;
    padding: 1.3rem 0;
  }

  .profile-label {
    font-size: 1.4rem;
  }

  .info-area {
    padding: 0;
    width: 100%;
  }
}

.point-container {
  padding: 2rem;
  border: 1px solid #eee;
  border-radius: 0.6rem;
  // margin-bottom: 0.6rem;

  .point-label {
    color: $custom-purple-01;
    display: inline-block;
    font-size: 1.6rem;
  }

  .point-btn-controller {
    padding: 1rem 2rem;
    border-radius: 6px;
    font-size: 1.4rem;
    font-weight: 400;
  }
}

@media (min-width: 600px) {
  .profile-info-container {
    .info-area {
      padding: 2rem;
    }

    .profile-user-name {
      margin-bottom: 2rem;
    }

    .change-pwd-controller {
      padding: 0.2rem 0;
    }
  }
}

@media (min-width: 768px) {
  .profile-info-container {
    .info-area {
      width: 75%;
    }
    .user-info-input {
      margin-bottom: 0;
    }
  }

  .point-container {
    // flex: 1;
    // flex-shrink: 0;
    // margin: 0 0.6rem 0 0;

    &:last-child {
      margin-right: 0;
    }
  }
}

@media (min-width: 992px) {
  .profile-info-container {
    padding: 3rem 3rem;

    .info-area {
      padding: 4rem;
    }

    .profile-user-name {
      margin-bottom: 2rem;
    }

    .change-pwd-controller {
      padding: 0.3rem 2rem;
    }
  }
}
</style>

<template>
  <a-row :gutter="[10, 10]">
    <a-col :span="24">
      <a-descriptions bordered size="small" :labelStyle="style.label" :contentStyle="style.content1">
        <template #title>
          {{ $t('common.title.basic_info') }}
          <a-typography-text type="secondary" class="text-subtitle1 q-ml-xs">
            {{ $t('common.label.last_login_time') }}:{{ info.last_Login_Time }}
          </a-typography-text>
        </template>
        <template #extra>
          <a-button
            type="primary"
            v-if="levelChangePayment !== AuthorityLevel.Impossible && !isEditUserInfo"
            @click="editUserInfo">
            {{ $t('common.button.edit') }}
          </a-button>
          <a-button v-if="isEditUserInfo" @click="isEditUserInfo = false" class="q-mr-sm">
            {{ $t('common.button.cancel') }}
          </a-button>
          <a-button type="primary" v-if="isEditUserInfo" @click="saveUserInfo">
            {{ $t('common.button.save') }}
          </a-button>
        </template>
        <a-descriptions-item :label="$t('common.label.user_id')">
          {{ info.user_Id }}
          <a-button size="small" class="q-ml-sm" @click="showChangePasswordModal">
            {{ $t('common.text.change_password') }}
          </a-button>
        </a-descriptions-item>
        <a-descriptions-item :label="$t('common.label.nickname')">{{ info.nick }}</a-descriptions-item>
        <a-descriptions-item :label="$t('common.label.birth')">
          <template v-if="info.birthDate !== null && info.birthDate !== ''">
            {{ info.birthDate }}
          </template>
          <template v-else>-</template>
        </a-descriptions-item>

        <a-descriptions-item :label="$t('common.label.level')">{{ info.level }}</a-descriptions-item>
        <a-descriptions-item :label="$t('common.label.reward_type')">
          <template v-if="!isEditUserInfo">
            <template v-if="info.rewardType">
              {{ options.rewardType.filter((e: any) => e.value === info.rewardType)[0].label() }}
            </template>
            <template v-else>-</template>
          </template>
          <template v-if="isEditUserInfo">
            <template v-if="info.rewardType !== null">
              {{ options.rewardType.filter((e: any) => e.value === info.rewardType)[0].label() }}
            </template>
            <a-select
              v-model:value="info.rewardType"
              :options="options.rewardType"
              :placeholder="$t('common.placeholder.select')"
              v-if="info.rewardType === null"
              style="min-width: 15rem" />
          </template>
        </a-descriptions-item>
        <a-descriptions-item :label="$t('common.label.state')">
          <template v-if="!isEditUserInfo">
            <a-badge
              v-if="info.status !== -1"
              :status="
                info.status === UserStatus.Normal
                  ? 'success'
                  : info.status === UserStatus.StandBy
                  ? 'processing'
                  : info.status === UserStatus.NoBetting
                  ? 'warning'
                  : 'error'
              "
              :text="options.userStatus.filter((e:any) =>e.value ===  info.status)[0].label()" />
            <template v-else>-</template>
          </template>

          <a-select
            v-model:value="info.status"
            :options="options.userStatus"
            v-if="isEditUserInfo"
            style="min-width: 20rem" />
        </a-descriptions-item>
      </a-descriptions>
    </a-col>
    <a-col :span="24">
      <a-descriptions bordered size="small" :column="2" :labelStyle="style.label">
        <a-descriptions-item :label="$t('common.label.create_authority')">
          <template v-if="!isEditUserInfo">
            <a-badge
              v-if="info.lower_Create_Permission !== -1"
              :status="info.lower_Create_Permission === AuthorityLevel.Possible ? 'success' : 'error'"
              :text="options.authorityLevel.filter((e: any) => e.value === info.lower_Create_Permission)[0].label()" />
            <template v-else>-</template>
          </template>

          <a-select
            v-model:value="info.lower_Create_Permission"
            :options="options.authorityLevel"
            v-if="isEditUserInfo" />
        </a-descriptions-item>
        <a-descriptions-item :label="$t('common.label.payment_authority')">
          <template v-if="!isEditUserInfo">
            <a-badge
              v-if="info.lower_Payment_Authority !== -1"
              :status="info.lower_Payment_Authority === AuthorityLevel.Possible ? 'success' : 'error'"
              :text="options.authorityLevel.filter((e: any) => e.value === info.lower_Payment_Authority)[0].label()" />
            <template v-else>-</template>
          </template>

          <a-select
            v-model:value="info.lower_Payment_Authority"
            :options="options.authorityLevel"
            v-if="isEditUserInfo" />
        </a-descriptions-item>
      </a-descriptions>
    </a-col>
    <a-col :span="24">
      <a-descriptions bordered size="small" :column="1" :labelStyle="style.label">
        <a-descriptions-item :label="$t('common.label.belong')">
          <template v-if="info.belong !== null && info.belong !== ''">{{ info.belong }}</template>
          <template v-else>-</template>
        </a-descriptions-item>
      </a-descriptions>
    </a-col>
    <a-col :span="24">
      <a-descriptions bordered size="small" :column="1" :labelStyle="style.label">
        <a-descriptions-item :label="$t('common.label.memo')">
          <template v-if="!isEditUserInfo">
            <template v-if="info.memo !== null && info.memo !== ''">{{ info.memo }}</template>
            <template v-else>-</template>
          </template>
          <template v-if="isEditUserInfo">
            <a-input v-model:value="info.memo" :placeholder="$t('common.label.memo')" />
          </template>
        </a-descriptions-item>
        <a-descriptions-item :label="$t('common.label.add_memo')">
          <template v-if="!isEditUserInfo">
            <template v-if="info.moreInformation !== null && info.moreInformation !== ''">
              {{ info.moreInformation }}
            </template>
            <template v-else>-</template>
          </template>
          <template v-if="isEditUserInfo">
            <a-input v-model:value="info.moreInformation" :placeholder="$t('common.label.add_memo')" />
          </template>
        </a-descriptions-item>
      </a-descriptions>
    </a-col>
    <a-col :span="24">
      <a-descriptions bordered size="small" :labelStyle="style.label" :contentStyle="style.content1">
        <a-descriptions-item :label="$t('common.label.registration_date')">{{ info.addTime }}</a-descriptions-item>
        <a-descriptions-item :label="$t('common.label.suspend_date')">
          <template v-if="info.suspend_Time !== null && info.suspend_Time !== ''">
            {{ info.suspend_Time }}
          </template>
          <template v-else>-</template>
        </a-descriptions-item>
        <a-descriptions-item :label="$t('common.label.withdrawal_date')">
          <template v-if="info.withdrawal_Time !== null && info.withdrawal_Time !== ''">
            {{ info.withdrawal_Time }}
          </template>
          <template v-else>-</template>
        </a-descriptions-item>
      </a-descriptions>
    </a-col>
  </a-row>
  <!--  balance_fee -->
  <a-row :gutter="[10, 10]" class="q-mt-xl">
    <a-col :span="24">
      <a-descriptions
        :title="$t('common.title.balance_fee')"
        bordered
        size="small"
        :column="4"
        :labelStyle="style.label"
        :contentStyle="style.content2">
        <a-descriptions-item>
          <template #label>
            <q-icon name="svguse:/img/icons.svg#custom-cash" />
            {{ $t('common.label.cash') }}
          </template>
          {{ comma(balance.cash) }}
          <SubtractionPaymentsBtn
            :value="balance.cash"
            :idx="info.idx"
            :type="PromotionRewardType.Cash"
            @state="editDone"
            v-if="info.status === UserStatus.Normal" />
        </a-descriptions-item>
        <a-descriptions-item>
          <template #label>
            <q-icon name="svguse:/img/icons.svg#custom-point" />
            {{ $t('common.label.point') }}
          </template>
          {{ comma(balance.point) }}
          <SubtractionPaymentsBtn
            :value="balance.point"
            :idx="info.idx"
            :type="PromotionRewardType.Point"
            @state="editDone"
            v-if="info.status === UserStatus.Normal" />
        </a-descriptions-item>
        <a-descriptions-item>
          <template #label>
            <q-icon name="svguse:/img/icons.svg#custom-rolling" />
            {{ $t('common.label.rolling') }}
          </template>
          {{ comma(balance.rolling) }}
        </a-descriptions-item>
        <a-descriptions-item>
          <template #label>
            <q-icon name="svguse:/img/icons.svg#custom-losing" />
            {{ $t('common.label.losing') }}
          </template>
          {{ comma(balance.losing) }}
        </a-descriptions-item>
      </a-descriptions>
    </a-col>
    <a-col :span="24">
      <a-descriptions bordered size="small" :column="1" :labelStyle="style.label">
        <a-descriptions-item>
          <template #label>
            {{ $t('common.label.fee') }} / {{ info.rewardType }}
            <!-- <template v-if="info.rewardType !== null">
              ({{ options.rewardType.filter((e: any) => e.value === info.rewardType)[0].label() }})
            </template> -->
          </template>
          {{ fee }}
        </a-descriptions-item>
      </a-descriptions>
    </a-col>
  </a-row>

  <ChangePasswordUser :show="isChangeModal" :idx="info.idx" @update:show="(value:boolean) => isChangeModal = value" />
</template>

<script setup lang="ts">
import SubtractionPaymentsBtn from 'src/components/SubtractionPaymentsBtn.vue';
import ChangePasswordUser from 'components/modals/ChangePasswordUser.vue';

import { storeToRefs } from 'pinia';
import { onBeforeMount, ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import { useRoute } from 'vue-router';

import { comma, options } from 'src/boot/global';
import { UserType, UserStatus, AuthorityLevel, PromotionRewardType, RewardType } from 'src/components/models/enums';
import { userStore } from 'src/stores/user';
import { commonStore } from 'src/stores/common';
import { apis } from 'src/stores/apis';

interface IBalance {
  cash: number;
  point: number;
  rolling: number;
  losing: number;
}

const { memberType } = storeToRefs(userStore.sign());
const { levelChangePayment } = storeToRefs(userStore.user());
const { isLanding } = storeToRefs(commonStore.ui());
const { onUserDetail } = userStore.user();

const route = useRoute();
const info = ref<any>({
  idx: 0,
  role: 0,
  last_Login_Time: '',
  user_Id: '',
  nick: '',
  birthDate: '',
  level: -1,
  rewardType: null,
  status: -1,
  lower_Create_Permission: -1,
  lower_Payment_Authority: -1,
  belong: '',
  memo: '',
  moreInformation: '',
  addTime: '',
  suspend_Time: '',
  withdrawal_Time: '',
});

const balance = ref<IBalance>({ cash: 0, point: 0, rolling: 0, losing: 0 });
const fee = ref<string>('');
const isEditUserInfo = ref<boolean>(false);
const isChangeModal = ref<boolean>(false);

const style = ref({
  label: { width: '12%', color: 'grey' },
  content1: { width: '21.33%' },
  content2: { width: '13%', 'text-align': 'right' },
});

const editUserInfo = () => {
  isEditUserInfo.value = true;
};

const saveUserInfo = async () => {
  isLanding.value = true;

  const send = {
    idx: info.value.idx,
    level: info.value.level,
    role: info.value.role,
    status: info.value.status,
    lower_Payment_Authority: info.value.lower_Payment_Authority,
    lower_Create_Permission: info.value.lower_Create_Permission,
    memo: info.value.memo,
    moreInformation: info.value.moreInformation,
    reward_Type: info.value.rewardType,
  };

  try {
    const response =
      memberType.value === UserType.Manager ? await apis.manager.UserModify(send) : await apis.partner.UserModify(send);
    if (response.data.errCode === 0) {
      setTimeout(() => {
        isLanding.value = false;
        isEditUserInfo.value = false;
        onRefresh();
        message.success(response.data.errMessage);
      }, 200);
    } else {
      isLanding.value = false;
    }
  } catch (error) {
    isLanding.value = false;
    console.error(error);
  }
};

const editDone = () => {
  onRefresh();
};

const onRefresh = async () => {
  info.value = await onUserDetail({ user_Idx: Number(route.params.idx) });
  isEditUserInfo.value = false;
};

const showChangePasswordModal = () => {
  isChangeModal.value = true;
};

watch(info, (e) => {
  info.value['rewardType'] = e.rewardType === RewardType.None ? null : e.rewardType;
  balance.value['cash'] = e.cash;
  balance.value['point'] = e.point;
  balance.value['rolling'] = e.rolling;
  balance.value['losing'] = e.losing;
  fee.value = e.fee;
});

onBeforeMount(() => {
  onRefresh();
});
</script>

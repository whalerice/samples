import { defineStore } from 'pinia';
import { Modal } from 'ant-design-vue';
import { SessionStorage } from 'quasar';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import { apis } from 'src/stores/apis';

const isUserInfo: IUserInfo | any = SessionStorage.getItem('userInfo');

const userInfoInitialState = () => {
  return {
    idx: 0,
    user_Id: '',
    password: '',
    token: '',
    site_Idx: 0,
    compnay_Idx: 0,
    referral_Id: '',
    nick: '',
    hp: '',
    pinNumber: '',
    level: 0,
    role: 0,
    referral_Cnt: 0,
    rewardType: 1,
    lower_Payment_Authority: 0,
    lower_Create_Permission: 0,
    memo: '',
    status: 0,
    last_Login_Time: '',
    withdrawal_Time: '',
    suspend_Time: '',
    addTime: '',
    cash: 0,
    losing: 0,
    point: 0,
    rolling: 0,
    casino_Fee: 0,
    slot_Fee: 0,
    losing_Fee: 0,
    accountName: '',
    bankAccount: '',
    bankCode: 0,
  };
};

const user = defineStore('user', () => {
  // const { loggedIn } = storeToRefs(userStore.sign());
  // const { t } = useI18n();
  const userInfo = ref<IUserInfo>(userInfoInitialState());
  const payInfo = ref<IPayInfo>({ cash: 0, point: 0, rolling: 0, losing: 0 });
  const profile = ref<IProfile | null>(null);
  const router = useRouter();

  if (isUserInfo) {
    userInfo.value = isUserInfo;
  }

  const onUserInfo = (data: IUserInfo) => {
    userInfo.value = data;
    SessionStorage.set('userInfo', data);
    SessionStorage.set('tk', data.token);
    // SessionStorage.set('site', data.site_Idx);
  };

  const destroyUserInfo = async () => {
    const send: ILogout = { user_Idx: userInfo.value.idx, api_Token: '', role: userInfo.value.role };
    try {
      const response = await apis.Logout(send);

      if (response.data.errCode === 0) {
        router.push('/');
        userInfo.value = userInfoInitialState();
        SessionStorage.remove('userInfo');
        SessionStorage.remove('tk');
      }
    } catch (error: any) {
      console.error(error);
    }
  };

  const userPayInfo = async () => {
    try {
      const response = await apis.PayInfo({ User_Idx: userInfo.value.idx });
      const data = response.data.returnData;

      if (response.data.errCode === 0) {
        payInfo.value = {
          cash: data.cash,
          point: data.point,
          rolling: data.rolling,
          losing: data.losing,
        };
      }
    } catch (error) {
      console.error(error);
    }
  };

  const userProfile = async () => {
    try {
      const response = await apis.Profile();
      if (response.data.errCode === 0) {
        profile.value = response.data.returnData;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const paymentDecline = async (data: IPaymentDecline) => {
    try {
      if (data !== null) {
        await apis.PaymentDecline(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return {
    userInfo,
    payInfo,
    profile,
    onUserInfo,
    destroyUserInfo,
    userPayInfo,
    paymentDecline,
    userProfile,
  };
});

const sign = defineStore('sign', () => {
  const { t } = useI18n();
  const loggedIn = ref(false);
  const userInfo = ref<IUserInfo>(userInfoInitialState());
  const router = useRouter();

  loggedIn.value = isUserInfo ? true : false;

  const onSignOut = (msg: string) => {
    Modal.error({
      content: msg,
      okText: t('common.button.ok'),
      onOk() {
        router.push('/');
        userInfo.value = userInfoInitialState();
        SessionStorage.remove('userInfo');
        SessionStorage.remove('tk');
        loggedIn.value = false;
        Modal.destroyAll();
      },
      centered: true,
    });
  };

  return { loggedIn, onSignOut };
});

export const userStore = { sign, user };

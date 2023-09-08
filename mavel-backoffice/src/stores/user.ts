import { defineStore } from 'pinia';
import { SessionStorage } from 'quasar';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';

import { axios } from 'src/boot/main';
import { UserType, AuthorityLevel } from 'src/components/models/enums';
import { apis } from 'src/stores/apis';

const user = defineStore(
  'user',
  () => {
    const { memberType } = storeToRefs(userStore.sign());

    const userInfo = ref<IUserInfo | null>(null);
    const token = ref<string>('');
    const siteIdx = ref<number>(0);
    const levelCreateUser = ref<number | undefined>(AuthorityLevel.Possible); // lower_Create_Permission : 하위 유저 생성 가능 여부 (1, 불가 / 2 가능)
    const levelChangePayment = ref<number | undefined>(AuthorityLevel.Possible); // lower_Payment_Authority : 하위 캐시,포인트 지급 차감 기능 (1, 불가 / 2 가능)

    const onUserInfo = (data: IUserInfo) => {
      userInfo.value = data;
      token.value = data.token;
      siteIdx.value = data.site_Idx;

      if (memberType.value === UserType.Partner) {
        levelCreateUser.value = data.lower_Create_Permission;
        levelChangePayment.value = data.lower_Payment_Authority;
      }
    };

    const onUserDetail = async (send: IDataTableDetail) => {
      try {
        const response =
          memberType.value === UserType.Manager
            ? await apis.manager.UserDetail(send)
            : await apis.partner.UserDetail(send);

        if (response.data.errCode === 0) {
          const returnData = response.data.returnData;
          return returnData;
        }
      } catch (error) {
        console.error(error);
      }
    };

    return { userInfo, token, siteIdx, levelCreateUser, levelChangePayment, onUserInfo, onUserDetail };
  },
  {
    persist: true,
  },
);

const sign = defineStore(
  'sign',
  () => {
    const loggedIn = ref<boolean>(false);
    const clientIp = ref<string>('');
    const memberType = ref<string>('');

    const signOut = () => {
      SessionStorage.remove('user');
      SessionStorage.remove('summary');
      loggedIn.value = false;
      memberType.value = '';
    };

    const getClientIp = async () => {
      try {
        const response = await axios.get('https://jsonip.com');
        clientIp.value = response.data.ip;
      } catch (error) {
        console.error(error);
      }
    };

    return { loggedIn, clientIp, memberType, signOut, getClientIp };
  },
  {
    persist: true,
  },
);

const summary = defineStore(
  'summary',
  () => {
    const { memberType } = storeToRefs(userStore.sign());
    const summaryData = ref<any>();
    const isRefreshStatistics = ref<boolean>(false);

    const siteStatistics = async () => {
      isRefreshStatistics.value = true;

      try {
        const response =
          memberType.value === UserType.Manager
            ? await apis.manager.SiteStatistics()
            : await apis.partner.SiteStatistics();

        if (response.data.errCode === 0) {
          summaryData.value = response.data.returnData;
        }
        setTimeout(() => {
          isRefreshStatistics.value = false;
        }, 1000);
      } catch (error) {
        isRefreshStatistics.value = false;
        console.error(error);
      }
    };

    return { summaryData, isRefreshStatistics, siteStatistics };
  },
  {
    persist: {
      paths: ['summaryData'],
    },
  },
);

export const userStore = { sign, user, summary };

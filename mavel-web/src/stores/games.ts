import SiteDialog from 'src/components/SiteDialog.vue';

import { defineStore, storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useQuasar, Dialog } from 'quasar';
import { notify } from 'src/boot/main';

import { userStore } from 'src/stores/user';
import { commonStore } from 'src/stores/common';
import { apis } from 'src/stores/apis';

const games = defineStore('games', () => {
  const recentGameList = ref<any[]>([]);

  const recentPlayGame = async (userIdx: number) => {
    try {
      const response = await apis.UserRecentPlayGame(userIdx);

      if (response.data.errCode === 0) {
        recentGameList.value = response.data.returnData.list;
      } else {
        console.error('error', response.data.errCode);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return { recentGameList, recentPlayGame };
});

const play = defineStore('play', () => {
  const { userPayInfo } = userStore.user();
  const $q = useQuasar();
  const { userInfo } = storeToRefs(userStore.user());
  const { showSignInModal } = storeToRefs(commonStore.ui());
  const nowLoading = ref<Array<string>>([]);
  const nowPlaying = ref<INowPlaying>({});
  const dialogVisible = ref<boolean>(false);
  const platform = $q.platform.is.desktop ? 'desktop' : 'mobile';

  const playGame = async (item: any) => {
    if (!dialogVisible.value) {
      if (!userInfo.value) {
        showSignInModal.value = true;
      } else {
        try {
          const send = {
            vendor: String(item.vendor_Key),
            gameCode: item.gameCode,
            userId: userInfo.value.user_Id,
            platform: platform,
          };

          const response = await apis.GameUrl(send);
          const errCode = response.data.errCode;
          // const errMessage = response.data.errMessage;
          const returnData = response.data.returnData;

          if (errCode === 0 && returnData !== null) {
            gameOpen(returnData.link, send.gameCode);
          } else {
            return errCode;
          }
        } catch (error: any) {
          const msg = JSON.parse(error);
          if (msg.ErrCode === 500) {
            showSignInModal.value = true;
          }
          return msg.ErrCode;
        }
      }
    } else {
      notify({
        message: '현재 진행 중인 게임을 종료 후 다시 시도해주세요.',
        color: 'custom-purple-gradient-01',
        textColor: 'white',
        position: 'top',
        spinnerSize: '4rem',
        timeout: 3000,
      });
    }
  };

  // const gameOBJ: any = ref({});

  const dialogCreate = (gameCode: string) => {
    dialogVisible.value = true;
    Dialog.create({ component: SiteDialog, componentProps: { nowPlaying: nowPlaying.value } })
      .onCancel(() => console.log())
      .onDismiss(async () => {
        dialogVisible.value = false;
        removeNowPlaying(gameCode);
        await userPayInfo();
      });
  };

  const gameOpen = async (uri: any, gameCode: string) => {
    await userPayInfo();
    pushNowPlaying(gameCode, uri);
    dialogCreate(gameCode);

    // const width = $q.platform.is.desktop ? 1200 : $q.screen.width;
    // const height = $q.platform.is.desktop ? 800 : $q.screen.height;
    // const options = `toolbar=no,scrollbars=no,resizable=yes,status=no,menubar=no,width=${width}, height=${height}, top=0,left=0`;

    // gameOBJ.value[gameCode] = () => {
    //   const popup = window.open(uri, gameCode, options);
    //   const interval = window.setInterval(async () => {
    //     try {
    //       if (popup == null || popup.closed) {
    //         clearInterval(interval);
    //         removeNowPlaying(gameCode);
    //         await userPayInfo();
    //         delete gameOBJ.value[gameCode];
    //       }
    //     } catch (e) {
    //       console.error(e);
    //     }
    //   }, 1000);
    // };

    // gameOBJ.value[gameCode]();
  };

  const pushNowLoading = (gameCode: string) => {
    nowLoading.value.push(gameCode);
  };

  const removeNowLoading = (gameCode: string) => {
    nowLoading.value = nowLoading.value.filter((e) => {
      e !== gameCode;
    });
  };

  const pushNowPlaying = (gameCode: string, url: string) => {
    nowPlaying.value[gameCode] = { url };
  };

  const removeNowPlaying = (gameCode: string) => {
    delete nowPlaying.value[gameCode];
  };

  return {
    gameOpen,
    playGame,
    nowLoading,
    nowPlaying,
    pushNowLoading,
    removeNowLoading,
    pushNowPlaying,
    removeNowPlaying,
  };
});

export const gamesStore = { play, games };

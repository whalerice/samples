import { defineStore } from 'pinia';
import { ref } from 'vue';
import { apis } from 'src/stores/apis';

const payment = defineStore('payment', () => {
  const isShowDeposit = ref(false);
  const isShowWithdrawal = ref(false);
  const depositPayList = ref<IPaymentGatewayList[]>([]);
  const withdrawalPayList = ref<IPaymentGatewayList[]>([]);
  const dialogVisible = ref<boolean>(false);
  const dialogCategory = ref<string>('');

  const getDepositPayments = async (siteIdx: number) => {
    try {
      // const siteIdx = userInfo.value.site_Idx;
      const res = await apis.SitePaymentInfoList(siteIdx);

      if (res.data.errCode === 0) {
        const list = res.data.returnData.list;
        list.forEach((item: any) => {
          item.label = item.payment_Category;
          item.value = item.idx;
          item.desc = item.payment_Name;
          item.disable = item.payment_Category === 'AstroPay' ? true : false;
          delete item.idx;
          delete item.payment_Category;
          delete item.payment_Name;
        });
        depositPayList.value = list;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getWithdrawPayments = async () => {
    try {
      const res = await apis.WithdrawPaymentList();

      if (res.data.errCode === 0) {
        const list = res.data.returnData;
        list.forEach((item: any) => {
          item.label = item.name;
          item.value = item.payment_Idx;
          item.desc = item.etc;
          item.disable = item.name === 'AstroPay' ? true : false;
          delete item.payment_Idx;
          delete item.name;
          delete item.etc;
        });
        withdrawalPayList.value = list;
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

  const showDeposit = async () => {
    isShowDeposit.value = true;
  };

  const showWithdrawal = async () => {
    isShowWithdrawal.value = true;
  };

  const showDialog = (category: string) => {
    dialogVisible.value = true;
    dialogCategory.value = category;
  };

  return {
    isShowDeposit,
    isShowWithdrawal,
    depositPayList,
    withdrawalPayList,
    dialogVisible,
    dialogCategory,
    getDepositPayments,
    getWithdrawPayments,
    paymentDecline,
    showDeposit,
    showWithdrawal,
    showDialog,
  };
});

export const paymentStore = { payment };

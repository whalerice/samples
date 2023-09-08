const deepFreeze = (obj) => {
  Object.keys(obj).forEach((prop) => {
    if (typeof obj[prop] === 'object' && !Object.isFrozen(obj[prop])) deepFreeze(obj[prop]);
  });
  return Object.freeze(obj);
};

export const Enum = {
  defaultWalletState: {
    firstApprovalWait: -1, // 1차 승인 대기 (진행중)
    secondApprovalWait: 0, // 2차 승인 대기 (진행중)
    transactionWait: 1, // 전송 대기 (진행중)
    transactionComplete: 2, // 완료 (완료)
    transactionFail: 3, // 실패 (취소)
    firstApprovalRefuse: 4, // 1차 승인 거절 (취소)
    secondApprovalRefuse: 5, // 2차 승인 거절 (취소)
    safeProceeding: 6, // 안전거래 진행중 (진행중)
    safeStop: 7, // 거래중단 (진행중)
    safeDeclare: 8, // 신고 (진행중)
    safeStopApproval: 9, // 거래 중단 승인 (완료)
    safeAccountStop: 10, // 계정 중단 (완료)
  },
  accountStatus: {
    active: 10,
    inactive: 20,
    suspended: 30,
    deleted: 40,
    dispute: 50,
  },
  walletUserType: {
    wallet: 1, //  일반회원
    tvp: 2,
    enterprise: 40,
    personal: 41,
  },
  //4.18 userType -> grade
  walletDealType: {
    deposit: 1,
    withdraw: 2,
    swap: 3,
  },
  walletTxIdType: {
    internalTransaction: 1, //내부거래
    externalTransaction: 2, //외부거래
    safeTransaction: 3, //안전거래
    investmentDeposit: 4, //투자금입금
    investmentWithdrawal: 5, //투자금출금
    paymentDeposit: 6, //결제입금
    paymentWithdrawal: 7, //결제출금
    purchaseDeposit: 8, //구매입금
    purchaseWithdrawal: 9, //구매출금
    donation: 10, //기부
  },
  cpesoStateType: {
    FirstRequest: -1,
    SecondRequest: 0,
    Approval: 2,
    FirstRefusal: 4,
    SecondRefusal: 5,
  },
  cpesoVerificationStateType: {
    ProcessingPayout: 1,
    Unfinished: 2,
    PayoutComplete: 3,
  },
  cpesoVerificationType: {
    AlreadyCompleted: 1, //완료 후 재업로드,
    VerificationComplete: 2, // 검증 완료
    PaymentIdDuplicated: 3, // Payment_Id 중복
    AccountNotFound: 4, // 결제 불가(계정 불일치)
    DisableAccount: 5, //사용 불가능한 계정 상태
    Unfinished: 6,
  },
  userStateType: {
    Request: 1,
    ApprovalProgress: 2,
    Refusal: 3,
    ConfirmDeposit: 4,
    Approval: 10,
  },
  depositStateType: {
    Request: 0,
    CancelledUser: 1,
    Completed: 2,
    CancelledStore: 3,
  },
  disputeStateType: {
    Request: false,
    Ongoing: true,
  },
  kycApprovalType: {
    finalRefusal: -2,
    refusal: -1,
    request: 0,
    approval: 1,
    finalApproval: 2,
  },
  kycStepType: {
    firstStep: 1,
    secondStep: 2,
  },
  kycTabType: {
    Waiting1stList: 0,
    Waiting2ndList: 1,
    ApprovalList: 2,
    RefusalList: 3,
  },
  partnerType: {
    enterprise: 40,
    personal: 41,
  },
};

deepFreeze(Enum);

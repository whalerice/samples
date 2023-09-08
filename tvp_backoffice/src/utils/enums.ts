export const RewardType = {
  Rolling: 0,
  Losing: 1,
};

export const SettlementType = {
  All: 0,
  Daily: 1,
  Weekly: 7,
  Monthly: 30,
};

export const MemberLevelType = {
  Investor: 0,
  AgentOne: 1,
  AgentTwo: 2,
  AgentThree: 3,
  AgentFour: 4,
  AgentFive: 5,
  User: 6,
};

export const RoleType = {
  Investor: 0,
  Agent: 1,
};

export const CoinCode = {
  BTC: 1,
  ETH: 2,
  USDT: 3,
  XRP: 4,
  TRX: 6,
  CPESO: 7,
};

export const TransactionType = {
  Withdrawal: 0,
  Deposit: 1,
};

export const MemberStatusType = {
  Online: 0,
  VisitedToday: 1,
  NewOfToday: 2,
  NewOfMonth: 3,
  DisconnectedForTwoWeeks: 4,
  Waiting: 5,
  Stop: 6,
  Normal: 7,
};

export const TransactionStatus = {
  OnRequest: 0,
  Completed: 1,
  Rejected: 2,
};

export const SettlementStatus = {
  OnRequest: 0,
  Approved: 1,
  Refused: 2,
};

export const VerificationMethod = {
  RegisterOtp: 1,
  ChangePassword: 2,
  ChangePin: 3,
  ChangePhone: 4,
  ChangeOtp: 5,
  FindPassword: 6,
  Register: 7,
  ExRegister: 8,
  BiomtericRegister: 9,
  BackOfficeAuth: 10,
  BackOfficePartnerSignUp: 11,
  BackOfficeChangeWithdraw: 12,
  AmountAccumulate: 13,
  Tvp: 14,
};

export const UserStateType = {
  Request: 1,
  ApprovalProgress: 2,
  Refusal: 3,
  ConfirmDeposit: 4,
  Approval: 10,
};

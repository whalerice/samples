export enum PaymentType {
  Deposit = 1,
  Withdrawal = 2,
}

export enum RecentPlayGameCategory {
  Hot = 1,
  Favorite = 2,
}

export enum MainCategory {
  LiveCasino = 1,
  Slots = 2,
  All = 3,
}

export enum UserCheckType {
  Id = 1,
  Nickname = 2,
}
export enum RewardType {
  Rolling = 1,
  Losing = 2,
}

export enum UseType {
  Charging = 4,
  Exchange = 2,
}

export enum CurrencyType {
  USD = 1,
  KRW = 2,
  EUR = 3,
  JPY = 4,
  CNY = 5,
  PHP = 6,
}

export enum PaymentName {
  Cpass = 1,
  AstroPay = 3,
}

export enum UserRole {
  HeadOffice = 1, // 본사
  Subsidiary = 2, // 부본사
  ExclusiveDistributor = 3, // 총판
  Shop = 4, // 매장
  User = 5, // 유저
}
export enum PaymentState {
  Request = 1, //신청
  Approval = 2, //승인
  Waiting = 3, //대기
  Refusal = 4, //거절
  Failed = 5, //실패
}

export enum PaymentProgressType {
  Ready = 0,
  Invoice = 1,
  Pay = 2,
}

export enum MessageType {
  Notice = 1, //공지사항
  Event = 2, //이벤트
  AdminToUser = 3, //관리자가 유저한테
  UserToAdmin = 4, //유저가 관리자에게
}

export enum LocaleCode {
  En = 'En', //영어
  Ko = 'Ko', //한국
  Zh = 'Cn', //중국
  Ja = 'Jp', //일본
  Ph = 'Ph', //필리핀
  Ru = 'Ru', //러시아
  Th = 'Th', //대만
}

export enum RecentTableCategory {
  PaymentRequest = 1,
  GameBetting = 2,
  Point = 3,
  Reward = 4,
  RewardRequest = 5,
}
export enum RecentTableType {
  Betting = 49,
  Result = 50,
  Deposit = 51, // 입금
  Withdraw = 52, // 출금
  Lose = 53, // 패
  Win = 54, // 승
  CashSwitching = 55, // 캐시 전환 ( - )
  Event = 56, // 이벤트 획득 ( + )
  AdminDeduct = 57, // 관리자 차감 ( - )
  AdminProvide = 58, // 관리자 지급 ( + )
  Rolling = 59, // 롤링
  Losing = 60, // 루징
}
export enum RecentTableState {
  Request = 61, //신청
  Approval = 62, //승인
  Waiting = 63, //대기
  Refusal = 64, //거절
  Fail = 65, //실패
  Processing = 66, // 진행중
  Complete = 67, // 완료
  Apply = 68, // 신청
  PaidOut = 69, // 지급 완료
}

// export enum Bank {
//   KB = 1, // 국민은행
//   KJ = 2, // 광주은행
//   KN = 3, // 경남은행
//   IBK = 4, //기업은행
//   NH = 5, //농협은행
//   DGB = 6, // 대구은행
//   DB = 7, // 도이치은행
//   BNK = 8, // 부산은행
//   MG = 9, // 새마을금고
//   SH = 10, // 수협은행
//   CU = 11, // 신협은행
//   SOL = 12, // 신한은행
//   WON = 13, // 우리은행
//   EPOST = 14, // 우체국
//   JB = 15, // 전북은행
//   JEJU = 16, // 제주은행
//   KEB = 17, // 하나(외환)은행
//   CITI = 18, // 한국씨티은행
//   HBC = 19, // HBC은행
//   SC = 20, // SC제일은행
//   SJ = 21, // 산림은행
//   KAKAO = 22, // 카카오뱅크
// }

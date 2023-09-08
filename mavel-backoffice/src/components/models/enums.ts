export enum SiteGrade {
  Admin = 0,
  Manager = 1,
}

export enum Role {
  HeadOffice = 1, // 본사(파트너)
  Subsidiary = 2, // 부본사(파트너)
  ExclusiveDistributor = 3, // 총판(파트너)
  Shop = 4, // 매장(파트너)
  User = 5, // 유저
}

export enum PaymentName {
  Cpass = 1,
  AstroPay = 2,
  Custom = 3,
}

export enum CurrencyType {
  USD = 1, // $
  KRW = 2, // ₩
  EUR = 3, // €
  JPY = 4, // ¥
  CNY = 5, // ¥
  PHP = 6, // ₱
}

export enum UserType {
  Manager = 'Manager',
  Partner = 'Partner',
}

export enum UserStatus {
  Normal = 1, // 정상
  StandBy = 2, // 대기
  Stop = 3, // 정지
  Withdrawal = 4, // 탈퇴
  NoBetting = 5, // 배팅금지
}
export enum RewardType {
  None = 0, // 미정
  Rolling = 1, // 롤링
  Losing = 2, // 루징
}

export enum BlockType {
  ID = 1,
  IP = 2,
}
export enum BlockState {
  Block = 1,
  Unblock = 2,
}

export enum UserCalculateState {
  Request = 1,
  Completion = 2,
  Refusal = 3,
}

export enum FeeType {
  RollingCasino = 1, // 롤링(카지노)
  RollingSlot = 2, // 롤링(슬롯)
  Losing = 3, // 루징
}

export enum DefaultState {
  Request = 1, // 신청
  Approval = 2, // 승인
  Waiting = 3, // 대기
  Refusal = 4, // 거절
  Fail = 5, //실패
}

export enum GameCategory {
  All = 0,
  Casino = 1,
  Slot = 2,
  Sports = 3,
}

export enum GameDesignation {
  All = 0,
  Hot = 1,
  Favorite = 2,
}
export enum UseCategory {
  Betting = 1, // 배팅 ( + / -)
  Exchange = 2, // 환전   ( - )
  PointSwitching = 3, // 포인트 전환 ( + )
  Charging = 4, // 충전 ( + )
  Reward = 5, // 리워드 ( + )
  AdminDeduct = 6, // 관리자 차감 ( - )
  AdminProvide = 7, // 관리자 지급 ( + )
  UserTransferDeduct = 8, // 유저 보유 자산 이동 (-)
  UserTransferProvide = 9, // 유저 보유 자산 이동 (+)
  ChargingCancel = 10, // 충전 취소 (되돌리) (-)
  Calculate = 11, // 정산 (-)
  BelowProvide = 12, // 하위 캐시 지급 ( - )
  BelowWithdraw = 13, // 하위 캐시 회수 ( + )
}

export enum NoticeStateType {
  Register = 0, // 등록
  Modify = 1, // 수정
}
export enum PromotionCategory {
  Event = 1, // 출석이벤트
  Betting = 2, // 베팅
  Reward = 3, // 리워드
}
export enum PromotionRewardType {
  Cash = 1,
  Point = 2,
}
export enum FilterDefault {
  All = 0,
  SiteName = 1,
  IDNick = 2,
  RecommendID = 3,
}
export enum AuthorityLevel {
  Impossible = 1,
  Possible = 2,
}
export enum AuthorityRW {
  Reading = 1,
  Writing = 2,
  All = 3,
}

export enum ManagerStatus {
  Normal = 1, // 정상
  Stop = 2, // 정지
}

export enum PaymentType {
  Cash = 1, //캐시
  Point = 2, //포인트
  Charging = 3, //충전
  Exchange = 4, //환전
}
export enum PointUseType {
  CashSwitching = 1, // 캐시 전환
  EventAcquiring = 2, //이벤트 획득
  AdminDeduct = 3, // 관리자 차감 ( - )
  AdminProvide = 4, //관리자 지급( + )
  BelowPointProvide = 5, // 하위 포인트 지급 ( - )
  BelowPointWithdraw = 6, // 하위 포인트 회수 ( + )
}
export enum GameResultType {
  Lose = 0,
  Win = 1,
  Done = 2,
}
// window.Role = Role;
// window.UserType = UserType;

// declare global {
//   interface Window {
//     Role: typeof Role;
//     UserType: typeof UserType;
//   }
// }

// export { UserType, Role };

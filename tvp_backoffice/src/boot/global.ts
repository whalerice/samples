import { boot } from 'quasar/wrappers';
import { LocalStorage } from 'quasar';
import type { SelectProps } from 'ant-design-vue';
import {
  MemberLevelType,
  RewardType,
  TransactionType,
  MemberStatusType,
} from '@/utils/enums';

const parseJwt = (token: string) => {
  const base64Url = token.split('.')[1] ?? '';
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );

  return jsonPayload ? JSON.parse(jsonPayload) : {};
};

const RoleClaimType =
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

const token = LocalStorage.getItem('token')?.toString() ?? '';

const jwt = token ? parseJwt(token) : '';
const role = jwt[RoleClaimType];

const comma = (change?: number | string | null) => {
  return Number(change ?? 0).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
};

const options: any = {};

export default boot(({ app }) => {
  const t = app.config.globalProperties.$t;

  const memberLevel: SelectProps['options'] = [
    {
      value: MemberLevelType.Investor,
      label: () => t('common.word.partner'),
    },
    {
      value: MemberLevelType.AgentOne,
      label: () => t('common.word.agent_number', { number: 1 }),
    },
    {
      value: MemberLevelType.AgentTwo,
      label: () => t('common.word.agent_number', { number: 2 }),
    },
    {
      value: MemberLevelType.AgentThree,
      label: () => t('common.word.agent_number', { number: 3 }),
    },
    {
      value: MemberLevelType.AgentFour,
      label: () => t('common.word.agent_number', { number: 4 }),
    },
    {
      value: MemberLevelType.AgentFive,
      label: () => t('common.word.agent_number', { number: 5 }),
    },
    {
      value: MemberLevelType.User,
      label: () => t('common.word.user'),
    },
  ];

  const reward: SelectProps['options'] = [
    { value: RewardType.Rolling, label: () => t('common.word.rolling') },
    { value: RewardType.Losing, label: () => t('common.word.losing') },
  ];

  const transaction: SelectProps['options'] = [
    { value: TransactionType.Deposit, label: () => t('common.word.deposit') },
    {
      value: TransactionType.Withdrawal,
      label: () => t('common.word.withdrawal'),
    },
  ];

  const memberStatus: SelectProps['options'] = [
    {
      value: MemberStatusType.Normal,
      label: () => t('common.word.status_normal'),
    },
    { value: MemberStatusType.Stop, label: () => t('common.word.status_stop') },
  ];

  const steps: SelectProps['options'] = [
    {
      value: 0,
      label: () => t('common.word.step_number', { number: 0 }),
    },
    {
      value: 1,
      label: () => t('common.word.step_number', { number: 1 }),
    },
    {
      value: 2,
      label: () => t('common.word.step_number', { number: 2 }),
    },
    {
      value: 3,
      label: () => t('common.word.step_number', { number: 3 }),
    },
    {
      value: 4,
      label: () => t('common.word.step_number', { number: 4 }),
    },
  ];

  options.memberLevel = memberLevel;
  options.reward = reward;
  options.transaction = transaction;
  options.memberStatus = memberStatus;
  options.steps = steps;
});

export { role, comma, options };

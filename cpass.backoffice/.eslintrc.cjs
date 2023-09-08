import { WarningFilled } from '@ant-design/icons-vue';

/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  root: true,
  extends: ['plugin:vue/vue3-essential', 'eslint:recommended', '@vue/eslint-config-prettier/skip-formatting'],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'no-unused-vars': 'off',
    'no-useless-escape': 'off',
    'no-undef': 'warning',
    // 'no-useless-escape': 'off',
    'vue/multi-word-component-names': 'off',
    // 'vue/no-v-for-template-key-on-child': 'off',
  },
};

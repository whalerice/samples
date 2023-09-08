// import { createCipheriv } from 'crypto';
import lottie from 'lottie-web';
import store from '@/store';
import send from '@/assets/images/success.json';
import settlement from '@/assets/images/settlement.json';
import inquiry from '@/assets/images/inquiry.json';
import swap from '@/assets/images/swap.json';
import setting from '@/assets/images/setting.json';

import { notification, Modal } from 'ant-design-vue';
import { computed } from 'vue';
import { Enum } from '@/assets/js/enum.js';

const currencyList = computed(() => store.state['sign'].currencyList);

export const decimal = (e) => {
  const num = String(e).replace(/[^\.0-9]/g, '');
  return num;
};

export const comma = (e) => {
  const num = String(e).split('.');
  num[0] = num[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return num.join('.');
};

export const dateSet = (day) => {
  const date = new Date();
  let setDay = day === 1 ? date.getDate() : date.getDate() - (day - 1);
  const today = new Date(date.toString(date.setDate(setDay)));
  const y = today.getFullYear();
  const m = today.getMonth() + 1;
  const d = today.getDate();

  return `${y}-${('0' + m).slice(-2)}-${('0' + d).slice(-2)}`;
};

export const nowDate = () => {
  const date = new Date();
  let now = date.getHours() + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
  return now;
};

export const decimalNumber = (number, digits) => {
  let num = typeof number === 'number' ? String(number) : number.replace(/,/g, '');

  if (digits === 0) return num.replace('.', '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const pointPos = num.indexOf('.');
  if (pointPos === -1) return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const splitNumber = num.split('.');
  return `${splitNumber[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${splitNumber[1].substr(0, digits)}`;
};

export const digits = (number, digits) => {
  let num = typeof number === 'number' ? String(number) : number.replace(/,/g, '');
  const pointPos = num.indexOf('.');
  if (pointPos === -1) return Number(num).toFixed(2);
  const splitNumber = num.split('.');
  const tempNum = `${splitNumber[0]}.${splitNumber[1].substr(0, digits)}`;
  return Number(tempNum).toFixed(digits);
};

export const googleTranslateEvent = (lang) => {
  const gtcombo = document.querySelector('.goog-te-combo');
  if (gtcombo == null) {
    return false;
  }
  gtcombo.value = lang;
  gtcombo.dispatchEvent(new Event('change'));
};

export const openNotificationWithIcon = (type, message, description) => {
  notification[type]({
    message: message,
    description: description,
  });
};

// export const encryption = (message) => {
//   const aesKey = 'Wk4516wkd2$8#ufrGof3!~7@90&XQ$%i';
//   const vectorKey = '1a2b3C4z0x9$8!67';

//   const cipher = createCipheriv('aes-256-cbc', aesKey, vectorKey);
//   let result = cipher.update(message, 'utf8', 'base64');
//   result += cipher.final('base64');

//   return result;
// };

export const lottieModal = (title, type, time) =>
  new Promise((resolve, reject) => {
    const selector = (type) => {
      if (type === 'send') return send;
      else if (type === 'settlement') return settlement;
      else if (type === 'swap') return swap;
      else if (type === 'inquiry') return inquiry;
      else if (type === 'setting') return setting;
    };

    let secondsToGo = time ? time : 5;
    const modal = Modal.success({
      title: `${title}`,
      class: 'lottie-success',
      icon: '',
    });
    document.querySelector('.ant-modal-confirm-btns').remove();

    const interval = setInterval(() => {
      secondsToGo -= 1;
    }, 1000);

    setTimeout(() => {
      clearInterval(interval);
      modal.destroy();
      setTimeout(() => {
        resolve(true);
      }, 500);
    }, secondsToGo * 1000);

    lottie.loadAnimation({
      container: document.querySelector('.lottie-success .ant-modal-confirm-body'),
      renderer: 'svg',
      loop: false,
      autoplay: true,
      animationData: selector(type),
    });
  });

export function returnFunction(val) {
  if (typeof val !== 'function') {
    return val;
  }
  return val();
}

export const auth = {
  Viewer: 25,
  Manager: 50,
  Supervisor: 30,
  Developer: 95,
  Supermaster: 100,
  Agent: 70,
  Headseller: 80,
  Master: 90,
  Enterprise: 40,
  Personal: 41,
};

export const accessList = [
  { idx: 25, name: 'Viewer' },
  { idx: 50, name: 'Manager' },
  { idx: 30, name: 'Supervisor' },
  { idx: 95, name: 'Developer' },
  { idx: 100, name: 'Supermaster' },
  { idx: 70, name: 'Agent' },
  { idx: 80, name: 'Headseller' },
  { idx: 90, name: 'Master' },
  { idx: 40, name: 'Enterprise' },
  { idx: 41, name: 'Personal' },
];
export const admin = [auth.Supervisor, auth.Developer, auth.Supermaster];
export const manager = [auth.Viewer, auth.Manager];
export const partner = [auth.Enterprise, auth.Personal];
export const seller = [auth.Agent, auth.Headseller, auth.Master];

export const authGroup = (grade) => {
  let name = '';

  if (admin.filter((e) => grade === e).length > 0) name = 'admin';
  else if (manager.filter((e) => grade === e).length > 0) name = 'manager';
  else if (partner.filter((e) => grade === e).length > 0) name = 'partner';
  else if (seller.filter((e) => grade === e).length > 0) name = 'seller';
  else name = 'Invalid';

  return name;
};

export const chartColor = [
  '#5470c6',
  '#91cc75',
  '#fac858',
  '#ee6666',
  '#73c0de',
  '#3ba272',
  '#fc8452',
  '#9a60b4',
  '#ea7ccc',
];

export const dayOptions = [
  {
    value: 'all',
    label: 'common.select.all',
  },
  {
    value: 7,
    label: '7',
  },
  {
    value: 15,
    label: '15',
  },
  {
    value: 30,
    label: '30',
  },
];

export const pages = [
  { value: 10, label: '10' },
  { value: 25, label: '25' },
  { value: 50, label: '50' },
];

export const secondCategories = {
  0: [],
  1: [],
  2: [
    { value: 0, label: 'search.select.all' },
    { value: 1, label: 'search.select.account' },
    { value: 2, label: 'search.select.cpass_wallet' },
    { value: 3, label: 'search.select.cpass_payment' },
    { value: 4, label: 'search.select.passq' },
  ],
};
export const countryList = [
  {
    country: 'search',
    alpha2Code: 'search',
    dialCode: 'search',
    disabled: true,
    class: 'v3f-country-search-block',
  },
  {
    alpha2Code: 'af',
    country: 'Afghanistan (افغانستان)',
    dialCode: '93',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'al',
    country: 'Albania (Shqipëri)',
    dialCode: '355',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'dz',
    country: 'Algeria (الجزائر‬‎)',
    dialCode: '213',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'as',
    country: 'American Samoa',
    dialCode: '1684',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'ad',
    country: 'Andorra',
    dialCode: '376',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'ao',
    country: 'Angola',
    dialCode: '244',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'ai',
    country: 'Anguilla',
    dialCode: '1264',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'ag',
    country: 'Antigua and Barbuda',
    dialCode: '1268',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'ar',
    country: 'Argentina',
    dialCode: '54',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'am',
    country: 'Armenia (Հայաստան)',
    dialCode: '374',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'aw',
    country: 'Aruba',
    dialCode: '297',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'au',
    country: 'Australia',
    dialCode: '61',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'at',
    country: 'Austria (Österreich)',
    dialCode: '43',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'az',
    country: 'Azerbaijan (Azərbaycan)',
    dialCode: '994',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'bs',
    country: 'Bahamas',
    dialCode: '1242',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'bh',
    country: 'Bahrain (البحرين‬‎)',
    dialCode: '973',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'bd',
    country: 'Bangladesh (বাংলাদেশ)',
    dialCode: '880',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'bb',
    country: 'Barbados',
    dialCode: '1246',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'by',
    country: 'Belarus (Беларусь)',
    dialCode: '375',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'be',
    country: 'Belgium (België)',
    dialCode: '32',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'bz',
    country: 'Belize',
    dialCode: '501',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'bj',
    country: 'Benin (Bénin)',
    dialCode: '229',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'bm',
    country: 'Bermuda',
    dialCode: '1441',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'bt',
    country: 'Bhutan (འབྲུག)',
    dialCode: '975',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'bo',
    country: 'Bolivia',
    dialCode: '591',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'ba',
    country: 'Bosnia and Herzegovina (Босна и Херцеговина)',
    dialCode: '387',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'bw',
    country: 'Botswana',
    dialCode: '267',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'br',
    country: 'Brazil (Brasil)',
    dialCode: '55',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'bn',
    country: 'Brunei',
    dialCode: '673',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'bg',
    country: 'Bulgaria (България)',
    dialCode: '359',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'bf',
    country: 'Burkina Faso',
    dialCode: '226',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'bi',
    country: 'Burundi (Uburundi)',
    dialCode: '257',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'kh',
    country: 'Cambodia (កម្ពុជា)',
    dialCode: '855',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'cm',
    country: 'Cameroon (Cameroun)',
    dialCode: '237',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'ca',
    country: 'Canada',
    dialCode: '1',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'cv',
    country: 'Cape Verde (Kabu Verdi)',
    dialCode: '238',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'ky',
    country: 'Cayman Islands',
    dialCode: '1345',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'cf',
    country: 'Central African Republic (République centrafricaine)',
    dialCode: '236',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'td',
    country: 'Chad (Tchad)',
    dialCode: '235',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'cl',
    country: 'Chile',
    dialCode: '56',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'cn',
    country: 'China (中国)',
    dialCode: '86',
    language: 'Chinese',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'co',
    country: 'Colombia',
    dialCode: '57',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'km',
    country: 'Comoros (جزر القمر‬‎)',
    dialCode: '269',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'cd',
    country: 'DR Congo (Jamhuri ya Kidemokrasia ya Kongo)',
    dialCode: '243',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'cg',
    country: 'Congo (Republic) (Congo-Brazzaville)',
    dialCode: '242',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'ck',
    country: 'Cook Islands',
    dialCode: '682',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'cr',
    country: 'Costa Rica',
    dialCode: '506',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'ci',
    country: "Côte d'Ivoire (Ivory Coast)",
    dialCode: '225',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'hr',
    country: 'Croatia (Hrvatska)',
    dialCode: '385',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'cu',
    country: 'Cuba',
    dialCode: '53',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'cy',
    country: 'Cyprus (Κύπρος)',
    dialCode: '357',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'cz',
    country: 'Czech Republic (Česká republika)',
    dialCode: '420',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'dk',
    country: 'Denmark (Danmark)',
    dialCode: '45',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'dj',
    country: 'Djibouti',
    dialCode: '253',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'dm',
    country: 'Dominica',
    dialCode: '1767',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'do',
    country: 'Dominican Republic (República Dominicana)',
    dialCode: '1',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'tl',
    country: 'East Timor (Timor-Leste)',
    dialCode: '670',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'ec',
    country: 'Ecuador',
    dialCode: '593',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'eg',
    country: 'Egypt (مصر‬‎)',
    dialCode: '20',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'sv',
    country: 'El Salvador',
    dialCode: '503',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'gq',
    country: 'Equatorial Guinea (Guinea Ecuatorial)',
    dialCode: '240',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'er',
    country: 'Eritrea',
    dialCode: '291',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'ee',
    country: 'Estonia (Eesti)',
    dialCode: '372',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'et',
    country: 'Ethiopia',
    dialCode: '251',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'fk',
    country: 'Falkland Islands (Islas Malvinas)',
    dialCode: '500',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'fo',
    country: 'Faroe Islands (Føroyar)',
    dialCode: '298',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'fj',
    country: 'Fiji',
    dialCode: '679',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'fi',
    country: 'Finland (Suomi)',
    dialCode: '358',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'fr',
    country: 'France',
    dialCode: '33',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'gf',
    country: 'French Guiana (Guyane française)',
    dialCode: '594',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'pf',
    country: 'French Polynesia (Polynésie française)',
    dialCode: '689',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'ga',
    country: 'Gabon',
    dialCode: '241',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'gm',
    country: 'Gambia',
    dialCode: '220',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'ge',
    country: 'Georgia (საქართველო)',
    dialCode: '995',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'de',
    country: 'Germany (Deutschland)',
    dialCode: '49',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'gh',
    country: 'Ghana (Gaana)',
    dialCode: '233',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'gi',
    country: 'Gibraltar',
    dialCode: '350',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'gr',
    country: 'Greece (Ελλάδα)',
    dialCode: '30',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'gl',
    country: 'Greenland (Kalaallit Nunaat)',
    dialCode: '299',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'gd',
    country: 'Grenada',
    dialCode: '1473',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'gp',
    country: 'Guadeloupe',
    dialCode: '590',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'gu',
    country: 'Guam',
    dialCode: '1671',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'gt',
    country: 'Guatemala',
    dialCode: '502',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'gn',
    country: 'Guinea (Guinée)',
    dialCode: '224',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'gw',
    country: 'Guinea-Bissau (Guiné Bissau)',
    dialCode: '245',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'gy',
    country: 'Guyana',
    dialCode: '592',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'ht',
    country: 'Haiti',
    dialCode: '509',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'hn',
    country: 'Honduras',
    dialCode: '504',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'hk',
    country: 'Hong Kong (香港)',
    dialCode: '852',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'hu',
    country: 'Hungary (Magyarország)',
    dialCode: '36',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'is',
    country: 'Iceland (Ísland)',
    dialCode: '354',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'in',
    country: 'India (भारत)',
    dialCode: '91',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'id',
    country: 'Indonesia',
    dialCode: '62',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'ir',
    country: 'Iran (ایران‬‎)',
    dialCode: '98',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'iq',
    country: 'Iraq (العراق‬‎)',
    dialCode: '964',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'ie',
    country: 'Ireland',
    dialCode: '353',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'il',
    country: 'Israel (ישראל‬‎&#x202C;&lrml)',
    dialCode: '972',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'it',
    country: 'Italy (Italia)',
    dialCode: '39',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'jm',
    country: 'Jamaica',
    dialCode: '1876',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'jp',
    country: 'Japan (日本)',
    dialCode: '81',
    language: 'Japanese',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'jo',
    country: 'Jordan (الأردن‬‎)',
    dialCode: '962',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'kz',
    country: 'Kazakhstan (Казахстан)',
    dialCode: '7',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'ke',
    country: 'Kenya',
    dialCode: '254',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'ki',
    country: 'Kiribati',
    dialCode: '686',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'kw',
    country: 'Kuwait (الكويت‬‎‬‎)',
    dialCode: '965',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'kg',
    country: 'Kyrgyzstan (Кыргызстан)',
    dialCode: '996',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'la',
    country: 'Laos PDR (ລາວ)',
    dialCode: '856',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'lv',
    country: 'Latvia (Latvija)',
    dialCode: '371',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'lb',
    country: 'Lebanon (لبنان‬‎)',
    dialCode: '961',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'ls',
    country: 'Lesotho',
    dialCode: '266',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'lr',
    country: 'Liberia',
    dialCode: '231',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'ly',
    country: 'Libya (ليبيا‬‎)',
    dialCode: '218',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'li',
    country: 'Liechtenstein',
    dialCode: '423',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'lt',
    country: 'Lithuania (Lietuva)',
    dialCode: '370',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'lu',
    country: 'Luxembourg',
    dialCode: '352',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'mo',
    country: 'Macau (澳門)',
    dialCode: '853',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'mk',
    country: 'Macedonia (FYROM) (Македонија)',
    dialCode: '389',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'mg',
    country: 'Madagascar (Madagasikara)',
    dialCode: '261',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'mw',
    country: 'Malawi',
    dialCode: '265',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'my',
    country: 'Malaysia',
    dialCode: '60',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'mv',
    country: 'Maldives',
    dialCode: '960',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'ml',
    country: 'Mali',
    dialCode: '223',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'mt',
    country: 'Malta',
    dialCode: '356',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'mh',
    country: 'Marshall Islands',
    dialCode: '692',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'mq',
    country: 'Martinique',
    dialCode: '596',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'mr',
    country: 'Mauritania (موريتانيا‬‎)',
    dialCode: '222',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'mu',
    country: 'Mauritius (Moris)',
    dialCode: '230',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'mx',
    country: 'Mexico (México)',
    dialCode: '52',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'fm',
    country: 'Micronesia',
    dialCode: '691',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'md',
    country: 'Moldova (Republica Moldova)',
    dialCode: '373',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'mc',
    country: 'Monaco',
    dialCode: '377',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'mn',
    country: 'Mongolia (Монгол)',
    dialCode: '976',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'me',
    country: 'Montenegro (Crna Gora)',
    dialCode: '382',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'ms',
    country: 'Montserrat',
    dialCode: '1664',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'ma',
    country: 'Morocco (المغرب‬‎)',
    dialCode: '212',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'mz',
    country: 'Mozambique (Moçambique)',
    dialCode: '258',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'mm',
    country: 'Myanmar (Burma) (မြန်မာ)',
    dialCode: '95',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'na',
    country: 'Namibia (Namibië)',
    dialCode: '264',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'np',
    country: 'Nepal (नेपाल)',
    dialCode: '977',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'nl',
    country: 'Netherlands (Nederland)',
    dialCode: '31',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'nc',
    country: 'New Caledonia (Nouvelle-Calédonie)',
    dialCode: '687',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'nz',
    country: 'New Zealand',
    dialCode: '64',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'ni',
    country: 'Nicaragua',
    dialCode: '505',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'ne',
    country: 'Niger (Nijar)',
    dialCode: '227',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'ng',
    country: 'Nigeria',
    dialCode: '234',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'nu',
    country: 'Niue',
    dialCode: '683',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'nf',
    country: 'Norfolk Island',
    dialCode: '672',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'no',
    country: 'Norway (Norge)',
    dialCode: '47',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'om',
    country: 'Oman (عُمان‬‎)',
    dialCode: '968',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'pk',
    country: 'Pakistan (پاکستان‬‎)',
    dialCode: '92',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'pw',
    country: 'Palau',
    dialCode: '680',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'ps',
    country: 'Palestine (Palestinian Territory) (فلسطين‬‎)',
    dialCode: '970',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'pa',
    country: 'Panama (Panamá)',
    dialCode: '507',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'pg',
    country: 'Papua New Guinea',
    dialCode: '675',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'py',
    country: 'Paraguay',
    dialCode: '595',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'pe',
    country: 'Peru (Perú)',
    dialCode: '51',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'ph',
    country: 'Philippines',
    dialCode: '63',
    language: 'Filipino',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'pl',
    country: 'Poland (Polska)',
    dialCode: '48',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'pt',
    country: 'Portugal',
    dialCode: '351',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'pr',
    country: 'Puerto Rico',
    dialCode: '1',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'qa',
    country: 'Qatar (قطر‬‎)',
    dialCode: '974',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 're',
    country: 'Reunion/Mayotte',
    dialCode: '262',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'ro',
    country: 'Romania (România)',
    dialCode: '40',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'ru',
    country: 'Russia (Россия)',
    dialCode: '7',
    language: 'Russian',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'rw',
    country: 'Rwanda',
    dialCode: '250',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'ws',
    country: 'Samoa',
    dialCode: '685',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'sm',
    country: 'San Marino',
    dialCode: '378',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'st',
    country: 'Sao Tome and Principe (São Tomé and Príncipe) (São Tomé e Príncipe)',
    dialCode: '239',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'sa',
    country: 'Saudi Arabia (‫المملكة العربية السعودية‬‎)',
    dialCode: '966',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'sn',
    country: 'Senegal (Sénégal)',
    dialCode: '221',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'rs',
    country: 'Serbia (Србија)',
    dialCode: '381',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'sc',
    country: 'Seychelles',
    dialCode: '248',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'sl',
    country: 'Sierra Leone',
    dialCode: '232',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'sg',
    country: 'Singapore',
    dialCode: '65',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'sk',
    country: 'Slovakia (Slovensko)',
    dialCode: '421',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'sb',
    country: 'Solomon Islands',
    dialCode: '677',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'so',
    country: 'Somalia (Soomaaliya)',
    dialCode: '252',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'za',
    country: 'South Africa',
    dialCode: '27',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'kr',
    country: 'Republic Of Korea (대한민국) (South Korea)',
    dialCode: '82',
    language: 'Korean',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'es',
    country: 'Spain (España)',
    dialCode: '34',
    language: 'Spanish',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'lk',
    country: 'Sri Lanka (ශ්‍රී ලංකාව)',
    dialCode: '94',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'kn',
    country: 'St Kitts and Nevis (Saint Kitts and Nevis)',
    dialCode: '1869',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'lc',
    country: 'St Lucia (Saint Lucia)',
    dialCode: '1758',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'pm',
    country: 'St Pierre and Miquelon (St Pierre and Miquelon) (Saint-Pierre-et-Miquelon)',
    dialCode: '508',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'vc',
    country: 'St Vincent Grenadines (Saint Vincent and the Grenadines)',
    dialCode: '1784',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'sd',
    country: 'Sudan (السودان‬‎)',
    dialCode: '249',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'sr',
    country: 'Suriname',
    dialCode: '597',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'sz',
    country: 'Swaziland',
    dialCode: '268',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'se',
    country: 'Sweden (Sverige)',
    dialCode: '46',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'ch',
    country: 'Switzerland (Schweiz)',
    dialCode: '41',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'sy',
    country: 'Syria (سوريا‬‎)',
    dialCode: '963',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'tw',
    country: 'Taiwan (台灣)',
    dialCode: '886',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'tj',
    country: 'Tajikistan',
    dialCode: '992',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'tz',
    country: 'Tanzania',
    dialCode: '255',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'th',
    country: 'Thailand (ไทย)',
    dialCode: '66',
    language: 'Thailand',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'tg',
    country: 'Togo',
    dialCode: '228',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'to',
    country: 'Tonga',
    dialCode: '676',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'tt',
    country: 'Trinidad and Tobago',
    dialCode: '1868',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'tn',
    country: 'Tunisia (تونس‬‎)',
    dialCode: '216',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'tr',
    country: 'Turkey (Türkiye)',
    dialCode: '90',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'tm',
    country: 'Turkmenistan',
    dialCode: '993',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'tc',
    country: 'Turks and Caicos Islands',
    dialCode: '1649',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'tv',
    country: 'Tuvalu',
    dialCode: '688',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'ug',
    country: 'Uganda',
    dialCode: '256',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'ua',
    country: 'Ukraine (Україна)',
    dialCode: '380',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'ae',
    country: 'United Arab Emirates (‫الإمارات العربية المتحدة‬‎)',
    dialCode: '971',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'gb',
    country: 'United Kingdom',
    dialCode: '44',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'us',
    country: 'United States',
    dialCode: '1',
    language: 'English',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'uy',
    country: 'Uruguay',
    dialCode: '598',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'uz',
    country: 'Uzbekistan (Oʻzbekiston)',
    dialCode: '998',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'vu',
    country: 'Vanuatu',
    dialCode: '678',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 've',
    country: 'Venezuela',
    dialCode: '58',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'vn',
    country: 'Vietnam (Việt Nam)',
    dialCode: '84',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'vg',
    country: 'Virgin Islands, British',
    dialCode: '1284',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'vi',
    country: 'Virgin Islands, U.S.',
    dialCode: '1340',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'wf',
    country: 'Wallis and Futuna (Wallis-et-Futuna)',
    dialCode: '681',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'ye',
    country: 'Yemen (اليمن‬‎)',
    dialCode: '967',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'zm',
    country: 'Zambia',
    dialCode: '260',
    checked: false,
    search: false,
  },
  {
    alpha2Code: 'zw',
    country: 'Zimbabwe',
    dialCode: '263',
    checked: false,
    search: false,
  },
];

export const matchingCoinImg = (coin) => {
  if (coin !== '' && coin !== null) {
    const filterData = store.state['sign'].partnerWallets.filter((data) => {
      return data.symbol === coin;
    });
    return filterData[0].img;
  }
};
export const matchingCoinImg2 = (coin) => {
  if (coin !== '' && coin !== null) {
    const filterData = store.state['sign'].coinList.filter((data) => {
      return data.label === coin;
    });
    return filterData[0].img;
  }
};
export const matchingCoinImgByCd = (coin_Cd) => {
  if (coin_Cd !== '' && coin_Cd !== null) {
    const filterData = store.state['sign'].coinList.filter((data) => {
      return data.coin_Cd === coin_Cd;
    });
    return filterData[0]?.img ? filterData[0].img : '';
  }
};
export const matchingCoinLabel = (coin) => {
  if (coin !== '' && coin !== null) {
    const filterData = store.state['sign'].coinList.filter((data) => {
      return data.coin_Cd === coin;
    });
    return filterData[0]?.label ? filterData[0]?.label : '';
  }
};
export const matchingCurrencySymbol = (currencyType) => {
  if (currencyType !== '' && currencyType !== null) {
    const currencySymbol = currencyList.value.filter((data) => {
      return data.value === currencyType;
    });
    return currencySymbol[0]?.symbol ? currencySymbol[0]?.symbol : '';
  }
};
export const matchingCurrencyType = (currencyValue) => {
  if (currencyValue !== '' && currencyValue !== null) {
    const currencyType = currencyList.value.filter((data) => {
      return data.value === currencyValue;
    });
    return currencyType[0]?.type ? currencyType[0]?.type : '';
  }
};
export const deepCopy = (object) => {
  if (object === null || typeof object !== 'object') {
    return object;
  }
  const copy = Array.isArray(object) ? [] : {};

  for (let key of Object.keys(object)) {
    copy[key] = deepCopy(object[key]);
  }

  return copy;
};
export const storageSetItem = (setList, setData) => {
  sessionStorage.setItem(setList, JSON.stringify(setData));
};
export const storageSetItems = (setList, setData) => {
  for (let i = 0; i < setList.length; i++) {
    sessionStorage.setItem(setList[i], JSON.stringify(setData[i]));
  }
};
export const storageGetItem = (getList) => {
  return JSON.parse(sessionStorage.getItem(getList));
};
export const storageGetItems = (getList) => {
  return JSON.parse(sessionStorage.getItem(getList));
};
export const getUserStateType = (t, value) => {
  const state = [
    { value: Enum.userStateType.Request, label: () => t('common.text.request'), color: 'default', checked: false },
    {
      value: Enum.userStateType.ApprovalProgress,
      label: () => t('common.text.approval_progress'),
      color: 'processing',
      checked: false,
    },
    { value: Enum.userStateType.Refusal, label: () => t('common.text.refusal'), color: 'error', checked: false },
    {
      value: Enum.userStateType.ConfirmDeposit,
      label: () => t('common.text.confirm_deposit'),
      color: 'warning',
      checked: false,
    },
    { value: Enum.userStateType.Approval, label: () => t('common.text.approval'), color: 'success', checked: false },
  ];
  if (value === undefined) {
    return state;
  } else {
    return state.filter((e) => e.value === value)[0];
  }
};
export const getDepositStateType = (t, value) => {
  const state = [
    {
      value: Enum.depositStateType.Request,
      label: () => t('search.label.request'),
      color: 'default',
      checked: false,
    },
    {
      value: Enum.depositStateType.CancelledUser,
      label: () => t('search.label.cancelled_user'),
      color: 'error',
      checked: false,
    },
    {
      value: Enum.depositStateType.Completed,
      label: () => t('search.label.completed'),
      color: 'success',
      checked: false,
    },
    {
      value: Enum.depositStateType.CancelledStore,
      label: () => t('search.label.cancelled_store'),
      color: 'error',
      checked: false,
    },
  ];

  if (value === undefined) {
    return state;
  } else {
    return state.filter((e) => e.value === value)[0];
  }
};
export const getDisputeStateType = (t, value) => {
  const state = [
    { value: Enum.disputeStateType.Request, label: () => t('search.label.request'), checked: false },
    { value: Enum.disputeStateType.Ongoing, label: () => t('search.label.ongoing'), checked: false },
  ];

  if (value === undefined) {
    return state;
  } else {
    return state.filter((e) => e.value === value)[0];
  }
};
export const getWalletUserType = (t, value) => {
  const state = [
    { value: Enum.walletUserType.wallet, label: () => t('datatable.text.normal_member'), checked: false },
    // { value: Enum.walletUserType.tvp, label: () => t('common.text.tvp'), checked: false },
    { value: Enum.walletUserType.personal, label: () => t('datatable.text.partner_personal'), checked: false },
    { value: Enum.walletUserType.enterprise, label: () => t('datatable.text.partner_enterprise'), checked: false },
  ];

  if (value === undefined) {
    return state;
  } else {
    return state.filter((e) => e.value === value)[0];
  }
};
export const getWalletDealType = (t, value) => {
  const state = [
    { value: Enum.walletDealType.deposit, label: () => t('search.select.deposit'), checked: false },
    { value: Enum.walletDealType.withdraw, label: () => t('datatable.text.withdrawal'), checked: false },
    { value: Enum.walletDealType.swap, label: () => t('datatable.text.swap'), checked: false },
  ];

  if (value === undefined) {
    return state;
  } else {
    return state.filter((e) => e.value === value)[0];
  }
};
export const getWalletTxIdType = (t, value) => {
  const state = [
    {
      request: [Enum.walletTxIdType.internalTransaction],
      value: Enum.walletTxIdType.internalTransaction,
      label: () => t('datatable.text.internal_transaction'),
      checked: false,
    },
    {
      request: [Enum.walletTxIdType.externalTransaction],
      value: Enum.walletTxIdType.externalTransaction,
      label: () => t('datatable.text.external_transaction'),
      checked: false,
    },
    {
      request: [Enum.walletTxIdType.safeTransaction],
      value: Enum.walletTxIdType.safeTransaction,
      label: () => t('datatable.text.safe_transaction'),
      checked: false,
    },

    {
      request: [Enum.walletTxIdType.investmentDeposit, Enum.walletTxIdType.investmentWithdrawal],
      value: Enum.walletTxIdType.investmentDeposit,
      label: () => t('datatable.text.tvp_game'),
      checked: false,
    },
    {
      request: [Enum.walletTxIdType.paymentDeposit],
      value: Enum.walletTxIdType.paymentDeposit,
      label: () => t('datatable.text.payment_deposit'),
      checked: false,
    },
    {
      request: [Enum.walletTxIdType.paymentWithdrawal],
      value: Enum.walletTxIdType.paymentWithdrawal,
      label: () => t('datatable.text.payment_withdrawal'),
      checked: false,
    },
    {
      request: [Enum.walletTxIdType.purchaseDeposit],
      value: Enum.walletTxIdType.purchaseDeposit,
      label: () => t('datatable.text.purchase_deposit'),
      checked: false,
    },
    {
      request: [Enum.walletTxIdType.purchaseWithdrawal],
      value: Enum.walletTxIdType.purchaseWithdrawal,
      label: () => t('datatable.text.purchase_withdrawal'),
      checked: false,
    },
    {
      request: [Enum.walletTxIdType.donation],
      value: Enum.walletTxIdType.donation,
      label: () => t('datatable.text.donation'),
      checked: false,
    },
  ];

  if (value === undefined) {
    return state;
  } else {
    return state.filter((e) => e.request.includes(value))[0];
  }
};
export const getWalletTransactionState = (t, val) => {
  const state = [
    {
      request: [Enum.defaultWalletState.transactionComplete, Enum.defaultWalletState.safeAccountStop],
      label: () => t('datatable.text.completed'),
      checked: false,
      value: 2,
      color: 'success',
    },
    {
      request: [
        Enum.defaultWalletState.firstApprovalWait,
        Enum.defaultWalletState.secondApprovalWait,
        Enum.defaultWalletState.transactionWait,
        Enum.defaultWalletState.safeProceeding,
        Enum.defaultWalletState.safeStop,
        Enum.defaultWalletState.safeDeclare,
      ],
      label: () => t('datatable.text.ongoing'),
      checked: false,
      value: 1,
      color: 'default',
    },
    {
      request: [
        Enum.defaultWalletState.transactionFail,
        Enum.defaultWalletState.firstApprovalRefuse,
        Enum.defaultWalletState.secondApprovalRefuse,
        Enum.defaultWalletState.safeStopApproval,
      ],
      label: () => t('common.button.cancel'),
      checked: false,
      value: 3,
      color: 'error',
    },
  ];

  if (val === undefined) {
    return state;
  } else {
    return state.filter((e) => e.request.includes(val) === true)[0];
  }
};
export const getDefaultWalletState = (t, val) => {
  const state = [
    {
      value: Enum.defaultWalletState.firstApprovalWait,
      label: () => t('datatable.text.waiting_1st_approval'),
      checked: false,
    },
    {
      value: Enum.defaultWalletState.secondApprovalWait,
      label: () => t('datatable.text.waiting_2nd_approval'),
      checked: false,
    },
    {
      value: Enum.defaultWalletState.transactionWait,
      label: () => t('datatable.text.waiting_transmission'),
      checked: false,
    },
    {
      value: Enum.defaultWalletState.transactionComplete,
      label: () => t('datatable.text.completed'),
      checked: false,
    },
    {
      value: Enum.defaultWalletState.transactionFail,
      label: () => t('datatable.text.failed'),
      checked: false,
    },
    {
      value: Enum.defaultWalletState.firstApprovalRefuse,
      label: () => t('datatable.text.1st_refusal'),
      checked: false,
    },
    {
      value: Enum.defaultWalletState.secondApprovalRefuse,
      label: () => t('datatable.text.final_refusal'),
      checked: false,
    },
    {
      value: Enum.defaultWalletState.safeProceeding,
      label: () => t('datatable.text.safe_transaction_processing'),
      checked: false,
    },
    {
      value: Enum.defaultWalletState.safeStop,
      label: () => t('datatable.text.stop'),
      checked: false,
    },
    {
      value: Enum.defaultWalletState.safeDeclare,
      label: () => t('datatable.text.declaration'),
      checked: false,
    },
    {
      value: Enum.defaultWalletState.safeStopApproval,
      label: () => t('datatable.text.discontinuance_approval'),
      checked: false,
    },
    {
      value: Enum.defaultWalletState.safeAccountStop,
      label: () => t('datatable.text.account_abort'),
      checked: false,
    },
  ];

  if (val === undefined) {
    return state;
  } else {
    return state.filter((e) => e.value === val)[0];
  }
};
export const getKycApprovalType = (t, value) => {
  const state = [
    { value: Enum.kycApprovalType.finalRefusal, label: () => t('datatable.text.final_refusal') },
    { value: Enum.kycApprovalType.refusal, label: () => t('datatable.text.1st_refusal') },
    { value: Enum.kycApprovalType.request, label: () => t('datatable.text.request') },
    { value: Enum.kycApprovalType.approval, label: () => t('datatable.text.1st_approval') },
    { value: Enum.kycApprovalType.finalApproval, label: () => t('datatable.text.final_approval') },
  ];
  if (value === undefined) {
    return state;
  } else {
    return state.filter((e) => e.value === value)[0];
  }
};
export const getKycStep = (t, kycStep) => {
  const state = [
    { value: Enum.kycStepType.firstStep, label: () => t('datatable.text.step_1st') },
    { value: Enum.kycStepType.secondStep, label: () => t('datatable.text.step_2nd') },
  ];

  if (kycStep === undefined) {
    return state;
  } else {
    return state.filter((e) => e.value === kycStep)[0];
  }
};
export const getAccountStatusInWallet = (t, value) => {
  const state = [
    {
      value: Enum.accountStatus.active,
      label: () => t('datatable.text.normal'),
      color: 'success',
    },
    { value: Enum.accountStatus.deleted, label: () => t('datatable.text.delete_member'), color: 'error' },
  ];

  if (value === undefined) {
    return [
      Enum.accountStatus.active,
      Enum.accountStatus.inactive,
      Enum.accountStatus.suspended,
      Enum.accountStatus.dispute,
      Enum.accountStatus.deleted,
    ];
  } else {
    if (value !== 40) {
      return state[0];
    } else {
      return state[1];
    }
  }
};
export const getPartnerType = (t, value) => {
  const state = [
    { value: Enum.partnerType.enterprise, label: () => t('datatable.text.partner_enterprise'), checked: false },
    { value: Enum.partnerType.personal, label: () => t('datatable.text.partner_personal'), checked: false },
  ];
  if (value === undefined) {
    return state;
  } else {
    return state.filter((e) => e.value === Number(value))[0];
  }
};
export const getPartnerWithdrawStateType = (t, value) => {
  const state = [
    { value: Enum.defaultWalletState.transactionWait, label: () => t('search.label.request'), checked: false },
    { value: Enum.defaultWalletState.transactionComplete, label: () => t('search.label.approval'), checked: false },
    { value: Enum.defaultWalletState.transactionFail, label: () => t('search.label.refusal'), checked: false },
  ];
  if (value === undefined) {
    return state;
  } else {
    return state.filter((e) => e.value === value)[0];
  }
};

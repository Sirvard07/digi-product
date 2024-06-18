import React from 'react';
import { FiUsers, FiCreditCard, FiUserPlus, FiInbox } from 'react-icons/fi';
import { BsCurrencyDollar, BsShield } from 'react-icons/bs';
import { RiDashboardLine } from 'react-icons/ri';
import { BiListPlus, BiPurchaseTag } from 'react-icons/bi';
import { BsListUl } from 'react-icons/bs';
import { MdOutlineCampaign, MdOutlineAnalytics, MdSettings, MdList, MdManageAccounts, MdWeb, MdDomain, MdEmail, MdAddLink, MdMoney, MdAddBox, MdAddShoppingCart, MdSchedule, MdReport, MdContactPage, MdGroup } from 'react-icons/md';
import { VscSymbolKeyword } from 'react-icons/vsc';
import avatar2 from './avatar2.jpg';
import avatar from './avatar2.jpg';
import { AiFillPhone } from 'react-icons/ai';

export const sidebarLinks = [
  {
    title: 'Dashboard',
    links: [
      {
        name: 'dashboard',
        icon: <RiDashboardLine />,
      },
    ],
  },
  {
    title: 'Pre-Warm Up',
    links: [
      {
        name: 'pre-warm-up-c-panel-accounts',
        icon: <MdManageAccounts />,
      },
      {
        name: 'pre-warm-up-domains',
        icon: <MdDomain />,
      },
      {
        name: 'pre-warm-up-email-accounts',
        icon: <MdEmail />,
      },
      {
        name: 'pre-warm-up-email-account-names-list',
        icon: <MdList />,
      },
      {
        name: 'pre-warm-up-default-settings',
        icon: <MdSettings />,
      }
    ],
  },
  {
    title: 'Warm Up',
    links: [
      {
        name: 'warmup-warm-up-schedule',
        icon: <MdSchedule />,
      },
      {
        name: 'warmup-domains',
        icon: <MdDomain />,
      },
      {
        name: 'warmup-reports',
        icon: <MdReport />,
      },
      {
        name: 'warmup-default-settings',
        icon: <MdSettings />,
      },
    ],
  },
  {
    title: 'Production',
    links: [
      {
        name: 'Offers',
        icon: <VscSymbolKeyword />,
      },
      {
        name: 'production-contacts',
        icon: <MdContactPage />
      },
      {
        name: 'production-email-copy',
        icon: <MdContactPage />
      },
      {
        name: 'production-groups',
        icon: <MdGroup />
      }
    ],
  }
];


export const chatData = [
  {
    image: avatar2,
    message: 'Welcome to our new SMS System!',
    desc: '...',
    time: '9:08 AM',
  },
];

export const modalInitialStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export const helperTextsForInputs = {
  "phoneNumberError": "Phone number must be in +12125551212 format",
  "newContactNameError": "New Contact Name must not be empty",
  "newKeywordNameError": "New Keyword Name must not be empty",
  "newListNameError": "New List Name must not be empty",
  "contactName" : "Client Name must not be empty.",
  "contactEmail" : "Please enter a valid email.",
  "companyName": "Company Name must not be empty.",
  "userName" : "User Name must not be empty.",
  "userEmail" : "Please enter a valid email.",
  "userPassword": "Please enter a password (min 8 Characters, 1 Special Character, 1 Uppercase and 1 Lowercase)",
  "newUserPassword": "Please enter a password (min 8 Characters, 1 Special Character, 1 Uppercase and 1 Lowercase)",
  "newClientCompanyName":"Company Name must not be empty.",
  "newClientContactName":"Contact Name must not be empty.",
  "newClientConfigurationOngageUsername": "Ongage Username must not be empty.",
  "newClientConfigurationOngagePassword": "Ongage Password must not be empty.",
  "newClientConfigurationOngageAccountCode": "Ongage Account Code must not be empty.",
  "newClientConfigurationClickMeterAPIKey": "ClickMeter API Key must not be empty.",
  "newClientConfigurationZeroBounceAPIKey": "ZeroBounce API Key must not be empty.",
  "newClientConfigurationKickBoxAPIKey": "KickBox API Key must not be empty.",
  "newClientConfigurationIP2LocationAPIKey": "IP2Location API Key must not be empty.",
  "newClientConfigurationWasabiAPIKey": "Wasabi API Key must not be empty.",
  "articleFeedTitle": "Article Feed Title must not be empty.",
  "articleFeedURL": "Article Feed URL must not be empty.",
  "articleFeedCategoryName": "Article Feed Category Name must not be empty.",
  "ongageListName": "Ongage List Name must not be empty.",
  "ongageListID": "Ongage List ID must not be empty."
}
export const themeColorsUsable = {
  "red":'#FF5C8E',
  "green": "#1cab1c"
}
export const themeColors = [
  {
    name: 'blue-theme',
    color: '#1A97F5',
  },
  {
    name: 'green-theme',
    color: '#03C9D7',
  },
  {
    name: 'purple-theme',
    color: '#7352FF',
  },
  {
    name: 'red-theme',
    color: '#FF5C8E',
  },
  {
    name: 'indigo-theme',
    color: '#1E4DB7',
  },
  {
    color: '#FB9678',
    name: 'orange-theme',
  },
];

export const userProfileData = [
  {
    icon: <BsCurrencyDollar />,
    title: 'My Profile',
    desc: 'Account Settings',
    iconColor: '#03C9D7',
    iconBg: '#E5FAFB',
  },
  {
    icon: <BsShield />,
    title: 'My Inbox',
    desc: 'Messages & Emails',
    iconColor: 'rgb(0, 194, 146)',
    iconBg: 'rgb(235, 250, 242)',
  },
  {
    icon: <FiCreditCard />,
    title: 'My Tasks',
    desc: 'To-do and Daily Tasks',
    iconColor: 'rgb(255, 244, 229)',
    iconBg: 'rgb(254, 201, 15)',
  },
];

export const formatDate = (dateString) => {
  if (dateString){
    let currentDate = new Date(dateString);
    let str = currentDate.getUTCFullYear() + "-" + (currentDate.getUTCMonth() + 1) + "-" + currentDate.getUTCDate() + " / " + currentDate.getUTCHours() + ":" + currentDate.getUTCMinutes() + "h";
    return str;
  }
  return "NO DATE YET";
}

export const validatePhoneForE164 = (phoneNumber) => {
  const regEx = /^\+[1-9]\d{10,14}$/;

  return regEx.test(phoneNumber);
};

export const changeTimezone = (date) => {
  let ianatz = "America/Toronto";
  date = new Date(date);
  // suppose the date is 12:00 UTC
  var invdate = new Date(date.toLocaleString('en-US', {
    timeZone: ianatz
  }));

  // then invdate will be 07:00 in Toronto
  // and the diff is 5 hours
  var diff = date.getTime() - invdate.getTime();

  // so 12:00 in Toronto is 17:00 UTC
  return new Date(date.getTime() - diff); // needs to substract

}

export const userRoles = {
  0: "Unauthorized",
  1: "Admin",
  2: "Scheduler",
  3: "Viewer"
}


export const preWarmUpSteps = [
  { key: 'isPurchased', label: 'Purchase Domain' },
  { key: 'isDNSNameserversComplete', label: 'Point Namecheap DNS to custom Nameservers' },
  { key: 'isConnectedToCPanel', label: 'Connect to cPanel' },
  { key: 'hasWebsite', label: 'Setup Website' },
  { key: 'emailAccountsCreated', label: 'Create Email Accounts' },
  { key: 'isConnectedToMTA', label: 'Connect to MTA' },
  { key: 'isMTAApiKeySet', label: 'Upload MTA API Key' },
  { key: 'isDKIMComplete', label: 'Upload DKIM record'},
  { key: 'isSendingIpAddressComplete', label: 'Upload Domain Sending IP Address'},
  { key: 'isDNSComplete', label: 'Complete DNS Setup' },
  { key: 'isConnectedToInstantly', label: 'Connect to Instantly' },
];
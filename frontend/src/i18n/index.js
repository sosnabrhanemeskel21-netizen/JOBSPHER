// i18n configuration scaffold
// For full implementation, install react-i18next: npm install react-i18next i18next

export const translations = {
  en: {
    common: {
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      save: 'Save',
      cancel: 'Cancel',
      submit: 'Submit',
      loading: 'Loading...',
    },
    auth: {
      email: 'Email',
      password: 'Password',
      firstName: 'First Name',
      lastName: 'Last Name',
      loginTitle: 'Login to Jobspher',
      registerTitle: 'Create an Account',
    },
    jobs: {
      title: 'Find Your Dream Job',
      searchPlaceholder: 'Search jobs...',
      location: 'Location',
      category: 'Category',
      salary: 'Salary',
      apply: 'Apply Now',
      viewDetails: 'View Details',
    },
  },
  am: {
    common: {
      login: 'ግባ',
      register: 'ተመዝግብ',
      logout: 'ውጣ',
      save: 'አስቀምጥ',
      cancel: 'ተወው',
      submit: 'ላክ',
      loading: 'በመጫን ላይ...',
    },
    auth: {
      email: 'ኢሜይል',
      password: 'የይለፍ ቃል',
      firstName: 'የመጀመሪያ ስም',
      lastName: 'የአያት ስም',
      loginTitle: 'ወደ Jobspher ግባ',
      registerTitle: 'መለያ ፍጠር',
    },
    jobs: {
      title: 'የምትፈልገውን ስራ ፈልግ',
      searchPlaceholder: 'ስራዎችን ፈልግ...',
      location: 'አካባቢ',
      category: 'ምድብ',
      salary: 'ደመወዝ',
      apply: 'አሁን ማመልከት',
      viewDetails: 'ዝርዝሮችን ይመልከቱ',
    },
  },
};

export const getTranslation = (lang = 'en', key) => {
  const keys = key.split('.');
  let value = translations[lang];
  for (const k of keys) {
    value = value?.[k];
  }
  return value || key;
};


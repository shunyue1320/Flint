import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import detector from "i18next-browser-languagedetector";
import en from "flint-i18n/locales/en.json";
import zhCN from "flint-i18n/locales/zh-CN.json";
import varsCNen from "flint-i18n/vars/cn/en.json";

const resources = {
  en: {
    translation: en,
  },
  "zh-CN": {
    translation: zhCN,
  },
};

i18n
  .use(detector) // 浏览器语言检测器
  .use(initReactI18next) // 将i18n向下传递到react-i18next
  .init({
    resources,
    fallbackLng: "en", // 如果检测到的lng不可用，则使用en
    interpolation: {
      escapeValue: false, // react already safes from xss
      defaultVariables: varsCNen,
    },
  });

export default i18n;

export const languages = ["en", "zh-CN"];

export const languagesWithName = [
  { lang: "en", name: "English" },
  { lang: "zh-CN", name: "简体中文" },
];

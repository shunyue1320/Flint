import i18next, { Resource } from "i18next";
import languageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import en from "flint-i18n/locales/en.json";
import zhCN from "flint-i18n/locales/zh-CN.json";
import varsCNen from "flint-i18n/vars/cn/en.json";
import varsCNzhCN from "flint-i18n/vars/cn/zh-CN.json";
import varsUSen from "flint-i18n/vars/us/en.json";
import varsUSzhCN from "flint-i18n/vars/us/zh-CN.json";

const resources: Resource = {
  en: { translation: en },
  "zh-CN": { translation: zhCN },
};

const defaultVars: Record<string, Record<string, string>> = process.env.FLAT_REGION === "US"
  ? { en: varsUSen, "zh-CN": varsUSzhCN }
  : { en: varsCNen, "zh-CN": varsCNzhCN };

void i18next
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "zh-CN",
    supportedLngs: ["zh-CN", "en"],
    interpolation: {
      escapeValue: false, // react already safes from xss
      defaultVariables: defaultVars[i18next.language] || defaultVars.en,
    },
  });

export const i18n = i18next;
export const languages = ["en", "zh-CN"] as const;

const changeLang = (lang: string): void => {
  document.querySelector("html")?.setAttribute("lang", lang);

  const defaultVariables = defaultVars[lang] || defaultVars.en;
  if (i18next.options.interpolation) {
    i18next.options.interpolation.defaultVariables = defaultVariables;
  } else {
    i18next.options.interpolation = { defaultVariables };
  }
};

changeLang(i18next.language);
i18next.on("languageChanged", changeLang);

import i18next, { type Resource, type i18n as Ii18n } from "i18next";
import { ReadonlyVal, Val } from "value-enhancer";
import languageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { SideEffectManager } from "side-effect-manager";

import en from "../locales/en.json";
import zhCN from "../locales/zh-CN.json";

import varsCNen from "../vars/cn/en.json";
import varsCNzhCN from "../vars/cn/zh-CN.json";
import varsUSen from "../vars/us/en.json";
import varsUSzhCN from "../vars/us/zh-CN.json";

declare global {
  interface Window {
    __FlintI18n?: FlintI18n;
  }
}

export type FlintI18nTFunction = (
  key: string,
  options?: Record<string, string | number | undefined>,
) => string;

export type FlintI18nLanguages = typeof FlintI18n.languages[number];

export class FlintI18n {
  public static t: FlintI18nTFunction = (key, options) =>
    FlintI18n.getInstance().i18n.t(key, options);

  public static changeLanguage = async (lang: FlintI18nLanguages): Promise<void> => {
    await FlintI18n.getInstance().i18n.changeLanguage(lang);
  };

  public static readonly languages = ["en", "zh-CN"] as const;

  // 单例模式
  public static getInstance(): FlintI18n {
    return (window.__FlintI18n ||= new FlintI18n());
  }

  public readonly $Val: {
    readonly isReady$: ReadonlyVal<boolean>;
    readonly language$: ReadonlyVal<FlintI18nLanguages>;
  };

  // 是否准备好
  public get isReady(): boolean {
    return this.$Val.isReady$.value;
  }

  // 获取当前语言
  public get language(): FlintI18nLanguages {
    return this.$Val.language$.value;
  }

  // 国际化 t 函数
  public t: FlintI18nTFunction = (key, options) => this.i18n.t(key, options);

  // 改变语言
  public changeLanguage = async (lang: FlintI18nLanguages): Promise<void> => {
    await this.i18n.changeLanguage(lang);
  };

  public readonly i18n: Ii18n;

  private _sideEffect = new SideEffectManager();

  private constructor() {
    const isReady$ = new Val(false);
    const language$ = new Val<FlintI18nLanguages>("zh-CN");
    this.$Val = { isReady$, language$ };

    this.i18n = i18next;

    const resources: Resource = {
      en: { translation: en },
      "zh-CN": { translation: zhCN },
    };

    const defaultVars: Record<string, Record<string, string>> = process.env.FLAT_REGION === "US"
      ? { en: varsUSen, "zh-CN": varsUSzhCN }
      : { en: varsCNen, "zh-CN": varsCNzhCN };

    // 初始化 i18next 语言
    void i18next
      .use(languageDetector)
      .use(initReactI18next)
      .init({
        resources,
        fallbackLng: "en",
        supportedLngs: FlintI18n.languages,
        interpolation: {
          escapeValue: false, // react already safes from xss
          defaultVariables: defaultVars[i18next.language] || defaultVars.en,
        },
      })
      .then(() => {
        language$.setValue(i18next.language as FlintI18nLanguages);
        isReady$.setValue(true);
      });

    // 监听语言改变
    const changeLang = (lang: FlintI18nLanguages): void => {
      document.querySelector("html")?.setAttribute("lang", lang);

      const defaultVariables = defaultVars[lang] || defaultVars.en;
      if (i18next.options.interpolation) {
        i18next.options.interpolation.defaultVariables = defaultVariables;
      } else {
        i18next.options.interpolation = { defaultVariables };
      }
    };

    changeLang(i18next.language as FlintI18nLanguages);
    i18next.on("languageChanged", changeLang);

    // 销毁时卸载监听
    this._sideEffect.addDisposer(() => {
      i18next.off("languageChanged", changeLang);
    });
  }

  public destroy(): void {
    this._sideEffect.flushAll();
  }
}

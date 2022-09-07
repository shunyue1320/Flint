import { useCallback, useState } from "react";
import { useValueEnhancer } from "use-value-enhancer";
import { FlintI18n, FlintI18nLanguages, FlintI18nTFunction } from "./flint-i18n";

export function useLanguage(): FlintI18nLanguages {
  const [flintI18n] = useState(FlintI18n.getInstance);
  return useValueEnhancer(flintI18n.$Val.language$);
}

export function useTranslate(): FlintI18nTFunction {
  const [flintI18n] = useState(FlintI18n.getInstance);
  const language = useValueEnhancer(flintI18n.$Val.language$);
  return useCallback<FlintI18nTFunction>(
    (key, options) => flintI18n.t(key, options),
    // 语言更改时更新TF函数
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [flintI18n, language],
  );
}

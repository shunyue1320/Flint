import { useState } from "react";
import { useValueEnhancer } from "use-value-enhancer";
import { FlintI18n, FlintI18nLanguages } from "./flat-i18n";

export function useLanguage(): FlintI18nLanguages {
  const [flintI18n] = useState(FlintI18n.getInstance);
  return useValueEnhancer(flintI18n.$Val.language$);
}

import React, { useMemo } from "react";

import { ConfigProvider } from "antd";
import zhCN from "antd/lib/locale/zh_CN";
import enUS from "antd/lib/locale/en_US";

export interface AntdProviderProps {
  lang: string;
  children: React.ReactNode;
}

export const AntdProvider: React.FC<AntdProviderProps> = ({ lang, children }) => {
  const antdLocale = useMemo(() => (lang.startsWith("zh") ? zhCN : enUS), [lang]);

  return (
    <ConfigProvider
      autoInsertSpaceInButton={false}
      // let popups scrolls with container parent
      getPopupContainer={getPopupContainer}
      locale={antdLocale}
    >
      {children}
    </ConfigProvider>
  );
};

function getPopupContainer(trigger?: HTMLElement): HTMLElement {
  return trigger?.parentElement || document.body;
}

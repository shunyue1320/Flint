import "@netless/flint-components/theme/index.less";
import "../theme.less";

import React from "react";
import ReactDOM from "react-dom/client";

import { useLanguage } from "@netless/flint-i18n";
import { AntdProvider } from "@netless/flint-components";
import { AppRoutes } from "@netless/flint-pages/src/AppRoutes";
import { StoreProvider } from "@netless/flint-pages/src/components/StoreProvider";
import { FlintServicesContextProvider } from "@netless/flint-pages/src/components/FlintServicesContext";

// 分离MboX的全局状态避免第三方模块响应式影响 https://www.mobxjs.com/configuration#isolateglobalstate-boolean
import { configure } from "mobx";
configure({
  isolateGlobalState: true,
});

const App: React.FC = () => {
  const language = useLanguage();

  return (
    <AntdProvider lang={language}>
      <StoreProvider>
        <FlintServicesContextProvider>
          <AppRoutes />
        </FlintServicesContextProvider>
      </StoreProvider>
    </AntdProvider>
  );
};

export const initUI = (): void => {
  ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
};

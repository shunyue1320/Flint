import "../flat-components.less";
import "../theme.less";

import React from "react";
import ReactDOM from "react-dom/client";

import { AppRoutes } from "../AppRoutes";
import { StoreProvider } from "../components/StoreProvider";

const App: React.FC = () => {
  return (
    <StoreProvider>
      <AppRoutes />
    </StoreProvider>
  );
};

export const initUI = (): void => {
  ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
};

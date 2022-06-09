import "../flat-components.less";
import "../theme.less";

import React from "react";
import ReactDOM from "react-dom/client";

import { AppRoutes } from "../AppRoutes";

const App: React.FC = () => {
  return <AppRoutes />;
};

export const initUI = (): void => {
  ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
};

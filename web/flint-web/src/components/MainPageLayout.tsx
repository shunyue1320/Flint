import React, { useContext } from "react";
import { routePages } from "../AppRoutes/route-pages";

import { PageStoreContext } from "./StoreProvider";

interface MainPageLayoutProps {
  children: React.ReactNode;
}

export const MainPageLayout: React.FC<MainPageLayoutProps> = ({ children }) => {
  const pageStore = useContext(PageStoreContext);
  const hasHeader = pageStore.name && routePages[pageStore.name].hasHeader;

  return hasHeader ? <>{children}</> : <>{children}</>;
};

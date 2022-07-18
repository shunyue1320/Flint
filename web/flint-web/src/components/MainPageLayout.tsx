import React, { useContext } from "react";
import { routePages } from "../AppRoutes/route-pages";

import { PageStoreContext } from "./StoreProvider";
import { MainPageLayoutHorizontalContainer } from "./MainPageLayoutHorizontalContainer";

interface MainPageLayoutProps {
  children: React.ReactNode;
}

export const MainPageLayout: React.FC<MainPageLayoutProps> = ({ children }) => {
  const pageStore = useContext(PageStoreContext);
  const hasHeader = pageStore.name && routePages[pageStore.name].hasHeader;
  console.log("hasHeader", hasHeader, pageStore.name);
  return hasHeader ? (
    <MainPageLayoutHorizontalContainer
      activeKeys={pageStore.activeKeys}
      subMenu={pageStore.subMenu}
      title={pageStore.title}
      onBackPreviousPage={pageStore.onBackPreviousPage}
      onRouteChange={pageStore.onRouteChange}
    >
      {children}
    </MainPageLayoutHorizontalContainer>
  ) : (
    <>{children}</>
  );
};

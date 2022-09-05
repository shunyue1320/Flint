import React, { useContext } from "react";
import { observer } from "mobx-react-lite";

import { routePages } from "../AppRoutes/route-pages";
import { PageStoreContext } from "./StoreProvider";
import { MainPageLayoutHorizontalContainer } from "./MainPageLayoutHorizontalContainer";

interface MainPageLayoutProps {
  children: React.ReactNode;
}

export const MainPageLayout = observer(function MainPageLayout({ children }: MainPageLayoutProps) {
  const pageStore = useContext(PageStoreContext);
  const hasHeader = pageStore.name && routePages[pageStore.name].hasHeader;
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
});

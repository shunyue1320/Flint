import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

import {
  MainPageLayoutHorizontal,
  MainPageLayoutItem,
  MainPageLayoutProps,
  // SVGCloudFilled,
  // SVGCloudOutlined,
  SVGDownload,
  // SVGFeedback,
  // SVGGithub,
  SVGHomeFilled,
  SVGHomeOutlined,
  SVGLogout,
  // SVGSetting,
} from "flint-components";
import { routeConfig, RouteNameType } from "../../route-config";
import { FLAT_DOWNLOAD_URL } from "../../constants/process";
import { GlobalStoreContext } from "../StoreProvider";
import { generateAvatar } from "../../utils/generate-avatar";

export interface MainPageLayoutHorizontalContainerProps {
  subMenu?: MainPageLayoutItem[];
  children: React.ReactNode;
  activeKeys?: string[];
  onRouteChange?: MainPageLayoutProps["onClick"];
  title?: React.ReactNode;
  onBackPreviousPage?: () => void;
}

export const MainPageLayoutHorizontalContainer: React.FC<
  MainPageLayoutHorizontalContainerProps
> = ({ subMenu, children, activeKeys, onRouteChange, title, onBackPreviousPage }) => {
  const { t } = useTranslation();

  const leftMenu: MainPageLayoutItem[] = [
    {
      key: routeConfig[RouteNameType.HomePage].path,
      icon: (active: boolean): React.ReactNode => {
        return active ? <SVGHomeFilled active={active} /> : <SVGHomeOutlined />;
      },
      title: t("home"),
      route: routeConfig[RouteNameType.HomePage].path,
    },
  ];

  const rightMenu: MainPageLayoutItem[] = [
    {
      key: "download",
      icon: (): React.ReactNode => <SVGDownload />,
      title: <></>,
      route: FLAT_DOWNLOAD_URL,
    },
  ];

  const popMenu: MainPageLayoutItem[] = [
    {
      key: "logout",
      icon: (): React.ReactNode => <SVGLogout />,
      title: <span className="logout-title">{t("logout")}</span>,
      route: routeConfig[RouteNameType.LoginPage].path,
    },
  ];

  const location = useLocation();
  activeKeys ??= [location.pathname];

  const navigate = useNavigate();

  const globalStore = useContext(GlobalStoreContext);

  const onMenuItemClick = (mainPageLayoutItem: MainPageLayoutItem): void => {
    if (mainPageLayoutItem.key === "logout") {
      globalStore.logout();
    }

    if (mainPageLayoutItem.route.startsWith("/")) {
      onRouteChange ? onRouteChange(mainPageLayoutItem) : navigate(mainPageLayoutItem.route);
    } else {
      void window.open(mainPageLayoutItem.route);
    }
    console.log("onMenuItemClick");
  };

  return (
    <MainPageLayoutHorizontal
      activeKeys={activeKeys}
      avatarSrc={globalStore.userInfo?.avatar ?? ""}
      generateAvatar={generateAvatar}
      leftMenu={leftMenu}
      popMenu={popMenu}
      rightMenu={rightMenu}
      subMenu={subMenu}
      title={title}
      userName={globalStore.userName ?? ""}
      onBackPreviousPage={onBackPreviousPage}
      onClick={onMenuItemClick}
    >
      {children}
    </MainPageLayoutHorizontal>
  );
};

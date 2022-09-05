import React, { ComponentType, useContext, useEffect } from "react";
import { useIsomorphicLayoutEffect } from "react-use";
import { useTranslation } from "react-i18next";
import loadable from "@loadable/component";

import { RouteNameType } from "../route-config";
import { AppRouteErrorBoundary } from "./AppRouteErrorBoundary";
import { routePages } from "./route-pages";
import { PageStoreContext } from "../components/StoreProvider";

export interface AppRouteContainerProps {
  name: RouteNameType;
  Comp: () => Promise<{ default: ComponentType<any> }>;
  title: string;
}

const componentCache = new Map<RouteNameType, ComponentType<any>>();

const preloadComponents = async (): Promise<void> => {
  for (const name of Object.keys(routePages) as RouteNameType[]) {
    if (!componentCache.has(name)) {
      const { default: Component } = await routePages[name].component();
      componentCache.set(name, Component);
      // 间隔2秒加载一个组件
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

window.setTimeout(preloadComponents, 5000);

export const AppRouteContainer: React.FC<AppRouteContainerProps> = ({ name, Comp, title }) => {
  const pageStore = useContext(PageStoreContext);
  const { t } = useTranslation();

  useIsomorphicLayoutEffect(() => {
    pageStore.setName(name);
  }, [name, pageStore]);

  useEffect(() => {
    document.title = t("title-" + title);
    window.getSelection()?.removeAllRanges();
  }, [t, title]);

  useEffect(() => {
    if (!componentCache.has(name)) {
      Comp().then(({ default: Component }) => {
        componentCache.set(name, Component);
      });
    }
  }, [Comp, name]);

  return (
    <AppRouteErrorBoundary Comp={componentCache.get(name) || loadable(Comp, {})} title={title} />
  );
};

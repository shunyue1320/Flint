import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { RouteConfig, routeConfig } from "../route-config";
import { routePages } from "./route-pages";
import { MainPageLayout } from "../components/MainPageLayout";
import { AppRouteContainer } from "./AppRouteContainer";

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <MainPageLayout>
        <Routes>
          {Object.keys(routeConfig).map(((name: keyof RouteConfig) => {
            const { path } = routeConfig[name];
            const { component, title } = routePages[name];

            return (
              <Route
                key={name}
                element={<AppRouteContainer Comp={component} name={name} title={title} />}
                path={path}
              />
            );
          }) as (name: string) => React.ReactElement)}
        </Routes>
      </MainPageLayout>
    </BrowserRouter>
  );
};

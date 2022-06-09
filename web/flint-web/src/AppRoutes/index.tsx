import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AppRouteErrorBoundary } from "./AppRouteErrorBoundary";
import { RouteConfig, routeConfig } from "../route-config";
import { routePages } from "./route-pages";
import { FlintThemeBodyProvider } from "../FlintThemeProvider";

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <FlintThemeBodyProvider>
        <AppRouteErrorBoundary>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              {Object.keys(routeConfig).map(((name: keyof RouteConfig) => {
                const { path } = routeConfig[name];
                const { component: PageComponent } = routePages[name];

                return <Route key={name} element={<PageComponent />} path={path} />;
              }) as (name: string) => React.ReactElement)}
            </Routes>
          </Suspense>
        </AppRouteErrorBoundary>
      </FlintThemeBodyProvider>
    </BrowserRouter>
  );
};

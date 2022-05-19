import { lazy } from "react";
import { RouteNameType } from "../route-config";

export type RoutePages = {
  readonly [key in RouteNameType]: {
    readonly title: String;
    readonly hasHeader?: String;
    readonly component: React.LazyExoticComponent<any>;
  };
};

export const routePages: RoutePages = {
  [RouteNameType.LoginPage]: {
    title: "LoginPage",
    component: lazy(() => import("../pages/LoginPage")),
  },
  [RouteNameType.HomePage]: {
    title: "HomePage",
    component: lazy(() => import("../pages/HomePage")),
  },
};

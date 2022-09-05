import { ComponentType } from "react";
import { RouteNameType } from "../route-config";

export type RoutePages = {
  readonly [key in RouteNameType]: {
    readonly title: string;
    readonly hasHeader?: true;
    readonly component: () => Promise<{ default: ComponentType<any> }>;
  };
};

export const routePages: RoutePages = {
  [RouteNameType.LoginPage]: {
    title: "LoginPage",
    component: () => import("../pages/LoginPage"),
  },
  [RouteNameType.HomePage]: {
    title: "HomePage",
    hasHeader: true,
    component: () => import("../pages/HomePage"),
  },
  [RouteNameType.DevicesTestPage]: {
    title: "DevicesTestPage",
    component: () => import("../pages/DevicesTestPage"),
  },
  [RouteNameType.JoinPage]: {
    title: "JoinPage",
    component: () => import("../pages/JoinPage"),
  },
  [RouteNameType.BigClassPage]: {
    title: "BigClassPage",
    component: () => import("../pages/BigClassPage"),
  },
};

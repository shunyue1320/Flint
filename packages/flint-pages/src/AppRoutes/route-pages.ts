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
    component: () => import("../LoginPage"),
  },
  [RouteNameType.HomePage]: {
    title: "HomePage",
    hasHeader: true,
    component: () => import("../HomePage"),
  },
  [RouteNameType.DevicesTestPage]: {
    title: "DevicesTestPage",
    component: () => import("../DevicesTestPage"),
  },
  [RouteNameType.JoinPage]: {
    title: "JoinPage",
    component: () => import("../JoinPage"),
  },
  [RouteNameType.BigClassPage]: {
    title: "BigClassPage",
    component: () => import("../BigClassPage"),
  },
};

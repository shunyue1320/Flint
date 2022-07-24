export enum RouteNameType {
  LoginPage = "LoginPage",
  HomePage = "HomePage",
  DevicesTestPage = "DevicesTestPage",
}

export const routeConfig = {
  [RouteNameType.LoginPage]: {
    path: "/login",
  },
  [RouteNameType.HomePage]: {
    path: "/",
  },
  [RouteNameType.DevicesTestPage]: {
    path: "/devices-test/:roomUUID/",
  },
};

export type ExtraRouteConfig = {};

// 范型 T 继承自 RouteNameType 所以 enum
type CheckRouteConfig<
  T extends {
    [name in RouteNameType]: {
      path: String;
    };
  },
  > = T;

// 将 routeConfig 转成类型传递给 CheckRouteConfig 的 T 范型 （目的：确保 routeConfig 使用了所有的 RouteNameType ）
export type RouteConfig = CheckRouteConfig<typeof routeConfig>;

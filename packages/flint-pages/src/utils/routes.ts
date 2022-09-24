import { useCallback, useMemo } from "react";
import { generatePath, useNavigate } from "react-router-dom";

import { routeConfig, RouteConfig, RouteNameType, ExtraRouteConfig } from "../route-config";

export { RouteNameType } from "../route-config";

type PickExtraRouteConfig<
  T extends RouteNameType,
  K extends string,
> = T extends keyof ExtraRouteConfig
  ? K extends keyof ExtraRouteConfig[T]
  ? ExtraRouteConfig[T][K]
  : string
  : string;

/**
 * Inspired by {@link https://github.com/ghoullier/awesome-template-literal-types#router-params-parsing}
 * Supports optional params
 */
type ExtractRouteParams<T extends RouteNameType, P extends string> = string extends P
  ? Record<string, string>
  : P extends `${infer _Start}:${infer Param}/${infer Rest}`
  ? Param extends `${infer Param}?`
  ? { [k in Param]?: PickExtraRouteConfig<T, k> } & ExtractRouteParams<T, Rest>
  : { [k in Param]: PickExtraRouteConfig<T, k> } & ExtractRouteParams<T, Rest>
  : P extends `${infer _Start}:${infer Param}`
  ? Param extends `${infer Param}?`
  ? { [k in Param]?: PickExtraRouteConfig<T, k> }
  : { [k in Param]: PickExtraRouteConfig<T, k> }
  : {};

export type RouteParams<T extends RouteNameType> = ExtractRouteParams<T, RouteConfig[T]["path"]>;

export function generateRoutePath<T extends RouteNameType>(
  name: T,
  params?: RouteParams<T>,
): string {
  return generatePath(routeConfig[name].path, params);
}

export function usePushNavigate(): <T extends RouteNameType>(
  name: T,
  params?: RouteParams<T>,
) => void {
  const navigate = useNavigate();

  const pushNavigate = useCallback(
    (name: RouteNameType, params: RouteParams<RouteNameType> = {}) => {
      navigate(generateRoutePath(name, params));
    },
    [navigate],
  );

  return pushNavigate;
}

export function useReplaceNavigate(): <T extends RouteNameType>(
  name: T,
  params?: RouteParams<T>,
) => void {
  const navigate = useNavigate();

  const replaceNavigate = useCallback(
    (name: RouteNameType, params: RouteParams<RouteNameType> = {}) => {
      navigate(generateRoutePath(name, params), { replace: true });
    },
    [navigate],
  );

  return replaceNavigate;
}

export function useURLParams(): Record<string, string> {
  const urlSearchParams = useMemo(
    () => new URLSearchParams(window.location.search),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [window.location.search],
  );

  const params = useMemo(() => {
    const res: Record<string, string> = {};
    for (const [key, value] of urlSearchParams.entries()) {
      res[key] = value;
    }
    return res;
  }, [urlSearchParams]);

  return params;
}

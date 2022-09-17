import React from "react";
import { createContext } from "react";
import {
  FlintServices,
  FlintServiceID,
  FlintServicesInstance,
  // FlintServicesCatalog,
} from "@netless/flint-services";
import { useIsomorphicLayoutEffect } from "react-use";
import { useSafePromise } from "@netless/flint-components";

export const FlintServicesContext = createContext<FlintServices>(null as unknown as FlintServices);

export const FlintServicesContextProvider: React.FC = props => (
  <FlintServicesContext.Provider value={FlintServices.getInstance()}>
    {props.children}
  </FlintServicesContext.Provider>
);

/** 使用主持好的服务 如：VideoChat TextChat */
export const useFlintService = <T extends FlintServiceID>(
  name: T,
): FlintServicesInstance<T> | undefined => {
  const flintServices = React.useContext(FlintServicesContext);
  const [service, setService] = React.useState<FlintServicesInstance<T> | null>();
  const sp = useSafePromise();
  useIsomorphicLayoutEffect(() => {
    sp(flintServices.requestService(name)).then(setService);
  }, [flintServices, name]);
  if (service === null) {
    throw new Error(`Flint 服务 ${name} 未注册`);
  }

  return service;
};

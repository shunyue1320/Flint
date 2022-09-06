import React from "react";
import { createContext } from "react";
import { FlintServices } from "@netless/flint-services";
// import { useIsomorphicLayoutEffect } from "react-use";
// import { useSafePromise } from "flint-components";

export const FlintServicesContext = createContext<FlintServices>(null as unknown as FlintServices);

export const FlintServicesContextProvider: React.FC<{ children: React.ReactNode }> = props => (
  <FlintServicesContext.Provider value={FlintServices.getInstance()}>
    {props.children}
  </FlintServicesContext.Provider>
);

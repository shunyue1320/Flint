import React from "react";
import { createContext } from "react";
import { FlintServices } from "@netless/flat-services";
import { useIsomorphicLayoutEffect } from "react-use";
import { useSafePromise } from "flat-components";

export const FlintServicesContext = createContext<FlintServices>(null as unknown as FlintServices);

export const FlintServicesContextProvider: React.FC = props => (
  <FlintServicesContext.Provider value={FlatServices.getInstance()}>
    {props.children}
  </FlintServicesContext.Provider>
);

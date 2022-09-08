import React, { createContext, FC } from "react";
import { preferencesStore, globalStore, roomStore } from "@netless/flat-stores";
import { pageStore } from "../stores/page-store";

// import { globalStore } from "../stores/GlobalStore";
// import { pageStore } from "../stores/page-store";
// import { configStore } from "../stores/config-store";
// import { roomStore } from "../stores/room-store";
// export const ConfigStoreContext = createContext(configStore);

// localStorage 存储的 GlobalStore
export const GlobalStoreContext = createContext(globalStore);
export const PreferencesStoreContext = createContext(preferencesStore);
export const PageStoreContext = createContext(pageStore);
export const RoomStoreContext = createContext(roomStore);

export interface StoreProviderProps {
  children: React.ReactNode;
}

export const StoreProvider: FC<StoreProviderProps> = ({ children }) => (
  <GlobalStoreContext.Provider value={globalStore}>
    <PreferencesStoreContext.Provider value={preferencesStore}>
      <RoomStoreContext.Provider value={roomStore}>
        <PageStoreContext.Provider value={pageStore}>{children}</PageStoreContext.Provider>
      </RoomStoreContext.Provider>
    </PreferencesStoreContext.Provider>
  </GlobalStoreContext.Provider>
);

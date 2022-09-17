import React, { createContext, FC } from "react";
import { preferencesStore, globalStore, roomStore } from "@netless/flint-stores";
import { pageStore } from "../stores/page-store";
import { WindowsBtnContextInterface } from "./WindowsBtnContext";

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
export const WindowsSystemBtnContext = createContext<WindowsBtnContextInterface | undefined>(
  undefined,
);

export interface StoreProviderProps {
  children: React.ReactNode;
  WindowsBtnContext?: WindowsBtnContextInterface;
}

export const StoreProvider: FC<StoreProviderProps> = ({ children, WindowsBtnContext }) => (
  <GlobalStoreContext.Provider value={globalStore}>
    <PreferencesStoreContext.Provider value={preferencesStore}>
      <RoomStoreContext.Provider value={roomStore}>
        <PageStoreContext.Provider value={pageStore}>
          <WindowsSystemBtnContext.Provider value={WindowsBtnContext}>
            {children}
          </WindowsSystemBtnContext.Provider>
        </PageStoreContext.Provider>
      </RoomStoreContext.Provider>
    </PreferencesStoreContext.Provider>
  </GlobalStoreContext.Provider>
);

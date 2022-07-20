import { autoPersistStore } from "./utils";

// clear storage if not match
const LS_VERSION = 1;

export class ConfigStore {
  /** Turn on camera when joining room */
  public autoCameraOn = false;
  /** Turn on mic when joining room */
  public autoMicOn = true;

  public constructor() {
    autoPersistStore({ storeLSName: "ConfigStore", store: this, version: LS_VERSION });
  }
}

export const configStore = new ConfigStore();

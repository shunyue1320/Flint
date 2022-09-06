import { IServiceFile, IServiceFileCatalog } from "./services/file";
import { IService } from "./services/typing";

export type FlintServicesCatalog = IServiceFileCatalog & {
  file: IServiceFile;
  videoChat: IServiceVideoChat;
  textChat: IServiceTextChat;
  whiteboard: IServiceWhiteboard;
  recording: IServiceRecording;
};

declare global {
  interface Window {
    __FlAtSeRvIcEs?: FlintServices;
  }
}

export type FlatServiceID = Extract<keyof FlintServicesCatalog, string>;

export class FlintServices {
  // 单例模式
  public static getInstance(): FlintServices {
    return (window.__FlAtSeRvIcEs ||= new FlintServices());
  }

  private registry = new Map<FlatServiceID, () => Promise<IService | null>>();

  private services = new Map<FlatServiceID, Promise<IService | null>>();

  private constructor() {
    // 保密
  }
}

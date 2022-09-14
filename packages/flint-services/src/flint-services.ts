import { IServiceFile, IServiceFileCatalog } from "./services/file";
import { IService } from "./services/typing";

import { IServiceVideoChat } from "./services/video-chat";

export type FlintServicesCatalog = IServiceFileCatalog & {
  file: IServiceFile;
  videoChat: IServiceVideoChat;
  textChat: IServiceTextChat;
  whiteboard: IServiceWhiteboard;
  recording: IServiceRecording;
};

export type FlintServiceID = Extract<keyof FlintServicesCatalog, string>;

export type FlintServicesInstance<T extends FlintServiceID> = FlintServicesCatalog[T];

declare global {
  interface Window {
    __FlAtSeRvIcEs?: FlintServices;
  }
}

export class FlintServices {
  // 单例模式
  public static getInstance(): FlintServices {
    return (window.__FlAtSeRvIcEs ||= new FlintServices());
  }

  private registry = new Map<FlintServiceID, () => Promise<IService | null>>();

  private services = new Map<FlintServiceID, Promise<IService | null>>();

  private constructor() {
    // 保密
  }

  public register<T extends FlintServiceID>(
    name: T | T[],
    serviceCreator: FlintServicesCreatorCatalog[T],
  ): void {
    const names = Array.isArray(name) ? name : [name];
    names.forEach(name => {
      if (this.isRegistered(name)) {
        throw new Error(`${name} 已注册`);
      }
      this.registry.set(name, serviceCreator);
    });
  }

  public async requestService<T extends FlintServiceID>(
    name: T,
    keepReference = true,
  ): Promise<FlintServicesCatalog[T] | null> {
    let service = this.services.get(name) || null;
    if (!service) {
      const creator = this.registry.get(name);
      if (creator) {
        service = creator();
        if (keepReference) {
          this.services.set(name, service);
        }
      }
    }
    return service as Promise<FlintServicesCatalog[T] | null>;
  }

  public isRegistered(name: FlintServiceID): boolean {
    return this.registry.has(name);
  }
}

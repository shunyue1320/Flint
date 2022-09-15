import { Remitter } from "remitter";

export interface IServiceShareScreenData {
  /** 当用户本地屏幕轨迹改变时触发的事件 */
  "local-changed": boolean;
  /** 当用户远程屏幕轨迹改变时触发的事件 */
  "remote-changed": boolean;
  /** 当 enable 失败时 */
  "err-enable": Error;
}

export type IServiceShareScreenUID = string;

/** 创建 rtc 需要的参数 uid token roomUUID */
export interface IServiceShareScreenParams {
  uid: IServiceShareScreenUID;
  token: string;
  roomUUID: string;
}

export interface IServiceShareScreenInfo {
  type: "display" | "window";
  screenId: number;
  name: string;
  image: Uint8Array;
}

/** 给共享视频一个 events 发布订阅的一个接口 */
export abstract class IServiceShareScreen {
  public readonly events = new Remitter<IServiceShareScreenData>();

  public abstract setParams(params: IServiceShareScreenParams | null): void;
  public abstract enable(enabled: boolean): void;
  public abstract setElement(element: HTMLElement | null): void;

  public getScreenInfo(): Promise<IServiceShareScreenInfo[]> {
    throw doesNotSupportError("screen info");
  }

  public setScreenInfo(_info: IServiceShareScreenInfo | null): void {
    throw doesNotSupportError("screen info");
  }

  public async destroy(): Promise<void> {
    this.events.destroy();
  }
}

function doesNotSupportError(type: string): Error {
  return new Error(`Does not support ${type}`);
}

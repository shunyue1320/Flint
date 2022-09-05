export type FlatServicesCatalog = {
  file: IServiceFile;
  videoChat: IServiceVideoChat;
  textChat: IServiceTextChat;
  whiteboard: IServiceWhiteboard;
  recording: IServiceRecording;
};

export type FlatServiceID = Extract<keyof FlatServicesCatalog, string>;

export class FlatServices {
  // 单例模式
  public static getInstance(): FlatServices {
    return (window.__FlAtSeRvIcEs ||= new FlatServices());
  }

  private registry = new Map<FlatServiceID, () => Promise<IService | null>>();

  private services = new Map<FlatServiceID, Promise<IService | null>>();

  private constructor() {
    // 保密
  }
}

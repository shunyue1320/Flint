import { SideEffectManager } from "side-effect-manager";

export class ClassRoomStore {
  private sideEffect = new SideEffectManager();

  public constructor(config) {
    console.log("config-===", config);
    //   if (!globalStore.userUUID) {
    //     throw new Error("Missing user uuid");
    // }
  }
}

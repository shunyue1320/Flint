import { makeObservable, observable } from "mobx";

export abstract class CloudStorageStore {
  /** 小型面板的紧凑用户界面 */
  public compact = false;
  protected constructor() {
    makeObservable(this, {
      compact: observable,
    });
  }

  public setCompact = (compact: boolean): void => {
    this.compact = compact;
  };
}

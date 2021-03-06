import type { i18n } from "i18next";
import { makeAutoObservable, observable } from "mobx";
import { Room } from "white-web-sdk";
import { FastboardApp } from "@netless/fastboard-react";

import { RoomType } from "../api-middleware/flatServer/constants";
import { CloudStorageFile, CloudStorageStore } from "../pages/CloudStoragePage/store";
import { message } from "antd";

export class WhiteboardStore {
  // 白板app插件
  public fastboardAPP: FastboardApp | null = null;
  public room: Room | null = null;
  public isWritable: boolean;
  // 是房间创建者
  public readonly isCreator: boolean;
  public readonly i18n: i18n;
  public readonly getRoomType: () => RoomType;
  public readonly onDrop: (file: File) => void;

  public readonly cloudStorageStore: CloudStorageStore;

  public constructor(config: {
    isCreator: boolean;
    i18n: i18n;
    getRoomType: () => RoomType;
    onDrop: (file: File) => void;
  }) {
    this.isCreator = config.isCreator;
    this.isWritable = config.isCreator;
    this.i18n = config.i18n;
    this.getRoomType = config.getRoomType;
    this.onDrop = config.onDrop;

    makeAutoObservable<this, "preloadPPTResource">(this, {
      room: observable.ref,
      preloadPPTResource: false,
      fastboardAPP: false,
    });

    this.cloudStorageStore = new CloudStorageStore({
      compact: true,
      i18n: this.i18n,
      insertCourseware: this.insertCourseware,
    });
  }

  public updateFastboardAPP = (whiteboardApp: FastboardApp): void => {
    this.fastboardAPP = whiteboardApp;
  };

  public insertCourseware = async (file: CloudStorageFile): Promise<void> => {
    if (file.convert === "converting") {
      void message.warn(this.i18n.t("in-the-process-of-transcoding-tips"));
      return;
    }

    void message.info(this.i18n.t("inserting-courseware-tips"));
  };
}

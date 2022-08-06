import { message } from "antd";
import type { i18n } from "i18next";
import { Room } from "white-web-sdk";
import { makeAutoObservable, observable, runInAction } from "mobx";
import { FastboardApp, createFastboard } from "@netless/fastboard-react";
import { WindowManager } from "@netless/window-manager";
import { DeviceType, RoomState, ViewMode } from "white-web-sdk";
import { isMobile, isWindows } from "react-device-detect";

import { RoomType } from "../api-middleware/flatServer/constants";
import { CloudStorageFile, CloudStorageStore } from "../pages/CloudStoragePage/store";
import { globalStore } from "./GlobalStore";
import { NETLESS } from "../constants/process";

export class WhiteboardStore {
  // 白板app插件
  public fastboardAPP: FastboardApp | null = null;
  public room: Room | null = null;
  public isWritable: boolean;
  public viewMode: ViewMode | null = null;
  // 被踢
  public isKicked = false;
  // 窗口管理器
  public windowManager: WindowManager | null = null;
  // 白板比例
  public smallClassRatio = 8.3 / 16;
  public otherClassRatio = 10.46 / 16;

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

  public updateRoom = (room: Room): void => {
    this.room = room;
  };

  public async joinWhiteboardRoom(): Promise<void> {
    if (!globalStore.userUUID) {
      throw new Error("缺少用户UUID");
    }

    if (!globalStore.whiteboardRoomUUID || !globalStore.whiteboardRoomToken) {
      throw new Error("缺少白板UUID和令牌");
    }

    let deviceType: DeviceType;
    if (isWindows) {
      deviceType = DeviceType.Surface;
    } else {
      if (isMobile) {
        deviceType = DeviceType.Touch;
      } else {
        deviceType = DeviceType.Desktop;
      }
    }

    const cursorName = globalStore.userInfo?.name;

    const fastboardAPP = await createFastboard({
      sdkConfig: {
        appIdentifier: NETLESS.APP_IDENTIFIER,
        deviceType: deviceType,
        region: globalStore.region ?? "cn-hz",
        pptParams: {
          useServerWrap: true,
        },
      },
      managerConfig: {
        cursor: true,
        chessboard: false,
        containerSizeRatio: this.getWhiteboardRatio(),
        collectorStyles: {
          position: "absolute",
          bottom: "8px",
        },
      },
      joinRoom: {
        uuid: globalStore.whiteboardRoomUUID,
        roomToken: globalStore.whiteboardRoomToken,
        region: globalStore.region ?? undefined,
        // 用户有效载荷
        userPayload: {
          uid: globalStore.userUUID,
          nickName: globalStore.userInfo?.name,
          // @deprecated
          userId: globalStore.userUUID,
          // @deprecated
          cursorName,
        },
        // 浮杆
        floatBar: true,
        // 禁用擦除图像
        disableEraseImage: true,
        // 是可写的
        isWritable: this.isWritable,
        // 隐形插件
        invisiblePlugins: [WindowManager],
        uid: globalStore.userUUID,
        callbacks: {
          // 在相位变化时
          onPhaseChanged: phase => {
            console.log("相位变化=======", phase);
          },
          // 房间状态已更改
          onRoomStateChanged: async (modifyState: Partial<RoomState>): Promise<void> => {
            console.log("房间状态已更改======", modifyState);
          },
          // 在发生错误时断开连接
          onDisconnectWithError: error => {
            void message.error(this.i18n.t("on-disconnect-with-error"));
            console.error(error);
          },
          // 被踢， 房间删除，房间被禁
          onKickedWithReason: reason => {
            if (reason === "kickByAdmin" || reason === "roomDelete" || reason === "roomBan") {
              runInAction(() => {
                if (!this.isCreator) {
                  this.isKicked = true;
                }
              });
            }
          },
        },
      },
    });

    // 禁用比例，固定高度。
    fastboardAPP.manager.mainView.setCameraBound({
      damping: 1,
      centerX: 0,
      centerY: 0,
      minContentMode: () => 1,
      maxContentMode: () => 1,
      width: 0,
      height: 9999,
    });

    this.updateFastboardAPP(fastboardAPP);

    const { room, manager } = fastboardAPP;
    this.updateRoom(room);
    this.updateWindowManager(manager);

    if (process.env.DEV) {
      (window as any).room = room;
      (window as any).manager = manager;
    }
  }

  public getWhiteboardRatio = (): number => {
    // 白板计算方法的比率是 高度/宽度
    if (this.getRoomType() === RoomType.SmallClass) {
      return this.smallClassRatio;
    }
    return this.otherClassRatio;
  };

  public updateFastboardAPP = (whiteboardApp: FastboardApp): void => {
    this.fastboardAPP = whiteboardApp;
  };

  public updateWindowManager = (manager: WindowManager): void => {
    this.windowManager = manager;
  };

  public updateViewMode = (viewMode: ViewMode): void => {
    this.viewMode = viewMode;
  };

  public insertCourseware = async (file: CloudStorageFile): Promise<void> => {
    if (file.convert === "converting") {
      void message.warn(this.i18n.t("in-the-process-of-transcoding-tips"));
      return;
    }

    void message.info(this.i18n.t("inserting-courseware-tips"));
  };
}

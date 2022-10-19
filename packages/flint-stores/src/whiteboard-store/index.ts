import { SideEffectManager } from "side-effect-manager";
import { WindowManager } from "@netless/window-manager";
import { IServiceWhiteboard } from "@netless/flint-services";
import type { FastboardApp } from "@netless/fastboard";
import { AnimationMode, Room } from "white-web-sdk";
import { makeAutoObservable, observable, runInAction } from "mobx";
import { RoomPhase, ViewMode } from "white-web-sdk";
import { debounce } from "lodash-es";

import { RoomType, Region } from "@netless/flint-server-api";
// import { FlintI18n } from "@netless/flint-i18n";
import { globalStore } from "../global-store";
import { preferencesStore } from "../preferences-store";
// import { CloudStorageStore } from "../cloud-storage-store";
import { ClassroomReplayEventData } from "../classroom-store/event";
// import { coursewarePreloader } from "../utils/courseware-preloader"; // 课件预加载程序

export class WhiteboardStore {
  private sideEffect = new SideEffectManager();
  public whiteboard: IServiceWhiteboard;
  /** 白板app插件 */
  public fastboardAPP: FastboardApp<ClassroomReplayEventData> | null = null;
  public room: Room | null = null;
  /** 白板连接阶段 */
  public phase: RoomPhase = RoomPhase.Connecting;
  public viewMode: ViewMode | null = null;
  /** 窗口管理器 */
  public windowManager: WindowManager | null = null;
  /** 是否可写 */
  public isWritable: boolean;
  /** 是否显示工具面板 */
  public isShowPreviewPanel = false;
  public isFileOpen = false;
  /** 是否被踢 */
  public isKicked = false;
  public isWindowMaximization = false;
  public isRightSideClose = false;
  public currentSceneIndex = 0;
  public scenesCount = 0;
  public smallClassRatio = 8.3 / 16;
  public otherClassRatio = 10.46 / 16;
  public smallClassAvatarWrapMaxWidth = 0;

  /** 是房间创建者 */
  public readonly isCreator: boolean;
  public readonly getRoomType: () => RoomType;
  public readonly onDrop: (file: File) => void;

  // public readonly cloudStorageStore: CloudStorageStore;

  public constructor({
    whiteboard,
    isCreator,
    isWritable,
    getRoomType,
    onDrop,
  }: {
    whiteboard: IServiceWhiteboard;
    isCreator: boolean;
    isWritable: boolean;
    getRoomType: () => RoomType;
    onDrop: (file: File) => void;
  }) {
    this.whiteboard = whiteboard;
    this.isCreator = isCreator;
    this.isWritable = isWritable;
    this.getRoomType = getRoomType;
    this.onDrop = onDrop;

    makeAutoObservable<this, "preloadPPTResource" | "sideEffect">(this, {
      room: observable.ref,
      preloadPPTResource: false,
      fastboardAPP: false,
      sideEffect: false,
      whiteboard: false,
    });

    this.whiteboard.setAllowDrawing(this.isWritable);

    // this.cloudStorageStore = new CloudStorageStore({
    //   compact: true,
    //   insertCourseware: this.insertCourseware,
    // });

    this.sideEffect.push([
      whiteboard.events.on("kicked", () => {
        // 【监听被踢】创建者不需要收听此事件, 因为他们控制着离开的房间。监听这个可能会中断休息室的进程。
        if (!this.isCreator) {
          runInAction(() => {
            this.isKicked = true;
          });
        }
      }),
      whiteboard.$Val.phase$.subscribe(() => {
        const room = this.getRoom();
        if (room) {
          runInAction(() => {
            this.phase = room.phase;
          });
        }
      }),
    ]);
  }

  public updateFastboardAPP = (whiteboardApp: FastboardApp<ClassroomReplayEventData>): void => {
    this.fastboardAPP = whiteboardApp;
  };

  public updateRoom = (room: Room): void => {
    this.room = room;
  };

  public updateWindowManager = (manager: WindowManager): void => {
    this.windowManager = manager;
  };

  public updateWritable = async (isWritable: boolean): Promise<void> => {
    this.isWritable = isWritable;
    this.whiteboard.setAllowDrawing(isWritable);
  };

  public updateWindowMaximization = (isMaximization: boolean): void => {
    this.isWindowMaximization = isMaximization;
  };

  public updateSmallClassAvatarWrapMaxWidth = (smallClassAvatarWrapMaxWidth: number): void => {
    this.smallClassAvatarWrapMaxWidth = smallClassAvatarWrapMaxWidth;
  };

  public setFileOpen = (open: boolean): void => {
    this.isFileOpen = open;
  };

  public toggleFileOpen = (): void => {
    this.isFileOpen = !this.isFileOpen;
  };

  public showPreviewPanel = (): void => {
    this.isShowPreviewPanel = true;
  };

  public setPreviewPanel = (show: boolean): void => {
    this.isShowPreviewPanel = show;
  };

  public setRightSideClose = (close: boolean): void => {
    this.isRightSideClose = close;
  };

  public async joinWhiteboardRoom(): Promise<FastboardApp<ClassroomReplayEventData>> {
    if (!globalStore.userUUID) {
      throw new Error("缺少用户UUID");
    }

    if (!globalStore.whiteboardRoomUUID || !globalStore.whiteboardRoomToken) {
      throw new Error("缺少白板UUID和token");
    }

    await this.whiteboard.joinRoom({
      roomID: globalStore.whiteboardRoomUUID,
      roomToken: globalStore.whiteboardRoomToken,
      region: globalStore.region ?? Region.CN_HZ,
      uid: globalStore.userUUID,
      nickName: globalStore.userInfo?.name ?? globalStore.userUUID,
      classroomType: this.getRoomType(),
      options: {
        strokeTail: preferencesStore.strokeTail,
      },
    });

    const fastboardAPP = await (this.whiteboard as any)._app$.value;
    this.updateFastboardAPP(fastboardAPP);
    const { room, manager } = fastboardAPP;
    this.updateRoom(room);
    this.updateWindowManager(manager);
    this.scrollToTopOnce();

    if (process.env.DEV) {
      (window as any).room = room;
      (window as any).manager = manager;
    }

    return fastboardAPP;
  }

  /** 滑动到顶部 */
  private scrollToTopOnce(): void {
    const { room, windowManager } = this;
    if (!room || !windowManager) {
      return;
    }
    if (!room.isWritable) {
      return;
    }
    if (!room.state.globalState || !(room.state.globalState as any).scrollToTop) {
      room.setGlobalState({ screenTop: true });
      windowManager.moveCamera({ centerY: -950, animationMode: AnimationMode.Immediately });
    }
  }

  public async destroy(): Promise<void> {
    this.sideEffect.flushAll();
    this.preloadPPTResource.cancel();
    await this.whiteboard.destroy();

    if (process.env.DEV) {
      (window as any).room = null;
      (window as any).manager = null;
    }
    console.log(`Whiteboard unloaded: ${globalStore.whiteboardRoomUUID}`);
  }

  private preloadPPTResource = debounce(async (pptSrc: string): Promise<void> => {
    // await coursewarePreloader.preload(pptSrc);
  }, 2000);

  /** 插入课件 */
  public insertCourseware = async (file: CloudFile): Promise<void> => {
    // if (
    //   (file.meta.whiteboardConvert || file.meta.whiteboardProjector)?.convertStep ===
    //   FileConvertStep.Converting
    // ) {
    //   void message.warn(FlintI18n.t("in-the-process-of-transcoding-tips"));
    //   return;
    // }
    // if (file.resourceType !== FileResourceType.Directory) {
    //   void message.info(FlintI18n.t("inserting-courseware-tips"));
    // }
    // const fileService = await FlintServices.getInstance().requestService("file");
    // if (!fileService) {
    //   void message.error(FlintI18n.t("unable-to-insert-courseware"));
    //   return;
    // }
    // await fileService.insert(file);
    // if (this.cloudStorageStore.onCoursewareInserted) {
    //   this.cloudStorageStore.onCoursewareInserted();
    // }
  };

  /** 获取保存注释图像 */
  public getSaveAnnotationImages(): Array<Promise<HTMLCanvasElement | null>> {
    return this.whiteboard.exportAnnotations();
  }

  private getRoom(): Room | null {
    return (this.whiteboard as any)._app$.value?.room ?? null;
  }
}

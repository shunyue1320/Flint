import { createFastboard, createUI, FastboardApp, addManagerListener } from "@netless/fastboard";
import { ReadonlyVal, Val, combine } from "value-enhancer";
import { AsyncSideEffectManager } from "side-effect-manager";
import { DeviceType, RoomPhase } from "white-web-sdk";
import { Displayer } from "@netless/white-snapshot";
import { WindowManager } from "@netless/window-manager";

import {
  IServiceWhiteboard,
  Toaster,
  IServiceWhiteboardPhase,
  IServiceWhiteboardJoinRoomConfig,
} from "@netless/flint-services";
import type { FlintI18n } from "@netless/flint-i18n";
import { RoomType } from "@netless/flint-server-api";

import { registerColorShortcut } from "./color-shortcut";
import { injectCursor } from "./inject-cursor";

export { replayFastboard, register, stockedApps } from "@netless/fastboard";

declare global {
  interface Window {
    __netlessUA?: string;
  }
}

interface FlintInfo {
  readonly platform?: string;
  readonly version?: string;
  readonly region?: string;
  readonly ua?: string;
}

export interface FastboardConfig {
  APP_ID?: string;
  toaster: Toaster;
  flintI18n: FlintI18n;
  flintInfo?: FlintInfo;
}

export class Fastboard extends IServiceWhiteboard {
  private asyncSideEffect = new AsyncSideEffectManager();
  private toaster: Toaster;
  private flintI18n: FlintI18n;
  private flintInfo: FlintInfo;
  private APP_ID?: string;
  private ui = createUI();

  public readonly _app$: Val<FastboardApp | null>;
  public readonly _el$: Val<HTMLElement | null>;
  public readonly _roomPhase$: Val<RoomPhase>;

  /** 白板连接状态 与 是否允许绘图 */
  public readonly $Val: Readonly<{
    phase$: ReadonlyVal<IServiceWhiteboardPhase>;
    allowDrawing$: Val<boolean>;
  }>;

  public get roomID(): string | null {
    return this._app$.value?.room.uuid ?? null;
  }

  /** 获取加入白板阶段状态 */
  public get phase(): IServiceWhiteboardPhase {
    return this.$Val.phase$.value;
  }

  /** 获取是否允许绘图 */
  public get allowDrawing(): boolean {
    return this.$Val.allowDrawing$.value;
  }

  /** 设置允许绘图 */
  public setAllowDrawing(allowDrawing: boolean): void {
    this.$Val.allowDrawing$.setValue(allowDrawing);
  }

  public constructor({ APP_ID, toaster, flintI18n, flintInfo = {} }: FastboardConfig) {
    super();

    this.APP_ID = APP_ID;
    this.toaster = toaster;
    this.flintI18n = flintI18n;
    this.flintInfo = flintInfo;

    this._app$ = new Val<FastboardApp | null>(null);
    this._el$ = new Val<HTMLElement | null>(null);
    this._roomPhase$ = new Val<RoomPhase>(RoomPhase.Disconnected);
    const allowDrawing$ = new Val(false);

    const phase$ = combine([this._app$, this._roomPhase$], ([app, phase]) =>
      app ? convertRoomPhase(phase) : IServiceWhiteboardPhase.Disconnected,
    );

    this.$Val = {
      phase$,
      allowDrawing$,
    };

    this.sideEffect.push(() => {
      this._app$.destroy();
      this._el$.destroy();
      this._roomPhase$.destroy();
      phase$.destroy();
      allowDrawing$.destroy();
    });

    this.setUA();

    this.sideEffect.push([
      // 订阅 允许绘图状态 改变并同步白板（app.room）的读写状态
      combine([this._app$, allowDrawing$]).subscribe(([app, allowDrawing]) => {
        const room = app?.room;
        if (!room) {
          return;
        }
        room.disableDeviceInputs = !allowDrawing;
        // room.isWritable 暂时遵循 allowDrawing
        if (allowDrawing !== room.isWritable) {
          this.asyncSideEffect.add(async () => {
            let isDisposed = false;
            try {
              if (allowDrawing) {
                await app.room.setWritable(true);
              } else {
                // 等到房间可写
                // 修复问题后删除
                await app.syncedStore.nextFrame();
                if (!isDisposed) {
                  await app.room.setWritable(false);
                }
              }
            } catch (e) {
              if (process.env.NODE_ENV !== "production") {
                console.error(e);
              }
            }
            return () => {
              isDisposed = true;
            };
          }, "setWritable");
        }
      }, true),

      this._el$.subscribe(el => {
        if (el) {
          this.ui.mount(el, {
            app: this._app$.value,
            config: {
              // 隐藏缩放控件
              zoom_control: { enable: false },
            },
          });
        } else {
          this.ui.destroy();
        }
      }),

      this._app$.subscribe(app => {
        this.ui.update({ app });
      }),

      this.flintI18n.$Val.language$.subscribe(language => {
        this.ui.update({ language });
      }),
    ]);
  }

  /** 加入白板房间  */
  public async joinRoom({
    appID = this.APP_ID,
    roomID,
    roomToken,
    uid,
    nickName,
    region,
    classroomType,
    options = {},
  }: IServiceWhiteboardJoinRoomConfig): Promise<void> {
    if (!appID) {
      throw new Error("[Fastboard] APP_ID is not set");
    }
    if (this.roomID) {
      throw new Error(`[Fastboard] cannot join room '${roomID}', already joined '${this.roomID}'`);
    }

    this._roomPhase$.setValue(RoomPhase.Disconnected);

    const fastboardAPP = await createFastboard({
      sdkConfig: {
        // WhiteWebSdk 实例的配置
        appIdentifier: appID, // 互动白板项目的 App Identifier
        region, // 数据中心 cn-hz
        deviceType: DeviceType.Surface, // 设备类型
        pptParams: {
          // ppt参数
          useServerWrap: true,
        },
        disableNewPencilStroke: options.strokeTail === false,
      },
      // 窗口样式配置
      managerConfig: {
        containerSizeRatio: classroomType === RoomType.SmallClass ? 8.3 / 16 : 10.46 / 16,
        cursor: true,
        chessboard: false,
        collectorStyles: {
          position: "absolute",
          bottom: "8px",
        },
        viewMode: "scroll",
      },
      joinRoom: {
        uuid: roomID,
        roomToken,
        region,
        userPayload: {
          uid,
          nickName,
          // @deprecated
          userId: uid,
          // @deprecated
          cursorName: nickName,
        },
        // 只有可写用户才能修改状态和分派事件。
        // 对于只读用户（受众），将此设置为false以获得更好的性能
        isWritable: this.allowDrawing,
        uid,
        floatBar: true,
        disableEraseImage: true,
        invisiblePlugins: [WindowManager],
        callbacks: {
          onEnableWriteNowChanged: async () => {
            const room = this._app$.value?.room;
            if (!room) {
              return;
            }
            if (room.isWritable) {
              room.disableSerialization = false;
            } else if (this.allowDrawing) {
              room.setWritable(true);
            }
          },
          // 白板连接状态变化时
          onPhaseChanged: phase => {
            this._roomPhase$.setValue(phase);
          },
          // 在发生错误时断开连接
          onDisconnectWithError: error => {
            this.toaster.emit("error", this.flintI18n.t("on-disconnect-with-error"));
            console.error(error);
          },
          // 被踢， 房间删除，房间被禁
          onKickedWithReason: async reason => {
            this.events.emit(
              "kicked",
              reason === "kickByAdmin"
                ? "kickedByAdmin"
                : reason === "roomDelete"
                  ? "roomDeleted"
                  : reason === "roomBan"
                    ? "roomBanned"
                    : "unknown",
            );
            try {
              await this.leaveRoom();
            } catch {
              // already in exception state, ignore errors
            }
          },
        },
      },
    });

    this._app$.setValue(fastboardAPP);
    // 画笔颜色快捷方式
    this.sideEffect.push(registerColorShortcut(fastboardAPP), "color-shortcut");
    // 光标样式
    this.sideEffect.push(injectCursor(fastboardAPP), "cursor");
    // 滚动状态
    this.sideEffect.push(
      addManagerListener(fastboardAPP.manager, "scrollStateChange", ({ page, maxScrollPage }) => {
        this.events.emit("scrollPage", page);
        this.events.emit("maxScrollPage", maxScrollPage);
      }),
      "scroll-state",
    );
    if (fastboardAPP.manager.scrollState) {
      const { page, maxScrollPage } = fastboardAPP.manager.scrollState;
      this.events.emit("scrollPage", page);
      this.events.emit("maxScrollPage", maxScrollPage);
    }
    // 用户滚动
    this.sideEffect.push(
      addManagerListener(
        fastboardAPP.manager,
        "userScroll",
        this.events.emit.bind(this.events, "userScroll"),
      ),
    );
  }

  /** 离开白板房间 */
  public async leaveRoom(): Promise<void> {
    const app = this._app$.value;
    if (app) {
      this._app$.setValue(null);
      this._el$.setValue(null);
      this.ui.destroy();
      await app.destroy();
    }
  }

  /** 设置白板挂载的 dom 节点 */
  public override render(el: HTMLElement): void {
    this._el$.setValue(el);
  }

  /** 设置白板的外观 */
  public override setTheme(theme: "light" | "dark"): void {
    this.ui.update({ theme });
  }

  public override async destroy(): Promise<void> {
    super.destroy();
    this.asyncSideEffect.flushAll();
    await this.leaveRoom();
  }

  /** 绘图导出保存为图片 */
  public exportAnnotations(): Array<Promise<HTMLCanvasElement | null>> {
    const app = this._app$.value;
    if (!app) {
      return [];
    }

    const displayer: Displayer = {
      state: app.manager,
      fillSceneSnapshot: app.manager.mainView.fillSceneSnapshot.bind(app.manager.mainView),
    };
    const scenes = app.manager.sceneState.scenes;
    const actions: Array<
      (snapshot: (...args: any) => Promise<HTMLCanvasElement | null>) => Promise<void>
    > = Array(scenes.length);
    const canvases: Array<Promise<HTMLCanvasElement | null>> = Array(scenes.length);

    // 遍历所有画板
    scenes.forEach((scene, i) => {
      // 给所有 canvas 绘制过程一个 promise，绘制成功后返回绘制的 canvas
      canvases[i] = new Promise(resolve => {
        actions[i] = async snapshot => {
          try {
            // 开始绘制 canvas
            const canvas = await snapshot(displayer, {
              scenePath: app.manager.mainViewSceneDir + scene.name,
              crossorigin: true,
            });
            resolve(canvas);
          } catch (e) {
            console.warn("Failed to snapshot scene", scene.name);
            console.error(e);
            resolve(null);
          }
        };
      });
    });

    Promise.resolve().then(async () => {
      const { snapshot } = await import("@netless/white-snapshot");
      for (const act of actions) {
        await act(snapshot);
      }
    });

    return canvases;
  }

  /** window 上注入 服务器地区 白板版本 方便白板调试 */
  private setUA(): void {
    const exist = window.__netlessUA || "";
    if (!exist.includes("FLAT/")) {
      const ua =
        this.flintInfo.ua || (this.flintI18n.t("app-name") || "").replace(/s+/g, "_").slice(0, 50);
      const platform = this.flintInfo.platform || "unknown";
      const region = this.flintInfo.region || "ROW";
      const version = this.flintInfo.version || "0.0.0";
      window.__netlessUA = exist + ` FLAT/${ua}_${platform}_${region}@${version} `;
    }
  }
}

function convertRoomPhase(roomPhase: RoomPhase): IServiceWhiteboardPhase {
  switch (roomPhase) {
    case RoomPhase.Connecting: {
      return IServiceWhiteboardPhase.Connecting;
    }
    case RoomPhase.Connected: {
      return IServiceWhiteboardPhase.Connected;
    }
    case RoomPhase.Reconnecting: {
      return IServiceWhiteboardPhase.Reconnecting;
    }
    case RoomPhase.Disconnecting: {
      return IServiceWhiteboardPhase.Disconnecting;
    }
    default: {
      return IServiceWhiteboardPhase.Disconnected;
    }
  }
}

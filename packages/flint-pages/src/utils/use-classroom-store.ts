import { useState, useEffect } from "react";
import { ClassroomStore, ClassroomStoreConfig } from "@netless/flint-stores";
import { RouteNameType, usePushNavigate } from "../utils/routes";
import { errorTips, useSafePromise } from "@netless/flint-components";
import { FlintServices } from "@netless/flint-services";

export type useClassRoomStoreConfig = Omit<
  ClassroomStoreConfig,
  "rtc" | "rtm" | "whiteboard" | "recording"
>;

/**
 * 房间状态管理：初始化状态 ｜ 销毁状态
 * @param config { roomUUID: "房间唯一id", ownerUUID: "用户唯一id" }
 * @returns 初始化教室状态并返回 classroomStore, 退出页面时销毁状态
 */
export function useClassroomStore(config: useClassRoomStoreConfig): ClassroomStore | undefined {
  const [classroomStore, setClassroomStore] = useState<ClassroomStore>();
  const pushNavigate = usePushNavigate();
  const sp = useSafePromise();

  const title = classroomStore?.roomInfo?.title;
  useEffect(() => {
    if (title) {
      document.title = title;
    }
  }, [title]);

  useEffect(() => {
    let isUnmounted = false;
    let classroomStore: ClassroomStore | undefined;
    const flintServices = FlintServices.getInstance();

    sp(
      Promise.all([
        flintServices.requestService("videoChat"),
        // flintServices.requestService("textChat"),
        flintServices.requestService("whiteboard"),
        // flintServices.requestService("recording"),
      ]),
    ).then(([videoChat, whiteboard]) => {
      if (!isUnmounted && videoChat && whiteboard) {
        // 初始化房间状态
        classroomStore = new ClassroomStore({
          ...config,
          rtc: videoChat,
          // rtm: textChat,
          whiteboard,
          // recording,
        });

        setClassroomStore(classroomStore);
        sp(classroomStore.init()).catch(e => {
          // 出错跳回首页
          errorTips(e);
          pushNavigate(RouteNameType.HomePage);
        });
      }
    });

    return () => {
      isUnmounted = true;
      classroomStore?.destroy().catch(e => {
        if (process.env.NODE_ENV !== "production") {
          console.error(e);
        }
      });

      flintServices.shutdownService("videoChat");
      // flintServices.shutdownService("textChat");
      // flintServices.shutdownService("whiteboard");
      // flintServices.shutdownService("recording");
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return classroomStore;
}

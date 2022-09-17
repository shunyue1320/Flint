import { useState, useEffect } from "react";
import { ClassroomStore, ClassroomStoreConfig } from "@netless/flint-stores";
import { RouteNameType, usePushNavigate } from "../utils/routes";
import { errorTips, useSafePromise } from "@netless/flint-components";
import { FlintServices } from "@netless/flint-services";

export type useClassRoomStoreConfig = Omit<
  ClassroomStoreConfig,
  "rtc" | "rtm" | "whiteboard" | "recording"
>;

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
        flintServices.requestService("textChat"),
        flintServices.requestService("whiteboard"),
        flintServices.requestService("recording"),
      ]),
    ).then(([videoChat, textChat, whiteboard, recording]) => {
      if (!isUnmounted && videoChat && textChat && whiteboard && recording) {
        classroomStore = new ClassroomStore({
          ...config,
          rtc: videoChat,
          rtm: textChat,
          whiteboard,
          recording,
        });

        setClassroomStore(classroomStore);
        sp(classroomStore.init()).catch(e => {
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
      flintServices.shutdownService("textChat");
      flintServices.shutdownService("whiteboard");
      flintServices.shutdownService("recording");
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return classroomStore;
}

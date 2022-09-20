import React from "react";
import { observer } from "mobx-react-lite";
import { useParams } from "react-router-dom";
import { ClassroomStore } from "@netless/flint-stores";

import { RouteNameType, RouteParams } from "../utils/routes";
import { useClassroomStore } from "./use-classroom-store";
import { LoadingPage } from "@netless/flint-components";
import { RoomPhase } from "white-web-sdk";

export type WithClassroomStoreProps<P = {}> = P & { classroomStore: ClassroomStore };

export const withClassroomStore = <P extends {}>(
  Component: React.ComponentType<WithClassroomStoreProps<P>>,
): React.FC<P> =>
  observer<P>(function WithClassroomStore(props) {
    // 拿到路由上的数据 { roomUUID: "房间唯一id", ownerUUID: "用户唯一id" }
    const params = useParams<RouteParams<RouteNameType.BigClassPage>>();

    const classroomStore = useClassroomStore(params);
    const isReady =
      classroomStore &&
      classroomStore.whiteboardStore.room &&
      classroomStore.whiteboardStore.phase !== RoomPhase.Connecting &&
      classroomStore.whiteboardStore.phase !== RoomPhase.Disconnecting;

    return isReady ? (
      <Component classroomStore={classroomStore} {...props} />
    ) : (
      <LoadingPage onTimeout="full-reload" />
    );
  });

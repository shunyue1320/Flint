import "@netless/window-manager/dist/style.css";
import "./style.less";

import React, { useCallback, useContext, useState, useEffect } from "react";
import { message } from "antd";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { RaiseHand, DarkModeContext } from "@netless/flint-components";
import { RoomPhase } from "white-web-sdk";
import { noop } from "lodash-es";

import { WhiteboardStore } from "../../stores/whiteboard-store";
import { ClassRoomStore } from "../../stores/class-room-store";
import { Fastboard, Language, FastboardUIConfig } from "@netless/fastboard-react";
import { refreshApps } from "../../utils/toolbar-apps";

const config: FastboardUIConfig = {
  // 不显示小程序收纳盒
  zoom_control: { enable: false },
  // 显示小程序工具栏
  toolbar: { apps: { enable: true } },
};

export interface WhiteboardProps {
  whiteboardStore: WhiteboardStore;
  classRoomStore: ClassRoomStore;
  disableHandRaising?: boolean;
}

export const Whiteboard = observer<WhiteboardProps>(function Whiteboard({
  whiteboardStore,
  classRoomStore,
  disableHandRaising,
}) {
  const { i18n, t } = useTranslation();
  const { room, phase, fastboardAPP } = whiteboardStore;
  const isDark = useContext(DarkModeContext);

  const [whiteboardEl, setWhiteboardEl] = useState<HTMLElement | null>(null);
  const [collectorEl, setCollectorEl] = useState<HTMLElement | null>(null);

  const isReconnecting = phase === RoomPhase.Reconnecting;

  useEffect(() => {
    return isReconnecting ? message.info(t("reconnecting"), 0) : noop;
  }, [isReconnecting, t]);

  // 每次窗口变动计算白板的大小
  useEffect(() => {
    if (whiteboardEl) {
      whiteboardOnResize();
      window.addEventListener("resize", whiteboardOnResize);
    }
    return () => {
      window.removeEventListener("resize", whiteboardOnResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [whiteboardEl]);

  useEffect(() => {
    refreshApps({
      t,
      onSaveAnnotation: () => {
        // showSaveAnnotation(true);
      },
      onPresets: () => {
        // showPresets(true);
      },
    });
  }, [t]);

  // 设置白板实例
  const bindWhiteboard = useCallback((ref: HTMLDivElement | null) => {
    if (ref) {
      setWhiteboardEl(ref);
    }
  }, []);

  // 白板小程序收纳盒
  const bindCollector = useCallback((ref: HTMLDivElement | null) => {
    if (ref) {
      setCollectorEl(ref);
    }
  }, []);

  const whiteboardOnResize = useCallback(() => {
    if (!whiteboardEl) {
      return;
    }
    const whiteboardRatio = whiteboardStore.getWhiteboardRatio();

    const isSmallClass = whiteboardStore.smallClassRatio === whiteboardRatio;
    const classRoomRightSideWidth = whiteboardStore.isRightSideClose ? 0 : 304;

    let classRoomTopBarHeight: number;
    let classRoomMinWidth: number;
    let classRoomMinHeight: number;
    let smallClassAvatarWrapMaxWidth: number;

    if (isSmallClass) {
      classRoomTopBarHeight = 150;
      classRoomMinWidth = whiteboardStore.isRightSideClose ? 826 : 1130;
      classRoomMinHeight = 610;
    } else {
      classRoomTopBarHeight = 40;
      classRoomMinWidth = whiteboardStore.isRightSideClose ? 716 : 1020;
      classRoomMinHeight = 522;
    }

    const whiteboardWidth = Math.min(
      window.innerWidth - classRoomRightSideWidth,
      (window.innerHeight - classRoomTopBarHeight) / whiteboardRatio,
    );
    const whiteboardHeight = whiteboardWidth * whiteboardRatio;

    whiteboardEl.style.width = `${whiteboardWidth}px`;
    whiteboardEl.style.height = `${whiteboardHeight}px`;

    if (window.innerHeight < classRoomMinHeight || window.innerWidth < classRoomMinWidth) {
      const whiteboardMinWidth = classRoomMinWidth - classRoomRightSideWidth;

      whiteboardEl.style.minWidth = `${whiteboardMinWidth}px`;
      whiteboardEl.style.minHeight = `${whiteboardMinWidth * whiteboardRatio}px`;
    }

    const classRoomWidth = whiteboardWidth + classRoomRightSideWidth;
    const classRoomWithoutRightSideWidth = classRoomMinWidth - classRoomRightSideWidth;

    if (whiteboardStore.isRightSideClose) {
      smallClassAvatarWrapMaxWidth =
        classRoomWidth < classRoomWithoutRightSideWidth
          ? classRoomWithoutRightSideWidth
          : classRoomWidth;
    } else {
      smallClassAvatarWrapMaxWidth =
        classRoomWidth < classRoomMinWidth ? classRoomMinWidth : classRoomWidth;
    }
    whiteboardStore.updateSmallClassAvatarWrapMaxWidth(smallClassAvatarWrapMaxWidth);
  }, [whiteboardEl, whiteboardStore]);

  const onDragOver = useCallback(() => {}, []);
  const onDrop = useCallback(() => {}, []);

  return (
    <>
      {room && (
        <div
          className={classNames("whiteboard-container", {
            "is-readonly": !whiteboardStore.isWritable,
          })}
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          {/* 显示举手按钮： 不是创建者 && 是可写 && 没有禁止  */}
          {!whiteboardStore.isCreator && !whiteboardStore.isWritable && !classRoomStore.isBan && (
            <div className="raise-hand-container">
              <RaiseHand
                disableHandRaising={disableHandRaising}
                isRaiseHand={classRoomStore.users.currentUser?.isRaiseHand}
                onRaiseHandChange={classRoomStore.onToggleHandRaising}
              />
            </div>
          )}
          {/* 小程序收集按钮 */}
          <div ref={bindCollector} />
          {/* 白板面板 */}
          <Fastboard
            app={fastboardAPP}
            config={config}
            // 容器ref引用
            containerRef={bindWhiteboard}
            language={i18n.language as Language}
            theme={isDark ? "dark" : "light"}
          />
        </div>
      )}
    </>
  );
});

import "./style.less";

import React, { useCallback, useContext } from "react";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { RaiseHand, DarkModeContext } from "flint-components";

import { WhiteboardStore } from "../../stores/whiteboard-store";
import { ClassRoomStore } from "../../stores/class-room-store";
import { Fastboard, Language, FastboardUIConfig } from "@netless/fastboard-react";

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
  const { room, fastboardAPP } = whiteboardStore;
  const isDark = useContext(DarkModeContext);

  const onDragOver = useCallback(() => {}, []);
  const onDrop = useCallback(() => {}, []);
  const bindCollector = useCallback(() => {}, []);

  const bindWhiteboard = useCallback((ref: HTMLDivElement | null) => {
    if (ref) {
      // setWhiteboardEl(ref);
    }
  }, []);

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
            containerRef={bindWhiteboard}
            language={i18n.language as Language}
            theme={isDark ? "dark" : "light"}
          />
        </div>
      )}
    </>
  );
});

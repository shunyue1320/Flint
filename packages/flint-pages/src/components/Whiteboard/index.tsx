import "@netless/window-manager/dist/style.css";
import "./style.less";

import React, { useCallback, useContext, useState, useEffect, useTransition } from "react";
import classNames from "classnames";
import { RoomPhase } from "white-web-sdk";
import { observer } from "mobx-react-lite";

import { WhiteboardStore, ClassroomStore } from "@netless/flint-stores";
import { RaiseHand, DarkModeContext } from "@netless/flint-components";
import { useTranslate, FlintI18nTFunction } from "@netless/flint-i18n";

export interface WhiteboardProps {
  whiteboardStore: WhiteboardStore;
  classRoomStore: ClassroomStore;
  disableHandRaising?: boolean;
}

const noop = (): void => {
  // noop
};

export const Whiteboard = observer<WhiteboardProps>(function Whiteboard({
  whiteboardStore,
  classRoomStore,
  disableHandRaising,
}) {
  const t = useTranslate();
  const { room, phase, whiteboard } = whiteboardStore;
  const isDark = useContext(DarkModeContext);

  const [page, setPage] = useState(0);
  const [maxPage, setMaxPage] = useState(Infinity);
  const [showPage, setShowPage] = useState(false);

  useEffect(() => {
    const stopListenPage = whiteboard.events.on("scrollPage", setPage);
    const stopListenMaxPage = whiteboard.events.on("maxScrollPage", setMaxPage);
    const stopListenUserScroll = whiteboard.events.on("userScroll", () => setShowPage(true));
    return () => {
      stopListenPage();
      stopListenMaxPage();
      stopListenUserScroll();
    };
  }, [whiteboard]);

  // 挂载白板
  const bindWhiteboard = useCallback(
    (ref: HTMLDivElement | null) => {
      ref && whiteboard.render(ref);
    },
    [whiteboard],
  );

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
          {/* 显示举手按钮：不是创建者 && 可发言  */}
          {!whiteboardStore.isCreator &&
            classRoomStore.users.currentUser &&
            !classRoomStore.users.currentUser.isSpeak && (
              <div className="raise-hand-container">
                <RaiseHand
                  disableHandRaising={disableHandRaising}
                  isRaiseHand={classRoomStore.users.currentUser?.isRaiseHand}
                  onRaiseHandChange={classRoomStore.onToggleHandRaising}
                />
              </div>
            )}
          <div ref={bindWhiteboard} className="whiteboard" />
          <div
            className={classNames("whiteboard-scroll-page", {
              "is-active": showPage,
            })}
          >
            {renderScrollPage(t, page, maxPage)}
          </div>
        </div>
      )}
    </>
  );
});

function renderScrollPage(t: FlintI18nTFunction, page: number, maxPage: number): string {
  if (page === 0) {
    return t("scroll.first-page");
  } else if (page >= maxPage) {
    return t("scroll.last-page");
  } else {
    return t("scroll.page", { page: ((((page + 1) * 10) | 0) / 10).toFixed(1) });
  }
}

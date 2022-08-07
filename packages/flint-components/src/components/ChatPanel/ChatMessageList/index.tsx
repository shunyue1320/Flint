import React, { useEffect, useRef, useState } from "react";
import { useUpdate } from "react-use";
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  Index,
  InfiniteLoader,
  InfiniteLoaderProps,
  List,
  ListRowRenderer,
} from "react-virtualized";
import { Observer } from "mobx-react-lite";

import { ChatMessage } from "../ChatMessage";
import { ChatMsg } from "../types";
import { User } from "../../../types/user";

export interface ChatMessageListProps {
  visible: boolean;
  userUUID: string;
  messages: ChatMsg[];
  getUserByUUID: (uuid: string) => User | undefined;
  loadMoreRows: InfiniteLoaderProps["loadMoreRows"];
  openCloudStorage: () => void;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  visible,
  userUUID,
  messages,
  getUserByUUID,
  loadMoreRows,
  openCloudStorage,
}) => {
  const forceUpdate = useUpdate();
  // 列表的长度
  const [scrollToIndex, setScrollToIndex] = useState<number | undefined>(messages.length - 1);

  useEffect(() => {
    // 当选项卡面板可见时，滚动条到最底下
    if (visible) {
      cellCache.clearAll();
      forceUpdate();
      setScrollToIndex(messages.length - 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const [cellCache] = useState(
    () =>
      new CellMeasurerCache({
        defaultHeight: 72,
        fixedWidth: true,
        keyMapper: index => messages[index].uuid,
      }),
  );

  const isFirstLoadRef = useRef(true);

  const isRowLoaded = ({ index }: Index): boolean => {
    // 滚动到顶部时加载更多
    const loaded = index > 0;
    if (isFirstLoadRef.current) {
      // 跳过额外的第一次加载
      isFirstLoadRef.current = false;
      return true;
    }
    return loaded;
  };

  const rowRenderer: ListRowRenderer = ({ index, parent, style }) => (
    <CellMeasurer
      key={messages[index].uuid}
      cache={cellCache}
      columnIndex={0}
      parent={parent}
      rowIndex={index}
    >
      {({ measure, registerChild }) => {
        return (
          <div ref={el => el && registerChild && registerChild(el)} style={style}>
            <Observer>
              {() => (
                <ChatMessage
                  message={messages[index]}
                  messageUser={getUserByUUID(messages[index].userUUID)}
                  openCloudStorage={openCloudStorage}
                  userUUID={userUUID}
                  onMount={measure}
                />
              )}
            </Observer>
          </div>
        );
      }}
    </CellMeasurer>
  );

  return (
    <InfiniteLoader
      isRowLoaded={isRowLoaded}
      loadMoreRows={loadMoreRows}
      rowCount={messages.length}
      threshold={1}
    >
      {({ onRowsRendered, registerChild }) => (
        <AutoSizer>
          {({ height, width }) => (
            <Observer>
              {() => (
                <List
                  ref={registerChild}
                  className="fancy-scrollbar"
                  height={height}
                  rowCount={messages.length}
                  rowHeight={cellCache.rowHeight}
                  rowRenderer={rowRenderer}
                  scrollToAlignment="start"
                  scrollToIndex={scrollToIndex}
                  width={width}
                  onRowsRendered={onRowsRendered}
                />
              )}
            </Observer>
          )}
        </AutoSizer>
      )}
    </InfiniteLoader>
  );
};

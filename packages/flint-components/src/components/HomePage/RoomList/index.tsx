import "./style.less";

import React, { PropsWithChildren, ReactElement, useMemo } from "react";
import { Dropdown, Menu } from "antd";
import { SVGDown } from "../../FlatIcons";

export * from "./RoomListItem";
export * from "./RoomListAllLoaded";

export interface RoomListProps<T extends string> {
  title?: string;
  filters?: Array<{
    title: string;
    key: T;
  }>;
  activeTab?: T;
  onTabActive?: (key: T) => void;
  style?: React.CSSProperties;
}

export const RoomList = <T extends string>({
  title,
  filters,
  activeTab,
  onTabActive,
  children,
  style,
}: PropsWithChildren<RoomListProps<T>>): ReactElement => {
  const activeTabTitle = useMemo(
    () => filters?.find(tab => tab.key === activeTab)?.title,
    [filters, activeTab],
  );

  return (
    <div className="room-list" style={style}>
      <div className="room-list-header">
        <h1 className="room-list-title">{title}</h1>
        {filters && (
          <Dropdown
            overlay={
              <Menu
                items={filters.map(({ title, key }) => ({
                  key,
                  label: title,
                  onClick: () => onTabActive?.(key),
                }))}
              />
            }
          >
            <span className="room-list-filters">
              {activeTabTitle}
              <SVGDown height={24} width={24} />
            </span>
          </Dropdown>
        )}
      </div>
      <div className="room-list-body fancy-scrollbar">{children}</div>
    </div>
  );
};

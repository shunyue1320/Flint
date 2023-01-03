import React, { PropsWithChildren, ReactElement } from "react";
import { Dropdown, Menu, Button } from "antd";

import { SVGMore } from "../../../FlatIcons";
import { RoomListItemAction } from "./types";

export interface RoomListItemMenusProps<TKey extends string = string> {
  actions: Array<RoomListItemAction<TKey>>;
  onAction: (key: TKey) => void;
}

export const RoomListItemMenus = <TKey extends string = string>({
  actions,
  onAction,
}: PropsWithChildren<RoomListItemMenusProps<TKey>>): ReactElement => {
  return (
    <Dropdown
      overlay={
        <Menu
          items={actions.map(action => ({
            key: action.key,
            label: action.text,
            onClick: () => onAction(action.key),
          }))}
        />
      }
      overlayClassName="room-list-item-sub-menu"
      trigger={["click"]}
    >
      <Button className="room-list-item-more" type="text">
        <SVGMore />
      </Button>
    </Dropdown>
  );
};

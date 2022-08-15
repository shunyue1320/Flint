import "./style.less";

import React from "react";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { AutoSizer, List, ListRowRenderer, Size } from "react-virtualized";

import { ChatUser, ChatUserProps } from "../ChatUser";
import { User } from "../../../types/user";

export type ChatUsersProps = {
  isCreator: boolean;
  hasHandRaising: boolean;
  isShowAllOfStage?: boolean;
  hasSpeaking: boolean;
  users: User[];
  onAllOffStage: () => void;
} & Omit<ChatUserProps, "user">;

export const ChatUsers: React.FC<ChatUsersProps> = ({
  isShowAllOfStage,
  hasSpeaking,
  users,
  onAllOffStage,
  ...restProps
}) => {
  const { t } = useTranslation();

  // 每一列表行渲染器
  const rowRenderer: ListRowRenderer = ({ index, style }): React.ReactNode => {
    const user = users[index];

    return (
      <div key={user.userUUID} style={style}>
        <ChatUser {...restProps} user={user} />
      </div>
    );
  };

  // 一列渲染器
  const renderList = ({ height, width }: Size): React.ReactNode => {
    return (
      <List
        className="fancy-scrollbar"
        data={users}
        height={height}
        rowCount={users.length}
        rowHeight={48}
        rowRenderer={rowRenderer}
        width={width}
      />
    );
  };

  return (
    <div className={classNames("chat-users-wrap", { "has-speaking": hasSpeaking })}>
      {isShowAllOfStage && (
        <div className="chat-users-cancel-hands-wrap">
          <button className="chat-users-cancel-hands" onClick={onAllOffStage}>
            {t("all-off-stage")}
          </button>
        </div>
      )}

      <div className={classNames("chat-users", { "with-cancel-hands": isShowAllOfStage })}>
        <AutoSizer>{renderList}</AutoSizer>
      </div>
    </div>
  );
};

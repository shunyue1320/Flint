import "./style.less";

import React from "react";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

import { ChatUserProps } from "../ChatUser";
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

  return (
    <div className={classNames("chat-users-wrap", { "has-speaking": hasSpeaking })}>
      <div>用户列表</div>
    </div>
  );
};

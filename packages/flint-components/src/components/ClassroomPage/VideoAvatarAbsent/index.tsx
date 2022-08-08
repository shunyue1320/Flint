import "./style.less";

import placeholderSVG from "./icons/placeholder.svg";

import React from "react";
import classnames from "classnames";
import { useTranslation } from "react-i18next";

export interface VideoAvatarAbsentProps {
  small?: boolean;
  isAvatarUserCreator: boolean;
}

export const VideoAvatarAbsent: React.FC<VideoAvatarAbsentProps> = ({
  small,
  isAvatarUserCreator,
}) => {
  const { t } = useTranslation();

  return (
    <div className={classnames("video-avatar-absent", { "is-small": small })}>
      <img className="video-avatar-absent-img" draggable={false} src={placeholderSVG} />
      <span className="video-avatar-absent-content">
        {t(`${isAvatarUserCreator ? "teacher" : "student"}-left-temporarily`)}
      </span>
    </div>
  );
};

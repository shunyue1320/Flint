import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { SVGUserInvite, TopBarRightBtn } from "@netless/flint-components";
import { RoomItem } from "../stores/room-store";
import { InviteModal } from "./Modal/InviteModal";

export interface InviteButtonProps {
  roomInfo?: RoomItem;
}

export const InviteButton: React.FC<InviteButtonProps> = ({ roomInfo }) => {
  const { t } = useTranslation();
  const [isShowInviteModal, showInviteModal] = useState(false);
  const hideInviteModal = (): void => showInviteModal(false);

  return (
    <div>
      <TopBarRightBtn
        icon={<SVGUserInvite />}
        title={t("invitation")}
        onClick={() => showInviteModal(true)}
      />
      {/* 点击邀请按钮的弹窗 */}
      {roomInfo && (
        <InviteModal
          room={roomInfo}
          visible={isShowInviteModal}
          onCancel={hideInviteModal}
          onCopied={hideInviteModal}
        />
      )}
    </div>
  );
};

export default InviteButton;

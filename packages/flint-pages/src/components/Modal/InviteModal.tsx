import React, { useCallback, useContext } from "react";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { InviteModal as InviteModalImpl } from "@netless/flint-components";

import { RoomItem } from "../../stores/room-store";
import { FLAT_WEB_BASE_URL } from "../../constants/process";
import { GlobalStoreContext, RoomStoreContext } from "../StoreProvider";
import { message } from "antd";

export interface InviteModalProps {
  visible: boolean;
  room: RoomItem;
  // 在复制之后执行
  onCopied: () => void;
  onCancel: () => void;
}

export const InviteModal = observer<InviteModalProps>(function InviteModal({
  visible,
  room,
  onCopied,
  onCancel,
}) {
  const { t } = useTranslation();
  const globalStore = useContext(GlobalStoreContext);
  const roomStore = useContext(RoomStoreContext);

  const { periodicUUID } = room;
  const periodicInfo = periodicUUID ? roomStore.periodicRooms.get(periodicUUID) : undefined;

  const onCopy = useCallback(
    async (text: string): Promise<void> => {
      await navigator.clipboard.writeText(text);
      void message.success(t("copy-success"));
      onCopied();
    },
    [onCopied, t],
  );

  return (
    <InviteModalImpl
      baseUrl={FLAT_WEB_BASE_URL}
      periodicWeeks={periodicInfo?.periodic.weeks}
      room={room}
      userName={globalStore.userName ?? ""}
      visible={visible}
      onCancel={onCancel}
      onCopy={onCopy}
    />
  );
});

import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { InviteModal as InviteModalImpl } from "flint-components";
import { RoomItem } from "../../stores/room-store";
import { FLAT_WEB_BASE_URL } from "../../constants/process";

export interface InviteModalProps {
  visible: boolean;
  room: RoomItem;
  // after copy is performed
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

  return <InviteModalImpl baseUrl={FLAT_WEB_BASE_URL} />;
});

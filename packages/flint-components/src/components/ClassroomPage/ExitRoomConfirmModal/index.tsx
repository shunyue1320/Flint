import React, { FC } from "react";
import { Modal } from "antd";
import { useTranslation } from "react-i18next";

export interface StopClassConfirmModalProps {
  visible: boolean;
  loading: boolean;
  onStop: () => void;
  onCancel: () => void;
}

// 当房间创建者按下“停止类”按钮时。
export const StopClassConfirmModal: FC<StopClassConfirmModalProps> = ({
  visible,
  loading,
  onStop,
  onCancel,
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      okButtonProps={{ loading }}
      open={visible}
      title={t("confirmation-of-the-end-of-classes")}
      onCancel={onCancel}
      onOk={onStop}
    >
      <p>{t("end-of-class-tips")}</p>
    </Modal>
  );
};

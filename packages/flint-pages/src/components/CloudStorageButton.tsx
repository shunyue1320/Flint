import React, { useCallback } from "react";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { SVGCloudOutlined, TopBarRightBtn } from "flint-components";
import { Modal } from "antd";

import { ClassRoomStore } from "../stores/class-room-store";
import { CloudStoragePanel } from "../pages/CloudStoragePage/CloudStoragePanel";

interface CloudStorageButtonProps {
  classroom: ClassRoomStore;
}

export const CloudStorageButton = observer<CloudStorageButtonProps>(function CloudStorageButton({
  classroom,
}) {
  const { t } = useTranslation();
  const showModal = () => {};
  const hideModal = () => {};

  if (!classroom.whiteboardStore.isWritable) {
    return null;
  }

  return (
    <>
      <TopBarRightBtn icon={<SVGCloudOutlined />} title={t("cloud-storage")} onClick={showModal} />
      <Modal
        centered
        destroyOnClose
        className="cloud-storage-button-modal"
        footer={[]}
        title={t("my-cloud ")}
        visible={classroom.isCloudStoragePanelVisible}
        onCancel={hideModal}
      >
        <CloudStoragePanel
          cloudStorage={classroom.whiteboardStore.cloudStorageStore}
          onCoursewareInserted={hideModal}
        />
      </Modal>
    </>
  );
});

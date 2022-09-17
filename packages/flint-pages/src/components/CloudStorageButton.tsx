import React, { useCallback } from "react";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { SVGCloudOutlined, TopBarRightBtn } from "@netless/flint-components";
import { Modal } from "antd";

import { ClassroomStore } from "@netless/flint-stores";
import { CloudStoragePanel } from "../CloudStoragePage/CloudStoragePanel";

interface CloudStorageButtonProps {
  classroom: ClassroomStore;
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

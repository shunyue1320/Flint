import "./CreateRoomBox.less";

import React, { useState } from "react";
import { Button, Modal } from "antd";
import { useTranslation } from "react-i18next";

import { HomePageHeroButton } from "flint-components";

export const CreateRoomBox: React.FC = () => {
  const { t } = useTranslation();
  const [isShowModal, showModal] = useState(false);

  return (
    <>
      <HomePageHeroButton
        type="begin"
        onClick={() => {
          showModal(true);
        }}
      />
      <Modal
        destroyOnClose
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            {t("cancel")}
          </Button>,
          <Button key="submit" type="primary" onClick={handleOk}>
            {t("begin")}
          </Button>,
        ]}
        title={t("home-page-hero-button-type.begin")}
        visible={isShowModal}
        width={400}
        wrapClassName="create-room-box-container"
        onCancel={handleCancel}
        onOk={handleOk}
      ></Modal>
    </>
  );

  function handleOk(): void {
    console.log("handleOk");
  }

  function handleCancel(): void {
    showModal(false);
  }
};

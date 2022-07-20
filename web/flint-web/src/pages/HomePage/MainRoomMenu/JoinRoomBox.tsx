import "./JoinRoomBox.less";

import React, { useState } from "react";
import { Form, Modal } from "antd";
import { validate, version } from "uuid";
import { useTranslation } from "react-i18next";
import { HomePageHeroButton } from "flint-components";

interface JoinRoomFormValues {
  roomUUID: string;
  autoCameraOn: boolean;
  autoMicOn: boolean;
}

const uuidRE =
  /(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)/i;

export interface JoinRoomBoxProps {
  onJoinRoom: (roomUUID: string) => Promise<void>;
}

export const JoinRoomBox: React.FC<JoinRoomBoxProps> = () => {
  const { t } = useTranslation();

  const [form] = Form.useForm<JoinRoomFormValues>();
  const [isFormValidated, setIsFormValidated] = useState(false);
  const [isShowModal, showModal] = useState(false);

  return (
    <>
      <HomePageHeroButton type="join" onClick={handleShowModal} />
      <Modal
        cancelText={t("cancel")}
        okText={t("join")}
        title={t("home-page-hero-button-type.join")}
        visible={isShowModal}
        width={400}
        wrapClassName="join-room-box-container"
        onCancel={handleCancel}
        onOk={handleOk}
      ></Modal>
    </>
  );

  async function handleShowModal(): Promise<void> {
    console.log("1111");
    try {
      const roomUUID = await extractUUIDFromClipboard();
      if (roomUUID && validate(roomUUID) && version(roomUUID) === 4) {
        form.setFieldsValue({ roomUUID });
        setIsFormValidated(true);
      }
    } catch {
      // ignore
    }
    showModal(true);
  }

  async function extractUUIDFromClipboard(): Promise<string | undefined> {
    const text = await navigator.clipboard.readText();
    const m = uuidRE.exec(text);
    return m?.[0];
  }

  function handleCancel(): void {
    showModal(false);
  }

  function handleOk(): void {
    console.log("handleOk =》");
  }
};

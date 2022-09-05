import "./JoinRoomBox.less";

import React, { useState, useContext, useRef, useEffect } from "react";
import { Form, Input, Modal, Button, InputRef, Checkbox } from "antd";
import { validate, version } from "uuid";
import { useTranslation } from "react-i18next";
import { HomePageHeroButton } from "flint-components";

import { useSafePromise } from "../../../utils/hooks/lifecycle";
import { ConfigStoreContext } from "../../../components/StoreProvider";

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

export const JoinRoomBox: React.FC<JoinRoomBoxProps> = ({ onJoinRoom }) => {
  const { t } = useTranslation();
  const sp = useSafePromise();
  const configStore = useContext(ConfigStoreContext);
  const [form] = Form.useForm<JoinRoomFormValues>();
  const roomTitleInputRef = useRef<InputRef>(null);

  const [isFormValidated, setIsFormValidated] = useState(false);
  const [isShowModal, showModal] = useState(false);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    let ticket = NaN;
    if (isShowModal) {
      ticket = window.setTimeout(() => {
        if (roomTitleInputRef.current) {
          roomTitleInputRef.current.focus();
          roomTitleInputRef.current.select();
        }
      }, 0);
    }

    return () => {
      window.clearTimeout(ticket);
    };
  }, [isShowModal]);

  const defaultValues: JoinRoomFormValues = {
    roomUUID: "",
    autoCameraOn: configStore.autoCameraOn,
    autoMicOn: configStore.autoMicOn,
  };

  return (
    <>
      <HomePageHeroButton type="join" onClick={handleShowModal} />
      <Modal
        cancelText={t("cancel")}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            {t("cancel")}
          </Button>,
          <Button
            key="submit"
            disabled={!isFormValidated}
            loading={isLoading}
            type="primary"
            onClick={handleOk}
          >
            {t("join")}
          </Button>,
        ]}
        okText={t("join")}
        title={t("home-page-hero-button-type.join")}
        visible={isShowModal}
        width={400}
        wrapClassName="join-room-box-container"
        onCancel={handleCancel}
        onOk={handleOk}
      >
        <Form
          className="main-room-menu-form"
          form={form}
          initialValues={defaultValues}
          layout="vertical"
          name="createRoom"
          onFieldsChange={formValidateStatus}
        >
          <Form.Item
            label={t("room-uuid")}
            name="roomUUID"
            rules={[{ required: true, message: t("enter-room-uuid") }]}
          >
            <Input ref={roomTitleInputRef} placeholder={t("enter-room-uuid")} />
          </Form.Item>

          <Form.Item label={t("join-options")}>
            <Form.Item noStyle name="autoMicOn" valuePropName="checked">
              <Checkbox>{t("turn-on-the-microphone")}</Checkbox>
            </Form.Item>
            <Form.Item noStyle name="autoCameraOn" valuePropName="checked">
              <Checkbox>{t("turn-on-the-camera")}</Checkbox>
            </Form.Item>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );

  async function handleShowModal(): Promise<void> {
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

  async function handleOk(): Promise<void> {
    try {
      await sp(form.validateFields());
    } catch (e) {
      // errors are displayed on the form
      return;
    }

    setLoading(true);

    try {
      // 持久化缓存 麦克风 摄像头 状态个性化设置
      const values = form.getFieldsValue();
      configStore.updateAutoMicOn(values.autoMicOn);
      configStore.updateAutoCameraOn(values.autoCameraOn);
      await sp(onJoinRoom(values.roomUUID));
      showModal(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function formValidateStatus(): void {
    setIsFormValidated(form.getFieldsError().every(field => field.errors.length <= 0));
  }
};

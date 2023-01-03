import "./CreateRoomBox.less";

import React, { useState, useContext, useRef, Fragment } from "react";
import { Button, Modal, Form, Input, InputRef, Dropdown, Menu, Checkbox } from "antd";
import { useTranslation } from "react-i18next";

import {
  ClassPicker,
  HomePageHeroButton,
  Region,
  regions,
  RegionSVG,
} from "@netless/flint-components";
import { RoomType } from "@netless/flint-server-api";
import { PreferencesStoreContext, GlobalStoreContext } from "../../components/StoreProvider";
import { useSafePromise } from "../../utils/hooks/lifecycle";

interface CreateRoomFormValues {
  roomTitle: string;
  roomType: RoomType;
  autoCameraOn: boolean;
}

export interface CreateRoomBoxProps {
  onCreateRoom: (title: string, type: RoomType, region: Region) => Promise<void>;
}

export const CreateRoomBox: React.FC<CreateRoomBoxProps> = ({ onCreateRoom }) => {
  const { t } = useTranslation();
  const sp = useSafePromise();
  const globalStore = useContext(GlobalStoreContext);
  const preferencesStore = useContext(PreferencesStoreContext);
  const [form] = Form.useForm<CreateRoomFormValues>();

  const [isFormValidated, setIsFormValidated] = useState(false);
  const [isShowModal, showModal] = useState(false);
  const roomTitleInputRef = useRef<InputRef>(null);
  const [roomRegion, setRoomRegion] = useState<Region>(preferencesStore.getRegion());
  const [classType, setClassType] = useState<RoomType>(RoomType.BigClass);
  const [isLoading, setLoading] = useState(false);

  const defaultValues: CreateRoomFormValues = {
    roomTitle: globalStore.userInfo?.name
      ? t("create-room-default-title", { name: globalStore.userInfo.name })
      : "",
    roomType: RoomType.BigClass,
    autoCameraOn: preferencesStore.autoCameraOn,
  };

  const regionMenu = (
    <Menu
      className="create-room-modal-menu-item"
      items={regions.map(region => ({
        key: region,
        label: (
          <Fragment>
            <img alt={region} src={RegionSVG[region]} style={{ width: 22 }} />
            <span style={{ paddingLeft: 8 }}>{t(`region-${region}`)}</span>
          </Fragment>
        ),
      }))}
      style={{ width: "auto" }}
      onClick={e => setRoomRegion(e.key as Region)}
    />
  );

  return (
    <>
      <HomePageHeroButton
        type="begin"
        onClick={() => {
          form.setFieldsValue(defaultValues);
          showModal(true);
          formValidateStatus();
        }}
      />
      <Modal
        destroyOnClose
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
            {t("begin")}
          </Button>,
        ]}
        open={isShowModal}
        title={t("home-page-hero-button-type.begin")}
        width={400}
        wrapClassName="create-room-box-container"
        onCancel={handleCancel}
        onOk={handleOk}
      >
        <Form
          className="main-room-menu-form"
          form={form}
          layout="vertical"
          name="createRoom"
          onFieldsChange={formValidateStatus}
        >
          <Form.Item
            label={t("theme")}
            name="roomTitle"
            rules={[
              { required: true, message: t("enter-room-theme") },
              { max: 50, message: t("theme-can-be-up-to-50-characters") },
            ]}
          >
            <Input
              ref={roomTitleInputRef}
              placeholder={t("enter-room-theme")}
              suffix={
                <Dropdown overlay={regionMenu} placement="bottomRight" trigger={["click"]}>
                  <img
                    alt={roomRegion}
                    src={RegionSVG[roomRegion]}
                    style={{ cursor: "pointer", width: 22, marginRight: 0 }}
                  />
                </Dropdown>
              }
            />
          </Form.Item>
          <Form.Item label={t("type")} name="roomType" valuePropName="type">
            <ClassPicker value={classType} onChange={e => setClassType(RoomType[e])} />
          </Form.Item>
          <Form.Item label={t("join-options")}>
            <Form.Item noStyle name="autoCameraOn" valuePropName="checked">
              <Checkbox>{t("turn-on-the-camera")}</Checkbox>
            </Form.Item>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );

  async function handleOk(): Promise<void> {
    try {
      await sp(form.validateFields());
    } catch (e) {
      // 表单上会显示错误
      return;
    }

    setLoading(true);
    try {
      const values = form.getFieldsValue();
      preferencesStore.updateAutoCameraOn(values.autoCameraOn);
      await sp(onCreateRoom(values.roomTitle, values.roomType, roomRegion));
      showModal(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handleCancel(): void {
    showModal(false);
  }

  function formValidateStatus(): void {
    setIsFormValidated(form.getFieldsError().every(field => field.errors.length <= 0));
  }
};

export default CreateRoomBox;

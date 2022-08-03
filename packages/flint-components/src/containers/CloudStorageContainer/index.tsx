import "./style.less";

import React from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { Button, Dropdown, Menu } from "antd";
import { FormOutlined } from "@ant-design/icons";

import { CloudStorageStore } from "./store";

export * from "./store";

export interface CloudStorageContainerProps {
  /** CloudStorage MobX store */
  store: CloudStorageStore;
}

export const CloudStorageContainer: React.FC<CloudStorageContainerProps> = ({ store }) => {
  const { t } = useTranslation();
  // const [isH5PanelVisible, setH5PanelVisible] = useState(false);

  // const handleMenuClick = useCallback(({ key }: { key: string }) => {
  //   if (key === "h5") {
  //     setH5PanelVisible(true);
  //   }
  // }, []);

  const containerBtns = (
    <div className="cloud-storage-container-btns">
      <Button danger disabled={store.selectedFileUUIDs.length <= 0} onClick={store.onBatchDelete}>
        {t("delete")}
      </Button>
      <Dropdown.Button
        overlay={
          <Menu onClick={handleMenuClick}>
            <Menu.Item key="h5" icon={<FormOutlined />}>
              {t("online-h5.add")}
            </Menu.Item>
          </Menu>
        }
        type="primary"
        onClick={store.onUpload}
      >
        {t("upload")}
      </Dropdown.Button>
    </div>
  );

  return (
    <div className="cloud-storage-container" onDragOver={onDragOver} onDrop={onDrop}>
      {!store.compact && (
        <div className="cloud-storage-container-head">
          <div>
            <h1 className="cloud-storage-container-title">{t("my-cloud ")}</h1>
            <small
              className={classNames("cloud-storage-container-subtitle", {
                "is-hide": !store.totalUsage,
              })}
            >
              {store.totalUsageHR ? t("used-storage", { usage: store.totalUsageHR }) : "-"}
            </small>
          </div>
          {containerBtns}
        </div>
      )}
    </div>
  );
};

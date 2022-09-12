import React, { useEffect } from "react";
import { CloudStorageContainer } from "@netless/flint-components";

import { CloudStorageStore } from "./store";

export interface CloudStoragePanelProps {
  cloudStorage: CloudStorageStore;
  onCoursewareInserted?: () => void;
}

export const CloudStoragePanel: React.FC = ({ cloudStorage, onCoursewareInserted }) => {
  useEffect(
    () => cloudStorage.initialize({ onCoursewareInserted }),
    [cloudStorage, onCoursewareInserted],
  );

  return <CloudStorageContainer store={cloudStorage} />;
};

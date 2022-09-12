import { useCallback, useState } from "react";

import { RoomStatus } from "../api-middleware/flatServer/constants";
import { useSafePromise } from "../utils/hooks/lifecycle";
import { RouteNameType, usePushNavigate } from "../utils/routes";
import { errorTips } from "@netless/flint-components";

export enum ExitRoomConfirmType {
  StopClassButton,
  ExitButton,
}

export interface ExitRoomConfirmProps {
  isCreator: boolean;
  confirmType: ExitRoomConfirmType;
  visible: boolean;
  isReturnLoading: boolean;
  isStopLoading: boolean;
  onReturnMain: () => Promise<void>;
  onStopClass: () => Promise<void>;
  onCancel: () => void;
  confirm: (confirmType: ExitRoomConfirmType) => void;
}

export function useExitRoomConfirmModal({
  roomStatus,
  hangClass,
  stopClass,
}: {
  roomStatus: RoomStatus;
  hangClass: () => Promise<void>;
  stopClass: () => Promise<void>;
}): Omit<ExitRoomConfirmProps, "isCreator"> {
  const [confirmType, setConfirmType] = useState(ExitRoomConfirmType.ExitButton);
  const [visible, setVisible] = useState(false);
  const [isReturnLoading, setReturnLoading] = useState(false);
  const [isStopLoading, setStopLoading] = useState(false);
  const sp = useSafePromise();
  const pushNavigate = usePushNavigate();

  const onReturnMain = useCallback(async () => {
    setReturnLoading(true);

    try {
      await sp(hangClass());
    } catch (e) {
      console.error(e);
      errorTips(e);
    } finally {
      setReturnLoading(true);
    }

    pushNavigate(RouteNameType.HomePage);
  }, [pushNavigate, hangClass, sp]);

  const onStopClass = useCallback(async () => {
    setStopLoading(true);

    try {
      await sp(stopClass());
    } catch (e) {
      console.error(e);
      errorTips(e);
    } finally {
      setStopLoading(false);
    }
  }, [stopClass, sp]);

  const onCancel = useCallback(() => {
    setVisible(false);
  }, []);

  const confirm = useCallback(
    (confirmType: ExitRoomConfirmType) => {
      if (roomStatus === RoomStatus.Started || roomStatus === RoomStatus.Paused) {
        setVisible(true);
        setConfirmType(confirmType);
      } else {
        void onReturnMain();
      }
    },
    [onReturnMain, roomStatus],
  );

  return {
    isStopLoading,
    confirmType,
    isReturnLoading,
    visible,
    confirm,
    onReturnMain,
    onStopClass,
    onCancel,
  };
}

import { WindowsSystemBtnItem } from "@netless/flint-components";

export interface WindowsBtnContextInterface {
  showWindowsBtn: boolean;
  onClickWindowsSystemBtn: (winSystemBtn: WindowsSystemBtnItem) => void;
  clickWindowMaximize: () => void;
  sendWindowWillCloseEvent: (callback: () => void) => void;
  removeWindowWillCloseEvent: () => void;
  openExternalBrowser: (url: string) => void;
}

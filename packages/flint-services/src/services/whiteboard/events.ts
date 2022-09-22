import { Remitter } from "remitter";

/** 白板服务被踢出的原因 */
export type IServiceWhiteboardKickedReason =
  | "kickedByAdmin"
  | "roomDeleted"
  | "roomBanned"
  | "unknown";

/** 白板服务事件数据 */
export interface IServiceWhiteboardEventData {
  kicked: IServiceWhiteboardKickedReason;
  exportAnnotations: void;
  insertPresets: void;
  scrollPage: number;
  maxScrollPage: number;
  userScroll: void;
}

export type IServiceWhiteboardEvents = Remitter<IServiceWhiteboardEventData>;

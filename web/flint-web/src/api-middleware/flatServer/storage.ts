import { Region } from "@netless/flint-components";
import { FileConvertStep } from "./constants";

enum FileResourceType {
  WhiteboardConvert = "WhiteboardConvert",
  LocalCourseware = "LocalCourseware",
  OnlineCourseware = "OnlineCourseware",
  NormalResources = "NormalResources",
  WhiteboardProjector = "WhiteboardProjector",
}

export type ResourceType = `${FileResourceType}`;

export interface CloudFile {
  fileUUID: string;
  fileName: string;
  fileSize: number;
  fileURL: string;
  convertStep: FileConvertStep;
  /** 课件转换状态查询 */
  taskUUID: string;
  taskToken: string;
  createAt: Date;
  region: Region;
  /** 在线课件 */
  external: boolean;
  resourceType: ResourceType;
}

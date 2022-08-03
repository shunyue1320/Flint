export type CloudStorageConvertStatusType = "idle" | "error" | "converting" | "success";
export type CloudStorageUploadStatusType = "idle" | "error" | "uploading" | "success";

export interface CloudStorageFile {
  fileUUID: string;
  fileName: string;
  fileSize: number;
  convert: CloudStorageConvertStatusType;
  createAt: Date;
}

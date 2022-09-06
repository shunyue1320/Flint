import { IService } from "../typing";

export type IServiceFileCatalog = {};

export interface CloudFile {
  fileUUID: string;
  fileName: string;
  fileSize: number;
  fileURL: string;
  // convertStep: FileConvertStep;
  /** 课件 UUID */
  taskUUID: string;
  /** 课件转换状态查询 */
  taskToken: string;
  createAt: Date;
  // region: Region;
  /** 在线课件 */
  external: boolean;
  // resourceType: ResourceType;
}

export interface IServiceFile extends IService {
  insert(file: CloudFile): Promise<void>;
  preview(file: CloudFile): Promise<void>;
}

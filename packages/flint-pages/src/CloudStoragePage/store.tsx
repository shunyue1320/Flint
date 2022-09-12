import {
  CloudStorageFile as CloudStorageFileUI,
  CloudStorageStore as CloudStorageStoreBase,
} from "@netless/flint-components";
import { i18n } from "i18next";

import { CloudFile } from "../../api-middleware/flatServer/storage";

export type CloudStorageFile = CloudStorageFileUI &
  Pick<CloudFile, "fileURL" | "taskUUID" | "taskToken" | "region" | "external" | "resourceType">;

export class CloudStorageStore extends CloudStorageStoreBase {
  public insertCourseware: (file: CloudStorageFile) => void;
  private i18n: i18n;

  public constructor({
    compact,
    insertCourseware,
    i18n,
  }: {
    compact: boolean;
    insertCourseware: (file: CloudStorageFile) => void;
    i18n: i18n;
  }) {
    super();

    this.insertCourseware = insertCourseware;
    this.compact = compact;
    this.i18n = i18n;
  }
}

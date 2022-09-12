import { message } from "antd";
import { isServerRequestError } from "@netless/flint-server-api";
import { FlintI18n } from "@netless/flint-i18n";

export const errorTips = (e: unknown): void => {
  if (process.env.NODE_ENV === "development") {
    console.error(e);
  }

  if (isServerRequestError(e)) {
    void message.error({
      content: FlintI18n.t(e.errorMessage),
      key: e.errorMessage,
    });
  } else {
    const { message: content, message: key } = e as Error;
    void message.error({ content, key });
  }
};

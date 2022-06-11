import { message } from "antd";
import { NODE_ENV } from "../../constants/process";
import { ServerRequestError } from "../../utils/error/server-request-error";

export const errorTips = (e: unknown): void => {
  if (NODE_ENV === "development") {
    console.error(e);
  }

  if (e instanceof ServerRequestError) {
    void message.error({
      content: e.errorMessage,
      key: e.errorMessage,
    });
  } else {
    const { message: content, message: key } = e as Error;
    void message.error({ content, key });
  }
};

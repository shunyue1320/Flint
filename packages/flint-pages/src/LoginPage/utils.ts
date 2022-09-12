import { LoginProcessResult } from "@netless/flint-server-api";

export type LoginDisposer = () => void;

export type LoginExecutor = (
  onSuccess: (successResult: LoginProcessResult) => void,
) => LoginDisposer;

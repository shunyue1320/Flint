import Axios, { AxiosRequestConfig } from "axios";
import { FLAT_SERVER_VERSIONS, Status } from "./constants";
import { RequestErrorCode } from "../../constants/error-code";
import { ServerRequestError } from "../../utils/error/server-request-error";
import { globalStore } from "../../stores/GlobalStore";

// 数据返回格式
export type FlatServerResponse<T> =
  | { status: Status.Success; data: T }
  | { status: Status.Failed; code: RequestErrorCode };

export async function post<Payload, Result>(
  action: string,
  payload: Payload,
  params?: AxiosRequestConfig["params"],
  token?: string,
): Promise<Result> {
  const config: AxiosRequestConfig = { params };

  const Authorization = token || globalStore.userInfo?.token;
  if (!Authorization) {
    throw new ServerRequestError(RequestErrorCode.NeedLoginAgain);
  }

  config.headers = {
    Authorization: "Bearer " + Authorization,
  };

  const { data: res } = await Axios.post<FlatServerResponse<Result>>(
    `${FLAT_SERVER_VERSIONS.V1}/${action}`,
    payload,
    config,
  );

  if (res.status !== Status.Success) {
    throw new ServerRequestError(res.code);
  }

  return res.data;
}

export async function postNotAuth<Payload, Result>(
  action: string,
  payload: Payload,
  params?: AxiosRequestConfig["params"],
): Promise<Result> {
  const config: AxiosRequestConfig = {
    params,
  };

  const { data: res } = await Axios.post<FlatServerResponse<Result>>(
    `${FLAT_SERVER_VERSIONS.V1}/${action}`,
    payload,
    config,
  );

  if (res.status !== Status.Success) {
    throw new ServerRequestError(res.code);
  }

  return res.data;
}

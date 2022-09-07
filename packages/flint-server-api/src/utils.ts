import { FLAT_SERVER_BASE_URL_V1, Status } from "./constants";
// import { RequestErrorCode } from "../constants/error-code";
// import { ServerRequestError } from "../../utils/error/server-request-error";
// import { globalStore } from "../../stores/GlobalStore";
import { RequestErrorCode, ServerRequestError } from "./error";

let authToken = /* @__PURE__*/ localStorage.getItem("FlintAuthToken");

// 数据返回格式
export type FlintServerResponse<T> =
  | { status: Status.Success; data: T }
  | { status: Status.Process; data: T };

export type FlintServerRawResponseData<T> =
  | FlintServerResponse<T>
  | {
    status: Status.Failed;
    code: RequestErrorCode;
  };

export function setFlatAuthToken(token: string): void {
  authToken = token;
  localStorage.setItem("FlintAuthToken", token);
}

export async function requestFlatServer<Payload, TResult>(
  action: string,
  payload: Payload,
  init?: Partial<RequestInit>,
  token: string | null = authToken,
): Promise<FlintServerResponse<TResult>> {
  const headers = new Headers(init?.headers);
  headers.set("accept", "application/json, text/plain, */*");
  const config: RequestInit = { method: "POST", ...init, headers };

  if (payload) {
    config.body = JSON.stringify(payload);
    headers.set("content-type", "application/json");
  }

  if (token) {
    headers.set("authorization", "Bearer " + token);
  }

  const response = await fetch(`${FLAT_SERVER_BASE_URL_V1}/${action}`, config);

  if (!response.ok) {
    throw new ServerRequestError(RequestErrorCode.ServerFail);
  }

  const data: FlintServerRawResponseData<TResult> = await response.json();

  if (data.status !== Status.Success && data.status !== Status.Process) {
    throw new ServerRequestError(data.code);
  }

  return data;
}

export async function post<TPayload, TResult>(
  action: string,
  payload?: TPayload,
  init?: Partial<RequestInit>,
  token?: string,
): Promise<TResult> {
  const authorization = token || authToken;
  if (!authorization) {
    throw new ServerRequestError(RequestErrorCode.NeedLoginAgain);
  }

  const res = await requestFlatServer<TPayload, TResult>(action, payload, init, authorization);

  return res.data;
}

export async function postNotAuth<TPayload, TResult>(
  action: string,
  payload: TPayload,
  init?: Partial<RequestInit>,
): Promise<TResult> {
  const res = await requestFlatServer<TPayload, TResult>(action, payload, init, "");

  return res.data;
}

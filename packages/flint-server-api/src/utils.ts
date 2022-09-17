import { FLAT_SERVER_BASE_URL_V1, FLAT_SERVER_BASE_URL_V2, Status } from "./constants";
import { RequestErrorCode, ServerRequestError } from "./error";
import { v4 as uuidv4 } from "uuid";

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

export function setFlintAuthToken(token: string): void {
  authToken = token;
  localStorage.setItem("FlintAuthToken", token);
}

export async function requestFlintServer<Payload, TResult>(
  action: string,
  payload?: Payload,
  init?: Partial<RequestInit>,
  token: string | null = authToken,
  enableFlatServerV2?: boolean,
): Promise<FlintServerResponse<TResult>> {
  const headers = new Headers(init?.headers);
  headers.set("accept", "application/json, text/plain, */*, x-session-id, x-request-id");
  const config: RequestInit = { method: "POST", ...init, headers };

  if (!sessionStorage.getItem("sessionID")) {
    sessionStorage.setItem("sessionID", uuidv4());
  }

  const sessionID = sessionStorage.getItem("sessionID");
  if (sessionID) {
    headers.set("x-session-id", sessionID);
  }
  headers.set("x-request-id", uuidv4());

  if (payload) {
    config.body = JSON.stringify(payload);
    headers.set("content-type", "application/json");
  }

  if (token) {
    headers.set("authorization", "Bearer " + token);
  }

  const response = await fetch(
    `${enableFlatServerV2 === true ? FLAT_SERVER_BASE_URL_V2 : FLAT_SERVER_BASE_URL_V1}/${action}`,
    config,
  );

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

  const res = await requestFlintServer<TPayload, TResult>(action, payload, init, authorization);

  if (process.env.NODE_ENV !== "production") {
    if (res.status !== Status.Success) {
      throw new TypeError(`[Flint API] ${action} 返回意外的处理状态：${res.status}`);
    }
  }

  return res.data;
}

export async function postV2<TPayload, TResult>(
  action: string,
  payload?: TPayload,
  init?: Partial<RequestInit>,
  token?: string,
): Promise<TResult> {
  const authorization = token || authToken;

  if (!authorization) {
    throw new ServerRequestError(RequestErrorCode.NeedLoginAgain);
  }

  const res = await requestFlintServer<TPayload, TResult>(
    action,
    payload,
    init,
    authorization,
    true,
  );

  if (process.env.NODE_ENV !== "production") {
    if (res.status !== Status.Success) {
      throw new TypeError(`[Flint API] ${action} 返回意外的处理状态：${res.status}`);
    }
  }

  return res.data;
}

export async function postNotAuth<TPayload, TResult>(
  action: string,
  payload: TPayload,
  init?: Partial<RequestInit>,
): Promise<TResult> {
  const res = await requestFlintServer<TPayload, TResult>(action, payload, init, "");

  if (process.env.NODE_ENV !== "production") {
    if (res.status !== Status.Success) {
      throw new TypeError(`[Flint API] ${action} 返回意外的处理状态：${res.status}`);
    }
  }

  return res.data;
}

export async function getNotAuth<TResult>(
  action: string,
  init?: Partial<RequestInit>,
): Promise<TResult> {
  const res = await requestFlintServer<undefined, TResult>(
    action,
    undefined,
    { ...init, method: "GET" },
    "",
  );

  if (process.env.NODE_ENV !== "production") {
    if (res.status !== Status.Success) {
      throw new TypeError(`[Flint API] ${action} 返回意外的处理状态：${res.status}`);
    }
  }

  return res.data;
}

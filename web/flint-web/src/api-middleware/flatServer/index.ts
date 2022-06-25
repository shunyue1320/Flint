import { postNotAuth, post } from "./utils";

export interface bindingPhoneSendCodePayload {
  phone: string; // +86155...
}

export type bindingPhoneSendCodeResult = {};

export async function bindingPhoneSendCode(phone: string): Promise<bindingPhoneSendCodeResult> {
  return await postNotAuth<bindingPhoneSendCodePayload, bindingPhoneSendCodeResult>(
    "user/binding/platform/phone/sendMessage ",
    {
      phone,
    },
  );
}

export interface BindingPhonePayload {
  phone: string;
  code: number;
}

export type BindingPhoneResult = {};

export async function bindingPhone(phone: string, code: number): Promise<BindingPhoneResult> {
  return await post<BindingPhonePayload, BindingPhoneResult>("user/binding/platform/phone", {
    phone,
    code,
  });
}

export interface LoginProcessResult {
  name: string;
  avatar: string;
  userUUID: string;
  token: string;
  hasPhone: boolean;
  agoraSSOLoginID?: string;
}

export interface loginProcessPayload {
  authUUID: string;
}

export async function loginProcess(authUUID: string): Promise<LoginProcessResult> {
  return await postNotAuth<loginProcessPayload, LoginProcessResult>("login/process", {
    authUUID,
  });
}

export interface LoginCheckPayload { }

export interface LoginCheckResult {
  name: string;
  avatar: string;
  userUUID: string;
  token: string;
  hasPhone: boolean;
}

export async function loginCheck(token?: string): Promise<LoginCheckResult> {
  return await post<LoginCheckPayload, LoginCheckResult>("login", {}, {}, token);
}

export interface setAuthUUIDPayload {
  authUUID: string;
}
export interface setAuthUUIDResult {
  authUUID: string;
}

export async function setAuthUUID(authUUID: string): Promise<setAuthUUIDResult> {
  return await postNotAuth<setAuthUUIDPayload, setAuthUUIDResult>("login/set-auth-uuid", {
    authUUID,
  });
}

export interface loginPhoneSendCodePayload {
  phone: string; // +86145...
}

export type LoginPhoneSendCodeResult = {};

export async function loginPhoneSendCode(phone: string): Promise<LoginPhoneSendCodeResult> {
  return await postNotAuth<loginPhoneSendCodePayload, LoginPhoneSendCodeResult>(
    "login/phone/sendMessage",
    { phone },
  );
}

export interface loginPhonePayload {
  phone: string;
  code: number;
}

export async function loginPhone(phone: string, code: number): Promise<LoginProcessResult> {
  return await postNotAuth<loginPhonePayload, LoginProcessResult>("login/phone", {
    phone,
    code,
  });
}

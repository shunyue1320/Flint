import { postNotAuth } from "./utils";

export interface LoginProcessResult {
  name: string;
  avatar: string;
  userUUID: string;
  token: string;
  hasPhone: boolean;
  agoraSSOLoginID?: string;
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

import { postNotAuth } from "./utils";

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

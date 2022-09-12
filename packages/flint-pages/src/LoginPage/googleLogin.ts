import { v4 as uuidv4 } from "uuid";
import { LoginExecutor } from "./utils";
import { GOOGLE } from "../constants/process";
import { errorTips } from "@netless/flint-components";
import { FLAT_SERVER_LOGIN, setAuthUUID, loginProcess } from "@netless/flint-server-api";

export const googleLogin: LoginExecutor = onSuccess => {
  let timer = NaN;
  const authUUID = uuidv4();

  function getGoogleURL(authUUID: string): string {
    const scopes = ["openid", "https://www.googleapis.com/auth/userinfo.profile"];
    const scope = encodeURIComponent(scopes.join(" "));
    const redirectURL = encodeURIComponent(FLAT_SERVER_LOGIN.GOOGLE_CALLBACK);
    return `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&access_type=online&scope=${scope}&client_id=${GOOGLE.CLIENT_ID}&redirect_uri=${redirectURL}&state=${authUUID}`;
  }

  void (async () => {
    try {
      await setAuthUUID(authUUID);
    } catch (err) {
      errorTips(err);
      return;
    }

    void window.open(getGoogleURL(authUUID));

    const googleLoginProcessRequest = async (): Promise<void> => {
      try {
        const data = await loginProcess(authUUID);
        if (!data.name) {
          timer = window.setTimeout(googleLoginProcessRequest, 2000);
          return;
        }

        onSuccess(data);
      } catch (err) {
        errorTips(err);
      }
    };

    void googleLoginProcessRequest();
  })();

  return () => {
    window.clearTimeout(timer);
  };
};

import { v4 as uuidv4 } from "uuid";
import { loginProcess, setAuthUUID } from "src/api-middleware/flatServer";
import { LoginExecutor } from "./utils";
import { errorTips } from "src/components/Tips/ErrorTips";
import { FLAT_SERVER_LOGIN } from "../../api-middleware/flatServer/constants";
import { GITHUB } from "../../constants/process";

export const githubLogin: LoginExecutor = onSuccess => {
  let timer = NaN;
  const authUUID = uuidv4();

  void (async () => {
    try {
      await setAuthUUID(authUUID);
    } catch (err) {
      errorTips(err);
    }

    void window.open(getGithubURL(authUUID, FLAT_SERVER_LOGIN.GITHUB_CALLBACK));

    const githubLoginProcessRequest = async (): Promise<void> => {
      try {
        const data = await loginProcess(authUUID);
        if (!data.name) {
          timer = window.setTimeout(githubLoginProcessRequest, 2000);
        }

        onSuccess(data);
      } catch (err) {
        errorTips(err);
      }
    };

    void githubLoginProcessRequest();
  })();

  return () => {
    window.clearTimeout(timer);
  };
};

export function getGithubURL(authUUID: string, redirect_uri: string): string {
  const redirectURL = encodeURIComponent(redirect_uri);
  return `https://github.com/login/oauth/authorize?client_id=${GITHUB.CLIENT_ID}&redirect_uri=${redirectURL}&state=${authUUID}`;
}
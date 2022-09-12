import { useContext, useEffect, useState } from "react";

import { GlobalStoreContext } from "../components/StoreProvider";
import { NEED_BINDING_PHONE } from "../constants/config";
import { errorTips } from "@netless/flint-components";
import { useReplaceNavigate, RouteNameType } from "./routes";
import { loginCheck } from "@netless/flint-server-api";

export function useLoginCheck(): boolean {
  const replaceNavigate = useReplaceNavigate();
  const globalStore = useContext(GlobalStoreContext);
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    let isUnMount = false;

    async function checkLogin(): Promise<boolean> {
      if (!globalStore.userInfo?.token) {
        return false;
      }

      // 已登录（距离上次登录2小时内）
      if (globalStore.lastLoginCheck) {
        if (Date.now() - globalStore.lastLoginCheck < 2 * 60 * 60 * 1000) {
          return true;
        }
      }

      // 登录2小时后通过 token 重新获取用户信息
      try {
        const result = await loginCheck();
        globalStore.updateUserInfo(result);
        globalStore.updateLastLoginCheck(Date.now());
        return NEED_BINDING_PHONE ? result.hasPhone : true;
      } catch (e) {
        globalStore.updateLastLoginCheck(null);
        console.error(e);
        errorTips(e as Error);
      }

      return false;
    }

    checkLogin().then(isLoggedIn => {
      if (!isUnMount) {
        if (isLoggedIn) {
          setIsLogin(true);
        } else {
          // 登录状态失败时跳转至登录页面
          replaceNavigate(RouteNameType.LoginPage);
        }
      }
    });

    return () => {
      isUnMount = true;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isLogin;
}

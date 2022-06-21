import React from "react";
import { useLoginCheck } from "../utils/use-login-check";

export const HomePage: React.FC = () => {
  const isLogin = useLoginCheck();

  return <div>{isLogin ? <div>HomePage</div> : "没登录"}</div>;
};

export default HomePage;

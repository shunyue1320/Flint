// import { message } from "antd";
// import { Remitter } from "remitter";

// import { FlintI18n } from "@netless/flint-i18n";
import { FlintServices } from "@netless/flint-services";

export function initFlintServices(): void {
  // const toaster = createToaster();
  // const flintI18n = FlintI18n.getInstance();

  const flintServices = FlintServices.getInstance();

  flintServices.register("videoChat", async () => {
    const { AgoraRTCWeb } = await import("@netless/flint-service-provider-agora-rtc-web");
    return new AgoraRTCWeb({ APP_ID: process.env.AGORA_APP_ID });
  });

  flintServices.register("whiteboard", async () => { });
}

// function createToaster(): Toaster {
//   const toaster: Toaster = new Remitter();
//   toaster.on("info", info => message.info(info));
//   toaster.on("error", error => message.error(error));
//   toaster.on("warn", warn => message.warn(warn));
//   return toaster;
// }

import { message } from "antd";
import { Remitter } from "remitter";
import { combine } from "value-enhancer";

import { FlintI18n } from "@netless/flint-i18n";
import { FlintServices, Toaster } from "@netless/flint-services";

import countdownSVG from "@netless/flint-pages/src/assets/image/tool-countdown.svg";

export function initFlintServices(): void {
  const toaster = createToaster();
  const flintI18n = FlintI18n.getInstance();

  const flintServices = FlintServices.getInstance();

  flintServices.register("videoChat", async () => {
    const { AgoraRTCWeb } = await import("@netless/flint-service-provider-agora-rtc-web");
    return new AgoraRTCWeb({ APP_ID: process.env.AGORA_APP_ID });
  });

  flintServices.register("textChat", async () => {
    const { AgoraRTM } = await import("@netless/flint-service-provider-agora-rtm");
    return new AgoraRTM(process.env.AGORA_APP_ID);
  });

  flintServices.register("whiteboard", async () => {
    const { Fastboard, register, stockedApps } = await import(
      "@netless/flat-service-provider-fastboard"
    );

    void register({
      kind: "Countdown",
      src: () => import("@netless/app-countdown"),
    });

    const service = new Fastboard({
      APP_ID: process.env.NETLESS_APP_IDENTIFIER,
      toaster,
      flintI18n,
      flintInfo: {
        platform: "web",
        ua: process.env.FLAT_UA,
        region: process.env.FLAT_REGION,
        version: process.env.VERSION,
      },
    });

    service.sideEffect.addDisposer(
      combine([service._app$, flintI18n.$Val.language$]).subscribe(([_app, _lang]) => {
        stockedApps.clear();
        stockedApps.push({
          kind: "Countdown",
          icon: countdownSVG,
          label: flintI18n.t("tool.countdown"),
          onClick: app => app.manager.addApp({ kind: "Countdown" }),
        });
      }),
    );

    return service;
  });
}

function createToaster(): Toaster {
  const toaster: Toaster = new Remitter();
  toaster.on("info", info => message.info(info));
  toaster.on("error", error => message.error(error));
  toaster.on("warn", warn => message.warn(warn));
  return toaster;
}

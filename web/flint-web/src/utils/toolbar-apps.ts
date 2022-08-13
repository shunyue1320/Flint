import monacoSVG from "../assets/image/tool-monaco.svg";
import geogebraSVG from "../assets/image/tool-geogebra.svg";
import countdownSVG from "../assets/image/tool-countdown.svg";
import saveSVG from "../assets/image/tool-save.svg";
import presetsSVG from "../assets/image/tool-presets.svg";

import { TFunction } from "react-i18next";
import { apps, FastboardApp } from "@netless/fastboard-react";
import { noop } from "lodash-es";

export interface refreshAppsParams {
  t: TFunction;
  onSaveAnnotation?: (app: FastboardApp) => void;
  onPresets?: (app: FastboardApp) => void;
}

export const refreshApps = ({ t, onSaveAnnotation, onPresets }: refreshAppsParams): void => {
  apps.clear();
  apps.push(
    {
      kind: "Monaco",
      icon: monacoSVG,
      label: t("tool.monaco"), // t("tool.monaco")
      onClick: app => app.manager.addApp({ kind: "Monaco" }),
    },
    {
      kind: "GeoGebra",
      icon: geogebraSVG,
      label: t("tool.geogebra"),
      onClick: app => app.manager.addApp({ kind: "GeoGebra" }),
    },
    {
      kind: "Countdown",
      icon: countdownSVG,
      label: t("tool.countdown"),
      onClick: app => app.manager.addApp({ kind: "Countdown" }),
    },
    {
      kind: "Save",
      icon: saveSVG,
      label: t("tool.save"),
      onClick: onSaveAnnotation || noop,
    },
    {
      kind: "Presets",
      icon: presetsSVG,
      label: t("tool.presets"),
      onClick: onPresets || noop,
    },
  );
};

import "./style.less";
import cnSVG from "./icons/cn.svg";
import inSVG from "./icons/in.svg";
import gbSVG from "./icons/gb.svg";
import usSVG from "./icons/us.svg";
import sgSVG from "./icons/sg.svg";

export enum Region {
  CN_HZ = "cn-hz",
  US_SV = "us-sv",
  SG = "sg",
  IN_MUM = "in-mum",
  GB_LON = "gb-lon",
}

export const regions: Region[] = [
  Region.CN_HZ,
  Region.IN_MUM,
  Region.GB_LON,
  Region.US_SV,
  Region.SG,
];

export const RegionSVG: Record<Region, string> = {
  [Region.CN_HZ]: cnSVG,
  [Region.IN_MUM]: inSVG,
  [Region.GB_LON]: gbSVG,
  [Region.US_SV]: usSVG,
  [Region.SG]: sgSVG,
};

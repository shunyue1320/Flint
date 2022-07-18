import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGPlus: React.FC<FlatIconProps> = ({ active, className = "", ...restProps }) => {
  return (
    <svg
      className={`${className} flat-icon ${active ? "is-active" : ""}`}
      fill="none"
      height="24"
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
      {...restProps}
    >
      <path
        className="flat-icon-stroke-color"
        d="M5 12h14m-7-7v14"
        stroke="#5D6066"
        strokeLinejoin="round"
        strokeWidth="1.25"
      ></path>
    </svg>
  );
};

export default SVGPlus;

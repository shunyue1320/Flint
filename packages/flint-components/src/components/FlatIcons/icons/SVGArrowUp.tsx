import "../style.less";
import React from "react";
import { FlatIconProps } from "../types";

export const SVGArrowUp: React.FC<FlatIconProps> = ({ active, className = "", ...restProps }) => {
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
        d="m16 10-2-2-2-2-2 2-2 2m4-4v12"
        stroke="#5D6066"
        strokeLinejoin="round"
        strokeWidth="1.25"
      ></path>
    </svg>
  );
};

export default SVGArrowUp;
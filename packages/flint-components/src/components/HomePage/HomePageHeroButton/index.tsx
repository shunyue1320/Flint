import "./style.less";

import React from "react";
import { Button } from "antd";
import { useTranslation } from "react-i18next";

import { SVGJoin } from "./icons/SVGJoin";
import { SVGBegin } from "./icons/SVGBegin";

type HomePageHeroButtonType = "join" | "begin";

const HomePageHeroButtonIcons: Record<HomePageHeroButtonType, React.FC> = {
  join: SVGJoin,
  begin: SVGBegin,
};

export interface HomePageHeroButtonProps {
  type: HomePageHeroButtonType;
  onClick?: () => void;
}

export const HomePageHeroButton: React.FC<HomePageHeroButtonProps> = ({ type, onClick }) => {
  const { t } = useTranslation();

  return (
    <Button className="home-page-hero-button" onClick={onClick}>
      <span className="home-page-hero-button-icon">
        {React.createElement(HomePageHeroButtonIcons[type])}
      </span>
      <span className="home-page-hero-button-text">{t(`home-page-hero-button-type.${type}`)}</span>
    </Button>
  );
};

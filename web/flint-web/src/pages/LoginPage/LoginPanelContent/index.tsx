import "./index.less";

import React from "react";
import { TransitionGroup, CSSTransition } from "react-transition-group";

export interface LoginPanelContentProps {
  transitionKey: React.Key;
}

export const LoginPanelContent: React.FC<LoginPanelContentProps> = ({
  transitionKey,
  children,
}) => {
  return (
    <TransitionGroup className="login-panel-content">
      <CSSTransition key={transitionKey} unmountOnExit className="slider-in" time={400}>
        {children}
      </CSSTransition>
    </TransitionGroup>
  );
};

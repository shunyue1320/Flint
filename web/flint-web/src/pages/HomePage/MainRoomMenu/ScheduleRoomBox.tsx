import React from "react";

import { HomePageHeroButton } from "flint-components";
import { usePushNavigate } from "../../../utils/routes";

// React.memo 接受一个组件返回一个不会重新渲染的静态组件
export const ScheduleRoomBox = React.memo<{}>(function ScheduleRoomBox() {
  const pushNavigate = usePushNavigate();

  return <HomePageHeroButton type="schedule" onClick={() => {}} />;
});

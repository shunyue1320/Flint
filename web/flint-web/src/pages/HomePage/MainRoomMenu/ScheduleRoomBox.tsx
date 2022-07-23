import React from "react";

import { HomePageHeroButton } from "flint-components";
import { usePushNavigate } from "../../../utils/routes";

export const ScheduleRoomBox = React.memo<{}>(function ScheduleRoomBox() {
  const pushNavigate = usePushNavigate();

  return <HomePageHeroButton type="schedule" onClick={() => {}} />;
});

import "./index.less";

import { tasks } from "./tasks";

void (async () => {
  for (const task of tasks) {
    await task();
  }
})();

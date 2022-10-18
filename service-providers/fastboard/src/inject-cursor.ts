import type { FastboardApp } from "@netless/fastboard";

class InjectCustomCursor { }

const cursorInjector = new InjectCustomCursor();

export default cursorInjector;

export function injectCursor(app: FastboardApp): () => void {
  const dispose = app.memberState.subscribe(state => { });

  return () => {
    cursorInjector.disable();
    dispose();
  };
}

import type { FastboardApp } from "@netless/fastboard";
import { CursorNames } from "white-web-sdk";

type Color = string;
type CursorName = `${CursorNames}`;

// 2种光标
function getCircleUrl(color: Color): string {
  return `url("data:image/svg+xml,%3Csvg width='24' height='24' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Ccircle cx='12' cy='12' r='2.5' stroke='%23${color}' stroke-linejoin='square'/%3E%3Ccircle cx='12' cy='12' r='3.5' stroke='%23${color}'/%3E%3C/g%3E%3C/svg%3E") 12 12, auto;`; // cspell:disable-line
}
function getCrossUrl(color: Color): string {
  return `url("data:image/svg+xml,%3Csvg width='24' height='24' xmlns='http://www.w3.org/2000/svg' fill='none'%3E%3Cpath d='M5 12H19' stroke='%23${color}' stroke-linejoin='round'/%3E%3Cpath d='M12 5V19' stroke='%23${color}' stroke-linejoin='round'/%3E%3C/svg%3E%0A") 12 12, auto`; // cspell:disable-line
}

// 生成光标css
function makeStyleContent(config: Partial<Record<CursorName, Color>>): string {
  let result = "";
  Object.keys(config).forEach(cursorName => {
    const cursor = cursorName as CursorName;
    const color = config[cursor] as Color;
    const getter = cursor === "cursor-pencil" ? getCircleUrl : getCrossUrl;
    result += `.netless-whiteboard.${cursor} {cursor: ${getter(color)}}\n`;
  });
  return result;
}

// 重新实现了 white-web-sdk 的 `injectCustomStyle` 功能
// 但要使其动态工作（即随时插入/更改光标样式）。
class InjectCustomCursor {
  public $style = document.createElement("style");

  public enable(config: Partial<Record<CursorNames, Color>>): void {
    this.$style.textContent = makeStyleContent(config);
    // 始终确保风格在末尾
    document.head.appendChild(this.$style);
  }

  public disable(): void {
    document.head.removeChild(this.$style);
  }
}

const cursorInjector = new InjectCustomCursor();

export default cursorInjector;

// 注入光标
export function injectCursor(app: FastboardApp): () => void {
  const dispose = app.memberState.subscribe(state => {
    const [r, g, b] = state.strokeColor;
    const hex = ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    // 光标样式
    cursorInjector.enable({
      "cursor-pencil": hex,
      "cursor-rectangle": hex,
      "cursor-ellipse": hex,
      "cursor-straight": hex,
      "cursor-arrow": hex,
      "cursor-shape": hex,
    });
  });

  return () => {
    cursorInjector.disable();
    dispose();
  };
}

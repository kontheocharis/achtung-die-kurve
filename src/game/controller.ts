import { drawMap } from "./rendering";
import { State, updateState } from "./state";
import { KeyboardEvent } from "react";

export function renderGameFrame(
  state: State,
  context: CanvasRenderingContext2D,
  deltaTime: number,
) {
  updateState(state, deltaTime, () => true);
  drawMap(state, context);
}

export function handleKeyDown(
  state: State,
  event: KeyboardEvent<HTMLCanvasElement>,
): void {
  if (event.repeat) return;
  const bind = state.settings.keys[event.key];
  if (typeof bind !== "undefined") {
    const [player, dir] = bind;
    state.dynamics[player].turning = dir;
  }
}

export function handleKeyUp(
  state: State,
  event: KeyboardEvent<HTMLCanvasElement>,
): void {
  const bind = state.settings.keys[event.key];
  if (typeof bind !== "undefined") {
    const [player, _] = bind;
    state.dynamics[player].turning = undefined;
  }
}

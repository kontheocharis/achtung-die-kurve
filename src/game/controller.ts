import { drawMap } from "./rendering";
import { State, updateState } from "./state";
import { KeyboardEvent } from "react";

export function renderGameFrame(
  state: State,
  context: CanvasRenderingContext2D,
) {
  updateState(state);
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
    const [player, dir] = bind;
    if (state.dynamics[player].turning === dir) {
      state.dynamics[player].turning = undefined;
    }
  }
}

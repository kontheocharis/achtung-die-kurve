import { Vec2, SQRT_2 } from "@/lib/math";
import { Player, PLAYERS } from "./common";
import { GAP_APART, GAP_EVERY, GAP_SIZE, Settings } from "./settings";
import { State, updateState } from "./state";

function isValidPosition(
  settings: Settings,
  position: Vec2,
  settledContext: CanvasRenderingContext2D,
) {
  const d = settledContext.getImageData(
    Math.max(0, Math.round(position[0] + settings.snakeWidth / 2)),
    Math.max(0, Math.round(position[1] + settings.snakeWidth / 2)),
    Math.max(0, Math.round(settings.snakeWidth / SQRT_2)),
    Math.max(0, Math.round(settings.snakeWidth / SQRT_2)),
  );
  return d.data.every((value) => {
    return value == 0 || value == 1;
  });
}

export function renderGameFrame(
  state: State,
  context: CanvasRenderingContext2D,
  settledContext: CanvasRenderingContext2D,
  deltaTime: number,
  iterations: number,
) {
  updateState(state, deltaTime, (pos) =>
    isValidPosition(state.settings, pos, settledContext),
  );
  let gap = iterations;
  for (const player of PLAYERS) {
    drawPlayer(state, player, context, settledContext, deltaTime, gap);
    gap += GAP_APART;
  }
}

function drawPlayer(
  state: State,
  player: Player,
  context: CanvasRenderingContext2D,
  settledContext: CanvasRenderingContext2D,
  deltaTime: number,
  iterations: number,
) {
  const { position } = state.dynamics[player];

  const draw = (context: CanvasRenderingContext2D) => {
    if (iterations % GAP_EVERY < GAP_SIZE) {
      return;
    }

    context.fillStyle = state.settings.colourMap[player];
    context.beginPath();
    context.ellipse(
      position[0],
      position[1],
      state.settings.snakeWidth,
      state.settings.snakeWidth,
      0,
      0,
      Math.PI * 2,
    );
    context.fill();
  };

  draw(context);
  state.settled.push(draw);

  if (state.settled.length >= 1 / deltaTime) {
    const next = state.settled.shift();
    if (next) {
      next(settledContext);
    }
  }
}

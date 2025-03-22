import { add, modulo, normalised, rotate, scale, Vec2 } from "@/lib/math";
import { Player, PLAYERS } from "./common";
import { Settings } from "./settings";

export interface Dynamics {
  position: Vec2;
  velocity: Vec2;
  acceleration: Vec2;
  turning?: "left" | "right";
}

export interface State {
  settled: ((ctx: CanvasRenderingContext2D) => void)[];
  dynamics: Record<Player, Dynamics>;
  alive: Record<Player, boolean>;
  keys: Record<string, [Player, "left" | "right"]>;
  settings: Settings;
}

export function updateState(
  state: State,
  deltaTime: number,
  isValidPosition: (position: Vec2) => boolean,
) {
  for (const player of PLAYERS) {
    updateDynamics(state, player, deltaTime, isValidPosition);
  }
}

function updateDynamics(
  state: State,
  player: Player,
  deltaTime: number,
  isValidPosition: (position: Vec2) => boolean,
) {
  if (!state.alive[player]) {
    return;
  }

  const dynamics = state.dynamics[player];
  const settings = state.settings;

  if (typeof dynamics.turning !== "undefined") {
    const rotVec = scale(
      rotate(
        normalised(dynamics.velocity),
        dynamics.turning === "left" ? Math.PI / 2 : -Math.PI / 2,
      ),
      state.settings.turningSpeed,
    );
    dynamics.acceleration = rotVec;
  } else {
    dynamics.acceleration = [0, 0];
  }

  dynamics.velocity = scale(
    normalised(add(dynamics.velocity, scale(dynamics.acceleration, deltaTime))),
    settings.speed,
  );
  dynamics.position = modulo(
    add(dynamics.position, scale(dynamics.velocity, deltaTime)),
    settings.dimensions,
  );

  if (!isValidPosition(dynamics.position)) {
    dynamics.velocity = [0, 0];
    dynamics.acceleration = [0, 0];
    state.alive[player] = false;
  }
}

export function setInitialDynamics(state: State) {
  const centre = scale(state.settings.dimensions, 0.5);
  for (const player of PLAYERS) {
    const dir = normalised(
      add(scale(centre, -1), state.dynamics[player].position),
    );
    state.dynamics[player].velocity = scale(dir, -state.settings.speed);
    state.dynamics[player].acceleration = [0, 0];
  }
}

import {
  Vec2,
  scale,
  rotate,
  normalised,
  add,
  modulo,
  subtract,
} from "@/lib/math";
import { Player, PLAYERS } from "./common";
import { State } from "./state";
import { Settings } from "./settings";
import { fromEntries } from "@/lib/utils";

export interface Dynamics {
  position: Vec2;
  positionPrev: Vec2;
  velocity: Vec2;
  velocityNorm: Vec2;
  acceleration: Vec2;
  turning?: "left" | "right";
}

const PLACEMENT_AWAY_FROM_EDGE = 0.9;

export function initialDynamics(settings: Settings): Record<Player, Dynamics> {
  const radius =
    PLACEMENT_AWAY_FROM_EDGE *
    (Math.min(settings.dimensions[0], settings.dimensions[1]) / 2);

  const centre = scale(settings.dimensions, 0.5);

  return fromEntries(
    PLAYERS.map((player, i) => {
      const arg = (2 * i * Math.PI) / PLAYERS.length;
      const position: Vec2 = add(centre, [
        radius * Math.cos(arg),
        radius * Math.sin(arg),
      ]);
      const dir = normalised(subtract(centre, position));
      const velocity = scale(dir, settings.speed.normal);
      return [
        player,
        {
          position,
          positionPrev: position,
          velocity,
          velocityNorm: dir,
          acceleration: [0, 0],
        },
      ];
    }),
  );
}

export function updateDynamics(
  state: State,
  player: Player,
  deltaTime: number,
  isValidPosition: (player: Player) => boolean,
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

  const playerSpeed = state.powerUps[player].speed;

  dynamics.velocityNorm = normalised(
    add(dynamics.velocity, scale(dynamics.acceleration, deltaTime)),
  );
  dynamics.velocity = scale(dynamics.velocityNorm, settings.speed[playerSpeed]);
  dynamics.positionPrev = dynamics.position;
  dynamics.position = modulo(
    add(dynamics.position, scale(dynamics.velocity, deltaTime)),
    settings.dimensions,
  );

  if (!isValidPosition(player)) {
    dynamics.velocity = [0, 0];
    dynamics.acceleration = [0, 0];
    state.alive[player] = false;
  }
}

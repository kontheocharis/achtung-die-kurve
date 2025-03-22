import {
  add,
  modulo,
  normalised,
  rotate,
  scale,
  subtract,
  Vec2,
} from "@/lib/math";
import { Player, PLAYERS } from "./common";
import { Settings } from "./settings";
import { emptyQuadTree, QuadTree } from "@/lib/quad-tree";
import { Dynamics, initialDynamics, updateDynamics } from "./dynamics";
import { fromEntries } from "@/lib/utils";
import { addNewSegments, Segment } from "./map";

export interface PowerUps {
  size: "normal" | "huge" | "tiny";
  invincible: boolean;
  speed: "normal" | "fast" | "slow";
}

export interface State {
  map: QuadTree<Segment>;
  iterations: number;
  dynamics: Record<Player, Dynamics>;
  powerUps: Record<Player, PowerUps>;
  alive: Record<Player, boolean>;
  settings: Settings;
}

export function newState(settings: Settings): State {
  return {
    iterations: 0,
    map: emptyQuadTree(settings.dimensions[0], settings.dimensions[1]),
    dynamics: initialDynamics(settings),
    powerUps: fromEntries(
      PLAYERS.map(
        (p) =>
          [p, { size: "normal", invincible: false, speed: "normal" }] as const,
      ),
    ),
    alive: fromEntries(PLAYERS.map((p) => [p, true] as const)),
    settings,
  };
}

export function updateState(
  state: State,
  deltaTime: number,
  isValidPosition: (position: Vec2) => boolean,
) {
  for (const player of PLAYERS) {
    updateDynamics(state, player, deltaTime, isValidPosition);
  }
  addNewSegments(state);
  state.iterations++;
}

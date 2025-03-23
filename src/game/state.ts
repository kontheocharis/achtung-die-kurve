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
import { emptyQuadTree, getNearbyData, QuadTree } from "@/lib/quad-tree";
import { Dynamics, initialDynamics, updateDynamics } from "./dynamics";
import { fromEntries } from "@/lib/utils";
import { addNewSegments, Map, Segment } from "./map";
import {
  getNearbySegments,
  isValidPosition,
  segmentIntersectsPosition,
} from "./collisions";
import { emptyGrid } from "@/lib/grid";

export interface PowerUps {
  size: "normal" | "huge" | "tiny";
  invincible: boolean;
  speed: "normal" | "fast" | "slow";
}

export interface State {
  map: Map;
  iterations: number;
  dynamics: Record<Player, Dynamics>;
  powerUps: Record<Player, PowerUps>;
  alive: Record<Player, boolean>;
  unitsPerPixel: number;
  settings: Settings;
  msElapsed: number;
  deltaTime: number;
}

export function newState(settings: Settings): State {
  return {
    iterations: 0,
    map: emptyGrid(settings.dimensions, 1 / settings.minCellSize),
    dynamics: initialDynamics(settings),
    powerUps: fromEntries(
      PLAYERS.map(
        (p) =>
          [p, { size: "normal", invincible: false, speed: "normal" }] as const,
      ),
    ),
    unitsPerPixel: settings.unitsPerPixel,
    alive: fromEntries(PLAYERS.map((p) => [p, true] as const)),
    msElapsed: 0,
    deltaTime: 0,
    settings,
  };
}

export function updateState(state: State) {
  for (const player of PLAYERS) {
    updateDynamics(state, player, (p) => isValidPosition(state, p));
  }
  addNewSegments(state);
  state.msElapsed += state.deltaTime;
  state.iterations++;
}

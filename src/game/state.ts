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
import { addNewSegments, Map, Segment, segmentIntersectsPosition } from "./map";

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
    unitsPerPixel: settings.unitsPerPixel,
    alive: fromEntries(PLAYERS.map((p) => [p, true] as const)),
    settings,
  };
}

export function updateState(state: State, deltaTime: number) {
  addNewSegments(state, deltaTime);
  const ITERATION_TOLERANCE = 10;

  for (const player of PLAYERS) {
    const playerSize = state.powerUps[player].size;
    const segmentSize = state.settings.segmentWidth[playerSize];

    updateDynamics(state, player, deltaTime, (pos) => {
      const nearby = getNearbyData(
        state.map,
        add(pos, scale([segmentSize, segmentSize], 0.5)),
        10 * segmentSize,
      );

      for (const near of nearby) {
        if (
          near.player === player &&
          state.iterations - near.age < ITERATION_TOLERANCE
        ) {
          continue;
        }

        if (segmentIntersectsPosition(near, pos, segmentSize)) {
          return false;
        }
      }
      return true;
    });
  }
  state.iterations++;
}

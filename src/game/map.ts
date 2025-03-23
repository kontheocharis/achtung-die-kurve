import { Player, PLAYERS } from "./common";
import { State } from "./state";
import {
  add,
  triangleArea,
  rotateAbout,
  scale,
  subtract,
  Vec2,
} from "@/lib/math";
import { Memo } from "@/lib/utils";
import { Grid, addData } from "@/lib/grid";

export type Map = Grid<Segment>;

export interface Segment {
  player: Player;
  angle: number;
  size: Vec2;
  location: Vec2;
  age: number;
  isGap: boolean;
  boundingBox: [Vec2, Vec2, Vec2, Vec2];
}

export function addNewSegments(state: State) {
  for (const player of PLAYERS) {
    if (!state.alive[player]) continue;

    const playerDynamics = state.dynamics[player];
    const playerSize = state.powerUps[player].size;
    const angle = Math.atan2(
      playerDynamics.velocity[0],
      playerDynamics.velocity[1],
    );
    const size: Vec2 = [
      state.settings.segmentWidth[playerSize],
      state.settings.segmentWidth[playerSize],
    ];
    const playerSpeed = state.settings.speed[state.powerUps[player].speed];
    const unitsTravelled = playerSpeed * state.deltaTime;
    const segmentsPerUnit = 2 * (1 / state.settings.segmentWidth[playerSize]);

    const segmentsToAdd = Math.ceil(segmentsPerUnit * unitsTravelled);
    const initialPos = playerDynamics.positionPrev;
    const finalPos = playerDynamics.position;
    const dir = subtract(finalPos, initialPos);

    for (let i = 1; i <= segmentsToAdd; i++) {
      const t = i / segmentsToAdd;
      const pos = add(initialPos, scale(dir, t));

      const age = state.msElapsed + state.deltaTime * t;

      const isGap =
        age % state.settings.gapFrequencyMs < state.settings.gapWidthMs;

      addData(state.map, {
        player,
        angle,
        size,
        location: pos,
        age,
        isGap,
        boundingBox: boundingBox(pos, size, angle),
      });
    }
  }
}

function boundingBox(
  location: Vec2,
  size: Vec2,
  angle: number,
): [Vec2, Vec2, Vec2, Vec2] {
  const [x, y] = location;
  const [width, height] = size;
  const centre: Vec2 = [x + width / 2, y + height / 2];

  const northWest = rotateAbout([x, y], angle, centre);
  const northEast = rotateAbout([x + width, y], angle, centre);
  const southWest = rotateAbout([x, y - height], angle, centre);
  const southEast = rotateAbout([x + width, y - height], angle, centre);

  return [northWest, northEast, southWest, southEast];
}

export function segmentIsInGracePeriod(
  state: State,
  segment: Segment,
): boolean {
  return state.msElapsed - segment.age < state.settings.graceMs;
}

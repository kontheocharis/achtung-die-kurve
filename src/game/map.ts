import { addData, QuadTree } from "@/lib/quad-tree";
import { Player, PLAYERS } from "./common";
import { State } from "./state";
import { add, area, rotateAbout, scale, subtract, Vec2 } from "@/lib/math";
import { Memo } from "@/lib/utils";

export type Map = QuadTree<Segment>;

export interface Segment {
  player: Player;
  angle: number;
  size: Vec2;
  location: Vec2;
  age: number;
  boundingBox: [Vec2, Vec2, Vec2, Vec2];
}

export function addNewSegments(state: State, deltaTime: number) {
  for (const player of PLAYERS) {
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
    const segmentsPerPixel = 2 * (1 / state.settings.segmentWidth[playerSize]);

    const segmentsToAdd = Math.ceil(segmentsPerPixel * playerSpeed * deltaTime);
    const initialPos = playerDynamics.positionPrev;
    const finalPos = playerDynamics.position;
    const dir = subtract(finalPos, initialPos);

    for (let i = 1; i <= segmentsToAdd; i++) {
      const t = i / segmentsToAdd;
      const pos = add(initialPos, scale(dir, t));

      state.map = addData(state.map, {
        player,
        angle,
        size,
        location: pos,
        age: state.iterations,
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

export function segmentIntersectsPosition(
  segment: Segment,
  position: Vec2,
  radius: number,
) {
  const apd = area(segment.boundingBox[0], position, segment.boundingBox[3]);
  const dpc = area(segment.boundingBox[3], position, segment.boundingBox[2]);
  const cpb = area(segment.boundingBox[2], position, segment.boundingBox[1]);
  const pba = area(position, segment.boundingBox[1], segment.boundingBox[0]);

  const sum = apd + dpc + cpb + pba;
  const rectArea = segment.size[0] * segment.size[1];

  return sum <= rectArea;
}

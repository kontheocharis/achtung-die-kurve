import { Vec2, add, scale, triangleArea } from "@/lib/math";
import { Segment } from "./map";
import { rectIntersectsCircle } from "@/lib/geometry";
import { Settings } from "./settings";
import { State } from "./state";
import { Player } from "./common";
import { getNearbyData } from "@/lib/quad-tree";

export function segmentIntersectsPosition(
  segment: Segment,
  position: Vec2,
  radius: number,
) {
  return rectIntersectsCircle(
    segment.size,
    segment.location,
    segment.angle,
    position,
    radius,
  );
}

export function isValidPosition(state: State, player: Player) {
  const playerSize = state.powerUps[player].size;
  const playerWidth = state.settings.segmentWidth[playerSize];
  const pos = state.dynamics[player].position;
  return getNearbySegments(state, player).every(
    (near) => !segmentIntersectsPosition(near, pos, playerWidth / 2),
  );
}

export function getNearbySegments(state: State, player: Player): Segment[] {
  const playerDynamics = state.dynamics[player];
  const playerWidth = state.settings.segmentWidth[state.powerUps[player].size];

  return getNearbyData(
    state.map,
    add(playerDynamics.position, scale([playerWidth, playerWidth], 0.5)),
    3 * playerWidth, // should be plenty
  ).filter(
    (near) =>
      !(
        near.player === player &&
        state.iterations - near.age < state.settings.graceIterations
      ),
  );
}

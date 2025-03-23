import { Vec2, add, scale, triangleArea } from "@/lib/math";
import { Segment } from "./map";
import { rectIntersectsCircle } from "@/lib/geometry";
import { Settings } from "./settings";
import { State } from "./state";
import { Player } from "./common";
import { getNearbyData } from "@/lib/grid";
import { getPlayerDotPosition, getPlayerDotWidth } from "./dynamics";

export function segmentIntersectsPosition(
  segment: Segment,
  position: Vec2,
  radius: number,
) {
  return rectIntersectsCircle(
    add(segment.location, scale(segment.size, 0.5)),
    segment.size,
    segment.angle,
    position,
    radius,
  );
}

export function isValidPosition(state: State, player: Player) {
  const pos = getPlayerDotPosition(state, player);
  const width = getPlayerDotWidth(state, player);
  return getNearbySegments(state, player).every(
    (near) => !segmentIntersectsPosition(near, pos, width / 2),
  );
}

export function getNearbySegments(state: State, player: Player): Segment[] {
  const playerDynamics = state.dynamics[player];
  const playerWidth = state.settings.segmentWidth[state.powerUps[player].size];

  return getNearbyData(
    state.map,
    add(playerDynamics.position, scale([playerWidth, playerWidth], 0.5)),
  ).filter(
    (near) =>
      !(
        near.player === player &&
        state.iterations - near.age < state.settings.graceIterations
      ),
  );
}

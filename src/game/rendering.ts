import { add, scale, Vec2 } from "@/lib/math";
import { forAllData, getNearbyData } from "@/lib/quad-tree";
import { Player, PLAYERS } from "./common";
import { Map, Segment } from "./map";
import { State } from "./state";
import { getNearbySegments } from "./collisions";

export function mapToCanvas(state: State, v: Vec2): Vec2 {
  return scale(v, 1 / state.unitsPerPixel);
}

export function debugMap(
  state: State,
  map: Map,
  context: CanvasRenderingContext2D,
) {
  switch (map.kind) {
    case "leaf":
      context.strokeStyle = "#ffffff44";
      context.lineWidth = 3;
      const [h0, h1] = mapToCanvas(state, map.horizontal);
      const [v0, v1] = mapToCanvas(state, map.vertical);
      context.strokeRect(h0, v0, h1 - h0, v1 - v0);
      break;
    case "node":
      for (const [l, r] of map.children) {
        debugMap(state, l, context);
        debugMap(state, r, context);
      }
      break;
  }
}

function drawSegment(
  state: State,
  segment: Segment,
  context: CanvasRenderingContext2D,
  nearbyColour = false,
) {
  const [l0, l1] = mapToCanvas(state, [
    segment.location[0] + segment.size[0] / 2,
    segment.location[1] + segment.size[1] / 2,
  ]);
  const [extra0, extra1] = mapToCanvas(state, scale(segment.size, -1 / 2));
  const [size0, size1] = mapToCanvas(state, segment.size);

  if (
    state.settings.debug &&
    state.iterations - segment.age < state.settings.graceIterations
  ) {
    // Show grace iterations
    context.fillStyle = "#ff00ff44";
  } else {
    if (nearbyColour) {
      context.fillStyle = "#ffffff";
    } else {
      context.fillStyle = state.settings.colourMap[segment.player];
    }
  }

  context.save();
  context.translate(l0, l1);
  context.rotate(-segment.angle);
  context.beginPath();
  context.rect(extra0, extra1, size0, size1);
  context.fill();
  context.restore();
}

function drawPlayerCircle(
  state: State,
  player: Player,
  context: CanvasRenderingContext2D,
) {
  const playerDynamics = state.dynamics[player];
  const playerWidth = state.settings.segmentWidth[state.powerUps[player].size];
  const centeredPos = add(playerDynamics.position, [
    playerWidth / 2,
    playerWidth / 2,
  ]);

  const [x, y] = mapToCanvas(
    state,
    add(centeredPos, scale(playerDynamics.velocityNorm, playerWidth / 2)),
  );
  const [w0, w1] = mapToCanvas(state, [playerWidth / 2, playerWidth / 2]);

  // Show nearby segments
  if (state.settings.debug) {
    const nearby = getNearbySegments(state, player);
    console.log(nearby);
    for (const near of nearby) {
      drawSegment(state, near, context, true);
    }
  }

  context.fillStyle = state.settings.playerDotColour;
  context.beginPath();
  context.ellipse(x, y, w0, w1, 0, 0, Math.PI * 2);
  context.fill();
}

export function drawMap(state: State, context: CanvasRenderingContext2D) {
  // Clear the canvas
  const [totalWidth, totalHeight] = mapToCanvas(
    state,
    state.settings.dimensions,
  );
  context.clearRect(0, 0, totalWidth, totalHeight);

  if (state.settings.debug) {
    debugMap(state, state.map, context);
  }

  // Draw all the segments
  forAllData(state.map, (segment) => drawSegment(state, segment, context));

  // Draw a circle around each player
  for (const player of PLAYERS) {
    drawPlayerCircle(state, player, context);
  }
}

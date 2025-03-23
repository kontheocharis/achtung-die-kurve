import { add, scale, Vec2 } from "@/lib/math";
import { forAllData } from "@/lib/quad-tree";
import { PLAYERS } from "./common";
import { Map } from "./map";
import { State } from "./state";

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

export function drawMap(state: State, context: CanvasRenderingContext2D) {
  // Clear the canvas
  const [totalWidth, totalHeight] = mapToCanvas(
    state,
    state.settings.dimensions,
  );
  context.clearRect(0, 0, totalWidth, totalHeight);

  debugMap(state, state.map, context);

  // Draw all the segments
  forAllData(state.map, (segment) => {
    const [l0, l1] = mapToCanvas(state, [
      segment.location[0] + segment.size[0] / 2,
      segment.location[1] + segment.size[1] / 2,
    ]);
    const [extra0, extra1] = mapToCanvas(state, scale(segment.size, -1 / 2));
    const [size0, size1] = mapToCanvas(state, segment.size);

    context.fillStyle = state.settings.colourMap[segment.player];
    context.save();
    context.translate(l0, l1);
    context.rotate(-segment.angle);
    context.beginPath();
    context.rect(extra0, extra1, size0, size1);
    context.fill();
    context.restore();
  });

  // Draw a circle around each player
  for (const player of PLAYERS) {
    const playerDynamics = state.dynamics[player];
    const playerWidth =
      state.settings.segmentWidth[state.powerUps[player].size];

    // Move the circle 0.5 units forward
    const offset = scale(playerDynamics.velocityNorm, playerWidth / 2);

    const [x, y] = mapToCanvas(
      state,
      add(
        playerDynamics.position,
        add(scale([playerWidth, playerWidth], 1 / 2), offset),
      ),
    );
    const [w0, w1] = mapToCanvas(state, [playerWidth, playerWidth]);

    context.beginPath();
    context.fillStyle = state.settings.playerDotColour;
    context.ellipse(x, y, w0, w1, 0, 0, Math.PI * 2);
    context.fill();
  }
}

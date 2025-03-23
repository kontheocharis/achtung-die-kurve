import { add, scale, Vec2 } from "@/lib/math";
import { forAllData, getNearbyData } from "@/lib/grid";
import { Player, PLAYERS } from "./common";
import { Map, Segment, segmentIsInGracePeriod } from "./map";
import { State } from "./state";
import { getNearbySegments, segmentIntersectsPosition } from "./collisions";
import { getPlayerDotPosition, getPlayerDotWidth } from "./dynamics";

export function mapToCanvas(state: State, v: Vec2): Vec2 {
  return scale(v, 1 / state.unitsPerPixel);
}

function drawSegment(
  state: State,
  segment: Segment,
  context: CanvasRenderingContext2D,
  nearbyColour?: string,
) {
  const [l0, l1] = mapToCanvas(state, [
    segment.location[0] + segment.size[0] / 2,
    segment.location[1] + segment.size[1] / 2,
  ]);
  const [extra0, extra1] = mapToCanvas(state, scale(segment.size, -1 / 2));
  const [size0, size1] = mapToCanvas(state, segment.size);

  // Do not show gaps
  if (segment.isGap && !segmentIsInGracePeriod(state, segment)) {
    return;
  }

  if (state.settings.debug && segmentIsInGracePeriod(state, segment)) {
    // Show grace iterations
    context.fillStyle = "#ff00ff44";
  } else {
    if (nearbyColour) {
      context.fillStyle = nearbyColour;
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
  const pos = getPlayerDotPosition(state, player);
  const width = getPlayerDotWidth(state, player);

  const [x, y] = mapToCanvas(state, pos);
  const [w0, w1] = mapToCanvas(state, [width / 2, width / 2]);

  // Show nearby segments
  if (state.settings.debug) {
    const nearby = getNearbySegments(state, player);
    for (const near of nearby) {
      if (segmentIntersectsPosition(near, pos, width / 2)) {
        drawSegment(state, near, context, "#ffffff");
      } else {
        drawSegment(state, near, context, "#ff00ff");
      }
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

  // Draw all the segments
  forAllData(state.map, (segment) => drawSegment(state, segment, context));

  // Draw a circle around each player
  for (const player of PLAYERS) {
    drawPlayerCircle(state, player, context);
  }
}

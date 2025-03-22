import { Vec2, SQRT_2 } from "@/lib/math";
import { Player, PLAYERS } from "./common";
import { GAP_APART, GAP_EVERY, GAP_SIZE, Settings } from "./settings";
import { State, updateState } from "./state";
import { forAllData } from "@/lib/quad-tree";

export function drawMap(state: State, context: CanvasRenderingContext2D) {
  // Clear the canvas
  context.clearRect(
    0,
    0,
    state.settings.dimensions[0],
    state.settings.dimensions[1],
  );

  // Draw all the segments
  forAllData(state.map, (segment) => {
    context.fillStyle = state.settings.colourMap[segment.player];
    context.rotate(segment.angle);
    context.fillRect(
      segment.location[0],
      segment.location[1],
      segment.size[0],
      segment.size[1],
    );
    context.setTransform(1, 0, 0, 1, 0, 0);
  });

  // Draw a circle around each player
  // for (const player of PLAYERS) {
  //   const playerDynamics = state.dynamics[player];
  //   const playerWidth =
  //     state.settings.segmentWidth[state.powerUps[player].size];

  //   context.fillStyle = state.settings.playerDotColour;
  //   context.ellipse(
  //     playerDynamics.position[0],
  //     playerDynamics.position[1],
  //     playerWidth,
  //     playerWidth,
  //     0,
  //     0,
  //     Math.PI * 2,
  //   );
  //   context.fill();
  // }
}

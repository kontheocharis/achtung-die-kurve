import { addData } from "@/lib/quad-tree";
import { Player, PLAYERS } from "./common";
import { State } from "./state";
import { Vec2 } from "@/lib/math";

export interface Segment {
  player: Player;
  angle: number;
  size: Vec2;
  location: Vec2;
  age: number;
}

export function addNewSegments(state: State) {
  for (const player of PLAYERS) {
    const playerDynamics = state.dynamics[player];
    const playerSize = state.powerUps[player].size;

    state.map = addData(state.map, {
      player,
      angle: Math.atan2(playerDynamics.velocity[0], playerDynamics.velocity[1]),
      size: [
        state.settings.segmentWidth[playerSize],
        state.settings.segmentHeight[playerSize],
      ],
      location: [playerDynamics.position[0], playerDynamics.position[1]],
      age: state.iterations,
    });
  }
  console.log(state.map);
}

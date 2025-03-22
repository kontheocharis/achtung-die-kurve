import { Vec2 } from "@/lib/math";
import { Player } from "./common";

export const GAP_EVERY = 1000;
export const GAP_SIZE = 0;
export const GAP_APART = 300;

export interface Settings {
  speed: {
    normal: number;
    fast: number;
    slow: number;
  };
  turningSpeed: number;
  dimensions: Vec2;
  segmentWidth: {
    normal: number;
    huge: number;
    tiny: number;
  };
  segmentHeight: {
    normal: number;
    huge: number;
    tiny: number;
  };
  colourMap: Record<Player, string>;
  playerDotColour: string;
  keys: Record<string, [Player, "left" | "right"]>;
}

export function defaultSettings(): Settings {
  return {
    keys: {
      a: ["red", "left"],
      d: ["red", "right"],
      j: ["blue", "left"],
      k: ["blue", "right"],
      v: ["cyan", "left"],
      b: ["cyan", "right"],
      t: ["magenta", "left"],
      y: ["magenta", "right"],
      o: ["green", "left"],
      p: ["green", "right"],
      z: ["yellow", "left"],
      x: ["yellow", "right"],
    },
    speed: {
      normal: 100,
      fast: 200,
      slow: 50,
    },
    turningSpeed: 500,
    dimensions: [1000, 1000],
    segmentWidth: {
      normal: 5,
      huge: 10,
      tiny: 2,
    },
    segmentHeight: {
      normal: 5,
      huge: 10,
      tiny: 2,
    },
    colourMap: {
      red: "#ff0000",
      blue: "#0000ff",
      green: "#00ff00",
      yellow: "#ffff00",
      magenta: "#ff00ff",
      cyan: "#00ffff",
    },
    playerDotColour: "#ffffff",
  };
}

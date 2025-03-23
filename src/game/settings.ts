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
  unitsPerPixel: number;
  segmentWidth: {
    normal: number;
    huge: number;
    tiny: number;
  };
  minCellSize: number;
  colourMap: Record<Player, string>;
  playerDotColour: string;
  graceIterations: number;
  keys: Record<string, [Player, "left" | "right"]>;
  debug: boolean;
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
    unitsPerPixel: 0.2,
    segmentWidth: {
      normal: 5,
      huge: 10,
      tiny: 2,
    },
    minCellSize: 10,
    colourMap: {
      red: "#ff0000",
      blue: "#0000ff",
      green: "#00ff00",
      yellow: "#ffff00",
      magenta: "#ff00ff",
      cyan: "#00ffff",
    },
    playerDotColour: "#ffffff",
    graceIterations: 10,
    debug: false,
  };
}

export function getAspectRatio(settings: Settings): number {
  const width = settings.dimensions[0];
  const height = settings.dimensions[1];
  return width / height;
}

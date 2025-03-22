import { Vec2 } from "@/lib/math";
import { Player } from "./common";

export const GAP_EVERY = 1000;
export const GAP_SIZE = 0;
export const GAP_APART = 300;

export interface Settings {
  speed: number;
  turningSpeed: number;
  dimensions: Vec2;
  snakeWidth: number;
  colourMap: Record<Player, string>;
}

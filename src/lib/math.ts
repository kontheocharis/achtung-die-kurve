export const SQRT_2 = Math.sqrt(2);

export type Vec2 = [number, number];

export function scale(v: Vec2, factor: number): Vec2 {
  return [v[0] * factor, v[1] * factor];
}

export function normalised(v: Vec2): Vec2 {
  const length = Math.sqrt(v[0] ** 2 + v[1] ** 2);
  return [v[0] / length, v[1] / length];
}

export function rotate(v: Vec2, angle: number): Vec2 {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [v[0] * cos - v[1] * sin, v[0] * sin + v[1] * cos];
}

export function add(v1: Vec2, v2: Vec2): Vec2 {
  return [v1[0] + v2[0], v1[1] + v2[1]];
}

export function subtract(v1: Vec2, v2: Vec2): Vec2 {
  return [v1[0] - v2[0], v1[1] - v2[1]];
}

export function magnitude(v: Vec2): number {
  return Math.sqrt(v[0] ** 2 + v[1] ** 2);
}

export function magnitude2(v: Vec2): number {
  return v[0] ** 2 + v[1] ** 2;
}

export function modulo(v1: Vec2, v2: Vec2): Vec2 {
  return [v1[0] % v2[0], v1[1] % v2[1]];
}

import { subtract, Vec2 } from "./math";

export function rectIntersectsCircle(
  rectPosition: Vec2,
  rectDimensions: Vec2,
  rectAngle: number,
  circlePosition: Vec2,
  circleRadius: number,
): boolean {
  const relativeCirclePos = subtract(circlePosition, rectPosition);

  // Rotate the relative circle position by -angle to align with rectangle's local space
  const cosA = Math.cos(-rectAngle);
  const sinA = Math.sin(-rectAngle);

  const rotatedCirclePos: Vec2 = [
    relativeCirclePos[0] * cosA - relativeCirclePos[1] * sinA,
    relativeCirclePos[0] * sinA + relativeCirclePos[1] * cosA,
  ];

  // Check for collision using the rotated circle position and the aligned rectangle
  const halfWidth = rectDimensions[0] / 2;
  const halfHeight = rectDimensions[0] / 2;

  // Clamp circle position to rectangle bounds
  const closestX = Math.max(
    -halfWidth,
    Math.min(halfWidth, rotatedCirclePos[0]),
  );
  const closestY = Math.max(
    -halfHeight,
    Math.min(halfHeight, rotatedCirclePos[1]),
  );

  // Calculate the distance between the closest point and circle center
  const distanceX = rotatedCirclePos[0] - closestX;
  const distanceY = rotatedCirclePos[1] - closestY;

  const distanceSquared = distanceX * distanceX + distanceY * distanceY;

  // If the distance is less than the circle's radius, collision occurred
  return distanceSquared <= circleRadius * circleRadius;
}

import { magnitude2, subtract, Vec2 } from "./math";

const POINTS_PER_CELL = 4;

export interface Located {
  location: Vec2;
}

export type QuadTreeBase = {
  horizontal: Vec2;
  vertical: Vec2;
};

export type QuadTree<T extends Located> = QuadTreeBase &
  (
    | {
        kind: "leaf";
        data: T[];
      }
    | {
        kind: "node";
        children: [[QuadTree<T>, QuadTree<T>], [QuadTree<T>, QuadTree<T>]];
      }
  );

export function emptyQuadTree<T extends Located>(
  width: number,
  height: number,
): QuadTree<T> {
  return {
    kind: "leaf",
    horizontal: [0, width],
    vertical: [0, height],
    data: [],
  };
}

export function forAllData<T extends Located>(
  tree: QuadTree<T>,
  cb: (data: T) => void,
): void {
  switch (tree.kind) {
    case "leaf":
      tree.data.forEach((t) => cb(t));
      break;
    case "node":
      forAllData(tree.children[0][0], cb);
      forAllData(tree.children[0][1], cb);
      forAllData(tree.children[1][0], cb);
      forAllData(tree.children[1][1], cb);
      break;
  }
}

export function getNearbyData<T extends Located>(
  tree: QuadTree<T>,
  at: Vec2,
  radius: number,
): T[] {
  switch (tree.kind) {
    case "leaf":
      return tree.data.filter(
        (t) => magnitude2(subtract(t.location, at)) <= radius * radius,
      );
    case "node":
      const rec = (i: number, j: number) =>
        getNearbyData(tree.children[i][j], at, radius);

      const horizontalMax = quadrantIndex(at[0] + radius, tree.horizontal);
      const horizontalMin = quadrantIndex(at[0] - radius, tree.horizontal);
      const verticalMax = quadrantIndex(at[1] + radius, tree.vertical);
      const verticalMin = quadrantIndex(at[1] - radius, tree.vertical);

      if (horizontalMax === horizontalMin) {
        if (verticalMax === verticalMin) {
          return rec(horizontalMax, verticalMax);
        } else {
          return [
            ...rec(horizontalMax, verticalMax),
            ...rec(horizontalMax, verticalMin),
          ];
        }
      } else if (verticalMax === verticalMin) {
        return [
          ...rec(horizontalMax, verticalMax),
          ...rec(horizontalMin, verticalMax),
        ];
      } else {
        return [
          ...rec(horizontalMax, verticalMax),
          ...rec(horizontalMax, verticalMin),
          ...rec(horizontalMin, verticalMax),
          ...rec(horizontalMin, verticalMin),
        ];
      }
  }
}

// Modifies the data!
export function addData<T extends Located>(
  tree: QuadTree<T>,
  data: T,
): QuadTree<T> {
  switch (tree.kind) {
    case "node":
      const horizontal = quadrantIndex(data.location[0], tree.horizontal);
      const vertical = quadrantIndex(data.location[1], tree.vertical);
      tree.children[horizontal][vertical] = addData(
        tree.children[horizontal][vertical],
        data,
      );
      return tree;
    case "leaf":
      tree.data.push(data);
      if (tree.data.length > POINTS_PER_CELL) {
        tree = splitLeaf(tree);
      }
      return tree;
  }
}

function quadrantIndex(coord: number, bounds: Vec2): number {
  return Math.floor(2 * ((coord - bounds[0]) / (bounds[1] - bounds[0])));
}

function splitLeaf<T extends Located>(
  tree: QuadTree<T> & { kind: "leaf" },
): QuadTree<T> {
  const horizontalMid = tree.horizontal[0] + tree.horizontal[1] / 2;
  const verticalMid = tree.vertical[0] + tree.vertical[1] / 2;

  const northWest: T[] = [];
  const northEast: T[] = [];
  const southWest: T[] = [];
  const southEast: T[] = [];
  for (const item of tree.data) {
    const loc = item.location;
    if (loc[0] < horizontalMid) {
      if (loc[1] < verticalMid) {
        northWest.push(item);
      } else {
        northEast.push(item);
      }
    } else {
      if (loc[1] < verticalMid) {
        southWest.push(item);
      } else {
        southEast.push(item);
      }
    }
  }

  return {
    kind: "node",
    horizontal: tree.horizontal,
    vertical: tree.vertical,
    children: [
      [
        {
          kind: "leaf",
          horizontal: [tree.horizontal[0], horizontalMid],
          vertical: [tree.vertical[0], verticalMid],
          data: northWest,
        },
        {
          kind: "leaf",
          horizontal: [tree.horizontal[0], horizontalMid],
          vertical: [verticalMid, tree.vertical[1]],
          data: northEast,
        },
      ],
      [
        {
          kind: "leaf",
          horizontal: [horizontalMid, tree.horizontal[1]],
          vertical: [tree.vertical[0], verticalMid],
          data: southWest,
        },
        {
          kind: "leaf",
          horizontal: [horizontalMid, tree.horizontal[1]],
          vertical: [verticalMid, tree.vertical[1]],
          data: southEast,
        },
      ],
    ],
  };
}

import { magnitude2, posMod, subtract, Vec2 } from "./math";
import { assert, clearKeys } from "./utils";

const POINTS_PER_CELL = 4;
const MIN_CELL_SIZE = 20;

export interface Located {
  location: Vec2;
}

type Index = [0 | 1, 0 | 1][];

export type QuadTreeBase = {
  horizontal: Vec2;
  vertical: Vec2;
  neighbours: Neighbours;
};

export type Neighbours = {
  [H in 1 | 0 | -1]?: {
    [V in H extends 0 ? 1 | -1 : 0 | 1 | -1]?: Index[];
  };
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
    neighbours: {},
  };
}

export function getIndex<T extends Located>(
  tree: QuadTree<T>,
  at: Index,
): QuadTree<T> {
  if (tree.kind === "leaf" || at.length === 0) {
    return tree;
  }

  const next = [...at];
  const curr = next.shift();
  assert(typeof curr !== "undefined", "Index out of bounds");

  const x = quadrantIndex(curr[0], tree.horizontal);
  const y = quadrantIndex(curr[1], tree.vertical);

  return getIndex(tree.children[x][y], next);
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

export function allData<T extends Located>(tree: QuadTree<T>): T[] {
  const data: T[] = [];
  forAllData(tree, (d) => data.push(d));
  return data;
}

export function getNearbyData<T extends Located>(
  tree: QuadTree<T>,
  at: Vec2,
  localTree = tree,
): T[] {
  switch (localTree.kind) {
    case "leaf":
      // Get neighbour data too:
      const neighbours = Object.values(localTree.neighbours)
        .map((v) =>
          Object.values(v).map((ls) =>
            (ls ?? []).map((l) => allData(getIndex(tree, l))),
          ),
        )
        .flat(3);

      return localTree.data.concat(neighbours);
    case "node":
      const x = quadrantIndex(at[0], tree.horizontal);
      const y = quadrantIndex(at[1], tree.vertical);
      return getNearbyData(tree, at, localTree.children[x][y]);
  }
}

// Modifies the data!
export function addData<T extends Located>(
  tree: QuadTree<T>,
  data: T,
  minCellSize: number,
  currIndex: Index = [],
): QuadTree<T> {
  switch (tree.kind) {
    case "node":
      const horizontal = quadrantIndex(data.location[0], tree.horizontal);
      const vertical = quadrantIndex(data.location[1], tree.vertical);
      tree.children[horizontal][vertical] = addData(
        tree.children[horizontal][vertical],
        data,
        minCellSize,
        [...currIndex, [horizontal, vertical]],
      );
      return tree;
    case "leaf":
      tree.data.push(data);
      if (
        tree.data.length > POINTS_PER_CELL &&
        tree.horizontal[1] - tree.horizontal[0] > MIN_CELL_SIZE
      ) {
        tree = splitLeaf(tree, currIndex);
      }
      return tree;
  }
}

function quadrantIndex(coord: number, bounds: Vec2): 0 | 1 {
  const coordWrapped = posMod(coord - bounds[0], bounds[1] - bounds[0]);
  const idx = Math.floor(2 * (coordWrapped / (bounds[1] - bounds[0])));
  assert(idx === 0 || idx === 1);
  return idx;
}

function splitLeaf<T extends Located>(
  tree: QuadTree<T> & { kind: "leaf" },
  currIndex: Index,
): QuadTree<T> {
  const horizontalMid =
    tree.horizontal[0] + (tree.horizontal[1] - tree.horizontal[0]) / 2;
  const verticalMid =
    tree.vertical[0] + (tree.vertical[1] - tree.vertical[0]) / 2;

  if (
    horizontalMid === tree.horizontal[0] ||
    verticalMid === tree.vertical[0]
  ) {
    return tree;
  }

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
    neighbours: tree.neighbours,
    children: [
      [
        {
          kind: "leaf",
          horizontal: [tree.horizontal[0], horizontalMid],
          vertical: [tree.vertical[0], verticalMid],
          data: northWest,
          neighbours: {
            "-1": {
              "-1": tree.neighbours["-1"]?.["-1"],
              "0": tree.neighbours["-1"]?.["0"],
              "1": tree.neighbours["-1"]?.["1"],
            },
            "0": {
              "-1": tree.neighbours["0"]?.["-1"],
              "1": [[...currIndex, [0, 1]]],
            },
            "1": {
              "-1": tree.neighbours["-1"]?.["-1"],
              "0": [[...currIndex, [1, 0]]],
              "1": [[...currIndex, [1, 1]]],
            },
          },
        },
        {
          kind: "leaf",
          horizontal: [tree.horizontal[0], horizontalMid],
          vertical: [verticalMid, tree.vertical[1]],
          data: northEast,
          neighbours: {
            "-1": {
              "-1": tree.neighbours["-1"]?.["1"],
              "0": [[...currIndex, [0, 0]]],
              "1": [[...currIndex, [0, 1]]],
            },
            "0": {
              "-1": tree.neighbours["0"]?.["-1"],
              "1": [[...currIndex, [1, 1]]],
            },
            "1": {
              "-1": tree.neighbours["1"]?.["-1"],
              "0": tree.neighbours["1"]?.["0"],
              "1": tree.neighbours["1"]?.["1"],
            },
          },
        },
      ],
      [
        {
          kind: "leaf",
          horizontal: [horizontalMid, tree.horizontal[1]],
          vertical: [tree.vertical[0], verticalMid],
          data: southWest,
          neighbours: {
            "-1": {
              "-1": [[...currIndex, [0, 0]]],
              "0": [[...currIndex, [0, 1]]],
              "1": tree.neighbours["-1"]?.["1"],
            },
            "0": {
              "-1": tree.neighbours["0"]?.["-1"],
              "1": [[...currIndex, [1, 1]]],
            },
            "1": {
              "-1": tree.neighbours["1"]?.["-1"],
              "0": tree.neighbours["1"]?.["0"],
              "1": tree.neighbours["1"]?.["1"],
            },
          },
        },
        {
          kind: "leaf",
          horizontal: [horizontalMid, tree.horizontal[1]],
          vertical: [verticalMid, tree.vertical[1]],
          data: southEast,
          neighbours: {
            "-1": {
              "-1": [[...currIndex, [0, 0]]],
              "0": [[...currIndex, [0, 1]]],
              "1": tree.neighbours["-1"]?.["1"],
            },
            "0": {
              "-1": [[...currIndex, [1, 0]]],
              "1": tree.neighbours["0"]?.["1"],
            },
            "1": {
              "-1": tree.neighbours["1"]?.["-1"],
              "0": tree.neighbours["1"]?.["0"],
              "1": tree.neighbours["1"]?.["1"],
            },
          },
        },
      ],
    ],
  };
}

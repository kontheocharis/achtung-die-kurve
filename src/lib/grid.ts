import { as2DIndex, floor, scale, Vec2 } from "./math";

export interface Located {
  location: Vec2;
}

export type Grid<T> = {
  dimensionsInCells: Vec2;
  cellsPerUnit: number;
  cells: T[][];
};

export function emptyGrid<T>(dimensions: Vec2, cellsPerUnit: number): Grid<T> {
  const dimensionsInCells = scale(dimensions, cellsPerUnit);
  return {
    dimensionsInCells,
    cellsPerUnit,
    cells: Array.from(
      { length: dimensionsInCells[0] * dimensionsInCells[1] },
      () => [],
    ),
  };
}

export function addData<T extends Located>(grid: Grid<T>, data: T) {
  const pos = data.location;
  const cellPos = floor(scale(pos, grid.cellsPerUnit));

  const cellIndex = as2DIndex(cellPos, grid.dimensionsInCells);
  grid.cells[cellIndex].push(data);
}

export function forAllData<T>(grid: Grid<T>, callback: (data: T) => void) {
  grid.cells.forEach((cell) => cell.forEach(callback));
}

export function getNearbyData<T>(grid: Grid<T>, pos: Vec2): T[] {
  const [x, y] = floor(scale(pos, grid.cellsPerUnit));
  const nearbyCells = [
    [x, y],
    [x - 1, y - 1],
    [x, y - 1],
    [x + 1, y - 1],
    [x - 1, y],
    [x + 1, y],
    [x - 1, y + 1],
    [x, y + 1],
    [x + 1, y + 1],
  ].map(([x, y]) => as2DIndex([x, y], grid.dimensionsInCells));

  return nearbyCells.reduce((acc, index) => {
    if (index >= 0 && index < grid.cells.length) {
      acc.push(...grid.cells[index]);
    }
    return acc;
  }, [] as T[]);
}

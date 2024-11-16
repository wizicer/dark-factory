export function getPath(placements: number[], width: number): number[] {
  const height = Math.ceil(placements.length / width);
  const directions = [
    [0, 1], // Right
    [0, -1], // Left
    [1, 0], // Down
    [-1, 0], // Up
  ];

  const isValid = (x: number, y: number): boolean =>
    x >= 0 && x < height && y >= 0 && y < width;

  const toIndex = (x: number, y: number): number => x * width + y;

  const toCoordinates = (index: number): [number, number] => [
    Math.floor(index / width),
    index % width,
  ];

  const visited = new Set<number>();
  const path: number[] = [];
  const totalRoads = placements.filter((cell) => cell === 1).length;

  const addToPath = (index: number): void => {
    if (path.length === 0 || path[path.length - 1] !== index) {
      path.push(index);
    }
  };

  const dfs = (x: number, y: number): boolean => {
    const index = toIndex(x, y);
    if (!isValid(x, y) || placements[index] === 0 || visited.has(index))
      return false;

    visited.add(index);
    addToPath(index);

    // Check if all road points are visited
    if (visited.size === totalRoads) return true;

    for (const [dx, dy] of directions) {
      const nx = x + dx,
        ny = y + dy;
      const neighborIndex = toIndex(nx, ny);

      if (
        isValid(nx, ny) &&
        placements[neighborIndex] === 1 &&
        !visited.has(neighborIndex)
      ) {
        if (dfs(nx, ny)) return true;
      }
    }

    // Only backtrack if not all roads have been visited
    if (visited.size < totalRoads) {
      addToPath(index);
    }
    return false;
  };

  // Find the starting point (first road cell)
  for (let i = 0; i < placements.length; i++) {
    if (placements[i] === 1) {
      const [startX, startY] = toCoordinates(i);
      dfs(startX, startY);
      break;
    }
  }

  return path;
}

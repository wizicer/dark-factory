import TilesImage from '../../assets/components.png';
import TerrainImage from '../../assets/terrains.png';

export interface ImageOffset {
  image: string;
  draw: HTMLImageElement;
  tileWidth: number;
  tileHeight: number;
  xOffset: number;
  yOffset: number;
  name: string;
}

export interface MapParameters {
  baseSize: number;
  tileWidth: number;
  tileHeight: number;
  mapRows: number;
  mapColumns: number;
  offsetRows: number;
  offsetColumns: number;
  fixedMapColumns: number;
  fixedMapRows: number;
  mapHeight: number;
  mapWidth: number;
  sourceTile: number;
  tiles: (number | null)[];
  mouseState: 'Normal' | 'LeftDown' | 'RightDown';
  context: CanvasRenderingContext2D | null;
  placements: ImageOffset[];
  roadImages: Record<string, ImageOffset>;
  seaImages: Record<string, ImageOffset>;
  mapPattern: Record<number, string>;
  seaPattern: Record<number, string>;
}

export const getMapParameters = (
  context: CanvasRenderingContext2D | null = null,
  mapRows = 8,
  mapColumns = 18,
): MapParameters => {
  const baseSize = 21;
  const fixedMapColumns = 25;
  const fixedMapRows = 16;
  const offsetColumns = Math.floor((fixedMapColumns - mapColumns) / 2);
  const offsetRows = Math.floor((fixedMapRows - mapRows) / 2);
  return {
    baseSize,
    tileWidth: baseSize,
    tileHeight: baseSize,
    mapRows,
    mapColumns,
    mapHeight: fixedMapRows * baseSize,
    mapWidth: fixedMapColumns * baseSize,
    fixedMapRows,
    fixedMapColumns,
    offsetColumns,
    offsetRows,
    tiles: new Array(mapRows * mapColumns).fill(null),
    sourceTile: 0,
    mouseState: 'Normal',
    context,
    placements: getPlacements(),
    roadImages: getRoadImages(),
    seaImages: getSeaImages(),
    mapPattern: generateMapPattern(mapColumns, mapRows),
    seaPattern: generateSeaPattern(fixedMapColumns, fixedMapRows),
  };
};

// image, name, width, height, xOffset, yOffset
export const placementRaw: [string, string, number, number, number, number][] =
  [
    [TerrainImage, 'road', 1, 1, 0, 3],
    [TilesImage, 'iron-buyer', 2, 2, 4, 0],
    [TilesImage, 'iron-processor', 4, 2, 0, 0],
    [TilesImage, 'iron-seller', 1, 2, 6, 0],
    [TilesImage, 'seaport', 2, 2, 3, 3],
    [TilesImage, 'barn', 3, 3, 0, 3],
  ];

export function getPlacements(): ImageOffset[] {
  return placementRaw.map(
    ([image, name, tileWidth, tileHeight, xOffset, yOffset]) => {
      const draw = new Image();
      draw.src = image;
      return { image, draw, tileWidth, tileHeight, xOffset, yOffset, name };
    },
  );
}

export const roadImageRaw: [string, number, number][] = [
  ['horizontal', 1, 3],
  ['vertical', 0, 3],
  ['grass', 0, 0],
  ['leaf1', 2, 0],
  ['leaf2', 4, 0],
  ['eastnorth', 0, 5],
  ['eastsouth', 1, 5],
  ['westsouth', 2, 5],
  ['westnorth', 3, 5],
  ['exceptwest', 0, 6],
  ['exceptnorth', 1, 6],
  ['excepteast', 2, 6],
  ['exceptsouth', 3, 6],
  ['cross', 4, 6],
  ['one', 0, 2],
  ['endnorth', 1, 2],
  ['endeast', 2, 2],
  ['endsouth', 3, 2],
  ['endwest', 4, 2],
];

export function getRoadImages(): Record<string, ImageOffset> {
  const draw = new Image();
  draw.src = TerrainImage;
  const roadImages: Record<string, ImageOffset> = {};
  for (let i = 0; i < roadImageRaw.length; i++) {
    const [name, xOffset, yOffset] = roadImageRaw[i];
    roadImages[name] = {
      image: TerrainImage,
      draw,
      tileWidth: 1,
      tileHeight: 1,
      xOffset,
      yOffset,
      name,
    };
  }
  return roadImages;
}

// 1: road, 0: grass, 2: component
// north, east, south, west
export const roadMapping: Record<string, string> = {
  '0000': 'one',
  '0001': 'endwest',
  '0010': 'endsouth',
  '0011': 'westsouth',
  '0100': 'endeast',
  '0101': 'horizontal',
  '0110': 'eastsouth',
  '0111': 'exceptnorth',
  '1000': 'endnorth',
  '1001': 'westnorth',
  '1010': 'vertical',
  '1011': 'excepteast',
  '1100': 'eastnorth',
  '1101': 'exceptsouth',
  '1110': 'exceptwest',
  '1111': 'cross',
};

export function generateMapPattern(
  columns: number,
  rows: number,
): Record<number, string> {
  const mapPattern: Record<number, string> = {};
  const grassTypes = ['grass', 'leaf1', 'leaf2'];
  for (let i = 0; i < columns * rows; i++) {
    const randomGrassType =
      grassTypes[Math.floor(Math.random() * grassTypes.length)];
    mapPattern[i] = randomGrassType;
  }
  return mapPattern;
}

export function generateSeaPattern(
  columns: number,
  rows: number,
): Record<number, string> {
  const seaPattern: Record<number, string> = {};
  const seaOptions = [
    { name: 'sea', chance: 0.75 },
    { name: 'float1', chance: 0.14 },
    { name: 'float2', chance: 0.05 },
    { name: 'float3', chance: 0.04 },
    { name: 'float4', chance: 0.01 },
    { name: 'float5', chance: 0.01 },
  ];
  for (let i = 0; i < columns * rows; i++) {
    const randomValue = Math.random();
    let cumulativeChance = 0;
    for (const option of seaOptions) {
      cumulativeChance += option.chance;
      if (randomValue < cumulativeChance) {
        seaPattern[i] = option.name;
        break;
      }
    }
  }
  return seaPattern;
}

export const seaImageRaw: [string, number, number][] = [
  ['lt', 0, 7],
  ['mt', 1, 7],
  ['rt', 2, 7],
  ['lb', 3, 7],
  ['mb', 4, 7],
  ['rb', 5, 7],
  ['lc', 0, 8],
  ['rc', 1, 8],
  ['sea', 2, 8],
  ['float1', 0, 9],
  ['float2', 1, 9],
  ['float3', 2, 9],
  ['float4', 3, 9],
  ['float5', 4, 9],
];

export function getSeaImages(): Record<string, ImageOffset> {
  const draw = new Image();
  draw.src = TerrainImage;
  const seaImages: Record<string, ImageOffset> = {};
  for (let i = 0; i < seaImageRaw.length; i++) {
    const [name, xOffset, yOffset] = seaImageRaw[i];
    seaImages[name] = {
      image: TerrainImage,
      draw,
      tileWidth: 1,
      tileHeight: 1,
      xOffset,
      yOffset,
      name,
    };
  }
  return seaImages;
}

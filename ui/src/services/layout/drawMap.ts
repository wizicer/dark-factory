import { ImageOffset, MapParameters, roadMapping } from './definitions';

export function redrawMap(par: MapParameters): void {
  if (par.context) {
    par.context.clearRect(0, 0, par.mapWidth, par.mapHeight);

    const occupied: Record<number, boolean> = {};
    // convert tiles to occupied by fill component width/height
    for (let i = 0; i < par.mapColumns * par.mapRows; i++) {
      const pt = par.tiles[i];
      if (pt !== null) {
        const t = par.placements[pt];
        for (let j = 0; j < t.tileWidth; j++) {
          for (let k = 0; k < t.tileHeight; k++) {
            occupied[i + k * par.mapColumns + j] = true;
          }
        }
      }
    }

    // draw border of map with outside sea and inner grass with direction using offset and sea images
    for (let row = 0; row < par.fixedMapRows; row++) {
      for (let col = 0; col < par.fixedMapColumns; col++) {
        if (
          row > par.offsetRows &&
          row < par.mapRows - par.offsetRows - 1 &&
          col > par.offsetColumns &&
          col < par.mapColumns - par.offsetColumns - 1
        )
          continue;
        const x = col * par.tileWidth;
        const y = row * par.tileHeight;

        let seaName = '';
        if (row == par.offsetRows - 1 && col == par.offsetColumns - 1) {
          seaName = 'lt';
        } else if (
          row == par.offsetRows + par.mapRows &&
          col == par.mapColumns + par.offsetColumns
        ) {
          seaName = 'rb';
        } else if (
          row == par.offsetRows - 1 &&
          col == par.mapColumns + par.offsetColumns
        ) {
          seaName = 'rt';
        } else if (
          row == par.offsetRows + par.mapRows &&
          col == par.offsetColumns - 1
        ) {
          seaName = 'lb';
        } else if (
          col == par.offsetColumns - 1 &&
          row > par.offsetRows - 1 &&
          row < par.mapRows + par.offsetRows
        ) {
          seaName = 'lc';
        } else if (
          row == par.offsetRows - 1 &&
          col > par.offsetColumns - 1 &&
          col < par.mapColumns + par.offsetColumns
        ) {
          seaName = 'mt';
        } else if (
          col == par.mapColumns + par.offsetColumns &&
          row > par.offsetRows - 1 &&
          row < par.mapRows + par.offsetRows
        ) {
          seaName = 'rc';
        } else if (
          row == par.mapRows + par.offsetRows &&
          col > par.offsetColumns - 1 &&
          col < par.mapColumns + par.offsetColumns
        ) {
          seaName = 'mb';
        } else {
          seaName = par.seaPattern[row * par.fixedMapColumns + col];
        }

        if (!par.seaImages[seaName])
          console.log('cannot find seaName', seaName);
        par.context.drawImage(
          par.seaImages[seaName].draw,
          par.seaImages[seaName].xOffset * (par.baseSize + 1),
          par.seaImages[seaName].yOffset * (par.baseSize + 1),
          par.seaImages[seaName].tileWidth * par.baseSize,
          par.seaImages[seaName].tileHeight * par.baseSize,
          x,
          y,
          par.seaImages[seaName].tileWidth * par.baseSize,
          par.seaImages[seaName].tileHeight * par.baseSize,
        );
      }
    }

    // draw roads according to direction and position
    for (let row = 0; row < par.mapRows; row++) {
      for (let col = 0; col < par.mapColumns; col++) {
        const tileIndex = row * par.mapColumns + col;
        const tile = par.tiles[tileIndex];
        const x = col * par.tileWidth;
        const y = row * par.tileHeight;
        // 1: road, 0: grass, 2: component
        const north =
          row < 0
            ? 0
            : par.tiles[tileIndex - par.mapColumns] == 0
              ? 1
              : occupied[tileIndex - par.mapColumns]
                ? 1
                : 0;
        const south =
          row >= par.mapRows - 1
            ? 0
            : par.tiles[tileIndex + par.mapColumns] == 0
              ? 1
              : occupied[tileIndex + par.mapColumns]
                ? 1
                : 0;
        const east =
          col >= par.mapColumns - 1
            ? 0
            : par.tiles[tileIndex + 1] == 0
              ? 1
              : occupied[tileIndex + 1]
                ? 1
                : 0;
        const west =
          col < 0
            ? 0
            : par.tiles[tileIndex - 1] == 0
              ? 1
              : occupied[tileIndex - 1]
                ? 1
                : 0;
        let roadImage: ImageOffset;
        if (tile === 0 && !!par.placements[tile]) {
          roadImage =
            par.roadImages[roadMapping[`${north}${east}${south}${west}`]];
        } else {
          roadImage = par.roadImages[par.mapPattern[tileIndex]];
        }

        par.context.drawImage(
          roadImage.draw,
          roadImage.xOffset * (par.baseSize + 1),
          roadImage.yOffset * (par.baseSize + 1),
          roadImage.tileWidth * par.baseSize,
          roadImage.tileHeight * par.baseSize,
          par.offsetColumns * par.baseSize + x,
          par.offsetRows * par.baseSize + y,
          roadImage.tileWidth * par.baseSize,
          roadImage.tileHeight * par.baseSize,
        );
      }
    }

    // draw components
    for (let row = 0; row < par.mapRows; row++) {
      for (let col = 0; col < par.mapColumns; col++) {
        const tileIndex = row * par.mapColumns + col;
        const tile = par.tiles[tileIndex];
        if (tile && !!par.placements[tile]) {
          const t = par.placements[tile];
          const x = col * par.tileWidth;
          const y = row * par.tileHeight;
          par.context.drawImage(
            t.draw,
            t.xOffset * (par.baseSize + 1),
            t.yOffset * (par.baseSize + 1),
            t.tileWidth * par.baseSize,
            t.tileHeight * par.baseSize,
            par.offsetColumns * par.baseSize + x,
            par.offsetRows * par.baseSize + y,
            t.tileWidth * par.baseSize,
            t.tileHeight * par.baseSize,
          );
        }
      }
    }
  }
}

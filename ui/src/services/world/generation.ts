export function generateIslandImage(
  width: number,
  height: number,
  max_width = 30,
  max_height = 30,
): string {
  const canvas = document.createElement('canvas');
  canvas.width = max_width;
  canvas.height = max_height;
  const ctx = canvas.getContext('2d');
  if (ctx === null) return '';

  const left = Math.floor((max_width - width) / 2);
  const top = Math.floor((max_height - height) / 2);

  for (let i = 0; i < max_width; i++) {
    for (let j = 0; j < max_height; j++) {
      // if within range draw green pixel, other wise draw blue pixel
      if (i >= left && i < left + width && j >= top && j < top + height) {
        ctx.fillStyle = 'rgb(0, 255, 0)'; // Green color
      } else {
        ctx.fillStyle = 'rgb(0, 0, 255)'; // Blue color
      }
      ctx.fillRect(i, j, 1, 1); // Draw a 1x1 pixel at (i, j)
    }
  }

  return canvas.toDataURL(); // Convert to data URL
}

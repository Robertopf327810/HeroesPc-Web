import { Jimp } from 'jimp';

const inputPath = './src/assets/HEROESPC-LOGO.jpg';
const outputPath = './src/assets/HEROESPC-LOGO.png';

const image = await Jimp.read(inputPath);
const { width, height } = image.bitmap;

let minX = width;
let minY = height;
let maxX = 0;
let maxY = 0;

// 1. Vuelve transparentes los píxeles blancos del fondo y detecta los bordes reales del emblema
image.scan(0, 0, width, height, function (x, y, idx) {
  const r = this.bitmap.data[idx];
  const g = this.bitmap.data[idx + 1];
  const b = this.bitmap.data[idx + 2];

  const isWhiteBg = r > 238 && g > 238 && b > 238;
  if (isWhiteBg) {
    this.bitmap.data[idx + 3] = 0; // Transparente
  } else {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
});

// 2. Recorta exactamente al tamaño del emblema incluyendo el texto inferior "GAMES & HARDWARE"
const cropW = maxX - minX + 1;
const cropH = maxY - minY + 1;
image.crop({ x: minX, y: minY, w: cropW, h: cropH });

await image.write(outputPath);
console.log(`Logo recortado sin fondo blanco guardado en ${outputPath} (${cropW}x${cropH})`);
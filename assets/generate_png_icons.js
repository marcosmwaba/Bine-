import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Standard launcher sizes (width & height)
const standardSizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

// Adaptive foreground launcher sizes
const foregroundSizes = {
  'mipmap-mdpi': 108,
  'mipmap-hdpi': 162,
  'mipmap-xhdpi': 216,
  'mipmap-xxhdpi': 324,
  'mipmap-xxxhdpi': 432,
};

const srcSvgPath = './assets/icon.svg';

async function generate() {
  try {
    const svgContent = fs.readFileSync(srcSvgPath, 'utf8');

    // Create transparent foreground SVG content by removing the solid white background path
    // The background path is the line containing fill="#FEFEFE"
    const fgSvgContent = svgContent
      .split('\n')
      .filter(line => !line.includes('fill="#FEFEFE"'))
      .join('\n');

    const svgBuffer = Buffer.from(svgContent);
    const fgSvgBuffer = Buffer.from(fgSvgContent);

    // Generate standard & round icons
    for (const [folder, size] of Object.entries(standardSizes)) {
      const destDir = path.join('./android/app/src/main/res', folder);
      fs.mkdirSync(destDir, { recursive: true });

      // standard ic_launcher
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join(destDir, 'ic_launcher.png'));

      // round ic_launcher_round
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join(destDir, 'ic_launcher_round.png'));

      console.log(`Generated standard and round icons for ${folder} (${size}x${size})`);
    }

    // Generate adaptive foreground icons
    for (const [folder, size] of Object.entries(foregroundSizes)) {
      const destDir = path.join('./android/app/src/main/res', folder);
      fs.mkdirSync(destDir, { recursive: true });

      // foreground ic_launcher_foreground
      await sharp(fgSvgBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join(destDir, 'ic_launcher_foreground.png'));

      console.log(`Generated foreground icon for ${folder} (${size}x${size})`);
    }

    console.log('All Android launcher icons generated successfully using Sharp!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generate();

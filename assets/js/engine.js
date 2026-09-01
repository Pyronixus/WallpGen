import { t, getDayName, getMonthName } from "./translate.js";

const DESKTOP_W = 3840, DESKTOP_H = 2160;
const MOBILE_W = 1290, MOBILE_H = 2796;

const PALETTES = [
  { name: "Charcoal", colors: ["#000000", "#141414", "#2a2a2a", "#404040", "#595959", "#737373", "#8c8c8c", "#b3b3b3", "#d9d9d9", "#ffffff"] },
  { name: "Stone", colors: ["#1a1714", "#2c2825", "#3e3a35", "#534e47", "#6b655c", "#857d72", "#9f9688", "#b8b0a3", "#d1c9bd", "#ece6dc"] },
  { name: "Blue", colors: ["#01052b", "#04137a", "#0825c7", "#0d39ff", "#1552ff", "#2f73ff", "#58a3ff", "#7dc3ff", "#aedfff", "#edf8ff"] },
  { name: "Sunrise", colors: ["#031c35", "#05284a", "#063862", "#0b4b7a", "#ff5b40", "#ff7240", "#ff9438", "#ffb33f", "#ffd064", "#fff0c8"] },
  { name: "Fire", colors: ["#1a0000", "#450000", "#7a0000", "#b30000", "#e63900", "#ff6a00", "#ff9500", "#ffb700", "#ffd166", "#fff1c2"] },
  { name: "Purple", colors: ["#100014", "#22002e", "#3f005a", "#5c0085", "#7a00b3", "#9b1fff", "#b84dff", "#cf88ff", "#e4c2ff", "#f7ebff"] },
  { name: "Toxic Glow", colors: ["#050807", "#0c1410", "#14221a", "#1e3325", "#2a4d2e", "#3f6b2f", "#5f8a2c", "#86b326", "#b9e83f", "#f6ffe0"] },
  { name: "Arctic Winter", colors: ["#081018", "#112131", "#1d3348", "#33516a", "#55768f", "#7d9eb5", "#a7c2d3", "#cfe0ea", "#e8f0f5", "#ffffff"] },
  { name: "Neon Horizon", colors: ["#13051a", "#290d3a", "#3c1259", "#3b2285", "#2b42b0", "#1d6cd4", "#2ca1e8", "#59cef2", "#94f2f7", "#e0fbfd"] },
  { name: "Solar Flare", colors: ["#1f0505", "#3a0d0d", "#611111", "#871c26", "#ab3037", "#cb4f41", "#e6744a", "#f79d5c", "#fcc579", "#fdf2a6"] },
  { name: "Deep Forest", colors: ["#051214", "#0b2426", "#123a39", "#18524c", "#226b5d", "#32856c", "#49a07a", "#68ba89", "#91d49d", "#c3ebd0"] },
  { name: "Cosmic Blush Nebula", colors: ["#120414", "#260824", "#3f0f3d", "#5c1a5c", "#7a2a7a", "#a33a86", "#c85b98", "#e98fb6", "#ffd0dd", "#fff1f6"] },
  { name: "Ocean Depths", colors: ["#020c1b", "#0a1628", "#0f2847", "#0d3b6e", "#0e5a8a", "#1a7fa0", "#30a5b8", "#5eccc5", "#96ead8", "#d4fff2"] },
  { name: "Blood Moon", colors: ["#000000", "#0f0000", "#1f0000", "#330000", "#4d0000", "#6b0000", "#880000", "#a50000", "#c40000", "#e60000"] },
];

const PARSED_PALETTES = PALETTES.map(p => ({
  colors: p.colors.map(hex => ({
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16)
  }))
}));

const PATTERNS = ["flowing-hills", "smooth-wave", "sand-dunes", "mountains", "concentric-arcs", "desert-dunes"];
const PATTERN_LABELS = PATTERNS.map((p) => t(`pattern.${p}`));

let globalSeedOffset = 0;

// Buffer réutilisable pour éviter la création d'objets (Garbage Collection)
const RIDGE_BUFFER = new Float32Array(2048);

function mulberry32Hash(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

// Bruit entier Ultra-Rapide (remplace Math.sin)
function fastHash(x) {
  let n = (x | 0) & 0xffff;
  n = (n << 13) ^ n;
  return (1.0 - ((n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824) * 0.5 + 0.5;
}

function perlinNoise(x) {
  const integerPart = Math.floor(x);
  const fractionalPart = x - integerPart;
  const smoothstep = fractionalPart * fractionalPart * (3 - 2 * fractionalPart);
  const basePhase = (integerPart + globalSeedOffset) | 0;
  const valueA = fastHash(basePhase);
  const valueB = fastHash(basePhase + 127);
  return valueA + (valueB - valueA) * smoothstep;
}

function fractionalBrownianMotion(x, octaveCount = 4) {
  let totalValue = 0;
  let amplitude = 0.5;
  let frequency = 1;
  for (let i = 0; i < octaveCount; i++) {
    totalValue += amplitude * perlinNoise(x * frequency);
    amplitude *= 0.5;
    frequency *= 2.1;
  }
  return totalValue;
}

function interpolateColor(c1, c2, factor) {
  return `rgb(${(c1.r + (c2.r - c1.r) * factor) | 0},${(c1.g + (c2.g - c1.g) * factor) | 0},${(c1.b + (c2.b - c1.b) * factor) | 0})`;
}

function getPaletteColor(paletteIndex, normalization, isDarkMode) {
  const colors = PARSED_PALETTES[paletteIndex].colors;
  const adjustedNorm = isDarkMode ? 1 - normalization : normalization;
  const colorIndex = adjustedNorm * (colors.length - 1);
  const floorIndex = colorIndex | 0;

  if (floorIndex >= colors.length - 1) {
    const c = colors[colors.length - 1];
    return `rgb(${c.r},${c.g},${c.b})`;
  }
  if (floorIndex < 0) {
    const c = colors[0];
    return `rgb(${c.r},${c.g},${c.b})`;
  }
  return interpolateColor(colors[floorIndex], colors[floorIndex + 1], colorIndex - floorIndex);
}

function getBackgroundColor(paletteIndex, isDarkMode) {
  const colors = PARSED_PALETTES[paletteIndex].colors;
  const c = isDarkMode ? colors[colors.length - 1] : colors[0];
  return `rgb(${c.r},${c.g},${c.b})`;
}

// Dessin optimisé des sapins en une seule passe
function drawPineTree(context, centerX, baseY, treeWidth, treeHeight, randomGenerator, isExport = false) {
  context.beginPath();
  // Tronc
  context.rect(centerX - treeWidth * 0.08, baseY - treeHeight * 0.15, treeWidth * 0.16, treeHeight * 0.15);

  const segmentCount = isExport ? 12 : 4;
  for (let i = 0; i < segmentCount; i++) {
    const progress = i / (segmentCount - 1);
    const segmentTopY = baseY - treeHeight + treeHeight * progress * 0.45;
    const segmentBottomY = baseY - treeHeight + treeHeight * (progress + 0.22);
    const segmentWidth = treeWidth * (0.25 + progress * 0.75);
    const leftJitter = (randomGenerator() - 0.5) * (treeWidth * 0.08);
    const rightJitter = (randomGenerator() - 0.5) * (treeWidth * 0.08);

    context.moveTo(centerX, segmentTopY);
    context.lineTo(centerX - segmentWidth / 2 + leftJitter, segmentBottomY);
    context.lineTo(centerX + segmentWidth / 2 + rightJitter, segmentBottomY);
  }
  context.fill();
}

function drawFlowingHills(context, width, height, paletteIndex, randomGen, isDarkMode, isExport = false) {
  const layerCount = 5;
  const isDesktop = width > height;
  const pixelStep = isExport ? Math.max(2, (width / 300) | 0) : Math.max(6, (width / 80) | 0);
  const invWidth = 1 / width;
  const octaves = isExport ? 8 : 3;

  for (let layerIndex = 0; layerIndex < layerCount; layerIndex++) {
    const layerFactor = (layerIndex + 1) / layerCount;
    const verticalSpacing = isDesktop ? 0.4 : 0.33;
    const layerBaseY = height * (0.5 + (layerIndex / layerCount) * verticalSpacing);

    context.fillStyle = getPaletteColor(paletteIndex, layerFactor * 0.85 + 0.1, isDarkMode);
    context.beginPath();
    context.moveTo(0, height);

    const freqMod = layerIndex * 4.5;
    const freqModHill = layerIndex * 2.1;
    const mountainHeight = isDesktop ? height * 0.32 : height * 0.12;
    const hillHeight = isDesktop ? height * 0.16 : height * 0.06;
    const mountainOffset = isDesktop ? height * 0.12 : height * 0.05;
    const hillOffset = isDesktop ? height * 0.01 : height * 0.02;

    let idx = 0;
    for (let pixelX = 0; pixelX <= width + pixelStep; pixelX += pixelStep) {
      const normalizedX = pixelX * invWidth;
      let pixelY;

      if (layerIndex < 2) {
        const mountainFrequency = isDesktop ? 4.5 : 2.5;
        pixelY = layerBaseY + fractionalBrownianMotion(normalizedX * mountainFrequency + freqMod, octaves) * mountainHeight - mountainOffset;
      } else {
        const hillFrequency = isDesktop ? 2.5 : 1.5;
        pixelY = layerBaseY + fractionalBrownianMotion(normalizedX * hillFrequency + freqModHill, octaves) * hillHeight - hillOffset;
      }

      if (idx < RIDGE_BUFFER.length) RIDGE_BUFFER[idx++] = pixelY;
      context.lineTo(pixelX, pixelY);
    }

    context.lineTo(width, height);
    context.lineTo(0, height);
    context.closePath();
    context.fill();

    if (layerIndex >= 1) {
      const baseScale = isDesktop ? 0.045 + layerIndex * 0.004 : 0.12 + layerIndex * 0.004;
      const treeBaseWidth = (isDesktop ? height : width) * baseScale;
      const treeBaseHeight = treeBaseWidth * (1 + randomGen() * 0.2);
      const horizontalStep = treeBaseWidth * (isExport ? 0.35 : 0.6);
      const totalPoints = idx - 1;

      for (let plantX = 0; plantX <= width; plantX += horizontalStep) {
        const pointIndex = Math.min(totalPoints, Math.max(0, ((plantX * invWidth) * totalPoints) | 0));
        const ridgeY = RIDGE_BUFFER[pointIndex];

        let verticalRows = isDesktop ? (layerIndex === 1 ? 2 : 3) : (layerIndex === 1 ? 1 : 2);

        for (let rowIndex = 0; rowIndex < verticalRows; rowIndex++) {
          const rowVerticalOffset = rowIndex * (treeBaseHeight * 0.22);
          const treeBottomY = ridgeY + rowVerticalOffset;
          if (treeBottomY > height + 20) continue;

          const scaleMultiplier = isDesktop ? 0.65 + randomGen() * 1.1 : 0.8 + randomGen() * 0.4;
          const finalTreeWidth = treeBaseWidth * (isDesktop ? Math.min(scaleMultiplier, 1.1) : scaleMultiplier);
          const jitteredX = plantX + (randomGen() - 0.5) * (horizontalStep * 0.5);

          drawPineTree(context, jitteredX, treeBottomY, finalTreeWidth, treeBaseHeight * scaleMultiplier, randomGen, isExport);
        }
      }
    }
  }
}

function drawSmoothWave(context, width, height, paletteIndex, randomGen, isDarkMode, isExport = false) {
  const layerCount = 6 + ((randomGen() * 3) | 0);
  const waveCenter = width * (0.45 + randomGen() * 0.1);
  const waveBase = height * (0.75 + randomGen() * 0.08);
  const samplingSteps = isExport ? 120 : 40;
  const invWidth = width / samplingSteps;
  const invHeight = 2 / height;
  const octaves = isExport ? 3 : 2;

  for (let i = layerCount; i >= 0; i--) {
    const layerFactor = i / layerCount;
    const waveSpread = height * (0.8 + layerFactor * 1.8);
    const wavePeakHeight = height * (0.05 + layerFactor * 0.3);
    const asymmetrySkew = randomGen() * 0.2 - 0.1;
    const noiseMod = i * 1.4;
    const invWaveSpread = 1 / waveSpread;

    context.beginPath();
    context.moveTo(0, height);
    context.lineTo(0, waveBase + wavePeakHeight * 0.5);

    for (let step = 0; step <= samplingSteps; step++) {
      const pixelX = step * invWidth;
      const distance = (pixelX - waveCenter) * invWaveSpread;
      const bellCurve = Math.exp(-distance * distance * 0.4);
      const asymmetryFactor = 1 + asymmetrySkew * distance;
      const waveDisplacement = bellCurve * wavePeakHeight * asymmetryFactor;
      const microDetail = fractionalBrownianMotion(pixelX * invHeight + noiseMod, octaves) * height * 0.008;

      context.lineTo(pixelX, waveBase - waveDisplacement + microDetail);
    }

    context.lineTo(width, height);
    context.closePath();
    context.fillStyle = getPaletteColor(paletteIndex, 0.1 + (1 - layerFactor) * 0.8, isDarkMode);
    context.fill();
  }
}

function drawSandDunes(context, width, height, paletteIndex, randomGen, isDarkMode, isExport = false) {
  const layerCount = 6 + ((randomGen() * 3) | 0);
  const step = isExport ? Math.max(2, (width / 600) | 0) : Math.max(8, (width / 100) | 0);
  const invHeight = 1 / height;
  const waveAmplitude = height * 0.05;
  const octaves = isExport ? 3 : 2;

  for (let layerIndex = 0; layerIndex < layerCount; layerIndex++) {
    const layerFactor = (layerIndex + 1) / layerCount;
    const duneBase = height * (0.55 + layerFactor * 0.35);
    const waveFrequency = 0.5 + randomGen() * 0.8;
    const wavePhase = randomGen() * 10;
    const noiseMod = layerIndex * 2.1;

    context.beginPath();
    for (let pixelX = 0; pixelX <= width + step; pixelX += step) {
      const normalizedX = pixelX * invHeight;
      const sinusoidalWave = Math.sin(normalizedX * Math.PI * waveFrequency + wavePhase) * waveAmplitude;
      const noiseDetail = fractionalBrownianMotion(normalizedX * 0.8 + noiseMod, octaves) * waveAmplitude;
      const pixelY = duneBase + sinusoidalWave + noiseDetail;

      if (pixelX === 0) context.moveTo(pixelX, pixelY);
      else context.lineTo(pixelX, pixelY);
    }

    context.lineTo(width, height);
    context.lineTo(0, height);
    context.closePath();
    context.fillStyle = getPaletteColor(paletteIndex, layerFactor * 0.8 + 0.15, isDarkMode);
    context.fill();
  }
}

function drawMountains(context, width, height, paletteIndex, randomGen, isDarkMode, isExport = false) {
  const layerCount = 4 + ((randomGen() * 2) | 0);
  const step = isExport ? Math.max(2, (width / 600) | 0) : Math.max(8, (width / 100) | 0);
  const invHeight = 1 / height;
  const octaves = isExport ? 3 : 2;

  for (let layerIndex = 0; layerIndex < layerCount; layerIndex++) {
    const layerFactor = (layerIndex + 1) / layerCount;
    const mountainBase = height * (0.55 + layerFactor * 0.35);
    const peakNumber = 2 + ((randomGen() * 2) | 0);
    const noiseMod = layerIndex * 2.3 + randomGen() * 50;

    const mountainPeaks = [];
    for (let peakIndex = 0; peakIndex < peakNumber; peakIndex++) {
      const w = height * (0.6 + randomGen() * 0.6);
      mountainPeaks.push({
        cx: width * (0.1 + randomGen() * 0.8),
        peakH: height * (0.1 + randomGen() * 0.15) * (1 - layerIndex * 0.08),
        width: w,
        invWidth: 1 / w
      });
    }

    context.beginPath();
    context.moveTo(-2, height + 2);

    for (let pixelX = -2; pixelX <= width + step + 2; pixelX += step) {
      let pixelY = mountainBase;

      for (let i = 0; i < mountainPeaks.length; i++) {
        const peak = mountainPeaks[i];
        const distanceFromPeak = Math.abs(pixelX - peak.cx);
        if (distanceFromPeak < peak.width) {
          const peakRise = 1 - (distanceFromPeak * peak.invWidth);
          const peakElevation = Math.pow(peakRise, 1.3 + randomGen() * 0.3) * peak.peakH;
          pixelY = Math.min(pixelY, mountainBase - peakElevation);
        }
      }

      const microDetail = fractionalBrownianMotion(pixelX * invHeight * 1.5 + noiseMod, octaves) * height * 0.008;
      context.lineTo(pixelX, pixelY + microDetail);
    }

    context.lineTo(width + step + 2, height + 2);
    context.closePath();
    context.fillStyle = getPaletteColor(paletteIndex, layerFactor * 0.8 + 0.12, isDarkMode);
    context.fill();
  }
}

function drawConcentricArcs(context, width, height, paletteIndex, randomGen, isDarkMode) {
  const maxRadius = height * 1.0;
  const centerOriginX = width * (0.45 + randomGen() * 0.1);
  const centerOriginY = height * 1.5;
  const ringCount = 10 + ((randomGen() * 4) | 0);
  const invRingCount = 1 / ringCount;

  for (let ringIndex = ringCount; ringIndex >= 0; ringIndex--) {
    const ringFactor = ringIndex * invRingCount;
    context.beginPath();
    context.arc(centerOriginX, centerOriginY, maxRadius * ringFactor, 0, Math.PI * 2);
    context.fillStyle = getPaletteColor(paletteIndex, 0.1 + (1 - ringFactor) * 0.8, isDarkMode);
    context.fill();
  }
}

function drawDesertDunes(context, width, height, paletteIndex, randomGen, isDarkMode) {
  for (let strokeIndex = 0; strokeIndex < 10; strokeIndex++) {
    const strokeFactor = strokeIndex / 10;
    context.beginPath();
    let currentX = width * randomGen();
    let currentY = height * (0.5 + randomGen() * 0.5);
    context.moveTo(currentX, currentY);

    for (let segmentIndex = 0; segmentIndex < 6; segmentIndex++) {
      currentX += (randomGen() - 0.5) * width;
      currentY += (randomGen() - 0.4) * height * 0.2;
      context.bezierCurveTo(
        width * randomGen(), height * (0.5 + randomGen() * 0.5),
        width * randomGen(), height * (0.5 + randomGen() * 0.5),
        currentX, currentY
      );
    }
    context.strokeStyle = getPaletteColor(paletteIndex, strokeFactor, isDarkMode);
    context.lineWidth = randomGen() * 3;
    context.stroke();
  }
}

export function drawClockOverlay(context, width, height, displayType, paletteIndex, isDarkMode) {
  const colors = PARSED_PALETTES[paletteIndex].colors;
  const c = isDarkMode ? colors[colors.length - 1] : colors[0];
  const luminance = (c.r * 299 + c.g * 587 + c.b * 114) / 1000;

  context.fillStyle = luminance > 125 ? "rgba(0, 0, 0, 0.75)" : "rgba(255, 255, 255, 0.9)";
  context.textAlign = "center";
  context.textBaseline = "middle";

  const currentDateTime = new Date();
  const hoursFormatted = String(currentDateTime.getHours()).padStart(2, "0");
  const minutesFormatted = String(currentDateTime.getMinutes()).padStart(2, "0");
  const timeDisplay = `${hoursFormatted}:${minutesFormatted}`;
  const dateDisplay = `${getDayName(currentDateTime.getDay())}, ${currentDateTime.getDate()} ${getMonthName(currentDateTime.getMonth())}`;

  if (displayType === "desktop") {
    context.font = '300 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
    context.fillText(dateDisplay, width / 2, height * 0.2);
    context.font = '600 42px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
    context.fillText(timeDisplay, width / 2, height * 0.3);
  } else if (displayType === "mobile") {
    context.font = '500 7px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
    context.fillText(dateDisplay.toUpperCase(), width / 2, height * 0.15);
    context.font = '700 28px -apple-system, BlinkMacSystemFont, "SF Pro Display", Roboto';
    context.fillText(timeDisplay, width / 2, height * 0.23);
  }
}

export function drawPattern(context, width, height, patternIndex, paletteIndex, randomSeedValue, isDarkMode = false, isExport = false) {
  globalSeedOffset = (randomSeedValue * 0.01) | 0;
  const randomNumberGenerator = mulberry32Hash(randomSeedValue);

  context.fillStyle = getBackgroundColor(paletteIndex, isDarkMode);
  context.fillRect(0, 0, width, height);

  switch (PATTERNS[patternIndex]) {
    case "flowing-hills": drawFlowingHills(context, width, height, paletteIndex, randomNumberGenerator, isDarkMode, isExport); break;
    case "smooth-wave": drawSmoothWave(context, width, height, paletteIndex, randomNumberGenerator, isDarkMode, isExport); break;
    case "sand-dunes": drawSandDunes(context, width, height, paletteIndex, randomNumberGenerator, isDarkMode, isExport); break;
    case "mountains": drawMountains(context, width, height, paletteIndex, randomNumberGenerator, isDarkMode, isExport); break;
    case "concentric-arcs": drawConcentricArcs(context, width, height, paletteIndex, randomNumberGenerator, isDarkMode); break;
    case "desert-dunes": drawDesertDunes(context, width, height, paletteIndex, randomNumberGenerator, isDarkMode); break;
  }
}

export async function exportWallpaper(width, height, patternIndex, paletteIndex, randomSeed, isDarkMode, outputFilename) {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = width;
  exportCanvas.height = height;
  drawPattern(exportCanvas.getContext("2d"), width, height, patternIndex, paletteIndex, randomSeed, isDarkMode, true);

  const imageBlob = await new Promise((resolve) => exportCanvas.toBlob(resolve, "image/png"));
  const arrayBuffer = await imageBlob.arrayBuffer();
  const byteArray = Array.from(new Uint8Array(arrayBuffer));

  if (window.__TAURI__) {
    await window.__TAURI__.core.invoke("save_wallpaper", { bytes: byteArray, filename: outputFilename });
  } else {
    const blobUrl = URL.createObjectURL(imageBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = blobUrl;
    downloadLink.download = outputFilename;
    downloadLink.click();
  }
}

export { PALETTES, PATTERNS, PATTERN_LABELS, DESKTOP_W, DESKTOP_H, MOBILE_W, MOBILE_H };
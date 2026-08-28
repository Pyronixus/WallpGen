import {
  drawPattern,
  drawClockOverlay,
  exportWallpaper,
  PALETTES,
  PATTERNS,
  DESKTOP_W,
  DESKTOP_H,
  MOBILE_W,
  MOBILE_H,
} from "./engine.js";
import { t } from "./translate.js";

let selectedPattern = 0;
let selectedPalette = 0;
let randomSeed = (Math.random() * 10000) | 0;
let isDarkMode = false;

function renderPreview() {
  const desktopCtx = document.getElementById("previewDesktop").getContext("2d");
  const mobileCtx = document.getElementById("previewMobile").getContext("2d");
  drawPattern(
    desktopCtx,
    640,
    360,
    selectedPattern,
    selectedPalette,
    randomSeed,
    isDarkMode,
  );
  drawPattern(
    mobileCtx,
    145,
    314,
    selectedPattern,
    selectedPalette,
    randomSeed,
    isDarkMode,
  );
  drawClockOverlay(
    desktopCtx,
    640,
    360,
    "desktop",
    selectedPalette,
    isDarkMode,
  );
  drawClockOverlay(mobileCtx, 145, 314, "mobile", selectedPalette, isDarkMode);
}

// Initialize pattern grid
const patternGrid = document.getElementById("styleGrid");
PATTERNS.forEach((patternName, index) => {
  const button = document.createElement("button");
  button.className = "style-btn" + (index === selectedPattern ? " active" : "");
  button.title = t(`pattern.${patternName}`);
  const canvas = document.createElement("canvas");
  canvas.width = 120;
  canvas.height = 75;
  button.appendChild(canvas);
  patternGrid.appendChild(button);
  drawPattern(canvas.getContext("2d"), 120, 75, index, 0, 42, false);
  button.onclick = () => {
    selectedPattern = index;
    patternGrid
      .querySelectorAll(".style-btn")
      .forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    renderPreview();
  };
});

// Initialize palette selector
const paletteRow = document.getElementById("paletteRow");
PALETTES.forEach((palette, index) => {
  const swatch = document.createElement("button");
  swatch.className =
    "palette-swatch" + (index === selectedPalette ? " active" : "");
  swatch.title = palette.name;
  swatch.style.background =
    palette.colors[Math.floor(palette.colors.length / 2)];
  paletteRow.appendChild(swatch);
  swatch.onclick = () => {
    selectedPalette = index;
    paletteRow
      .querySelectorAll(".palette-swatch")
      .forEach((btn) => btn.classList.remove("active"));
    swatch.classList.add("active");
    renderPreview();
  };
});

// Dark mode toggle
document.getElementById("btnDark").onclick = () => {
  isDarkMode = false;
  document.getElementById("btnDark").classList.add("active");
  document.getElementById("btnLight").classList.remove("active");
  renderPreview();
};

// Light mode toggle
document.getElementById("btnLight").onclick = () => {
  isDarkMode = true;
  document.getElementById("btnLight").classList.add("active");
  document.getElementById("btnDark").classList.remove("active");
  renderPreview();
};

// Generate new variation
document.getElementById("btnShuffle").onclick = () => {
  randomSeed = (Math.random() * 100000) | 0;
  renderPreview();
};

// Download desktop wallpaper
document.getElementById("btnDesktop").onclick = () => {
  exportWallpaper(
    DESKTOP_W,
    DESKTOP_H,
    selectedPattern,
    selectedPalette,
    randomSeed,
    isDarkMode,
    "wllpr-desktop-4k.png",
  );
};

// Download mobile wallpaper
document.getElementById("btnMobile").onclick = () => {
  exportWallpaper(
    MOBILE_W,
    MOBILE_H,
    selectedPattern,
    selectedPalette,
    randomSeed,
    isDarkMode,
    "wllpr-iphone.png",
  );
};

renderPreview();

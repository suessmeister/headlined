import p5 from "p5";
import { Character } from "../types/Character";
import seedrandom from "seedrandom";

export function generateCity(
  canvas: HTMLCanvasElement,
  setCharacters: React.Dispatch<React.SetStateAction<Character[]>>,
  seed: string,
) {
  const rng = seedrandom(seed);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const fixedWidth = 1920;
  const fixedHeight = 1080;

  const screenWidth = fixedWidth;
  const screenHeight = fixedHeight;

  // Scale canvas to logical resolution
  canvas.width = fixedWidth;
  canvas.height = fixedHeight;

  ctx.clearRect(0, 0, fixedWidth, fixedHeight);
  // ctx.scale(1, 1); // Keep as 1 for pure logical coords

  // DRAW SKY FIRST
  drawAnimatedSky(ctx, screenWidth, screenHeight);

  // THEN draw city
  // ctx.clearRect(0, 0, screenWidth, screenHeight); // optional clear before buildings
  const newCharacters: Character[] = [];
  drawBuildings(ctx, screenWidth, screenHeight, newCharacters, rng);
  setCharacters(newCharacters);

  // fitCanvasToViewport(canvas);
}

function drawAnimatedSky(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const now = Date.now();
  const t = ((now / 1000) % 60) / 60; // loops every 60 seconds
  const topColor = lerpColor("#FF512F", "#0F2027", t);
  const bottomColor = lerpColor("#F09819", "#001120", t);

  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, topColor);
  gradient.addColorStop(1, bottomColor);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // draw sun
  const sunY = height * 0.4 + Math.sin(t * Math.PI * 2) * 50;
  ctx.beginPath();
  ctx.arc(width * 0.75, sunY, 40, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 204, 0, 0.8)";
  ctx.fill();

  // draw stars fading in
  const starAlpha = t > 0.5 ? (t - 0.5) * 2 : 0;
  ctx.fillStyle = `rgba(255, 255, 255, ${starAlpha})`;
  for (let i = 0; i < 50; i++) {
    const x = (i * 137) % width;
    const y = ((i * 89) % height) * 0.6;
    ctx.beginPath();
    ctx.arc(x, y, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function lerpColor(c1: string, c2: string, t: number): string {
  const hex = (c: string) =>
    c.length === 4
      ? c
          .substring(1)
          .split("")
          .map((ch) => parseInt(ch + ch, 16))
      : [
          parseInt(c.substring(1, 3), 16),
          parseInt(c.substring(3, 5), 16),
          parseInt(c.substring(5, 7), 16),
        ];

  const [r1, g1, b1] = hex(c1);
  const [r2, g2, b2] = hex(c2);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

const drawBuildings = (
  ctx: CanvasRenderingContext2D,
  screenWidth: number,
  screenHeight: number,
  newCharacters: Character[],
  rng: seedrandom.PRNG,
) => {
  const minBuildingWidth = 40;
  const maxBuildingWidth = 80;
  const minBuildingHeight = screenHeight * 0.3;
  const maxBuildingHeight = screenHeight * 0.7;
  const minSpacing = -7;
  const maxSpacing = 10;
  const optimalBuildingCount =
    Math.floor(screenWidth / (minBuildingWidth / 2)) + 15;
  const roadHeight = 100;

  // Draw the road
  ctx.fillStyle = "#333333";
  ctx.fillRect(0, screenHeight - roadHeight, screenWidth, roadHeight);

  // Draw road markings
  ctx.fillStyle = "#FFFFFF";
  const lineWidth = 4;
  const lineSpacing = 30;
  for (let i = 0; i < screenWidth; i += lineSpacing) {
    ctx.fillRect(
      i,
      screenHeight - roadHeight / 2 - lineWidth / 2,
      lineWidth,
      lineWidth,
    );
  }

  let currentX = 0;

  for (let i = 0; i < optimalBuildingCount; i++) {
    const width =
      rng() * (maxBuildingWidth - minBuildingWidth) + minBuildingWidth;
    const height =
      rng() * (maxBuildingHeight - minBuildingHeight) + minBuildingHeight;
    const spacing = rng() * (maxSpacing - minSpacing) + minSpacing;
    const x = i === 0 ? 0 : currentX - spacing;

    if (x > screenWidth + 200) continue;

    const color = i % 2 === 0 ? "#2C3E50" : "#34495E";
    const y = screenHeight - height - roadHeight;

    // Draw building base
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);

    // Draw gothic roof
    const roofHeight = rng() * 30 + 20;
    const spireCount = Math.floor(width / 20);
    const spireWidth = width / spireCount;

    // Draw main roof
    ctx.fillStyle = "#1A1A1A";
    for (let j = 0; j < spireCount; j++) {
      const spireX = x + j * spireWidth;
      ctx.beginPath();
      ctx.moveTo(spireX, y);
      ctx.lineTo(spireX + spireWidth / 2, y - roofHeight);
      ctx.lineTo(spireX + spireWidth, y);
      ctx.closePath();
      ctx.fill();

      // Draw decorative spire
      const spireHeight = roofHeight * 0.3;
      ctx.beginPath();
      ctx.moveTo(spireX + spireWidth / 2, y - roofHeight);
      ctx.lineTo(spireX + spireWidth / 2, y - roofHeight - spireHeight);
      ctx.lineTo(spireX + spireWidth / 2 + 2, y - roofHeight);
      ctx.closePath();
      ctx.fill();
    }

    // Draw decorative arches at the top
    const archCount = Math.floor(width / 20);
    const archWidth = width / archCount;
    ctx.fillStyle = "#E0E0E0";
    for (let j = 0; j < archCount; j++) {
      const archX = x + j * archWidth;

      // Draw main pointed arch
      ctx.beginPath();
      ctx.moveTo(archX, y - 5);
      ctx.quadraticCurveTo(
        archX + archWidth / 2,
        y - 15,
        archX + archWidth,
        y - 5,
      );
      ctx.strokeStyle = "#E0E0E0";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw decorative tracery inside arch
      ctx.beginPath();
      ctx.moveTo(archX + archWidth / 2, y - 5);
      ctx.lineTo(archX + archWidth / 2, y - 10);
      ctx.stroke();

      // draw small decorative circles at arch points
      ctx.beginPath();
      ctx.arc(archX + archWidth / 4, y - 5, 2, 0, Math.PI * 2);
      ctx.arc(archX + (archWidth * 3) / 4, y - 5, 2, 0, Math.PI * 2);
      ctx.fill();

      //Draw small decorative spires above arch
      const spireHeight = 8;
      ctx.beginPath();
      ctx.moveTo(archX + archWidth / 2, y - 15);
      ctx.lineTo(archX + archWidth / 2, y - 15 - spireHeight);
      ctx.lineTo(archX + archWidth / 2 + 2, y - 15);
      ctx.closePath();
      ctx.fill();
    }

    drawWindows(ctx, x, y, width, height, newCharacters, rng);

    currentX += width + spacing;
  }
};

const CHARACTER_PROBABILITY = 0.1;
const drawWindows = (
  ctx: CanvasRenderingContext2D,
  buildingX: number,
  buildingY: number,
  buildingWidth: number,
  buildingHeight: number,
  newCharacters: Character[],
  rng: seedrandom.PRNG,
) => {
  const windowWidth = 15;
  const windowHeight = 20;
  const windowSpacing = 8;
  const margin = 8;

  const maxWindowsX = Math.floor(
    (buildingWidth - margin * 2) / (windowWidth + windowSpacing),
  );
  const maxWindowsY = Math.floor(
    (buildingHeight - margin * 2) / (windowHeight + windowSpacing),
  );

  const windowsX = Math.max(1, maxWindowsX);
  const windowsY = Math.max(1, maxWindowsY);

  for (let row = 0; row < windowsY; row++) {
    for (let col = 0; col < windowsX; col++) {
      const x = buildingX + margin + col * (windowWidth + windowSpacing);
      const y = buildingY + margin + row * (windowHeight + windowSpacing);

      if (x + windowWidth > buildingX + buildingWidth - margin) continue;
      if (y + windowHeight > buildingY + buildingHeight - margin) continue;

      const isLit = rng() > 0.7;
      ctx.fillStyle = isLit ? "#FFD700" : "#2C3E50";
      ctx.fillRect(x, y, windowWidth, windowHeight);

      const windowCenterX = x + windowWidth / 2;
      const windowCenterY = y + windowHeight / 2;

      const isInsideCanvas =
        windowCenterX >= 0 &&
        windowCenterX <= 1920 &&
        windowCenterY >= 0 &&
        windowCenterY <= 1080;

      if (!isInsideCanvas) continue;

      if (isLit && rng() < CHARACTER_PROBABILITY) {
        const isSniper = rng() < 0.4;

        const charX = windowCenterX - 9;
        const verticalOffset = window.innerHeight < 1080 ? -5 : 0;
        const charY = isSniper
          ? windowCenterY - 5 + verticalOffset
          : windowCenterY + verticalOffset;

        newCharacters.push({
          id: Date.now() + rng(),
          x: isSniper ? charX + 2 : charX,
          y: isSniper ? charY : charY - 10.5,
          image: isSniper
            ? "/figures/evil_sniper.png"
            : "/figures/better_s2.gif",
          isSniper,
          phase: isSniper ? "warmup" : undefined,
          nextPhase: isSniper ? Date.now() + 5000 : undefined,
        });
      }
    }
  }
};

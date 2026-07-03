import sharp from "sharp";

const WIDTH = 1080;
const HEIGHT = 1920;

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if ((current + " " + word).trim().length <= maxChars) {
      current = (current + " " + word).trim();
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function createSvg(
  lines: string[],
  bgColor: string,
  textColor: string,
  fontSize: number,
  title?: string
): string {
  const lineHeight = fontSize * 1.4;
  const titleHeight = title ? fontSize * 2.5 : 0;
  const totalTextHeight = lines.length * lineHeight;
  const startY = (HEIGHT - totalTextHeight - titleHeight) / 2;

  let svg = `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="${bgColor}"/>
    <defs>
      <filter id="shadow">
        <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.6"/>
      </filter>
    </defs>`;

  if (title) {
    svg += `<text x="${WIDTH / 2}" y="${startY}" text-anchor="middle"
      font-family="Georgia, serif" font-size="${fontSize * 0.7}"
      fill="${textColor}" opacity="0.6" font-style="italic">${title}</text>`;
  }

  lines.forEach((line, i) => {
    const y = startY + titleHeight + i * lineHeight + fontSize;
    svg += `<text x="${WIDTH / 2}" y="${y}" text-anchor="middle"
      font-family="Georgia, serif" font-size="${fontSize}"
      fill="${textColor}" filter="url(#shadow)">${escapeXml(line)}</text>`;
  });

  svg += "</svg>";
  return svg;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export interface ImageConfig {
  bgColor?: string;
  textColor?: string;
  fontSize?: number;
}

export async function generateImage(
  text: string,
  config?: ImageConfig,
  title?: string
): Promise<Buffer> {
  const bgColor = config?.bgColor || "#1a1a2e";
  const textColor = config?.textColor || "#e0e0e0";
  const fontSize = config?.fontSize || 48;
  const maxChars = 30;

  const lines = wrapText(text, maxChars);
  const svg = createSvg(lines, bgColor, textColor, fontSize, title);

  const image = await sharp({
    create: {
      width: WIDTH,
      height: HEIGHT,
      channels: 3,
      background: hexToRgb(bgColor),
    },
  })
    .composite([
      {
        input: Buffer.from(svg),
        top: 0,
        left: 0,
      },
    ])
    .png()
    .toBuffer();

  return image;
}

export async function generateCarouselImages(
  items: { text: string; title?: string }[],
  bgColor?: string,
  textColor?: string
): Promise<Buffer[]> {
  return Promise.all(
    items.map((item, i) =>
      generateImage(
        item.text,
        {
          bgColor: i % 2 === 0 ? bgColor || "#1a1a2e" : "#16213e",
          textColor: textColor || "#e0e0e0",
          fontSize: i === 0 ? 56 : 48,
        },
        item.title
      )
    )
  );
}

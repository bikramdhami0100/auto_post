import sharp from "sharp";

const WIDTH = 1080;
const HEIGHT = 1920;

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

function escapeXml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

export async function generateImage(
  text: string,
  title?: string,
  citation?: string
): Promise<Buffer> {
  const maxChars = 28;
  const lines = wrapText(text, maxChars);
  const titleLines = title ? wrapText(title, maxChars) : [];
  const citeLines = citation ? wrapText(citation, maxChars) : [];

  const titleHeight = titleLines.length * 90;
  const bodyHeight = lines.length * 75;
  const citeHeight = citeLines.length * 60;
  const totalHeight = titleHeight + bodyHeight + citeHeight + 100;
  const startY = Math.max((HEIGHT - totalHeight) / 2, 100);

  let svg = `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#000000"/>`;

  let y = startY;

  for (const line of titleLines) {
    svg += `<text x="${WIDTH / 2}" y="${y}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="64" fill="#FFFFFF">${escapeXml(line)}</text>`;
    y += 90;
  }

  y += 40;

  for (const line of lines) {
    svg += `<text x="${WIDTH / 2}" y="${y}" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" fill="#FFFFFF">${escapeXml(line)}</text>`;
    y += 75;
  }

  if (citation) {
    y += 30;
    for (const line of citeLines) {
      svg += `<text x="${WIDTH / 2}" y="${y}" text-anchor="middle" font-family="Arial, sans-serif" font-style="italic" font-size="40" fill="#AAAAAA">${escapeXml(line)}</text>`;
      y += 55;
    }
  }

  svg += "</svg>";

  return sharp({
    create: { width: WIDTH, height: HEIGHT, channels: 3, background: { r: 0, g: 0, b: 0 } },
  })
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .png()
    .toBuffer();
}

export async function generateCarouselImages(
  items: { text: string; title?: string }[]
): Promise<Buffer[]> {
  return Promise.all(items.map((item) => generateImage(item.text, item.title)));
}

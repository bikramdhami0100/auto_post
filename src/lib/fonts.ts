import { Noto_Sans_Devanagari } from "next/font/google";
import { registerFont } from "canvas";
import { join } from "path";
import { tmpdir } from "os";
import { existsSync, mkdirSync } from "fs";
import { writeFile } from "fs/promises";

export const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-noto-devanagari",
});

function getFontDir(): string {
  const dir = join(tmpdir(), "autopost-fonts");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

function getLocalPaths(name: string) {
  const dir = getFontDir();
  return {
    regular: join(dir, `${name}-Regular.woff2`),
    bold: join(dir, `${name}-Bold.woff2`),
    light: join(dir, `${name}-Light.woff2`),
  };
}

async function downloadGoogleFont(name: string, cssFamily: string, weights: string): Promise<void> {
  const paths = getLocalPaths(name);
  if (existsSync(paths.regular) && existsSync(paths.bold)) return;

  const cssUrl = `https://fonts.googleapis.com/css2?family=${cssFamily}:wght@${weights}&display=swap`;
  const css = await (await fetch(cssUrl)).text();

  const sections = css.split("@font-face").slice(1);
  const woff2Urls: string[] = [];
  for (const sec of sections) {
    const m = sec.match(/src:\s*url\(([^)]+)\)/);
    if (m) woff2Urls.push(m[1]);
  }

  if (woff2Urls.length >= 1) {
    const resp = await fetch(woff2Urls[0]);
    await writeFile(paths.regular, Buffer.from(await resp.arrayBuffer()));
  }
  if (woff2Urls.length >= 2) {
    const resp = await fetch(woff2Urls[1]);
    await writeFile(paths.bold, Buffer.from(await resp.arrayBuffer()));
  }
  if (woff2Urls.length >= 3) {
    const resp = await fetch(woff2Urls[2]);
    await writeFile(paths.light, Buffer.from(await resp.arrayBuffer()));
  }
}

export async function downloadGoogleFonts(): Promise<void> {
  await downloadGoogleFont("NotoSansDevanagari", "Noto+Sans+Devanagari", "400;700");
  await downloadGoogleFont("Kalam", "Kalam", "300;400;700");
}

export async function initCanvasFonts(): Promise<void> {
  const localFallbackDir = join(process.cwd(), "public", "fonts");
  const ndPaths = getLocalPaths("NotoSansDevanagari");
  const kalamPaths = getLocalPaths("Kalam");

  const fonts: { path: string; family: string; weight?: string }[] = [];

  if (existsSync(ndPaths.regular)) {
    fonts.push({ path: ndPaths.regular, family: "ND" });
  } else if (existsSync(join(localFallbackDir, "NotoSansDevanagari-Regular.ttf"))) {
    fonts.push({ path: join(localFallbackDir, "NotoSansDevanagari-Regular.ttf"), family: "ND" });
  }
  if (existsSync(ndPaths.bold)) {
    fonts.push({ path: ndPaths.bold, family: "ND", weight: "bold" });
  } else if (existsSync(join(localFallbackDir, "NotoSansDevanagari-Bold.ttf"))) {
    fonts.push({ path: join(localFallbackDir, "NotoSansDevanagari-Bold.ttf"), family: "ND", weight: "bold" });
  }

  if (existsSync(kalamPaths.regular)) {
    fonts.push({ path: kalamPaths.regular, family: "K" });
  }
  if (existsSync(kalamPaths.bold)) {
    fonts.push({ path: kalamPaths.bold, family: "K", weight: "bold" });
  }
  if (existsSync(kalamPaths.light)) {
    fonts.push({ path: kalamPaths.light, family: "K", weight: "300" });
  }

  for (const f of fonts) {
    try {
      registerFont(f.path, { family: f.family, weight: f.weight });
    } catch {
      // already registered
    }
  }
}

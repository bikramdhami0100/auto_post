import { Noto_Sans_Devanagari } from "next/font/google";
import { registerFont } from "canvas";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";
import { writeFile, readFile } from "fs/promises";

export const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-noto-devanagari",
});

interface FontUrls {
  regular: string;
  bold: string;
}

async function fetchGoogleFontsCss(): Promise<string> {
  const cssUrl =
    "https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;700&display=swap";
  const resp = await fetch(cssUrl);
  return resp.text();
}

function parseFontUrls(css: string): FontUrls {
  const urls: string[] = [];
  const regex = /src:\s*url\(([^)]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(css)) !== null) {
    urls.push(match[1]);
  }

  const devanagariUrls: string[] = [];
  const sections = css.split("@font-face");
  for (let i = 1; i < sections.length; i++) {
    const section = sections[i];
    if (section.includes("U+0900-097F")) {
      const urlMatch = section.match(/src:\s*url\(([^)]+)\)/);
      if (urlMatch) devanagariUrls.push(urlMatch[1]);
    }
  }

  const filtered =
    devanagariUrls.length >= 2
      ? devanagariUrls
      : urls.filter((u) => /\.woff2/i.test(u));

  return {
    regular: filtered[0] || urls[0],
    bold: filtered[1] || urls[1] || urls[0],
  };
}

function getFontDir(): string {
  const dir = join(process.cwd(), ".next", "fonts");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

function getLocalPaths() {
  const dir = getFontDir();
  return {
    regular: join(dir, "NotoSansDevanagari-Regular.woff2"),
    bold: join(dir, "NotoSansDevanagari-Bold.woff2"),
  };
}

export async function downloadGoogleFonts(): Promise<void> {
  const paths = getLocalPaths();
  if (existsSync(paths.regular) && existsSync(paths.bold)) return;

  const css = await fetchGoogleFontsCss();
  const urls = parseFontUrls(css);

  const regularResp = await fetch(urls.regular);
  if (!regularResp.ok) throw new Error(`Failed to download regular font`);
  await writeFile(paths.regular, Buffer.from(await regularResp.arrayBuffer()));

  const boldResp = await fetch(urls.bold);
  if (!boldResp.ok) throw new Error(`Failed to download bold font`);
  await writeFile(paths.bold, Buffer.from(await boldResp.arrayBuffer()));

  console.log(`Fonts downloaded to ${getFontDir()}`);
}

export async function initCanvasFonts(): Promise<void> {
  const localFallbackDir = join(process.cwd(), "public", "fonts");
  const localRegular = join(localFallbackDir, "NotoSansDevanagari-Regular.ttf");
  const localBold = join(localFallbackDir, "NotoSansDevanagari-Bold.ttf");

  const paths = getLocalPaths();

  if (existsSync(paths.regular) && existsSync(paths.bold)) {
    try {
      registerFont(paths.regular, { family: "ND" });
      registerFont(paths.bold, { family: "ND", weight: "bold" });
      console.log("Canvas fonts registered (CDN)");
      return;
    } catch {
      console.log("CDN font registration failed, trying local fallback");
    }
  }

  if (existsSync(localRegular) && existsSync(localBold)) {
    registerFont(localRegular, { family: "ND" });
    registerFont(localBold, { family: "ND", weight: "bold" });
    console.log("Canvas fonts registered (local fallback)");
  }
}

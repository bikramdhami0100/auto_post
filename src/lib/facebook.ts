const FB_GRAPH = "https://graph.facebook.com/v21.0";

export async function postToFacebook(
  imageBuffer: Buffer,
  caption: string
): Promise<string> {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  if (!pageId || !token) {
    throw new Error("Facebook credentials not configured");
  }

  const boundary = `----FormBoundary${Date.now()}`;
  const body = buildMultipartBody(boundary, imageBuffer, caption, token);

  const res = await fetch(`${FB_GRAPH}/${pageId}/photos`, {
    method: "POST",
    headers: {
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
    },
    body: body as unknown as BodyInit,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(`Facebook API error: ${JSON.stringify(data)}`);
  }

  return data.id as string;
}

function buildMultipartBody(
  boundary: string,
  imageBuffer: Uint8Array,
  caption: string,
  accessToken: string
): Uint8Array {
  const encoder = new TextEncoder();
  const parts: Uint8Array[] = [];

  const write = (str: string) => parts.push(encoder.encode(str));
  const writeBuffer = (buf: Uint8Array) => parts.push(buf);

  write(`--${boundary}\r\n`);
  write(`Content-Disposition: form-data; name="source"; filename="post.png"\r\n`);
  write(`Content-Type: image/png\r\n\r\n`);
  writeBuffer(imageBuffer);
  write(`\r\n`);

  write(`--${boundary}\r\n`);
  write(`Content-Disposition: form-data; name="message"\r\n\r\n`);
  write(`${caption}\r\n`);

  write(`--${boundary}\r\n`);
  write(`Content-Disposition: form-data; name="access_token"\r\n\r\n`);
  write(`${accessToken}\r\n`);

  write(`--${boundary}--\r\n`);

  const totalLength = parts.reduce((acc, p) => acc + p.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const p of parts) {
    result.set(p, offset);
    offset += p.length;
  }

  return result;
}

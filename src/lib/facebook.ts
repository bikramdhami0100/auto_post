const FB_GRAPH = "https://graph.facebook.com/v25.0";

export async function postToFacebook(
  caption: string,
  imageBuffers?: Buffer[]
): Promise<string> {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  if (!pageId || !token) {
    throw new Error("Facebook credentials not configured");
  }

  if (imageBuffers && imageBuffers.length > 0) {
    const formBoundary = `----FormBoundary${Date.now()}`;
    const bodyParts: Buffer[] = [];
    const enc = (s: string) => Buffer.from(s, "utf-8");

    bodyParts.push(
      enc(
        `--${formBoundary}\r\nContent-Disposition: form-data; name="source"; filename="post.png"\r\nContent-Type: image/png\r\n\r\n`
      )
    );
    bodyParts.push(imageBuffers[0]);
    bodyParts.push(enc("\r\n"));

    bodyParts.push(
      enc(
        `--${formBoundary}\r\nContent-Disposition: form-data; name="message"\r\n\r\n${caption}\r\n`
      )
    );

    bodyParts.push(enc(`--${formBoundary}--\r\n`));

    const totalBody = Buffer.concat(bodyParts);

    const res = await fetch(`${FB_GRAPH}/${pageId}/photos?access_token=${token}`, {
      method: "POST",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${formBoundary}`,
      },
      body: totalBody,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(`Facebook API error: ${JSON.stringify(data)}`);
    }

    return data.id as string;
  }

  const res = await fetch(`${FB_GRAPH}/${pageId}/feed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: caption, access_token: token }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(`Facebook API error: ${JSON.stringify(data)}`);
  }

  return data.id as string;
}

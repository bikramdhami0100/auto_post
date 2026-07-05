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

  // Post with image: use FormData (reliable multipart handling)
  const form = new FormData();
  form.append("message", caption);

  if (imageBuffers && imageBuffers.length > 0) {
    // Attach all images as multipart
    for (const buf of imageBuffers) {
      const blob = new Blob([new Uint8Array(buf)], { type: "image/png" });
      form.append("source", blob, "post.png");
    }
  }

  const res = await fetch(`${FB_GRAPH}/${pageId}/photos?access_token=${token}`, {
    method: "POST",
    body: form,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(`Facebook API error: ${JSON.stringify(data)}`);
  }

  return data.id as string;
}

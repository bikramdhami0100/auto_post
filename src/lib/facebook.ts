const FB_GRAPH = "https://graph.facebook.com/v21.0";

export async function postToFacebook(caption: string): Promise<string> {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  if (!pageId || !token) {
    throw new Error("Facebook credentials not configured");
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

const TIKTOK_API = "https://open.tiktokapis.com/v2";

interface TikTokInitResponse {
  data?: {
    upload_url: string;
    publish_id: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

interface TikTokPublishResponse {
  data?: {
    status: string;
    post_id?: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

async function getAccessToken(): Promise<string> {
  const token = process.env.TIKTOK_ACCESS_TOKEN;
  if (!token) throw new Error("TikTok access token not configured");
  return token;
}

export async function postToTikTok(
  imageBuffers: Buffer[],
  caption: string
): Promise<string> {
  const token = await getAccessToken();

  const initRes = await fetch(`${TIKTOK_API}/post/publish/inbox/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      post_info: {
        title: caption,
        privacy_level: "PUBLIC_TO_EVERYONE",
        disable_duet: false,
        disable_comment: false,
        disable_stitch: false,
        video_cover_timestamp_ms: 0,
      },
      source_info: {
        source: "PULL_FROM_URL",
      },
    }),
  });

  const initData: TikTokInitResponse = await initRes.json();

  if (initData.error || !initData.data?.upload_url) {
    throw new Error(
      `TikTok init error: ${JSON.stringify(initData.error)}`
    );
  }

  const { upload_url } = initData.data;

  const formBoundary = `----FormBoundary${Date.now()}`;
  const bodyParts: Buffer[] = [];

  const enc = (s: string) => Buffer.from(s, "utf-8");

  for (let i = 0; i < imageBuffers.length; i++) {
    bodyParts.push(
      enc(
        `--${formBoundary}\r\nContent-Disposition: form-data; name="images"; filename="slide_${i}.png"\r\nContent-Type: image/png\r\n\r\n`
      )
    );
    bodyParts.push(imageBuffers[i]);
    bodyParts.push(enc("\r\n"));
  }

  bodyParts.push(enc(`--${formBoundary}--\r\n`));

  const totalBody = Buffer.concat(bodyParts);

  const uploadRes = await fetch(upload_url, {
    method: "PUT",
    headers: {
      "Content-Type": `multipart/form-data; boundary=${formBoundary}`,
    },
    body: totalBody,
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`TikTok upload error (${uploadRes.status}): ${errText}`);
  }

  const publishRes = await fetch(
    `${TIKTOK_API}/post/publish/inbox/complete/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        publish_id: initData.data.publish_id,
      }),
    }
  );

  const publishData: TikTokPublishResponse = await publishRes.json();

  if (publishData.error) {
    throw new Error(
      `TikTok publish error: ${JSON.stringify(publishData.error)}`
    );
  }

  return publishData.data?.post_id || initData.data.publish_id;
}

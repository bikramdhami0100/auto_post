import { NextResponse } from "next/server";
import { generateImage } from "@/lib/image-generator";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const buf = await generateImage(
      "जीवनमा ठूला सफलताहरू प्राप्त गर्नको लागि असफलतालाई अङ्गाल्न सिक्नुहोस्।",
      "असफलता सफलताको सिँढी हो",
      "— जे.के. रोलिङ"
    );
    return new NextResponse(buf, {
      headers: { "Content-Type": "image/png" },
    });
  } catch {
    return NextResponse.json({ error: "Image generation failed" }, { status: 500 });
  }
}

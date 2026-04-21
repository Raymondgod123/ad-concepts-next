import { NextResponse } from "next/server";

type AdConcept = {
  id: string;
  angle: string;
  headline: string;
  primaryText: string;
  cta: string;
  visualDirection: string;
  audience: string;
};

function safeHostname(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const productUrl = String(formData.get("productUrl") ?? "").trim();
  const creativeUrl = String(formData.get("creativeUrl") ?? "").trim();
  const creativeFile = formData.get("creativeFile");

  if (!productUrl) {
    return NextResponse.json({ error: "Product URL is required." }, { status: 400 });
  }
  try {
    // eslint-disable-next-line no-new
    new URL(productUrl);
  } catch {
    return NextResponse.json({ error: "Product URL must be a valid URL." }, { status: 400 });
  }

  const hasCreativeFile = creativeFile instanceof File;
  if (!creativeUrl && !hasCreativeFile) {
    return NextResponse.json(
      { error: "Provide a source creative URL or upload a file." },
      { status: 400 }
    );
  }
  if (creativeUrl) {
    try {
      // eslint-disable-next-line no-new
      new URL(creativeUrl);
    } catch {
      return NextResponse.json({ error: "Source creative URL must be a valid URL." }, { status: 400 });
    }
  }

  await sleep(950);

  if (productUrl.toLowerCase().includes("fail")) {
    return NextResponse.json(
      { error: "Mock failure triggered (remove 'fail' from the product URL)." },
      { status: 500 }
    );
  }

  const brand = safeHostname(productUrl) || "your brand";
  const creativeSource = creativeUrl ? safeHostname(creativeUrl) || creativeUrl : hasCreativeFile ? creativeFile.name : "";

  const concepts: AdConcept[] = [
    {
      id: "c1",
      angle: "Problem → Solution",
      headline: `Stop guessing. Try ${brand}.`,
      primaryText: `Turn curiosity into confident clicks. Inspired by your creative from ${creativeSource}.`,
      cta: "Shop now",
      visualDirection: "Split-screen: 'Before' clutter vs 'After' clean outcome. Big product hero + 3 benefit badges.",
      audience: "Busy shoppers"
    },
    {
      id: "c2",
      angle: "Social proof",
      headline: `${brand}: small upgrade, big win.`,
      primaryText: `A quick swipe-friendly story: why people are switching (and sticking). Built from ${creativeSource}.`,
      cta: "Learn more",
      visualDirection: "UGC-style selfie video opener + on-screen captions + punchy testimonial overlay.",
      audience: "Value seekers"
    },
    {
      id: "c3",
      angle: "Limited-time offer",
      headline: `Today’s best time to try ${brand}.`,
      primaryText: `Add urgency without pressure: “New drop” feel, clear value prop, fast path to checkout.`,
      cta: "Get offer",
      visualDirection: "Bold gradient backdrop, countdown-style sticker, product close-up with motion blur accent.",
      audience: "Impulse buyers"
    }
  ];

  return NextResponse.json({ concepts });
}


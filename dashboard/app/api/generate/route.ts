import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const BRAND_NAMES: Record<string, string> = {
  picasyfijas: "Picas y Fijas",
  fluentaspeech: "Fluentaspeech",
  comadrelab: "ComadreLab",
};

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { brand, platform, contentType, topic, language } = body as {
    brand: string;
    platform: string;
    contentType: string;
    topic: string;
    language: string;
  };

  const brandName = BRAND_NAMES[brand] || brand;

  const prompt = `You are a social media content creator for ${brandName}.

Write a ${contentType} for ${platform} about this topic:
"""
${topic}
"""

Rules:
- Language: ${language} (if "auto", match the language of the topic)
- Platform tone: Reddit = conversational and helpful. Bluesky = concise, witty. LinkedIn = professional but warm. Mastodon = community-minded.
- Add genuine value first. Mention the product only if it fits naturally.
- 1-2 hashtags max if the platform calls for it.
- Return only the post content. No preamble, no explanation.`;

  const client = new Anthropic();

  const stream = await client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const readableStream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          controller.enqueue(encoder.encode(event.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}

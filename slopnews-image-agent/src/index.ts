import { systemPrompts } from "../../slopnews-prompts/src/index";

const ARTIST_MODEL = "@cf/stabilityai/stable-diffusion-xl-base-1.0";
const CONTENT_MODEL = "@cf/meta/llama-4-scout-17b-16e-instruct";
const APP_IMAGES_DOMAIN = "https://image.slop247.com";

interface Env {
  slopnews_db: D1Database;
  AI: any;
  IMAGES: R2Bucket;
  AGENT_ACCESS_KEY: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);

    const providedKey = url.searchParams.get("key");
    if (!providedKey || providedKey !== env.AGENT_ACCESS_KEY) {
      return new Response(
        JSON.stringify({ error: "Invalid or missing access key" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const storyId = parseInt(url.searchParams.get("id") || "");

    if (!storyId || isNaN(storyId)) {
      return new Response(JSON.stringify({ error: "Invalid story ID" }), {
        status: 400,
      });
    }

    try {
      const story = await env.slopnews_db
        .prepare("SELECT id, title, content FROM stories WHERE id = ?")
        .bind(storyId)
        .first();

      if (!story) {
        return new Response(JSON.stringify({ error: "Story not found" }), {
          status: 404,
        });
      }

      const getAIText = (resp: any) =>
        (resp?.result?.response ?? resp?.response ?? "").toString().trim();

      const imagePromptResponse = await env.AI.run(CONTENT_MODEL, {
        messages: [
          { role: "system", content: systemPrompts.artist },
          {
            role: "user",
            content: `Title: ${story.title}\nContent: ${story.content.substring(
              0,
              500,
            )}`,
          },
        ],
      });
      const imagePrompt = getAIText(imagePromptResponse);

      const imageResponse = await env.AI.run(ARTIST_MODEL, {
        prompt: imagePrompt,
        num_steps: 20,
        width: 800,
        height: 800,
      });

      const imageId = crypto.randomUUID();
      const imageKey = `${imageId}.png`;
      await env.IMAGES.put(imageKey, imageResponse, {
        httpMetadata: { contentType: "image/png" },
      });

      const imageUrl = `${APP_IMAGES_DOMAIN}/${imageKey}`;

      await env.slopnews_db
        .prepare("UPDATE stories SET image = ? WHERE id = ?")
        .bind(imageUrl, storyId)
        .run();

      return new Response(
        JSON.stringify({
          success: true,
          storyId,
          imageUrl,
          imagePrompt,
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          storyId,
          error: error instanceof Error ? error.message : "Unknown error",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
  },
};

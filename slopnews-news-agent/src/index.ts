/// <reference types="@cloudflare/workers-types" />
import { Ai } from "@cloudflare/ai";
import { systemPrompts } from "../../slopnews-prompts/src/index";

const HEADLINE_MODEL = "@cf/meta/llama-4-scout-17b-16e-instruct";
const CONTENT_MODEL = "@cf/meta/llama-4-scout-17b-16e-instruct";
const EDITOR_MODEL = "@cf/meta/llama-4-scout-17b-16e-instruct";
const CATEGORY_MODEL = "@cf/meta/llama-4-scout-17b-16e-instruct";

const APP_DOMAIN = "https://slop247.com";
const APP_IMAGES_DOMAIN = "https://image.slop247.com";

interface Env {
  slopnews_db: D1Database;
  AI: any;
  ACCOUNT_ID: string;
  API_TOKEN: string;
  ACCOUNT_HASH: string;
  AGENT_ACCESS_KEY: string;
  IMAGE_AGENT_ACCESS_KEY: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    try {
      const url = new URL(request.url);
      const getAIText = (resp: any) =>
        (resp?.result?.response ?? resp?.response ?? "").toString().trim();

      // Check for valid access key
      const providedKey = url.searchParams.get("key");
      if (!providedKey || providedKey !== env.AGENT_ACCESS_KEY) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Invalid or missing access key",
          }),
          {
            status: 401,
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
      }

      const ai = new Ai(env.AI);

      // Generate a headline
      const headlinePrompt =
        url.searchParams.get("headline")?.toString() ||
        "Generate a dytopian news headline.";
      const titleResponse = await ai.run(HEADLINE_MODEL as any, {
        messages: [
          { role: "system", content: systemPrompts.headline },
          { role: "user", content: headlinePrompt },
        ],
      });
      const title = getAIText(titleResponse);

      // Generate a story
      const contentResponse = await ai.run(CONTENT_MODEL as any, {
        messages: [
          { role: "system", content: systemPrompts.writer },
          {
            role: "user",
            content: `Write a detailed news article with the headline: ${title}. Include at least 10-15 paragraphs.`,
          },
        ],
        max_tokens: 4000,
      });
      let content = getAIText(contentResponse);

      // Fetch recent headlines from the database
      const recentStories = await env.slopnews_db
        .prepare(
          `
          SELECT title
          FROM stories
          ORDER BY id DESC
          LIMIT 20
        `,
        )
        .all();
      const headlines = recentStories.results.map((story: any) => story.title);

      // Edit content
      try {
        const editorResponse = await ai.run(EDITOR_MODEL as any, {
          messages: [
            { role: "system", content: systemPrompts.editor },
            {
              role: "user",
              content: `Recent stories:\n${headlines.join(
                "\n",
              )}\n\nStory:\n${content}`,
            },
          ],
          max_tokens: 2000,
        });
        content = getAIText(editorResponse);
        console.log("Edited content length:", content.length);
      } catch (error) {
        console.error("Editor step failed:", error);
        console.log("Using initial content due to editor failure");
      }

      // Generate category
      const categoryResponse = await ai.run(CATEGORY_MODEL as any, {
        messages: [
          {
            role: "system",
            content: systemPrompts.categorizer,
          },
          {
            role: "user",
            content: `Classify this news story:\nTitle: ${title}\nContent: ${content}`,
          },
        ],
      });
      const category = getAIText(categoryResponse).toLowerCase();

      // Create story object without image first
      const story = {
        title,
        content,
        source: "SLOP News 24/7 Staff",
        days_ago: 0,
        image: `${APP_IMAGES_DOMAIN}/default.png`,
        category,
      };

      // Publish story
      const result = await env.slopnews_db
        .prepare(
          `
          INSERT INTO stories (title, content, source, days_ago, image, category)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        )
        .bind(
          story.title,
          story.content,
          story.source,
          story.days_ago,
          story.image,
          story.category,
        )
        .run();

      const storyId = result.meta.last_row_id;

      // Generate image via image-regen agent
      let imageUrl = story.image;
      let imagePrompt = "";
      try {
        const imageGenResponse = await fetch(
          `https://image-agent.slop247.com?key=${env.IMAGE_AGENT_ACCESS_KEY}&id=${storyId}`,
        );
        const imageGenResult = await imageGenResponse.json();
        if (imageGenResult.success) {
          imageUrl = imageGenResult.imageUrl;
          imagePrompt = imageGenResult.imagePrompt;
          console.log("Generated image:", imageUrl);
        } else {
          console.error("Image generation failed:", imageGenResult.error);
        }
      } catch (error) {
        console.error("Error calling image-regen agent:", error);
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "AI-generated story published successfully",
          storyId,
          story: { ...story, image: imageUrl },
          imagePrompt,
          headlinePrompt,
          contentLength: content.length,
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    } catch (error) {
      console.error("Error in story generation:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }
  },
};

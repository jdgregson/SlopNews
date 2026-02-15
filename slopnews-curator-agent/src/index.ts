/// <reference types="@cloudflare/workers-types" />
import { systemPrompts } from "../../slopnews-prompts/src/index";

const HEADLINE_MODEL = "@cf/meta/llama-4-scout-17b-16e-instruct";

interface Env {
  AI: any;
  slopnews_db: D1Database;
  NEWS_API_KEY: string;
  SLOPNEWS_NEWS_AGENT_URL: string;
  NEWS_AGENT_ACCESS_KEY: string;
  AGENT_ACCESS_KEY: string;
}

async function executeCuration(env: Env) {
  const getAIText = (resp: any) =>
    (resp?.result?.response ?? resp?.response ?? "").toString().trim();

  const stories = await env.slopnews_db
    .prepare("SELECT title FROM stories ORDER BY id DESC LIMIT 10")
    .all();

  const newsResponse = await fetch(
    `https://newsapi.org/v2/top-headlines?country=us&apiKey=${env.NEWS_API_KEY}`,
    {
      headers: {
        "User-Agent": "slopnews-curator-agent/1.0",
      },
    },
  );
  const data: any = await newsResponse.json();

  let newsTitles: string[] = [];
  if (data && Array.isArray(data.articles)) {
    newsTitles = data.articles.map((article: any) => article.title);
  }

  const headlines = newsTitles.join("\n - ");
  const recentStories =
    stories.results?.map((s: any) => s.title).join("\n - ") || "None";
  const formattedPrompt = `Current headlines:\n${headlines}\n\nRecent stories already published:\n${recentStories}`;

  const headlineResponse = await env.AI.run(HEADLINE_MODEL as any, {
    messages: [
      { role: "system", content: systemPrompts.curator },
      { role: "user", content: formattedPrompt },
    ],
    max_tokens: 2000,
  });
  const headlineOutput = getAIText(headlineResponse);

  const requestUrl = `${env.SLOPNEWS_NEWS_AGENT_URL}/?key=${env.NEWS_AGENT_ACCESS_KEY}&headline=${headlineOutput}`;
  const newsAgentResponse = await fetch(requestUrl, {
    method: "GET",
  });

  if (!newsAgentResponse.ok) {
    throw new Error(
      `News agent responded with status ${newsAgentResponse.status}: ${await newsAgentResponse.text()}`,
    );
  }

  const newsAgentData = await newsAgentResponse.json();

  if (!newsAgentData || Object.keys(newsAgentData).length === 0) {
    throw new Error("News agent returned empty response");
  }

  return {
    status: "success",
    headline: headlineOutput,
    news_agent_response: newsAgentData,
  };
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    try {
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

      const result = await executeCuration(env);
      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({
          error: "Internal server error",
          details: error.message,
          stack: error.stack,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  },

  async scheduled(
    event: ScheduledEvent,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    try {
      await executeCuration(env);
    } catch (error: any) {
      console.error("Scheduled curation failed:", error.message);
    }
  },
};

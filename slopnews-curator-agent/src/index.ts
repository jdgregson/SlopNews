/// <reference types="@cloudflare/workers-types" />
import {Ai} from '@cloudflare/ai';
import {systemPrompts} from '../../slopnews-news-agent/src/system-prompts';

const HEADLINE_MODEL = '@cf/meta/llama-4-scout-17b-16e-instruct';

interface Env {
  AI: any;
  slopnews_db: D1Database;
  NEWS_API_KEY: string;
  SLOPNEWS_NEWS_AGENT_URL: string;
  SLOPNEWS_NEWS_AGENT_KEY: string;
}

interface NewsArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

interface NewsResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    try {
      const getAIText = (resp: any) =>
        (resp?.result?.response ?? resp?.response ?? '').toString().trim();

      // Get stories from our database
      const stories = await env.slopnews_db
        .prepare('SELECT title FROM stories ORDER BY id DESC LIMIT 10')
        .all();

      // Get top headlines from News API
      const newsResponse = await fetch(
        `https://newsapi.org/v2/top-headlines?country=us&apiKey=${env.NEWS_API_KEY}`,
        {
          headers: {
            'User-Agent': 'slopnews-curator-agent/1.0',
          },
        }
      );
      const data: any = await newsResponse.json();

      let newsTitles: string[] = [];
      if (data && Array.isArray(data.articles)) {
        newsTitles = data.articles.map((article: any) => article.title);
      }

      const headlines = newsTitles.join('\n - ');
      const storyTitles = stories.results
        .map((story: any) => story.title)
        .join('\n - ');
      const formattedPrompt = `Current headlines:\n${headlines}`;

      const ai = new Ai(env.AI);
      const headlineResponse = await ai.run(
        HEADLINE_MODEL as any,
        {
          messages: [
            {role: 'system', content: systemPrompts.curator},
            {role: 'user', content: formattedPrompt},
          ],
          max_tokens: 2000,
        }
      );
      const headlineOutput = getAIText(headlineResponse);

      const requestUrl = `${env.SLOPNEWS_NEWS_AGENT_URL}/?key=${env.SLOPNEWS_NEWS_AGENT_KEY}&headline=${headlineOutput}`;
      const newsAgentResponse = await fetch(requestUrl, {
        method: 'GET',
      });

      if (!newsAgentResponse.ok) {
        throw new Error(`News agent responded with status ${newsAgentResponse.status}: ${await newsAgentResponse.text()}`);
      }

      const newsAgentData = await newsAgentResponse.json();

      if (!newsAgentData || Object.keys(newsAgentData).length === 0) {
        throw new Error('News agent returned empty response');
      }

      return new Response(JSON.stringify({
        status: 'success',
        headline: headlineOutput,
        news_agent_response: newsAgentData
      }), {
        headers: {'Content-Type': 'application/json'},
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({
          error: 'Internal server error',
          details: error.message,
          stack: error.stack,
        }),
        {
          status: 500,
          headers: {'Content-Type': 'application/json'},
        }
      );
    }
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    // Reuse the fetch logic for the cron job
    await this.fetch(new Request('http://localhost'), env, ctx);
  }
};

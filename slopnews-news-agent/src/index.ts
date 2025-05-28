/// <reference types="@cloudflare/workers-types" />
import {Ai} from '@cloudflare/ai';
import {systemPrompts} from './system-prompts';

const HEADLINE_MODEL = '@cf/mistral/mistral-7b-instruct-v0.2-lora';
const CONTENT_MODEL = '@cf/mistral/mistral-7b-instruct-v0.2-lora';
const EDITOR_MODEL = '@cf/mistral/mistral-7b-instruct-v0.2-lora';
const CATEGORY_MODEL = '@cf/mistral/mistral-7b-instruct-v0.2-lora';
const ARTIST_MODEL = '@cf/lykon/dreamshaper-8-lcm';

const APP_DOMAIN = 'https://slop247.com';
const APP_IMAGES_DOMAIN = 'https://image.slop247.com';

interface Env {
  slopnews_db: D1Database;
  AI: any;
  IMAGES: R2Bucket;
  ACCOUNT_ID: string;
  API_TOKEN: string;
  ACCOUNT_HASH: string;
  AGENT_ACCESS_KEY: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    try {
      const url = new URL(request.url);
      const getAIText = (resp: any) =>
        (resp?.result?.response ?? resp?.response ?? '').toString().trim();

      // Check for valid access key
      const providedKey = url.searchParams.get('key');
      if (!providedKey || providedKey !== env.AGENT_ACCESS_KEY) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Invalid or missing access key',
          }),
          {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      const ai = new Ai(env.AI);

      // Generate a headline
      const headlinePrompt =
        url.searchParams.get('headline')?.toString() ||
        'Generate a dytopian news headline.';
      const titleResponse = await ai.run(HEADLINE_MODEL as any, {
        messages: [
          {role: 'system', content: systemPrompts.headline},
          {role: 'user', content: headlinePrompt},
        ],
      });
      const title = getAIText(titleResponse);

      // Generate a story
      const contentResponse = await ai.run(CONTENT_MODEL, {
        messages: [
          {role: 'system', content: systemPrompts.writer},
          {
            role: 'user',
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
        `
        )
        .all();
      const headlines = recentStories.results.map((story: any) => story.title);

      // Edit content
      try {
        const editorResponse = await ai.run(EDITOR_MODEL as any, {
          messages: [
            {role: 'system', content: systemPrompts.editor},
            {
              role: 'user',
              content: `Recent stories:\n${headlines.join(
                '\n'
              )}\n\nStory:\n${content}`,
            },
          ],
          max_tokens: 2000,
        });
        content = getAIText(editorResponse);
        console.log('Edited content length:', content.length);
      } catch (error) {
        console.error('Editor step failed:', error);
        console.log('Using initial content due to editor failure');
      }

      // Generate category
      const categoryResponse = await ai.run(CATEGORY_MODEL, {
        messages: [
          {
            role: 'system',
            content:
              'You are a news category classifier. Choose a single, concise category for this news story. Examples: technology, politics, sports, entertainment, business, science, health, world, local. Respond with just the category name, nothing else.',
          },
          {
            role: 'user',
            content: `Classify this news story:\nTitle: ${title}\nContent: ${content}`,
          },
        ],
      });
      const category = getAIText(categoryResponse).toLowerCase();

      // Generate image prompt
      const imagePromptResponse = await ai.run(ARTIST_MODEL as any, {
        messages: [
          {role: 'system', content: systemPrompts.artist},
          {
            role: 'user',
            content: `Generate an image prompt for this news story:\nTitle: ${title}\nContent: ${content}`,
          },
        ],
      });
      const imagePrompt = getAIText(imagePromptResponse);

      // Generate image
      const imageResponse = await ai.run(ARTIST_MODEL, {
        prompt: imagePrompt,
        num_steps: 20,
        width: 800,
        height: 800,
      } as any);

      // Store image in R2
      const imageId = crypto.randomUUID();
      const originalKey = `${imageId}.png`;
      await env.IMAGES.put(originalKey, imageResponse, {
        httpMetadata: {
          contentType: 'image/png',
        },
      });

      const imageUrl = `${APP_IMAGES_DOMAIN}/${originalKey}`;

      // Create story object
      const story = {
        title,
        content,
        source: 'SLOP News 24/7 Staff',
        days_ago: 0,
        image: imageUrl,
        category,
      };

      // Publish story
      const result = await env.slopnews_db
        .prepare(
          `
          INSERT INTO stories (title, content, source, days_ago, image, category)
          VALUES (?, ?, ?, ?, ?, ?)
        `
        )
        .bind(
          story.title,
          story.content,
          story.source,
          story.days_ago,
          story.image,
          story.category
        )
        .run();

      return new Response(
        JSON.stringify({
          success: true,
          message: 'AI-generated story published successfully',
          storyId: result.meta.last_row_id,
          story: story,
          imagePrompt,
          headlinePrompt,
          contentLength: content.length,
        }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      console.error('Error in story generation:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
  },
};

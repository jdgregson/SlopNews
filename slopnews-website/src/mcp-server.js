import { Server } from '@modelcontextprotocol/sdk/server/index.js';

export function createMCPServer(env) {
  // Simple, working MCP server implementation
  const server = {
    // Track recent requests to prevent loops
    recentRequests: new Map(),

    async handleRequest(request) {
      try {
        const { jsonrpc, id, method, params } = request;

        if (jsonrpc !== '2.0') {
          throw new Error('Invalid JSON-RPC version');
        }

        // Rate limiting for tool calls to prevent loops
        if (method === 'tools/call') {
          const { name, arguments: args } = params;
          const requestKey = `${name}-${JSON.stringify(args)}`;
          const now = Date.now();

          if (this.recentRequests.has(requestKey)) {
            const lastCall = this.recentRequests.get(requestKey);
            if (now - lastCall < 5000) { // 5 second cooldown
              return {
                jsonrpc: '2.0',
                id,
                error: {
                  code: -32603,
                  message: 'Rate limit exceeded. Please wait before making the same request again.',
                },
              };
            }
          }

          this.recentRequests.set(requestKey, now);

          // Clean up old entries (older than 1 minute)
          for (const [key, timestamp] of this.recentRequests.entries()) {
            if (now - timestamp > 60000) {
              this.recentRequests.delete(key);
            }
          }
        }

        switch (method) {
          case 'initialize':
            return {
              jsonrpc: '2.0',
              id,
              result: {
                protocolVersion: '2024-11-05',
                capabilities: {
                  resources: {},
                  tools: {},
                },
                serverInfo: {
                  name: 'slopnews-mcp-server',
                  version: '1.0.0',
                },
              },
            };

          case 'notifications/initialized':
            return {
              jsonrpc: '2.0',
              id,
              result: {},
            };

          case 'notifications/cancelled':
            return {
              jsonrpc: '2.0',
              id,
              result: {},
            };

          case 'tools/list':
            return {
              jsonrpc: '2.0',
              id,
              result: {
                tools: [
                  {
                    name: 'get_news_stories',
                    description: 'Get news stories with optional filtering. Use sparingly to avoid rate limits.',
                    inputSchema: {
                      type: 'object',
                      properties: {
                        limit: {
                          type: 'number',
                          description: 'Number of stories to return (default: 10, max: 20)',
                        },
                        offset: {
                          type: 'number',
                          description: 'Number of stories to skip (default: 0)',
                        },
                        category: {
                          type: 'string',
                          description: 'Filter stories by category',
                        },
                        snippet: {
                          type: 'boolean',
                          description: 'Return truncated content (default: false)',
                        },
                      },
                    },
                  },
                  {
                    name: 'get_news_story',
                    description: 'Get a specific news story by ID',
                    inputSchema: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                          description: 'The story ID',
                        },
                      },
                      required: ['id'],
                    },
                  },
                  {
                    name: 'get_news_categories',
                    description: 'Get all unique news categories',
                    inputSchema: {
                      type: 'object',
                      properties: {},
                    },
                  },
                  {
                    name: 'get_related_stories',
                    description: 'Get stories related to a specific story',
                    inputSchema: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                          description: 'The story ID to find related stories for',
                        },
                        limit: {
                          type: 'number',
                          description: 'Number of related stories to return (default: 3)',
                        },
                      },
                      required: ['id'],
                    },
                  },
                  {
                    name: 'get_gallery_images',
                    description: 'Get news stories with images for gallery view',
                    inputSchema: {
                      type: 'object',
                      properties: {
                        page: {
                          type: 'number',
                          description: 'Page number (default: 1)',
                        },
                        limit: {
                          type: 'number',
                          description: 'Number of images per page (default: 20)',
                        },
                      },
                    },
                  },
                ],
              },
            };

          case 'tools/call':
            const { name, arguments: args } = params;
            const result = await handleToolCall(name, args, env);
            return {
              jsonrpc: '2.0',
              id,
              result: {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(result, null, 2),
                  },
                ],
              },
            };

          case 'resources/list':
            return {
              jsonrpc: '2.0',
              id,
              result: {
                resources: [
                  {
                    uri: 'slopnews://stories',
                    name: 'news-stories',
                    description: 'Get all news stories with optional filtering',
                    mimeType: 'application/json',
                  },
                  {
                    uri: 'slopnews://story/{id}',
                    name: 'news-story',
                    description: 'Get a specific news story by ID',
                    mimeType: 'application/json',
                  },
                  {
                    uri: 'slopnews://categories',
                    name: 'news-categories',
                    description: 'Get all unique news categories',
                    mimeType: 'application/json',
                  },
                  {
                    uri: 'slopnews://related/{id}',
                    name: 'related-stories',
                    description: 'Get stories related to a specific story',
                    mimeType: 'application/json',
                  },
                  {
                    uri: 'slopnews://gallery',
                    name: 'gallery-images',
                    description: 'Get news stories with images for gallery view',
                    mimeType: 'application/json',
                  },
                ],
              },
            };

          case 'resources/read':
            const { uri } = params;
            const contents = await handleResourceRead(uri, env);
            return {
              jsonrpc: '2.0',
              id,
              result: { contents },
            };

          default:
            throw new Error(`Unknown method: ${method}`);
        }
      } catch (error) {
        return {
          jsonrpc: '2.0',
          id: request.id,
          error: {
            code: -32603,
            message: error.message,
          },
        };
      }
    },
  };

  return server;
}

async function handleToolCall(name, args, env) {
  switch (name) {
    case 'get_news_stories':
      const { limit = 10, offset = 0, category, snippet = false } = args;

      // Enforce maximum limit to prevent abuse
      const actualLimit = Math.min(limit, 20);

      let query = 'SELECT * FROM stories';
      const queryParams = [];

      if (category) {
        query += ' WHERE category = ?';
        queryParams.push(category);
      }

      query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
      queryParams.push(actualLimit, offset);

      const stories = await env.DB.prepare(query)
        .bind(...queryParams)
        .all();

      let results = stories.results;

      if (snippet) {
        results = results.map((story) => ({
          ...story,
          content:
            story.content.length > 200
              ? story.content.slice(0, 200) + '…'
              : story.content,
        }));
      }

      return results;

    case 'get_news_story':
      const { id } = args;
      const story = await env.DB.prepare('SELECT * FROM stories WHERE id = ?')
        .bind(id)
        .first();

      if (!story) {
        throw new Error('Story not found');
      }

      return story;

    case 'get_news_categories':
      const result = await env.DB.prepare(
        'SELECT category FROM stories GROUP BY category ORDER BY category'
      ).all();

      return result.results.map((r) => r.category);

    case 'get_related_stories':
      const { id: storyId, limit: relatedLimit = 3 } = args;
      const currentStory = await env.DB.prepare(
        'SELECT category FROM stories WHERE id = ?'
      )
        .bind(storyId)
        .first();

      if (!currentStory) {
        throw new Error('Story not found');
      }

      const relatedStories = await env.DB.prepare(
        'SELECT * FROM stories WHERE category = ? AND id != ? ORDER BY id DESC LIMIT ?'
      )
        .bind(currentStory.category, storyId, relatedLimit)
        .all();

      return relatedStories.results;

    case 'get_gallery_images':
      const { page = 1, limit: galleryLimit = 20 } = args;
      const galleryOffset = (page - 1) * galleryLimit;

      const galleryStories = await env.DB.prepare(
        'SELECT id, title, content, image FROM stories WHERE image IS NOT NULL ORDER BY id DESC LIMIT ? OFFSET ?'
      ).bind(galleryLimit, galleryOffset).all();

      return galleryStories.results;

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function handleResourceRead(uri, env) {
  if (uri.startsWith('slopnews://stories')) {
    const url = new URL(`http://localhost${uri.replace('slopnews://', '/')}`);
    const limit = parseInt(url.searchParams.get('limit')) || 10;
    const offset = parseInt(url.searchParams.get('offset')) || 0;
    const category = url.searchParams.get('category');
    const snippet = url.searchParams.get('snippet') === 'true';

    let query = 'SELECT * FROM stories';
    const queryParams = [];

    if (category) {
      query += ' WHERE category = ?';
      queryParams.push(category);
    }

    query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);

    const stories = await env.DB.prepare(query)
      .bind(...queryParams)
      .all();

    let results = stories.results;

    if (snippet) {
      results = results.map((story) => ({
        ...story,
        content:
          story.content.length > 200
            ? story.content.slice(0, 200) + '…'
            : story.content,
      }));
    }

    return [
      {
        type: 'text',
        text: JSON.stringify(results, null, 2),
      },
    ];
  }

  if (uri.startsWith('slopnews://story/')) {
    const id = uri.replace('slopnews://story/', '');
    const story = await env.DB.prepare('SELECT * FROM stories WHERE id = ?')
      .bind(id)
      .first();

    if (!story) {
      throw new Error('Story not found');
    }

    return [
      {
        type: 'text',
        text: JSON.stringify(story, null, 2),
      },
    ];
  }

  if (uri === 'slopnews://categories') {
    const result = await env.DB.prepare(
      'SELECT category FROM stories GROUP BY category ORDER BY category'
    ).all();

    const categories = result.results.map((r) => r.category);

    return [
      {
        type: 'text',
        text: JSON.stringify(categories, null, 2),
      },
    ];
  }

  if (uri.startsWith('slopnews://related/')) {
    const id = uri.replace('slopnews://related/', '');
    const limit = 3;

    const currentStory = await env.DB.prepare(
      'SELECT category FROM stories WHERE id = ?'
    )
      .bind(id)
      .first();

    if (!currentStory) {
      throw new Error('Story not found');
    }

    const relatedStories = await env.DB.prepare(
      'SELECT * FROM stories WHERE category = ? AND id != ? ORDER BY id DESC LIMIT ?'
    )
      .bind(currentStory.category, id, limit)
      .all();

    return [
      {
        type: 'text',
        text: JSON.stringify(relatedStories.results, null, 2),
      },
    ];
  }

  if (uri.startsWith('slopnews://gallery')) {
    const url = new URL(`http://localhost${uri.replace('slopnews://', '/')}`);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 20;
    const offset = (page - 1) * limit;

    const stories = await env.DB.prepare(
      'SELECT id, title, content, image FROM stories WHERE image IS NOT NULL ORDER BY id DESC LIMIT ? OFFSET ?'
    ).bind(limit, offset).all();

    return [
      {
        type: 'text',
        text: JSON.stringify(stories.results, null, 2),
      },
    ];
  }

  throw new Error(`Unknown resource: ${uri}`);
}
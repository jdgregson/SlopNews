export function createMCPServer(env) {
  // Simple MCP server implementation for Cloudflare Workers
  const server = {
    async handleRequest(request) {
      try {
        const { jsonrpc, id, method, params } = request;

        if (jsonrpc !== '2.0') {
          throw new Error('Invalid JSON-RPC version');
        }

        switch (method) {
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

async function handleResourceRead(uri, env) {
  // Get all news stories
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

  // Get a single story by ID
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

  // Get categories
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

  // Get related stories
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

  // Get gallery images
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
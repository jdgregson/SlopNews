import {Router} from 'itty-router';
import {UI_HTML} from './ui';
import {STORY_HTML} from './story';
import {DISCLAIMER_HTML} from './disclaimer';
import {GALLERY_HTML} from './gallery';

const router = Router();

// Serve the UI
router.get('/', async (request, env) => {
  return new Response(UI_HTML, {
    headers: {'Content-Type': 'text/html'},
  });
});

// Serve individual story pages
router.get('/story/:id', async (request, env) => {
  return new Response(STORY_HTML, {
    headers: {'Content-Type': 'text/html'},
  });
});

// Serve disclaimer page
router.get('/disclaimer', async (request, env) => {
  return new Response(DISCLAIMER_HTML, {
    headers: {'Content-Type': 'text/html'},
  });
});

// Serve gallery page
router.get('/gallery', async (request, env) => {
  return new Response(GALLERY_HTML, {
    headers: { 'Content-Type': 'text/html' },
  });
});

// API endpoint to get a single story
router.get('/api/stories/:id', async (request, env) => {
  const id = request.params.id;

  try {
    const story = await env.DB.prepare('SELECT * FROM stories WHERE id = ?')
      .bind(id)
      .first();

    if (!story) {
      return new Response(JSON.stringify({error: 'Story not found'}), {
        status: 404,
        headers: {'Content-Type': 'application/json'},
      });
    }

    return new Response(JSON.stringify(story), {
      headers: {'Content-Type': 'application/json'},
    });
  } catch (error) {
    console.error('Database error:', error);
    return new Response(JSON.stringify({error: 'Internal server error'}), {
      status: 500,
      headers: {'Content-Type': 'application/json'},
    });
  }
});

// API endpoint to get all news stories
router.get('/api/stories', async (request, env) => {
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit')) || 10;
  const offset = parseInt(url.searchParams.get('offset')) || 0;
  const category = url.searchParams.get('category');
  const snippet = url.searchParams.get('snippet') === 'true';

  try {
    let query = 'SELECT * FROM stories';
    const params = [];

    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }

    query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const stories = await env.DB.prepare(query)
      .bind(...params)
      .all();

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM stories';
    let countResult;
    if (category) {
      countQuery += ' WHERE category = ?';
      countResult = await env.DB.prepare(countQuery).bind(category).first();
    } else {
      countResult = await env.DB.prepare(countQuery).first();
    }

    // If snippet is requested, truncate content to 200 characters
    if (snippet) {
      stories.results = stories.results.map((story) => ({
        ...story,
        content:
          story.content.length > 200
            ? story.content.slice(0, 200) + '…'
            : story.content,
      }));
    }

    return new Response(
      JSON.stringify({
        stories: stories.results,
        total: countResult.total,
      }),
      {
        headers: {'Content-Type': 'application/json'},
      }
    );
  } catch (error) {
    console.error('Database error:', error);
    return new Response(JSON.stringify({error: 'Internal server error'}), {
      status: 500,
      headers: {'Content-Type': 'application/json'},
    });
  }
});

// API endpoint to get all unique categories
router.get('/api/categories', async (request, env) => {
  try {
    const result = await env.DB.prepare(
      'SELECT category FROM stories GROUP BY category ORDER BY category'
    ).all();
    return new Response(JSON.stringify(result.results.map((r) => r.category)), {
      headers: {'Content-Type': 'application/json'},
    });
  } catch (error) {
    console.error('Database error:', error);
    return new Response(JSON.stringify({error: 'Internal server error'}), {
      status: 500,
      headers: {'Content-Type': 'application/json'},
    });
  }
});

// API endpoint to get related stories
router.get('/api/stories/:id/related', async (request, env) => {
  const id = request.params.id;
  const limit = 3;

  try {
    // First get the current story's category
    const currentStory = await env.DB.prepare(
      'SELECT category FROM stories WHERE id = ?'
    )
      .bind(id)
      .first();

    if (!currentStory) {
      return new Response(JSON.stringify({error: 'Story not found'}), {
        status: 404,
        headers: {'Content-Type': 'application/json'},
      });
    }

    // Then get 3 other stories from the same category
    const relatedStories = await env.DB.prepare(
      'SELECT * FROM stories WHERE category = ? AND id != ? ORDER BY id DESC LIMIT ?'
    )
      .bind(currentStory.category, id, limit)
      .all();

    return new Response(JSON.stringify(relatedStories.results), {
      headers: {'Content-Type': 'application/json'},
    });
  } catch (error) {
    console.error('Database error:', error);
    return new Response(JSON.stringify({error: 'Internal server error'}), {
      status: 500,
      headers: {'Content-Type': 'application/json'},
    });
  }
});

// API endpoint to get images for gallery
router.get('/api/gallery', async (request, env) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page')) || 1;
  const limit = parseInt(url.searchParams.get('limit')) || 20;
  const offset = (page - 1) * limit;

  try {
    const stories = await env.DB.prepare(
      'SELECT id, title, content, image FROM stories WHERE image IS NOT NULL ORDER BY id DESC LIMIT ? OFFSET ?'
    ).bind(limit, offset).all();

    return new Response(JSON.stringify({
      images: stories.results
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Database error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

// Handle 404s
router.all('*', () => new Response('Not Found', {status: 404}));

export default {
  fetch: router.handle,
};

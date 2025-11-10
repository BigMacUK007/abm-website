import type { APIRoute } from 'astro';
import { randomUUID } from 'crypto';

export const prerender = false;

// GET - List all articles
export const GET: APIRoute = async ({ locals }) => {
  try {
    // Check authentication
    const { userId } = locals.auth();
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = locals.runtime.env.DB;
    const result = await db.prepare('SELECT * FROM articles ORDER BY updated_at DESC').all();

    return new Response(JSON.stringify({ articles: result.results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch articles' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// POST - Create new article
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Check authentication
    const { userId } = locals.auth();
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await request.json();
    const {
      title,
      slug,
      excerpt = '',
      category = '',
      tags = '',
      image = '',
      author = '',
      publishDate = new Date().toISOString().split('T')[0],
      draft = true,
      content = '',
    } = data;

    // Validate required fields
    if (!title || !slug) {
      return new Response(JSON.stringify({ error: 'Title and slug are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = locals.runtime.env.DB;
    const id = randomUUID();

    // Check if slug already exists
    const existing = await db.prepare('SELECT id FROM articles WHERE slug = ?').bind(slug).first();
    if (existing) {
      return new Response(JSON.stringify({ error: 'Slug already exists' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Insert article
    await db
      .prepare(
        `INSERT INTO articles (id, slug, title, excerpt, category, tags, image, author, publishDate, draft, content, metadata, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
      )
      .bind(
        id,
        slug,
        title,
        excerpt,
        category,
        tags,
        image,
        author,
        publishDate,
        draft ? 1 : 0,
        content,
        JSON.stringify({})
      )
      .run();

    return new Response(JSON.stringify({ success: true, id }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating article:', error);
    return new Response(JSON.stringify({ error: 'Failed to create article' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

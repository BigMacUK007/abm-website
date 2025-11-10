import type { APIRoute } from 'astro';

export const prerender = false;

// GET - Get single article
export const GET: APIRoute = async ({ params, locals }) => {
  try {
    // Check authentication
    const { userId } = locals.auth();
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { id } = params;
    const db = locals.runtime.env.DB;
    const article = await db.prepare('SELECT * FROM articles WHERE id = ?').bind(id).first();

    if (!article) {
      return new Response(JSON.stringify({ error: 'Article not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ article }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch article' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// PUT - Update article
export const PUT: APIRoute = async ({ params, request, locals }) => {
  try {
    // Check authentication
    const { userId } = locals.auth();
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { id } = params;
    const data = await request.json();
    const {
      title,
      slug,
      excerpt = '',
      category = '',
      tags = '',
      image = '',
      author = '',
      publishDate,
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

    // Check if article exists
    const existing = await db.prepare('SELECT id FROM articles WHERE id = ?').bind(id).first();
    if (!existing) {
      return new Response(JSON.stringify({ error: 'Article not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if slug is taken by another article
    const slugCheck = await db.prepare('SELECT id FROM articles WHERE slug = ? AND id != ?').bind(slug, id).first();
    if (slugCheck) {
      return new Response(JSON.stringify({ error: 'Slug already exists' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update article
    await db
      .prepare(
        `UPDATE articles
         SET slug = ?, title = ?, excerpt = ?, category = ?, tags = ?, image = ?, author = ?, publishDate = ?, draft = ?, content = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`
      )
      .bind(slug, title, excerpt, category, tags, image, author, publishDate, draft ? 1 : 0, content, id)
      .run();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating article:', error);
    return new Response(JSON.stringify({ error: 'Failed to update article' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// DELETE - Delete article
export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    // Check authentication
    const { userId } = locals.auth();
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { id } = params;
    const db = locals.runtime.env.DB;

    // Check if article exists
    const existing = await db.prepare('SELECT id FROM articles WHERE id = ?').bind(id).first();
    if (!existing) {
      return new Response(JSON.stringify({ error: 'Article not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Delete article
    await db.prepare('DELETE FROM articles WHERE id = ?').bind(id).run();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting article:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete article' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

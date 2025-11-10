# Blog System Quick Reference

## Key Files at a Glance

| File/Folder | Purpose | Key Info |
|-------------|---------|----------|
| `/src/data/post/` | Blog articles storage | .md/.mdx files, 6 posts |
| `/src/content/config.ts` | Content validation | Zod schema for frontmatter |
| `/src/utils/blog.ts` | Blog logic | 10+ utility functions |
| `/src/pages/[...blog]/` | Blog routes | Single post, list, category, tag |
| `/src/components/blog/` | UI components | 10 components |
| `/src/config.yaml` | Blog config | Enable/disable features |
| `/src/types.d.ts` | TypeScript types | Post interface definition |

---

## Frontmatter Cheat Sheet

```yaml
---
publishDate: 2024-01-15T10:00:00Z       # ISO format, required for sorting
updateDate: 2024-01-16T14:30:00Z        # Optional
draft: false                            # Optional (filters out drafts)

title: "Your Article Title"             # REQUIRED
excerpt: "Brief summary for preview"    # Optional but recommended
image: "https://example.com/image.jpg"  # Optional featured image

category: "Category Name"               # Optional (single value)
tags:                                   # Optional
  - tag1
  - tag2
  - tag3

author: "Author Name"                   # Optional

metadata:                               # Optional SEO block
  canonical: "https://example.com/..."  # For internal links
  robots:
    index: true
    follow: true
---
```

---

## URL Patterns

| Pattern | Example | Controlled By |
|---------|---------|---------------|
| Blog index | `/blog` | `config.yaml: apps.blog.list.pathname` |
| Post | `/{slug}` | `config.yaml: apps.blog.post.permalink` |
| Pagination | `/blog/page/2` | Auto-generated |
| Category | `/category/tutorials` | `config.yaml: apps.blog.category.pathname` |
| Tag | `/tag/astro` | `config.yaml: apps.blog.tag.pathname` |

---

## Blog Config (`src/config.yaml`)

```yaml
apps:
  blog:
    isEnabled: true              # Master switch
    postsPerPage: 6              # Posts per paginated page
    post:
      isEnabled: true
      permalink: '/%slug%'       # URL pattern
      robots:
        index: true              # SEO indexable?
    list:
      isEnabled: true
      pathname: 'blog'           # Base path
      robots:
        index: true
    category:
      isEnabled: true
      pathname: 'category'
      robots:
        index: true
    tag:
      isEnabled: true
      pathname: 'tag'
      robots:
        index: false             # Usually false for tags
    isRelatedPostsEnabled: true
    relatedPostsCount: 4
```

---

## Common Functions

### `src/utils/blog.ts`

```typescript
// Fetch all posts (cached)
const posts = await fetchPosts()

// Find posts by slug
const posts = await findPostsBySlugs(['slug-1', 'slug-2'])

// Find posts by file ID
const posts = await findPostsByIds(['file-id-1'])

// Get latest N posts
const recent = await findLatestPosts({ count: 5 })

// Get related posts (by category & tags)
const related = await getRelatedPosts(currentPost, 4)
```

### `src/utils/permalinks.ts`

```typescript
// Generate URL from post
const url = getPermalink(post.permalink, 'post')  // Returns: /slug

// Generate category URL
const url = getPermalink(category.slug, 'category')  // Returns: /category/slug

// Generate tag URL
const url = getPermalink(tag.slug, 'tag')  // Returns: /tag/slug
```

---

## Component Usage

### `ListItem.astro` - Post Card
```astro
---
import ListItem from '~/components/blog/ListItem.astro'
---

<ListItem post={post} />
```

### `SinglePost.astro` - Full Post
```astro
---
import SinglePost from '~/components/blog/SinglePost.astro'
---

<SinglePost post={post} url={pageUrl}>
  {post.Content ? <post.Content /> : <Fragment set:html={post.content} />}
</SinglePost>
```

### `RelatedPosts.astro`
```astro
---
import RelatedPosts from '~/components/blog/RelatedPosts.astro'
---

<RelatedPosts post={post} />
```

### `Pagination.astro`
```astro
---
import Pagination from '~/components/blog/Pagination.astro'
---

<Pagination prevUrl={page.url.prev} nextUrl={page.url.next} />
```

---

## Creating a New Blog Post

1. Create file: `src/data/post/my-post-title.md`
2. Add frontmatter:
```yaml
---
publishDate: 2024-01-15T10:00:00Z
title: My Post Title
excerpt: Short summary
category: Tutorial
tags:
  - astro
  - web
---
```
3. Write content in Markdown
4. Run: `npm run build`
5. Commit and push to git (auto-deploys via Cloudflare Pages)

---

## Post Type (TypeScript)

```typescript
interface Post {
  id: string                          // File ID
  slug: string                        // URL slug
  permalink: string                   // Full URL path
  publishDate: Date                   // Publication date
  updateDate?: Date                   // Last updated
  title: string                       // Article title
  excerpt?: string                    // Summary text
  image?: ImageMetadata | string      // Featured image
  category?: Taxonomy                 // Single category
  tags?: Taxonomy[]                   // Tag array
  author?: string                     // Author name
  metadata?: MetaData                 // SEO metadata
  draft?: boolean                     // Draft status
  Content?: AstroComponentFactory     // Rendered markdown
  readingTime?: number                // Minutes to read
}
```

---

## Static Paths Functions

Each route file calls these functions to generate static pages:

```typescript
// Blog list + pagination
export const getStaticPaths = async ({ paginate }) => {
  return await getStaticPathsBlogList({ paginate })
}

// Individual posts
export const getStaticPaths = async () => {
  return await getStaticPathsBlogPost()
}

// Category archives
export const getStaticPaths = async ({ paginate }) => {
  return await getStaticPathsBlogCategory({ paginate })
}

// Tag archives
export const getStaticPaths = async ({ paginate }) => {
  return await getStaticPathsBlogTag({ paginate })
}
```

---

## Configuration Toggles

Toggle blog features on/off in `src/config.yaml`:

```yaml
# Disable entire blog
apps.blog.isEnabled: false

# Disable individual post pages
apps.blog.post.isEnabled: false

# Disable category archives
apps.blog.category.isEnabled: false

# Disable tag archives
apps.blog.tag.isEnabled: false

# Disable related posts section
apps.blog.isRelatedPostsEnabled: false

# Change posts per page
apps.blog.postsPerPage: 10

# Change URL paths
apps.blog.post.permalink: '/%year%/%month%/%slug%'
apps.blog.list.pathname: 'articles'
apps.blog.category.pathname: 'topics'
apps.blog.tag.pathname: 'keywords'
```

---

## Build & Deploy

```bash
# Development
npm run dev              # Hot reload at localhost:3000

# Production build
npm run build           # Creates /dist/ directory

# Preview production build
npm run preview         # Serves /dist/ locally

# Format & lint
npm run check          # Runs astro check + eslint + prettier
npm run fix            # Auto-fixes formatting issues

# Git workflow
git add .
git commit -m "Add: new blog post"
git push               # Auto-deploys via Cloudflare Pages webhook
```

---

## Admin Area Setup (TODO)

Directories exist but empty:
- `/src/pages/admin/` - Admin interface
- `/src/pages/api/` - API endpoints

Recommended stack:
1. Cloudflare D1 (PostgreSQL database)
2. Astro API routes for REST endpoints
3. React components for admin UI (Shadcn UI)
4. JWT for authentication
5. Cloudflare R2 for image uploads

---

## Slug Generation Rules

1. Take filename: `how-to-customize-astrowind.md`
2. Remove extension: `how-to-customize-astrowind`
3. Apply cleanSlug():
   - Convert to lowercase
   - Replace spaces with hyphens
   - Remove special characters
4. Result: `how-to-customize-astrowind`
5. Final URL: `/{slug}` or `/how-to-customize-astrowind`

---

## Environment Variables

Currently configured (but unused):
```
APOS_HOST=http://localhost:3002
APOS_EXTERNAL_FRONT_KEY=...
```

For future use:
```
# Database (Cloudflare D1)
DATABASE_URL=

# Image upload (Cloudflare R2)
R2_ACCOUNT_ID=
R2_ACCESS_KEY=
R2_SECRET_KEY=

# Authentication
JWT_SECRET=

# Analytics
FATHOM_SITE_ID=
```

---

## Performance Notes

- Static generation: All pages pre-rendered at build time
- No database queries at runtime (file-based or static cache)
- Image optimization: sharp processes images at build
- Compression: astro-compress gzips assets
- Deployment: Cloudflare CDN globally distributes static files

---

## SEO Features

- XML Sitemap: `/sitemap-index.xml` (auto-generated)
- RSS Feed: `/rss.xml` (auto-generated)
- Open Graph: Social sharing meta tags
- Twitter Cards: Tweet-optimized images
- Canonical URLs: Duplicate content prevention
- Reading Time: Auto-calculated per post
- robots.yaml compliance: Configurable per route

---

## Tips & Tricks

1. **Draft posts**: Set `draft: true` in frontmatter to hide
2. **Scheduled publishing**: Frontmatter doesn't auto-publish; requires rebuild
3. **Related posts**: Based on category (5 points) + tags (1 point each)
4. **Image URLs**: Use Unsplash/external URLs; no local image support in current setup
5. **Markdown+Components**: Use MDX format to import React/Astro components
6. **URL flexibility**: Permalink pattern supports date variables (%year%, %month%, %day%)

---

## Troubleshooting

**Posts not showing?**
- Check `draft: false` in frontmatter
- Verify file is in `/src/data/post/`
- Run `npm run build` to regenerate

**Build fails?**
- Check Zod validation errors in frontmatter
- Ensure date format is ISO 8601: `2024-01-15T10:00:00Z`
- Verify YAML syntax (indentation matters)

**Routes not working?**
- Check `config.yaml` - route enablement flags
- Verify file path matches pattern in route handler
- Check `getStaticPaths()` implementation

**Images not showing?**
- Use full URLs (https://)
- Check URL accessibility
- Verify CORS if external source


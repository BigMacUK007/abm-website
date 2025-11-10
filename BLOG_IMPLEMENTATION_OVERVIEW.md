# Blog Implementation Overview - ABM Prospector Website

## Executive Summary

The ABM Prospector website is built with **Astro 5.0** and uses Astro's native **Content Collections** (astro:content) for managing blog articles. Blog posts are stored as **Markdown/MDX files** in the filesystem with YAML frontmatter. The blog is statically generated at build time.

---

## 1. TECH STACK

### Core Technologies
- **Framework**: Astro 5.12.9
- **CSS Framework**: Tailwind CSS 3.4.17
- **Hosting**: Cloudflare (with @astrojs/cloudflare adapter)
- **Markdown Processing**: 
  - MDX support (@astrojs/mdx 4.3.3)
  - Custom remark/rehype plugins for reading time, responsive tables, lazy image loading
- **Image Optimization**: sharp (0.34.3) for image processing
- **Analytics**: Fathom Analytics (integrated via partytown)
- **Build Output**: Static HTML (output: 'static')

### Notable Integrations
- @astrojs/sitemap - XML sitemap generation
- @astrojs/rss - RSS feed support
- astro-icon - Icon component system
- astro-embed - Embedded content (YouTube, Vimeo, etc.)
- astro-compress - Build-time asset compression
- partytown - Non-blocking third-party script execution

### Backend/CMS
- **Environment Configuration**: .env file indicates Apostrophe CMS configuration headers, but NOT currently in use
  - `APOS_HOST=http://localhost:3002` (unused)
  - `APOS_EXTERNAL_FRONT_KEY` (unused)
- **Current CMS**: File-based (no database required)

---

## 2. BLOG ARTICLES STORAGE

### Storage Method
**Markdown/MDX files** stored in the filesystem.

### Location
```
/src/data/post/
├── astrowind-template-in-depth.mdx
├── get-started-website-with-astro-tailwind-css.md
├── how-to-customize-astrowind-to-your-brand.md
├── landing.md
├── markdown-elements-demo-post.mdx
└── useful-resources-to-create-websites.md
```

### Current Blog Posts
- 6 existing blog posts (mix of .md and .mdx files)
- Supports both Markdown and MDX syntax (allowing embedded components)

---

## 3. ARTICLE STRUCTURE & FRONTMATTER

### Frontmatter Schema
```yaml
---
publishDate: 2023-08-12T00:00:00Z      # Required format: ISO 8601 date-time
updateDate: 2023-08-13T00:00:00Z       # Optional: update timestamp
draft: false                            # Optional: boolean (filters out draft posts)

title: "Article Title"                  # Required: string
excerpt: "Brief summary..."             # Optional: string (used in lists & SEO)
image: "https://url-to-image.jpg"       # Optional: URL string (Unsplash format supported)

category: "Tutorials"                   # Optional: string (single value, normalized to slug)
tags:                                   # Optional: array of strings
  - astro
  - tailwind css
author: "John Smith"                    # Optional: string

metadata:                               # Optional: SEO metadata object
  canonical: https://example.com/...    # Optional: URL
  robots:                               # Optional: SEO robots rules
    index: true
    follow: true
  openGraph:                            # Optional: Open Graph metadata
    url: string
    siteName: string
    images: 
      - url: string
        width: number
        height: number
    locale: string
    type: string
  twitter:                              # Optional: Twitter Card metadata
    handle: string
    site: string
    cardType: string
---
```

### Content Format
- **Markdown**: Standard Markdown syntax (headers, lists, code blocks, etc.)
- **MDX**: Can include Astro components inline (example: `import { YouTube } from 'astro-embed'`)
- **Processing**: Custom remark/rehype plugins add:
  - Reading time calculation (stored in `readingTime` field)
  - Responsive table handling
  - Lazy image loading

### Example Frontmatter
```yaml
---
publishDate: 2023-08-12T00:00:00Z
author: John Smith
title: Get started with AstroWind to create a website using Astro and Tailwind CSS
excerpt: Start your web journey with AstroWind – harness Astro and Tailwind CSS for a stunning site. Explore our guide now.
image: https://images.unsplash.com/photo-1516996087931-5ae405802f9f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80
category: Tutorials
tags:
  - astro
  - tailwind css
metadata:
  canonical: https://astrowind.vercel.app/get-started-website-with-astro-tailwind-css
---
```

---

## 4. BLOG ROUTES & URL STRUCTURE

### Route Configuration
Located in `src/config.yaml`:
```yaml
apps:
  blog:
    isEnabled: true
    postsPerPage: 6
    
    post:
      isEnabled: true
      permalink: '/%slug%'  # Variables available: %slug%, %year%, %month%, %day%, %hour%, %minute%, %second%, %category%
      robots:
        index: true
    
    list:
      isEnabled: true
      pathname: 'blog'
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
        index: false
    
    isRelatedPostsEnabled: true
    relatedPostsCount: 4
```

### URL Routes

| Route Type | Path Pattern | File Location | Status |
|-----------|--------------|---------------|--------|
| Blog Index | `/blog` | `/src/pages/[...blog]/index.astro` | Enabled ✓ |
| Single Post | `/{slug}` | `/src/pages/[...blog]/[...page].astro` | Enabled ✓ |
| Category List | `/category/{category}` | `/src/pages/[...blog]/[category]/index.astro` | Enabled ✓ |
| Tag List | `/tag/{tag}` | `/src/pages/[...blog]/[tag]/index.astro` | Enabled ✓ |
| RSS Feed | `/rss.xml` | `/src/pages/rss.xml.ts` | Auto-generated |
| Sitemap | `/sitemap-index.xml` | Generated by @astrojs/sitemap | Auto-generated |

### Pagination
- Posts per page: 6
- Enabled for blog index, category, and tag pages
- Navigation: Previous/Next page links

### Slug Generation
- **Source**: File ID (filename without extension)
- **Processing**: `cleanSlug()` function normalizes to lowercase kebab-case
- **Example**: `get-started-website-with-astro-tailwind-css.md` → slug: `get-started-website-with-astro-tailwind-css`

---

## 5. PAGE FILES & ROUTING IMPLEMENTATION

### Static Path Generation
All routes are pre-rendered at build time using `getStaticPaths()` exported functions:

#### Blog Index/Pagination
**File**: `/src/pages/[...blog]/[...page].astro`
```typescript
export const getStaticPaths = async ({ paginate }) => {
  return await getStaticPathsBlogList({ paginate });
};
```
- Generates paginated list views with 6 posts per page

#### Single Post
**File**: `/src/pages/[...blog]/index.astro`
```typescript
export const getStaticPaths = async () => {
  return await getStaticPathsBlogPost();
};
```
- Generates individual post pages with:
  - Post content (markdown rendered)
  - Metadata/SEO tags
  - Related posts (max 4)
  - Social sharing buttons
  - Tag listings

#### Category Pages
**File**: `/src/pages/[...blog]/[category]/index.astro`
```typescript
export const getStaticPaths = async ({ paginate }) => {
  return await getStaticPathsBlogCategory({ paginate });
};
```
- Dynamically generates category archives
- Groups posts by `category` frontmatter field

#### Tag Pages
**File**: `/src/pages/[...blog]/[tag]/index.astro`
```typescript
export const getStaticPaths = async ({ paginate }) => {
  return await getStaticPathsBlogTag({ paginate });
};
```
- Dynamically generates tag archives
- Groups posts by `tags` frontmatter array

---

## 6. CONTENT COLLECTION CONFIGURATION

### Collection Setup
**File**: `/src/content/config.ts`

```typescript
const postCollection = defineCollection({
  loader: glob({ pattern: ['*.md', '*.mdx'], base: 'src/data/post' }),
  schema: z.object({
    publishDate: z.date().optional(),
    updateDate: z.date().optional(),
    draft: z.boolean().optional(),
    title: z.string(),
    excerpt: z.string().optional(),
    image: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    author: z.string().optional(),
    metadata: metadataDefinition(),
  }),
});
```

### Schema Details
- **Loader**: Uses glob pattern to find .md and .mdx files in `src/data/post/`
- **Validation**: Zod schema validates frontmatter
- **Required Fields**: Only `title` is mandatory
- **Optional Fields**: 
  - Dates, excerpt, image, category, tags, author, metadata
  - All others are optional (defaults applied during normalization)

---

## 7. BLOG UTILITY FUNCTIONS

### Key Functions
**File**: `/src/utils/blog.ts`

| Function | Purpose |
|----------|---------|
| `fetchPosts()` | Loads all posts from collection, caches results |
| `getNormalizedPost()` | Converts raw collection entry to Post type, generates slug/permalink |
| `generatePermalink()` | Creates URL path based on date/slug/category pattern |
| `findPostsBySlugs()` | Retrieves specific posts by slug array |
| `findPostsByIds()` | Retrieves specific posts by ID array |
| `findLatestPosts()` | Returns latest N posts (default: 4) |
| `getStaticPathsBlogList()` | Generates pagination paths for blog index |
| `getStaticPathsBlogPost()` | Generates paths for each post |
| `getStaticPathsBlogCategory()` | Generates category archive paths |
| `getStaticPathsBlogTag()` | Generates tag archive paths |
| `getRelatedPosts()` | Calculates similar posts by category/tags |

### Post Type Definition
**File**: `/src/types.d.ts`

```typescript
export interface Post {
  id: string;                    // File ID
  slug: string;                  // URL slug
  permalink: string;             // Full URL path
  publishDate: Date;             // Publication date
  updateDate?: Date;             // Last update (optional)
  title: string;                 // Article title
  excerpt?: string;              // Summary text
  image?: ImageMetadata | string; // Featured image
  category?: Taxonomy;           // Single category
  tags?: Taxonomy[];             // Tag array
  author?: string;               // Author name
  metadata?: MetaData;           // SEO metadata
  draft?: boolean;               // Draft status
  Content?: AstroComponentFactory; // Rendered markdown
  content?: string;              // Raw HTML content
  readingTime?: number;          // Calculated reading time in minutes
}
```

---

## 8. CURRENT BUILD & DEPLOYMENT

### Build Process
```bash
npm run build  # Runs: astro build
```

### Output
- **Format**: Static HTML files (100% pre-rendered)
- **Destination**: `dist/` directory
- **Deployment Target**: Cloudflare Pages (via @astrojs/cloudflare adapter)

### Configuration
- **Prerender**: `export const prerender = true` on all blog pages
- **Output Type**: `output: 'static'` in astro.config.ts
- **Compression**: Enabled via astro-compress plugin

### Env Variables
Currently configured for unused Apostrophe CMS:
```
APOS_HOST=http://localhost:3002
APOS_EXTERNAL_FRONT_KEY=2c536aba7f99020e6691243a683974da893b954943d34760d404b26bd641ebe1
```

---

## 9. BLOG COMPONENTS

### Reusable Blog Components
**Location**: `/src/components/blog/`

| Component | Purpose | Usage |
|-----------|---------|-------|
| `ListItem.astro` | Single blog post card in lists | Blog index, categories, tags |
| `SinglePost.astro` | Full article view | Individual post pages |
| `List.astro` | Blog post grid wrapper | Blog list pages |
| `Pagination.astro` | Previous/Next navigation | Paginated views |
| `Tags.astro` | Tag/category badge display | Post metadata footer |
| `RelatedPosts.astro` | Related posts section | Bottom of single posts |
| `Grid.astro` | Grid layout wrapper | Featured posts sections |
| `GridItem.astro` | Grid item variant | Promotional/featured posts |
| `Headline.astro` | Section heading | Blog page headers |
| `ToBlogLink.astro` | Back to blog link | Post page footer |

### Related Features
- **Reading Time**: Auto-calculated and displayed on posts
- **Social Sharing**: Share buttons for Twitter, Facebook, LinkedIn
- **Image Optimization**: Responsive images with lazy loading
- **Dark Mode Support**: Full dark mode CSS classes (currently light:only enforced)

---

## 10. ADMIN AREA - CURRENT STATE

### Current Status
- **Admin Directory**: `/src/pages/admin/` (exists but EMPTY)
- **API Directory**: `/src/pages/api/` (exists but EMPTY except for nested pages folder)
- **Database**: None configured
- **Authentication**: Not implemented

### What's Missing
1. Admin authentication/login
2. Blog post CRUD operations
3. Database for post storage (if moving away from files)
4. Admin UI components
5. Image upload handling
6. Post preview functionality

---

## 11. RECOMMENDATIONS FOR ADMIN AREA DESIGN

### Architecture Decision Points

#### Option A: File-Based Admin (Keep Current Structure)
**Pros**:
- No database needed
- Version control integration (git)
- Simple to understand
- Fast static builds

**Cons**:
- Need Git workflow for updates
- No concurrent editing
- Limited user experience

#### Option B: Hybrid (File + Database)
**Pros**:
- Database for metadata/search
- Real-time editing UI
- Better UX
- Can use Cloudflare KV or D1 (fits existing stack)

**Cons**:
- More complex architecture
- Build-deploy required for live updates

#### Option C: Full Backend CMS
**Pros**:
- Full CRUD in web UI
- No build required
- Multi-user capable
- SSG/SSR hybrid

**Cons**:
- Database required
- More infrastructure
- Apostrophe CMS headers suggest this was considered

### Recommended Stack for Admin Area

Given the current tech stack, I recommend:

1. **Authentication**: Astro API routes + JWT tokens (or Clerk for managed auth)
2. **Database**: 
   - Cloudflare D1 (PostgreSQL-compatible, same host)
   - OR Cloudflare KV + JSON storage (simpler, limited)
   - OR Supabase (PostgreSQL, good integration)
3. **Admin UI**: 
   - React components (via .astro?jsx files)
   - Shadcn UI or similar component library
   - Form validation with Zod (already in use)
4. **File Upload**: Cloudflare R2 (compatible with S3 API)
5. **Post Generation**: 
   - Create .md files dynamically
   - Trigger rebuild via Cloudflare Pages webhooks
   - OR store in DB and render dynamically (hybrid SSG/SSR)

---

## 12. KEY INTEGRATION POINTS FOR ADMIN

### Required APIs
1. **Post Management**:
   ```
   GET /api/posts - List all posts
   GET /api/posts/:id - Get single post
   POST /api/posts - Create post
   PUT /api/posts/:id - Update post
   DELETE /api/posts/:id - Delete post
   ```

2. **Image Handling**:
   ```
   POST /api/upload - Upload featured image
   DELETE /api/media/:id - Remove image
   ```

3. **Categories/Tags**:
   ```
   GET /api/categories - List all categories
   GET /api/tags - List all tags
   ```

4. **Preview**:
   ```
   POST /api/preview - Generate post preview
   ```

### Database Schema (Recommended)
```sql
-- Posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  category_id UUID REFERENCES categories(id),
  draft BOOLEAN DEFAULT true,
  author TEXT,
  publish_date TIMESTAMP,
  update_date TIMESTAMP,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tags table
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

-- Post-Tag junction
CREATE TABLE post_tags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

-- Users table (for future auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  role TEXT DEFAULT 'editor'
);
```

---

## Summary

**Current Blog System**:
- Astro 5.0 with static generation
- Markdown/MDX files in `/src/data/post/`
- Content Collections (astro:content) for validation
- YAML frontmatter with comprehensive metadata
- 6 example blog posts (no active content yet)
- Routes: `/blog`, `/blog/{slug}`, `/category/{cat}`, `/tag/{tag}`
- Deployed to Cloudflare
- No admin interface (directories exist but empty)

**Recommended Admin Approach**:
- Cloudflare D1 (PostgreSQL) for post metadata
- Astro API routes for REST endpoints
- React-based admin dashboard
- JWT authentication
- Hybrid architecture: blog posts can be stored as .md files (git-versioned) or in database

This foundation allows you to build an admin interface that either:
1. Generates static MD files and triggers rebuilds
2. Stores posts in database and uses dynamic/hybrid rendering
3. Combination of both approaches


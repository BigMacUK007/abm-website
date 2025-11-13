# Blog Architecture Diagram & Flow

## Content Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     BLOG CONTENT SOURCES                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  .md / .mdx files in /src/data/post/  ← Current (File-based)    │
│  +                                                                │
│  Potential: Database (Cloudflare D1)  ← Future (Hybrid)         │
│                                                                   │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │   Content Collections API    │
        │  (astro:content, Zod)        │
        │ /src/content/config.ts       │
        └──────────────┬───────────────┘
                       │
                       ▼
        ┌──────────────────────────────────────────┐
        │  Blog Utility Functions                  │
        │  /src/utils/blog.ts                      │
        │                                          │
        │  • fetchPosts()                          │
        │  • getNormalizedPost()                   │
        │  • generatePermalink()                   │
        │  • getStaticPathsBlogList()              │
        │  • getStaticPathsBlogPost()              │
        │  • getStaticPathsBlogCategory()          │
        │  • getStaticPathsBlogTag()               │
        │  • getRelatedPosts()                     │
        └──────────────┬───────────────────────────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
    ┌─────────┐  ┌──────────┐  ┌─────────┐
    │ List    │  │ Post     │  │ Category│
    │ Pages   │  │ Pages    │  │ Pages   │
    │         │  │          │  │         │
    └─────────┘  └──────────┘  └─────────┘
          │            │            │
          └────────────┼────────────┘
                       │
                       ▼
        ┌──────────────────────────────────────┐
        │   Blog Components                    │
        │  /src/components/blog/               │
        │                                      │
        │  • ListItem.astro                    │
        │  • SinglePost.astro                  │
        │  • RelatedPosts.astro                │
        │  • Pagination.astro                  │
        │  • Tags.astro                        │
        └──────────────┬───────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────────┐
        │   Static HTML Generation             │
        │   (Build Time)                       │
        │                                      │
        │   npm run build                      │
        │   ↓                                  │
        │   astro build                        │
        │   ↓                                  │
        │   dist/ directory                    │
        └──────────────┬───────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────────┐
        │   Cloudflare Pages Deployment        │
        │                                      │
        │   Production: abmprospector.com      │
        └──────────────────────────────────────┘
```

---

## URL Routing Structure

```
Blog Root
│
├── /blog                          (Blog Index + Paginated List)
│   ├── /blog/page/2
│   ├── /blog/page/3
│   └── ...
│
├── /{slug}                        (Single Post)
│   ├── /get-started-astro
│   ├── /how-to-customize
│   └── ...
│
├── /category/{category}           (Category Archives + Paginated)
│   ├── /category/tutorials
│   ├── /category/tutorials/page/2
│   └── ...
│
├── /tag/{tag}                     (Tag Archives + Paginated)
│   ├── /tag/astro
│   ├── /tag/astro/page/2
│   └── ...
│
├── /rss.xml                       (RSS Feed)
│
└── /sitemap-index.xml             (XML Sitemap)
```

---

## File Structure

```
src/
├── data/
│   └── post/                          # Blog articles (Markdown/MDX)
│       ├── astrowind-template-in-depth.mdx
│       ├── get-started-website-with-astro-tailwind-css.md
│       ├── how-to-customize-astrowind-to-your-brand.md
│       ├── landing.md
│       ├── markdown-elements-demo-post.mdx
│       └── useful-resources-to-create-websites.md
│
├── content/
│   └── config.ts                      # Content Collection Schema
│
├── pages/
│   └── [...blog]/
│       ├── index.astro                # Single post page
│       ├── [...page].astro            # Blog list + pagination
│       ├── [category]/
│       │   └── index.astro            # Category archives
│       ├── [tag]/
│       │   └── index.astro            # Tag archives
│       └── admin/                     # Empty (future admin)
│
├── components/
│   └── blog/
│       ├── ListItem.astro             # Post card component
│       ├── SinglePost.astro           # Full post layout
│       ├── List.astro                 # List wrapper
│       ├── Pagination.astro           # Navigation
│       ├── Tags.astro                 # Tag display
│       ├── RelatedPosts.astro         # Related section
│       ├── Grid.astro
│       ├── GridItem.astro
│       ├── Headline.astro
│       └── ToBlogLink.astro
│
├── utils/
│   ├── blog.ts                        # Blog utility functions
│   ├── permalinks.ts                  # URL generation
│   ├── images.ts                      # Image optimization
│   └── frontmatter.ts                 # Markdown plugins
│
├── types.d.ts                         # Post interface definitions
└── config.yaml                        # Blog configuration
```

---

## Frontmatter Structure

```yaml
---
# Publication & Dates
publishDate: 2023-08-12T00:00:00Z     # ISO 8601 (required format)
updateDate: 2023-08-13T00:00:00Z      # Optional

# Content Identity
title: "Main Article Title"            # Required
excerpt: "Short summary for preview"   # Optional
draft: false                           # Optional (default: false)

# Media & Categories
image: "https://example.com/image.jpg" # Optional (featured image URL)
category: "Tutorials"                  # Optional (single value)
tags:                                  # Optional (array)
  - astro
  - tutorial

# Metadata
author: "John Smith"                   # Optional
metadata:                              # Optional (SEO & Open Graph)
  canonical: "https://..."
  robots:
    index: true
    follow: true
  openGraph:
    type: "article"
    images:
      - url: "..."
        width: 1200
        height: 628
  twitter:
    cardType: "summary_large_image"
---

# Content starts here (Markdown/MDX)
```

---

## Data Flow: Creating a New Post

### Current Workflow (File-based)
```
1. Create .md/.mdx file in /src/data/post/
   └─ filename becomes the slug
   
2. Add YAML frontmatter
   └─ Define title, date, category, tags, etc.
   
3. Write content in Markdown/MDX
   
4. Run: npm run build
   └─ Astro loads files via glob pattern
   └─ Content Collection validates against schema
   └─ getStaticPaths() generates routes
   └─ Components render HTML
   └─ Static files output to dist/
   
5. Deploy to Cloudflare Pages
   └─ Push to git triggers webhook
   └─ Site rebuilds and deploys
```

### Proposed Workflow (Admin Interface)
```
1. User navigates to /admin/posts
   
2. Click "New Post"
   
3. Fill form:
   ├─ Title, excerpt, content (rich editor)
   ├─ Category, tags
   ├─ Publish date
   └─ Upload featured image
   
4. Click "Publish"
   └─ API validates data (Zod schema)
   └─ Save to database (Cloudflare D1)
   └─ Generate slug from title
   └─ Optionally create .md file
   └─ Trigger site rebuild webhook
   
5. Post live on site
```

---

## Slug & Permalink Generation

```
Input: /src/data/post/how-to-customize-astrowind-to-your-brand.md

Slug Generation Process:
1. Extract filename: "how-to-customize-astrowind-to-your-brand"
2. Run cleanSlug(): lowercase kebab-case
3. Result: "how-to-customize-astrowind-to-your-brand"

Permalink Generation (based on config):
Pattern: /%slug%
Available variables:
  %slug%     → post slug
  %year%     → 2023
  %month%    → 08
  %day%      → 12
  %hour%     → 00
  %minute%   → 00
  %second%   → 00
  %category% → tutorials

Example URL: /how-to-customize-astrowind-to-your-brand
```

---

## Related Posts Algorithm

```
For each post:
  score = 0
  
  if post.category == current.category:
    score += 5  (same category weighted heavily)
  
  for each tag in post.tags:
    if tag in current.tags:
      score += 1
  
  related_posts = top 4 posts by score
```

---

## Static Build Process

```
1. npm run build
   │
   ├─ Load all .md/.mdx files from /src/data/post/
   │
   ├─ Validate frontmatter against Zod schema
   │
   ├─ For each post:
   │  ├─ Generate slug & permalink
   │  ├─ Calculate reading time (remark plugin)
   │  ├─ Process markdown to HTML
   │  └─ Create route path
   │
   ├─ Generate static routes:
   │  ├─ Blog index pages (paginated)
   │  ├─ Individual post pages
   │  ├─ Category archives
   │  ├─ Tag archives
   │  └─ RSS + Sitemap
   │
   ├─ Render components for each route:
   │  └─ Hydrate with post data
   │  └─ Apply layouts & styling
   │  └─ Generate HTML files
   │
   └─ Output to /dist/
      └─ dist/blog/index.html
      └─ dist/{slug}/index.html
      └─ dist/category/{cat}/index.html
      └─ dist/tag/{tag}/index.html
      └─ dist/rss.xml
      └─ dist/sitemap-index.xml
```

---

## Admin Architecture (Proposed)

```
┌───────────────────────────────────────────────────────────┐
│                      Admin Dashboard                      │
│              /src/pages/admin/                            │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  React Components (Shadcn UI)                            │
│  ├─ Layout.astro                                         │
│  ├─ posts/                                               │
│  │  ├─ index.astro (List all posts)                     │
│  │  ├─ [id].astro (Edit post)                           │
│  │  └─ new.astro (Create post)                          │
│  ├─ categories/ (CRUD)                                  │
│  ├─ tags/ (CRUD)                                        │
│  └─ settings/ (Configuration)                           │
│                                                           │
└──────────────────┬──────────────────────────────────────┘
                   │ API Calls
                   ▼
┌───────────────────────────────────────────────────────────┐
│              REST API Routes (Astro)                      │
│              /src/pages/api/                             │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  POST   /api/posts          (Create)                     │
│  GET    /api/posts          (List)                       │
│  GET    /api/posts/{id}     (Single)                     │
│  PUT    /api/posts/{id}     (Update)                     │
│  DELETE /api/posts/{id}     (Delete)                     │
│                                                           │
│  POST   /api/upload         (Image upload)               │
│  GET    /api/categories     (List)                       │
│  POST   /api/categories     (Create)                     │
│  GET    /api/tags           (List)                       │
│  POST   /api/tags           (Create)                     │
│                                                           │
│  Middleware: JWT validation, role-based access           │
│                                                           │
└──────────────────┬──────────────────────────────────────┘
                   │
        ┌──────────┼──────────┬──────────┐
        │          │          │          │
        ▼          ▼          ▼          ▼
    ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
    │Cloudflare│Cloudflare│  Git   │  Image │
    │   D1     │    R2    │ Webhook│ Cache  │
    │(PostgreSQL)│(Storage)│(Deploy)│(Upic)  │
    └────────┘ └────────┘ └────────┘ └────────┘
```

---

## SEO & Metadata

```
For each post:

1. HTML Meta Tags
   <title>{post.metadata.title || post.title} — ABM Prospector</title>
   <meta name="description" content="{post.excerpt}" />
   <meta name="robots" content="index, follow" />

2. Open Graph (Social)
   <meta property="og:type" content="article" />
   <meta property="og:title" content="{post.title}" />
   <meta property="og:description" content="{post.excerpt}" />
   <meta property="og:image" content="{post.image}" />
   <meta property="og:url" content="{canonical_url}" />

3. Twitter Card
   <meta name="twitter:card" content="summary_large_image" />
   <meta name="twitter:title" content="{post.title}" />
   <meta name="twitter:image" content="{post.image}" />

4. Structured Data (JSON-LD)
   - Article schema
   - Author schema
   - Image schema

5. Canonical URL
   <link rel="canonical" href="{post.metadata.canonical || computed_url}" />
```

---

## Config Switches

In `/src/config.yaml`:

```yaml
apps:
  blog:
    isEnabled: true              # Enable/disable entire blog
    postsPerPage: 6              # Pagination size
    
    post:
      isEnabled: true            # Enable individual post pages
      permalink: '/%slug%'       # URL pattern
      robots:
        index: true              # Make posts indexable
    
    list:
      isEnabled: true            # Enable blog index
      pathname: 'blog'           # Base path (/blog)
      robots:
        index: true
    
    category:
      isEnabled: true            # Enable category archives
      pathname: 'category'       # Base path (/category)
      robots:
        index: true
    
    tag:
      isEnabled: true            # Enable tag archives
      pathname: 'tag'            # Base path (/tag)
      robots:
        index: false             # Don't index tag pages (SEO preference)
    
    isRelatedPostsEnabled: true  # Show related posts
    relatedPostsCount: 4         # How many related posts
```

All these can be toggled independently for fine-grained control.


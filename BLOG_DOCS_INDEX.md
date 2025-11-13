# Blog System Documentation Index

This directory contains comprehensive documentation about the ABM Prospector blog implementation. Use this guide to navigate and understand the blog system.

---

## Documentation Files

### 1. QUICK_REFERENCE.md (START HERE)
**Best for**: Quick lookups and immediate answers

Contains:
- Key files at a glance
- Frontmatter cheat sheet
- URL patterns
- Common functions and components
- Creating a new post (5-step guide)
- Build & deploy commands
- Troubleshooting guide

Ideal for: Getting something done quickly, refreshing your memory

**Read time**: 5-10 minutes

---

### 2. BLOG_IMPLEMENTATION_OVERVIEW.md
**Best for**: Understanding the full system and architecture

Contains:
- Executive summary
- Complete tech stack
- Blog storage & location
- Article structure & frontmatter schema
- All blog routes & URL patterns
- Content collection configuration
- Blog utility functions reference
- Database schema recommendations
- Admin area recommendations

Ideal for: Learning how everything works, system design decisions, admin planning

**Read time**: 20-30 minutes

---

### 3. BLOG_ARCHITECTURE.md
**Best for**: Visual understanding and workflow diagrams

Contains:
- Content pipeline flowchart
- URL routing tree
- Complete file structure
- Frontmatter structure with annotations
- Data flow for creating posts (current & proposed)
- Slug & permalink generation process
- Related posts algorithm
- Static build process flowchart
- Proposed admin architecture
- SEO & metadata strategy
- Configuration switch reference

Ideal for: Understanding flow, designing admin interface, debugging routes

**Read time**: 15-20 minutes

---

## Quick Navigation

### By Task

**I want to...**

- **Create a new blog post** → QUICK_REFERENCE.md (section: "Creating a New Blog Post")
- **Understand the whole system** → BLOG_IMPLEMENTATION_OVERVIEW.md (sections 1-12)
- **Debug a routing issue** → BLOG_ARCHITECTURE.md (sections: "URL Routing Structure", "File Structure")
- **Learn slug generation** → BLOG_ARCHITECTURE.md (section: "Slug & Permalink Generation")
- **Design the admin area** → BLOG_IMPLEMENTATION_OVERVIEW.md (sections 10-12) + BLOG_ARCHITECTURE.md (section: "Admin Architecture")
- **Check frontmatter fields** → QUICK_REFERENCE.md (section: "Frontmatter Cheat Sheet") or BLOG_ARCHITECTURE.md (section: "Frontmatter Structure")
- **Find a specific function** → QUICK_REFERENCE.md (section: "Common Functions") or BLOG_IMPLEMENTATION_OVERVIEW.md (section 7)

### By Topic

- **Blog Configuration** → BLOG_ARCHITECTURE.md (section: "Config Switches")
- **Content Storage** → BLOG_IMPLEMENTATION_OVERVIEW.md (section 2)
- **Routes & URLs** → BLOG_IMPLEMENTATION_OVERVIEW.md (section 4) or BLOG_ARCHITECTURE.md (section: "URL Routing Structure")
- **Frontmatter** → BLOG_ARCHITECTURE.md (section: "Frontmatter Structure")
- **Components** → BLOG_IMPLEMENTATION_OVERVIEW.md (section 9)
- **Utility Functions** → BLOG_IMPLEMENTATION_OVERVIEW.md (section 7)
- **Build Process** → BLOG_ARCHITECTURE.md (section: "Static Build Process")
- **Admin Setup** → BLOG_IMPLEMENTATION_OVERVIEW.md (sections 11-12)

---

## System Overview

```
File Storage: /src/data/post/
     ↓
Content Collections (astro:content)
     ↓
Blog Utilities (/src/utils/blog.ts)
     ↓
Route Generators (getStaticPaths)
     ↓
Blog Components (/src/components/blog/)
     ↓
Static HTML Generation (npm run build)
     ↓
Cloudflare Pages Deployment
```

---

## Key Facts

- **Framework**: Astro 5.0
- **Storage**: Markdown/MDX files in `/src/data/post/`
- **Database**: None (file-based, static generation)
- **Hosting**: Cloudflare Pages
- **CSS**: Tailwind CSS
- **Blog Posts**: 6 example posts
- **Routes**: Blog index, single post, category, tag, RSS, sitemap
- **Components**: 10 reusable blog components
- **Admin Area**: Empty directories (TODO)

---

## Tech Stack Summary

| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Astro | 5.12.9 |
| Styling | Tailwind CSS | 3.4.17 |
| Markdown | MDX + remark/rehype plugins | @astrojs/mdx 4.3.3 |
| Image Processing | Sharp | 0.34.3 |
| Hosting | Cloudflare | Pages adapter |
| Icons | astro-icon | 1.1.5 |
| Validation | Zod | (in use) |

---

## File Structure Quick View

```
src/
├── data/post/              ← Blog articles (.md, .mdx)
├── content/config.ts       ← Content validation schema
├── pages/[...blog]/        ← Blog routes
├── components/blog/        ← Blog UI components
├── utils/blog.ts           ← Blog utilities
├── types.d.ts              ← Post interface
└── config.yaml             ← Blog config toggles
```

---

## Getting Started Checklist

- [ ] Read QUICK_REFERENCE.md for overview
- [ ] Review BLOG_IMPLEMENTATION_OVERVIEW.md for architecture
- [ ] Study BLOG_ARCHITECTURE.md for detailed flows
- [ ] Create your first post using QUICK_REFERENCE.md guide
- [ ] Run `npm run build` to generate static files
- [ ] Test locally with `npm run preview`
- [ ] Deploy to Cloudflare Pages

---

## Common Questions

**Q: Where are blog posts stored?**
A: `/src/data/post/` directory as .md or .mdx files

**Q: How do I create a new post?**
A: Create a .md file with YAML frontmatter. See QUICK_REFERENCE.md

**Q: Can I use custom components in posts?**
A: Yes, use .mdx format. See BLOG_ARCHITECTURE.md (frontmatter section)

**Q: How are URLs generated?**
A: From filename → slug → permalink. See BLOG_ARCHITECTURE.md

**Q: How do I enable/disable routes?**
A: Edit `/src/config.yaml` blog settings. See QUICK_REFERENCE.md

**Q: How do I add an admin interface?**
A: See BLOG_IMPLEMENTATION_OVERVIEW.md (sections 11-12)

**Q: What's the build process?**
A: See BLOG_ARCHITECTURE.md (section: "Static Build Process")

---

## Admin Area Planning

**Current State**: Empty directories exist
- `/src/pages/admin/` (admin interface)
- `/src/pages/api/` (API endpoints)

**Recommended Stack**:
1. Cloudflare D1 (PostgreSQL database)
2. Astro API routes (REST endpoints)
3. React components (Shadcn UI)
4. JWT authentication
5. Cloudflare R2 (image uploads)

**Reference**: BLOG_IMPLEMENTATION_OVERVIEW.md sections 11-12

---

## Performance Characteristics

- **Build Time**: Depends on post count (milliseconds per post)
- **Runtime**: Zero database queries (static HTML)
- **Page Size**: Optimized images, gzipped CSS/JS
- **Deployment**: CDN-distributed (Cloudflare edge)
- **SEO**: Pre-rendered HTML with meta tags

---

## Support Files

Other useful files in the project:
- `/src/config.yaml` - Blog config (referenced throughout docs)
- `/src/types.d.ts` - TypeScript interfaces
- `/src/utils/blog.ts` - Blog utility functions
- `/src/content/config.ts` - Content validation schema
- `astro.config.ts` - Astro configuration
- `package.json` - Dependencies and scripts

---

## Document Versions

- **BLOG_IMPLEMENTATION_OVERVIEW.md**: v1.0 (2024-11-07)
- **BLOG_ARCHITECTURE.md**: v1.0 (2024-11-07)
- **QUICK_REFERENCE.md**: v1.0 (2024-11-07)
- **BLOG_DOCS_INDEX.md**: v1.0 (2024-11-07)

These documents comprehensively cover the ABM Prospector blog system as of the last analysis.

---

## Next Steps

1. **Immediate**: Review QUICK_REFERENCE.md and create a test post
2. **Short-term**: Understand routes and components (BLOG_IMPLEMENTATION_OVERVIEW.md)
3. **Medium-term**: Design admin interface (sections 11-12 of BLOG_IMPLEMENTATION_OVERVIEW.md)
4. **Long-term**: Implement admin dashboard and database integration

---

**Questions?** Refer to the relevant documentation or check the codebase directly:
- Blog config: `/src/config.yaml`
- Content schema: `/src/content/config.ts`
- Utilities: `/src/utils/blog.ts`
- Components: `/src/components/blog/`
- Pages: `/src/pages/[...blog]/`


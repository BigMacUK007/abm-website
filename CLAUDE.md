# ABM Prospector Website - Claude Code Instructions

## Project Overview

This is an Astro 5.0 website for ABM Prospector built with:
- **Framework**: Astro 5.0 (hybrid mode)
- **Styling**: Tailwind CSS
- **Content**: MDX files + Cloudflare D1 database
- **Hosting**: Cloudflare Pages
- **Authentication**: Clerk (magic links)
- **Admin Editor**: Lexical (React-based WYSIWYG)

## Architecture

### Static Content (Public Site)
- Blog posts stored as MDX files in `/src/data/post/`
- Statically generated at build time
- Uses Astro Content Collections

### Dynamic Content (Admin Area)
- Articles managed via D1 database
- Server-side rendered (SSR) admin pages
- React components for interactive UI
- Clerk authentication for security

## Development Workflow

### Branch Strategy
- Main branch: `master`
- PR target: `feature/abm-ai-website-content`
- Feature branches: `feature/[description]`
- Fix branches: `fix/[description]`

### Before Creating PR
Always run these checks:
```bash
npm run check        # Runs astro check, eslint, and prettier
npm run fix          # Auto-fixes eslint and prettier issues
```

### Running Locally
```bash
npm run dev          # Start dev server on localhost:4321
```

### Admin Area Setup
See `ADMIN_SETUP.md` for complete setup instructions.

Quick start:
1. Add Clerk keys to `.env`
2. Create D1 database: `npx wrangler d1 create blog-admin-db`
3. Initialize schema: `npx wrangler d1 execute blog-admin-db --file=./schema.sql --local`
4. Access: `http://localhost:4321/admin/login`

## Key Files & Directories

### Blog System (Static)
- `/src/data/post/` - MDX blog posts
- `/src/utils/blog.ts` - Blog helper functions
- `/src/pages/blog/[...slug].astro` - Blog post pages
- `/src/pages/blog/[...page].astro` - Blog list with pagination
- `/src/config.yaml` - Site configuration

### Admin System (Dynamic)
- `/src/pages/admin/` - Admin pages (SSR)
- `/src/components/admin/` - React components
- `/src/pages/api/articles/` - API endpoints
- `/src/layouts/AdminLayout.astro` - Admin layout
- `/schema.sql` - D1 database schema
- `/wrangler.toml` - Cloudflare configuration

### Configuration
- `/astro.config.ts` - Astro configuration
- `/tailwind.config.ts` - Tailwind configuration
- `/.env` - Environment variables (not committed)
- `/.env.example` - Environment variable template

## Environment Variables

Required for admin functionality:
```bash
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

## Admin Features

### Authentication
- Magic link authentication via Clerk
- No passwords required
- Protected routes check `locals.auth().userId`

### Article Management
- Create, read, update, delete articles
- Lexical WYSIWYG editor
- Draft/publish toggle
- Slug auto-generation
- Category and tag support
- Featured images

### API Endpoints
All require authentication:
- `GET /api/articles` - List articles
- `POST /api/articles` - Create article
- `GET /api/articles/[id]` - Get article
- `PUT /api/articles/[id]` - Update article
- `DELETE /api/articles/[id]` - Delete article

## Docker Preference

When building new web apps, prefer Docker containers for:
- Consistent development environments
- Easy deployment
- Dependency isolation

## Code Style

### TypeScript
- Strict mode enabled
- Type all function parameters and returns
- Use interfaces for complex types

### React Components
- Functional components with hooks
- TypeScript for props
- Clear prop interfaces

### Astro Components
- Use TypeScript in frontmatter
- Export `prerender = false` for SSR pages
- Keep components focused and reusable

## Testing Changes

### Browser Testing
Use Playwright MCP for:
- UI/UX verification
- Form submissions
- Authentication flows
- Responsive design checks

Example:
```bash
# Access admin login
# Fill in email field
# Check magic link email
# Verify redirect to dashboard
```

### Checklist Before PR
- [ ] Run `npm run check` - All checks pass
- [ ] Test locally - Features work as expected
- [ ] Playwright testing - UI verified
- [ ] Update CLAUDE.md - Document changes
- [ ] Security scan - No vulnerabilities
- [ ] Git branch - Correct naming convention
- [ ] Commit messages - Clear and descriptive

## Common Tasks

### Add New Admin Page
1. Create page in `/src/pages/admin/`
2. Add `export const prerender = false`
3. Check auth: `const { userId } = Astro.locals.auth()`
4. Use `AdminLayout` component
5. Add navigation link in layout

### Add New API Endpoint
1. Create file in `/src/pages/api/`
2. Export HTTP method handlers (GET, POST, etc.)
3. Check authentication
4. Access D1 via `locals.runtime.env.DB`
5. Return JSON responses

### Modify Lexical Editor
1. Edit `/src/components/admin/LexicalEditor.tsx`
2. Add/remove Lexical plugins
3. Update toolbar for new features
4. Test thoroughly in browser

### Database Changes
1. Update `/schema.sql`
2. Create migration script if needed
3. Test locally with `--local` flag
4. Apply to remote with `--remote` flag

## Documentation

- `ADMIN_SETUP.md` - Admin area setup guide
- `BLOG_DOCS_INDEX.md` - Blog system documentation
- `QUICK_REFERENCE.md` - Quick reference guide
- This file - Claude Code instructions

## Security Best Practices

1. **Never commit secrets** - Use .env files
2. **Validate input** - Check all user inputs
3. **Parameterize queries** - Prevent SQL injection
4. **Check authentication** - On all admin routes
5. **Sanitize output** - Lexical handles this
6. **HTTPS only** - Cloudflare enforces this

## Getting Latest Docs

If you need the latest documentation for any technology:
1. Use Context7 MCP to fetch updated docs
2. Reference official documentation sites
3. Check for breaking changes in changelogs

## Notes

- Admin area uses hybrid rendering (static + SSR)
- Public blog remains static for performance
- Clerk handles all authentication concerns
- D1 database is bound via Cloudflare Workers
- Lexical editor state stored as JSON
- Article slugs must be unique

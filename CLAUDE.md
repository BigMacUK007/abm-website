# ABM Prospector Website - Claude Code Instructions

## Project Overview

This is an Astro 5.0 website for ABM Prospector built with:
- **Framework**: Astro 5.0 (static mode)
- **Styling**: Tailwind CSS
- **Content**: MDX files
- **Hosting**: Cloudflare Pages

## Architecture

### Static Content
- Blog posts stored as MDX files in `/src/data/post/`
- Statically generated at build time
- Uses Astro Content Collections

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

## Key Files & Directories

### Blog System
- `/src/data/post/` - MDX blog posts
- `/src/utils/blog.ts` - Blog helper functions
- `/src/pages/blog/[...slug].astro` - Blog post pages
- `/src/pages/blog/[...page].astro` - Blog list with pagination
- `/src/config.yaml` - Site configuration

### Configuration
- `/astro.config.ts` - Astro configuration
- `/tailwind.config.ts` - Tailwind configuration
- `/.env` - Environment variables (not committed)
- `/.env.example` - Environment variable template

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

### Astro Components
- Use TypeScript in frontmatter
- Keep components focused and reusable

## Testing Changes

### Browser Testing
Use Playwright MCP for:
- UI/UX verification
- Form submissions
- Responsive design checks

### Checklist Before PR
- [ ] Run `npm run check` - All checks pass
- [ ] Test locally - Features work as expected
- [ ] Playwright testing - UI verified
- [ ] Update CLAUDE.md - Document changes
- [ ] Security scan - No vulnerabilities
- [ ] Git branch - Correct naming convention
- [ ] Commit messages - Clear and descriptive

## Documentation

- `BLOG_DOCS_INDEX.md` - Blog system documentation
- `QUICK_REFERENCE.md` - Quick reference guide
- This file - Claude Code instructions

## Security Best Practices

1. **Never commit secrets** - Use .env files
2. **Validate input** - Check all user inputs
3. **HTTPS only** - Cloudflare enforces this

## Getting Latest Docs

If you need the latest documentation for any technology:
1. Use Context7 MCP to fetch updated docs
2. Reference official documentation sites
3. Check for breaking changes in changelogs

## Notes

- Site uses static rendering for optimal performance
- Blog posts are manually updated via MDX files
- All content is statically generated at build time

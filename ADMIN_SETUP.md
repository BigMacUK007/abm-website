# Admin Area Setup Guide

This document provides instructions for setting up and using the admin area for the ABM Prospector website.

## Overview

The admin area provides a secure, authenticated interface for managing blog articles using:
- **Clerk** for magic link authentication
- **Lexical** as the WYSIWYG editor
- **Cloudflare D1** database for article storage
- **Astro Hybrid Mode** for server-side rendering of admin pages

## Prerequisites

Before setting up the admin area, ensure you have:
1. Node.js v18.17.1 or higher
2. A Clerk account (https://clerk.com)
3. Wrangler CLI installed globally or via npm
4. Access to Cloudflare account

## Step 1: Configure Clerk Authentication

1. **Create a Clerk Application**
   - Go to https://dashboard.clerk.com
   - Create a new application
   - Enable "Email" as an authentication method
   - Under "Email options", enable "Email Magic Links"

2. **Get API Keys**
   - In your Clerk dashboard, go to "API Keys"
   - Copy the "Publishable Key" and "Secret Key"

3. **Set Environment Variables**
   Create a `.env` file in the project root:
   ```bash
   PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
   CLERK_SECRET_KEY=sk_test_your_key_here
   ```

4. **Configure Allowed Redirect URLs**
   - In Clerk dashboard, go to "Paths"
   - Add the following URLs:
     - Development: `http://localhost:4321/admin`
     - Production: `https://yourdomain.com/admin`

## Step 2: Create and Initialize D1 Database

1. **Create the D1 Database**
   ```bash
   npx wrangler d1 create blog-admin-db
   ```

2. **Update wrangler.toml**
   Copy the `database_id` from the output and update `wrangler.toml`:
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "blog-admin-db"
   database_id = "your-database-id-here"
   ```

3. **Initialize Database Schema**
   ```bash
   npx wrangler d1 execute blog-admin-db --file=./schema.sql --remote
   ```

   For local development:
   ```bash
   npx wrangler d1 execute blog-admin-db --file=./schema.sql --local
   ```

## Step 3: Test Locally

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Access Admin Panel**
   - Navigate to: http://localhost:4321/admin/login
   - Sign in using your email (magic link will be sent)
   - You should be redirected to the admin dashboard

3. **Test Article Creation**
   - Click "Create New Article"
   - Fill in the form with test data
   - Use the Lexical editor to write content
   - Save as draft or publish

## Step 4: Deploy to Production

1. **Add Environment Variables to Cloudflare**
   ```bash
   npx wrangler secret put CLERK_SECRET_KEY
   npx wrangler secret put PUBLIC_CLERK_PUBLISHABLE_KEY
   ```

2. **Build and Deploy**
   ```bash
   npm run build
   npx wrangler pages deploy dist
   ```

3. **Bind D1 Database**
   - In Cloudflare dashboard, go to Workers & Pages
   - Select your project
   - Go to Settings > Functions > D1 database bindings
   - Add binding: `DB` -> `blog-admin-db`

## File Structure

```
src/
├── components/
│   └── admin/
│       ├── ArticleEditorForm.tsx    # React form component
│       └── LexicalEditor.tsx         # Lexical WYSIWYG editor
├── layouts/
│   └── AdminLayout.astro             # Admin page layout
├── pages/
│   ├── admin/
│   │   ├── index.astro               # Admin dashboard
│   │   ├── login.astro               # Login page
│   │   └── articles/
│   │       ├── index.astro           # Article list
│   │       └── [id].astro            # Article editor
│   └── api/
│       └── articles/
│           ├── index.ts              # GET (list), POST (create)
│           └── [id].ts               # GET, PUT, DELETE
```

## Admin Routes

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/admin` | Dashboard | Yes |
| `/admin/login` | Login page | No |
| `/admin/articles` | Article list | Yes |
| `/admin/articles/new` | Create article | Yes |
| `/admin/articles/[id]` | Edit article | Yes |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/articles` | GET | List all articles |
| `/api/articles` | POST | Create new article |
| `/api/articles/[id]` | GET | Get single article |
| `/api/articles/[id]` | PUT | Update article |
| `/api/articles/[id]` | DELETE | Delete article |

## Database Schema

The `articles` table includes:
- `id` - Unique identifier (UUID)
- `slug` - URL-friendly identifier
- `title` - Article title
- `excerpt` - Brief description
- `category` - Article category
- `tags` - Comma-separated tags
- `image` - Featured image URL
- `author` - Author name
- `publishDate` - Publication date
- `draft` - Draft status (0 = published, 1 = draft)
- `content` - Lexical editor state (JSON)
- `metadata` - Additional metadata (JSON)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## Security Considerations

1. **Authentication**: All admin routes check for valid Clerk session
2. **API Protection**: All API endpoints require authentication
3. **Input Validation**: All forms validate required fields
4. **SQL Injection**: Using parameterized queries throughout
5. **XSS Protection**: Lexical editor sanitizes content

## Troubleshooting

### Database Not Initialized
**Error**: "Failed to load articles. Database may not be initialized."
**Solution**: Run the schema initialization command:
```bash
npx wrangler d1 execute blog-admin-db --file=./schema.sql --local
```

### Clerk Authentication Issues
**Error**: "Unauthorized" when accessing admin pages
**Solution**:
1. Check that environment variables are set correctly
2. Verify Clerk application is configured properly
3. Check that redirect URLs are whitelisted in Clerk dashboard

### Build Errors
**Error**: TypeScript or React compilation errors
**Solution**: Ensure all dependencies are installed:
```bash
npm install
```

## Development Workflow

1. Create feature branch: `git checkout -b feature/admin-enhancement`
2. Make changes to admin area
3. Test locally with `npm run dev`
4. Run checks: `npm run check`
5. Fix any issues: `npm run fix`
6. Commit changes
7. Create pull request to `feature/abm-ai-website-content`

## Future Enhancements

- [ ] Image upload functionality
- [ ] Rich media embedding
- [ ] Article preview before publishing
- [ ] Version history
- [ ] Bulk operations
- [ ] Search and filtering
- [ ] Analytics integration
- [ ] SEO metadata editor

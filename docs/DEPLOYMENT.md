# Deployment & Production Notes — Umhlaba Wami

## 1. Current State

The repository ships a fully functional **demo SPA**. Data is stored in the browser (`localStorage`). This is ideal for:

- Local development
- Stakeholder demonstrations
- UI/UX validation

It is **not** production-ready for multi-user concurrent use or sensitive data.

## 2. Recommended Production Architecture

1. **Frontend**: Deploy the Vite build to a static host (Vercel, Netlify, Cloudflare Pages, or S3 + CloudFront).
2. **Backend / Database**: Supabase project.
   - Run `public/supabase-schema.sql` (extend RLS policies).
   - Enable Auth (email + optional magic link / SSO).
   - Use Supabase Storage for ticket attachments and property images.
3. **Client refactor**:
   - Replace `src/services/db.ts` with a Supabase client module that implements the same TypeScript interfaces.
   - Replace `AuthService` session handling with Supabase Auth session + organisation membership checks.
4. **Environment variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - (Server-side) service role key only in secure edge functions if needed.

## 3. Build & Deploy (Static)

```bash
npm install
npm run build
# Output in dist/
```

Deploy the `dist` folder to your preferred static hosting provider. Configure SPA fallback so all routes serve `index.html`.

## 4. Security Checklist Before Go-Live

- [ ] Passwords hashed (bcrypt / Argon2) or fully delegated to Supabase Auth
- [ ] Comprehensive RLS policies for every table and operation
- [ ] Storage bucket policies restricting access by organisation / role
- [ ] HTTPS only
- [ ] Content Security Policy headers
- [ ] Rate limiting on auth and ticket creation endpoints
- [ ] Audit logging retained server-side
- [ ] Regular backups of the PostgreSQL database

## 5. Environment-Specific Configuration

- Use different Supabase projects (or schemas) for staging and production.
- Keep demo seed data out of production; provide a controlled seed script for UAT only.

## 6. Monitoring & Observability

- Application performance monitoring (e.g. Sentry for frontend errors).
- Supabase dashboard for database metrics and auth logs.
- Optional: structured logging of critical business events (ticket SLA breaches, organisation approvals).

## 7. Future Enhancements

- Progressive Web App (PWA) for technicians on mobile devices.
- Offline ticket draft support.
- Native mobile apps consuming the same Supabase backend.
- GenAI-assisted ticket triage and natural-language reports (capability already declared in `metadata.json`).

# Automated Deployment & Version Control Protocol

Whenever any code changes, bug fixes, UI updates, schema modifications, or features are implemented in this repository, **ALWAYS automatically execute this full deployment pipeline without asking the user**:

1. **Git Commit & Push**:
   - Stage all modified and new project files (`git add <files>`).
   - Commit with a clear, descriptive conventional commit message (`git commit -m "..."`).
   - Push immediately to GitHub: `git push origin main`.

2. **Cloudflare Pages Production Build & Deploy**:
   - Run the production build: `npm run build`.
   - Deploy immediately to Cloudflare Pages:
     `npx wrangler pages deploy dist --project-name hotel-sai-international --branch main`

3. **Cloudflare D1 Remote Database Sync**:
   - If SQL migrations, table definitions, or seed scripts are altered or added, apply them directly to the remote Cloudflare D1 database:
     `npx wrangler d1 execute hotel-sai-international-db --remote --file=<migration_file>`

4. **Confirmation**:
   - Provide the commit hash, the live GitHub link, and the live Cloudflare Pages URL in the final response.
   - Do NOT ask the user if they want to push or deploy; perform it as part of completing the task.

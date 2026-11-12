# Cloudflare gallery migration

This is a prepared Cloudflare replacement for the current Firebase-backed gallery. The upload page is closed in the website and the Worker rejects uploads by default. Do not remove the Firebase project until the Cloudflare resources are configured, existing gallery data is migrated if desired, and the new gallery is deployed and checked.

## Cloudflare components

- Pages: host this Vite frontend (`npm run build`, output `dist`).
- Workers: private API, guest validation, upload activation switch, and media delivery.
- R2: photo and video object storage.
- D1: guest invite-code hashes and gallery metadata only.

The Worker currently supports public gallery listing and R2 media reads. Upload POST deliberately remains fail-closed even if the feature flag is changed; the authenticated upload implementation must be completed and tested before turning uploads on. Guest entries should have a unique invite code; store only its SHA-256 hash in D1. Do not put the invite-code list in frontend code or Git.

## Before launch

1. Create the R2 bucket and D1 database, then fill in the IDs and bucket name in `wrangler.toml`.
2. Set `FRONTEND_ORIGIN` to the deployed gallery origin and deploy the Worker.
3. Add `VITE_GALLERY_API_URL` to the frontend deployment, pointing at the Worker URL.
4. Create guest invite codes and insert their hashes into D1 through a private provisioning script.
5. Finish and verify the Worker upload flow, including file-size limits, image/video validation, guest authorization, and an administrator-only activation control.
6. Test uploads, gallery display, video playback, downloads, and access restrictions with real phones before the event.
7. Only after successful checks, migrate or retain Firebase data as decided and remove Firebase from the project.

The current Worker accepts no uploads. Its R2 and D1 bindings use placeholders and it is not deployable until Cloudflare resources are created. The app's reads have been switched to the Worker API, so the gallery will show the empty state until that API is deployed and populated.

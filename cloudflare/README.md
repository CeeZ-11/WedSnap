# Cloudflare wedding gallery

The Vite frontend uses a Cloudflare Worker API, D1 for guest invite-code hashes and gallery metadata, and R2 for photos and videos.

## Upload behavior

The upload form and Worker support JPEG, PNG, WebP, GIF, HEIC, MP4, MOV, and WebM files. Each file is limited to 90 MiB (about 94 MB). The Worker checks the guest name and personal invite-code hash in D1 before it stores a file in R2 and adds its metadata to D1.

Uploads are open. The frontend form is visible, while the Worker enforces the guest name, four-character invite code, upload size, and accepted media types. Do not put raw invite codes in frontend code or Git.

The 90 MiB per-file limit keeps each upload below Cloudflare's 100 MB request-body limit on Free and Pro plans. For larger videos, use direct-to-R2 multipart uploads instead of raising this single-request limit.

## Deployment setup

1. Create the R2 bucket and D1 database, then fill their names and IDs into `wrangler.toml`.
2. Set `FRONTEND_ORIGIN` to the exact production origin of the Vite frontend and deploy the Worker.
3. In the Vercel frontend project, set `VITE_GALLERY_API_URL` to the Worker URL. The frontend upload form is enabled in code.
4. Provision each guest name with a unique invite-code SHA-256 hash in D1 using a private process. Never commit raw invite codes.
5. Before opening uploads, verify the gallery API, guest-code validation, file limits, accepted media types, R2 storage, playback, and access restrictions on phones and desktop.
6. To close uploads later, set `UPLOADS_ENABLED = "false"` in `wrangler.toml` and redeploy the Worker. The Worker gate prevents uploads even if the frontend form remains visible.
7. Keep Firebase until you have decided whether to migrate or retain existing gallery uploads and have verified the Cloudflare deployment.

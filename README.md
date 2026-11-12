# WedSnap wedding gallery

React/Vite frontend and a prepared Cloudflare Worker API for a wedding photo and video gallery.

## Local frontend preview

```sh
npm install
npm run dev
```

The upload form is closed by default. The new Worker and storage bindings are configured under `cloudflare/`, but require a Cloudflare account and created R2/D1 resources before deployment. The frontend gallery reads from `VITE_GALLERY_API_URL`; without a deployed API it displays an empty gallery.

## Cloudflare migration and launch checklist

See [`cloudflare/README.md`](cloudflare/README.md). Uploads are disabled by default in both the frontend and Worker. The Worker validates a guest's personal invitation code against a SHA-256 hash in D1, enforces supported media types and a 90 MB per-file maximum, stores media in R2, and stores only metadata in D1. Keep Firebase available until any existing uploads have been migrated and the Cloudflare deployment has been verified.

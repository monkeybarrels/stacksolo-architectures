A simple static website hosted on Google Cloud Storage with global CDN.

## What's Included

- **Cloud Storage** - Hosts the static files
- **Cloud CDN** - Global content delivery for fast load times
- **Load Balancer** - SSL termination and routing

## Use Cases

- Marketing websites
- Documentation sites
- Landing pages
- Portfolios
- Blogs (static site generators)

## Prerequisites

- GCP project with billing enabled
- `gcloud` CLI authenticated
- Node.js 18+ installed

## Getting Started

1. Copy the config to your project
2. Update `YOUR_GCP_PROJECT_ID` with your actual project ID
3. Run `stacksolo scaffold` to generate the website boilerplate
4. Build your static site (Vite, Astro, Hugo, etc.)
5. Run `stacksolo deploy` to deploy

## Supported Frameworks

Any static site generator that outputs to a `dist` or `build` folder:

- **Vite** - `npm run build` outputs to `dist/`
- **Astro** - `npm run build` outputs to `dist/`
- **Next.js (export)** - `next build && next export` outputs to `out/`
- **Hugo** - `hugo` outputs to `public/`

Update the `buildCommand` and `outputDir` in the config to match your framework.

## Custom Domain

After deployment, you can add a custom domain:

1. Verify domain ownership in Google Search Console
2. Create a managed SSL certificate
3. Update the load balancer with your domain

## Cost Optimization

Static sites on GCP are very cost-effective:
- Storage: ~$0.02/GB/month
- CDN egress: ~$0.08/GB (first 10TB)
- Load balancer: ~$18/month (forwarding rules)
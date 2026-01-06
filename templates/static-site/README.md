# Static Site Template

React static site with Vite. Deploys to Cloud Storage with CDN.

## What's Included

- React 18 with TypeScript
- Vite for fast development
- Clean, modern starter design
- Responsive layout
- One-command deployment

## Usage

```bash
# Initialize with this template
stacksolo init --template static-site

# Install dependencies
npm run install:all

# Start local development
npm run dev

# Deploy to GCP
stacksolo deploy
```

## Project Structure

```
your-project/
├── .stacksolo/
│   └── stacksolo.config.json
├── apps/
│   └── web/
│       ├── src/
│       │   ├── App.tsx
│       │   ├── App.css
│       │   └── main.tsx
│       ├── index.html
│       ├── package.json
│       └── vite.config.ts
└── package.json
```

## Customization

### Change Colors

Edit `src/App.css` - the primary gradient is:

```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Add Pages

Install React Router:

```bash
cd apps/web
npm install react-router-dom
```

Then update `App.tsx` with routing.

### Add an API

Use the `api-starter` template or add a function to your config:

```json
{
  "functions": [
    {
      "name": "api",
      "runtime": "nodejs20",
      "entryPoint": "handler"
    }
  ]
}
```

## Deployment

The site deploys to GCP Cloud Storage with a CDN (Cloud Load Balancer):

```bash
stacksolo deploy
```

After deployment, your site will be available at the load balancer IP or your configured domain.
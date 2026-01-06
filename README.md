# StackSolo Architecture Templates

Community-maintained architecture templates for [StackSolo](https://stacksolo.dev).

## What is this?

This repository contains tested, production-ready infrastructure configurations that you can use as starting points for your projects. Each architecture includes:

- A complete `config.json` that works with StackSolo
- Documentation explaining the architecture and use cases
- Customizable variables for your specific needs

## Available Architectures

| Name | Description | Difficulty |
|------|-------------|------------|
| [nextjs-postgres](architectures/nextjs-postgres/) | Full-stack Next.js with PostgreSQL | Beginner |
| [api-with-redis](architectures/api-with-redis/) | High-performance API with Redis cache | Intermediate |
| [static-website](architectures/static-website/) | Static site with CDN | Beginner |

## How to Use

### With AI Assistants (Claude, Cursor)

If you have the StackSolo MCP installed, your AI assistant can:

1. List architectures: "What StackSolo architectures are available?"
2. Get details: "Show me the nextjs-postgres architecture"
3. Customize for you: "Set up a Next.js app with Postgres for my-project"

### Manual Usage

1. Browse the architectures in this repo
2. Copy the `config.json` to your project's `.stacksolo/stacksolo.config.json`
3. Update the variables (project name, GCP project ID, etc.)
4. Run `stacksolo scaffold` then `stacksolo deploy`

## Contributing

We welcome contributions! To add a new architecture:

1. Fork this repository
2. Create a new folder in `architectures/` or `community/`
3. Add `config.json`, `README.md`, and `variables.json`
4. Update `index.json` with your architecture metadata
5. Submit a pull request

### Architecture Structure

```
architectures/your-architecture/
├── config.json       # StackSolo configuration
├── README.md         # Documentation
└── variables.json    # Customizable variables
```

### Guidelines

- Test your configuration before submitting
- Include clear documentation with use cases
- Set appropriate difficulty level
- Tag relevant categories (frontend, backend, database, etc.)

## Community Architectures

Community-contributed architectures are in the `community/` folder and marked with a star in the MCP.

## License

MIT
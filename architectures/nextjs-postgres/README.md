A production-ready Next.js application with PostgreSQL database.

## What's Included

- **Cloud Run** - Hosts the Next.js application with automatic scaling
- **Cloud SQL (PostgreSQL 15)** - Managed PostgreSQL database
- **Load Balancer** - Routes all traffic to the Next.js container

## Use Cases

- Full-stack web applications
- Admin dashboards with database
- E-commerce sites
- Content management systems

## Prerequisites

- GCP project with billing enabled
- `gcloud` CLI authenticated
- Node.js 18+ installed

## Getting Started

1. Copy the config to your project
2. Update `YOUR_GCP_PROJECT_ID` with your actual project ID
3. Run `stacksolo scaffold` to generate the Next.js boilerplate
4. Develop your application locally
5. Run `stacksolo deploy` to deploy

## Database Connection

The `DATABASE_URL` environment variable is automatically set from the Cloud SQL instance connection string. Use your favorite ORM (Prisma, Drizzle, Kysely) to connect.

## Scaling

The default `db-f1-micro` tier is suitable for development and low-traffic production. For higher traffic:

- Upgrade to `db-g1-small` or higher
- Consider read replicas for read-heavy workloads
- Enable Cloud SQL connection pooling
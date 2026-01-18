-- SaaS Starter Initial Migration

CREATE TABLE IF NOT EXISTS "users" (
  "id" varchar(128) PRIMARY KEY NOT NULL,
  "email" varchar(255) NOT NULL,
  "name" varchar(255),
  "avatar_url" varchar(500),
  "stripe_customer_id" varchar(255),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "subscriptions" (
  "id" varchar(255) PRIMARY KEY NOT NULL,
  "user_id" varchar(128) NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "status" varchar(50) NOT NULL,
  "price_id" varchar(255) NOT NULL,
  "product_id" varchar(255),
  "current_period_start" timestamp with time zone NOT NULL,
  "current_period_end" timestamp with time zone NOT NULL,
  "cancel_at_period_end" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone
);

CREATE INDEX IF NOT EXISTS "subscriptions_user_id_idx" ON "subscriptions" ("user_id");
CREATE INDEX IF NOT EXISTS "subscriptions_status_idx" ON "subscriptions" ("status");

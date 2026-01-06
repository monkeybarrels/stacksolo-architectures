-- Initial database schema
-- Generated for firebase-postgres template

CREATE TABLE IF NOT EXISTS "users" (
  "id" varchar(128) PRIMARY KEY NOT NULL,
  "email" varchar(255) NOT NULL,
  "name" varchar(255),
  "bio" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "items" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" varchar(128) NOT NULL,
  "title" varchar(255) NOT NULL,
  "description" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone
);

CREATE INDEX IF NOT EXISTS "items_user_id_idx" ON "items" ("user_id");

ALTER TABLE "items" ADD CONSTRAINT "items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;

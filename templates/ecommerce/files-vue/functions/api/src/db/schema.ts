/**
 * Database Schema
 */

import { pgTable, varchar, integer, timestamp, serial, text, index } from 'drizzle-orm/pg-core';

// Users - synced from Firebase Auth
export const users = pgTable('users', {
  id: varchar('id', { length: 128 }).primaryKey(), // Firebase UID
  email: varchar('email', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at'),
});

// Cart items
export const cartItems = pgTable(
  'cart_items',
  {
    id: serial('id').primaryKey(),
    userId: varchar('user_id', { length: 128 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    priceId: varchar('price_id', { length: 255 }).notNull(),
    productId: varchar('product_id', { length: 255 }).notNull(),
    quantity: integer('quantity').notNull().default(1),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at'),
  },
  (table) => [
    index('cart_items_user_id_idx').on(table.userId),
  ]
);

// Orders
export const orders = pgTable(
  'orders',
  {
    id: varchar('id', { length: 255 }).primaryKey(), // Stripe checkout session ID
    userId: varchar('user_id', { length: 128 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
    status: varchar('status', { length: 50 }).notNull().default('pending'), // pending, completed, failed
    totalAmount: integer('total_amount').notNull(), // in cents
    currency: varchar('currency', { length: 10 }).notNull().default('usd'),
    customerEmail: varchar('customer_email', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    completedAt: timestamp('completed_at'),
  },
  (table) => [
    index('orders_user_id_idx').on(table.userId),
    index('orders_status_idx').on(table.status),
  ]
);

// Order items
export const orderItems = pgTable(
  'order_items',
  {
    id: serial('id').primaryKey(),
    orderId: varchar('order_id', { length: 255 })
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    productId: varchar('product_id', { length: 255 }).notNull(),
    productName: varchar('product_name', { length: 255 }).notNull(),
    productDescription: text('product_description'),
    priceId: varchar('price_id', { length: 255 }).notNull(),
    quantity: integer('quantity').notNull(),
    unitAmount: integer('unit_amount').notNull(), // in cents
    downloadUrl: varchar('download_url', { length: 1000 }), // for digital products
  },
  (table) => [
    index('order_items_order_id_idx').on(table.orderId),
  ]
);

// Types for inserts
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type CartItem = typeof cartItems.$inferSelect;
export type NewCartItem = typeof cartItems.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

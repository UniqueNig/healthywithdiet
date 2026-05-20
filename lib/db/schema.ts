import { relations } from 'drizzle-orm';
import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';

// ----------------------------------------------------------------------
// Auth — tables required by better-auth (do not rename columns).
// Names are singular ("user", "session") to match better-auth's defaults.
// ----------------------------------------------------------------------

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ----------------------------------------------------------------------
// Enums — fixed sets of allowed values (Postgres-native, type-safe)
// ----------------------------------------------------------------------

export const currencyEnum = pgEnum('currency', ['NGN', 'USD']);
export const paymentProviderEnum = pgEnum('payment_provider', ['paystack', 'lemonsqueezy']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'paid', 'failed', 'refunded']);
export const subscriberStatusEnum = pgEnum('subscriber_status', ['active', 'unsubscribed']);

// ----------------------------------------------------------------------
// Shop: product categories (admin-managed)
// ----------------------------------------------------------------------

export const productCategories = pgTable('product_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ----------------------------------------------------------------------
// Blog: categories
// ----------------------------------------------------------------------

export const postCategories = pgTable('post_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ----------------------------------------------------------------------
// Blog: posts
// ----------------------------------------------------------------------

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  excerpt: text('excerpt'),
  content: text('content').notNull(),
  coverImageUrl: text('cover_image_url'),
  categoryId: uuid('category_id').references(() => postCategories.id, {
    onDelete: 'set null',
  }),
  isPublished: boolean('is_published').notNull().default(false),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ----------------------------------------------------------------------
// Shop: products
// ----------------------------------------------------------------------

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  coverImageUrl: text('cover_image_url'),
  fileKey: text('file_key').notNull(),
  categoryId: uuid('category_id').references(() => productCategories.id, {
    onDelete: 'set null',
  }),
  priceNgnKobo: integer('price_ngn_kobo').notNull(),
  priceUsdCents: integer('price_usd_cents').notNull(),
  isPublished: boolean('is_published').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ----------------------------------------------------------------------
// Shop: orders
// ----------------------------------------------------------------------

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerEmail: text('customer_email').notNull(),
  customerName: text('customer_name'),
  currency: currencyEnum('currency').notNull(),
  totalAmount: integer('total_amount').notNull(),
  paymentProvider: paymentProviderEnum('payment_provider').notNull(),
  paymentReference: text('payment_reference').unique(),
  status: orderStatusEnum('status').notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ----------------------------------------------------------------------
// Shop: order items — products inside an order
// ----------------------------------------------------------------------

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id, {
    onDelete: 'cascade',
  }),
  productId: uuid('product_id').notNull().references(() => products.id, {
    onDelete: 'restrict',
  }),
  productTitle: text('product_title').notNull(),
  unitPrice: integer('unit_price').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ----------------------------------------------------------------------
// Shop: download tokens — controls who can download what, when, how often
// ----------------------------------------------------------------------

export const downloadTokens = pgTable('download_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id, {
    onDelete: 'cascade',
  }),
  productId: uuid('product_id').notNull().references(() => products.id, {
    onDelete: 'restrict',
  }),
  token: text('token').notNull().unique(),
  downloadsUsed: integer('downloads_used').notNull().default(0),
  maxDownloads: integer('max_downloads').notNull().default(3),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ----------------------------------------------------------------------
// Newsletter subscribers
// ----------------------------------------------------------------------

export const newsletterSubscribers = pgTable('newsletter_subscribers', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  status: subscriberStatusEnum('status').notNull().default('active'),
  subscribedAt: timestamp('subscribed_at', { withTimezone: true }).notNull().defaultNow(),
  unsubscribedAt: timestamp('unsubscribed_at', { withTimezone: true }),
});

// ----------------------------------------------------------------------
// Admin-configurable settings (key/value store)
// ----------------------------------------------------------------------

export const settings = pgTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ----------------------------------------------------------------------
// Relations — tells Drizzle how tables connect (for type-safe joins)
// ----------------------------------------------------------------------

export const postCategoriesRelations = relations(postCategories, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  category: one(postCategories, {
    fields: [posts.categoryId],
    references: [postCategories.id],
  }),
}));

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
  downloadTokens: many(downloadTokens),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const productCategoriesRelations = relations(productCategories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(productCategories, {
    fields: [products.categoryId],
    references: [productCategories.id],
  }),
  orderItems: many(orderItems),
  downloadTokens: many(downloadTokens),
}));

export const downloadTokensRelations = relations(downloadTokens, ({ one }) => ({
  order: one(orders, {
    fields: [downloadTokens.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [downloadTokens.productId],
    references: [products.id],
  }),
}));

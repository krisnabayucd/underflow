import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
export const snapshots = sqliteTable('snapshots', {id:integer('id').primaryKey({autoIncrement:true}),createdAt:integer('created_at').notNull(),payload:text('payload').notNull()});
export const enrichmentCache = sqliteTable('enrichment_cache', {key:text('key').primaryKey(),updatedAt:integer('updated_at').notNull(),payload:text('payload').notNull()});

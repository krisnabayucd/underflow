import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
export const snapshots = sqliteTable('snapshots', {id:integer('id').primaryKey({autoIncrement:true}),createdAt:integer('created_at').notNull(),payload:text('payload').notNull()});

import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

export const analyses = sqliteTable('analyses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  inputText: text('input_text').notNull(),
  sanitized: text('sanitized').notNull(),
  normalized: text('normalized').notNull(),
  overallRisk: integer('overall_risk').notNull(),
  tokenDriftRatio: real('token_drift_ratio').notNull(),
  rawTokens: text('raw_tokens', { mode: 'json' }).notNull(),
  tokens: text('tokens', { mode: 'json' }).notNull(),
  alerts: text('alerts', { mode: 'json' }).notNull(),
  summary: text('summary', { mode: 'json' }).notNull(),
  matrix: text('matrix', { mode: 'json' }).notNull(),
  removed: text('removed', { mode: 'json' }).notNull(),
  policyMode: text('policy_mode').notNull().default('Observe'),
  commitSha: text('commit_sha'),
  buildTime: text('build_time'),
  batchId: integer('batch_id').references(() => batches.id),
  userId: text('user_id'),
  source: text('source').notNull().default('manual'),
  createdAt: text('created_at').notNull(),
});

export const batches = sqliteTable('batches', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  itemCount: integer('item_count').notNull(),
  alertCount: integer('alert_count').notNull(),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
});

export const logs = sqliteTable('logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  level: text('level').notNull(),
  message: text('message').notNull(),
  meta: text('meta', { mode: 'json' }),
  analysisId: integer('analysis_id').references(() => analyses.id),
  route: text('route'),
  ip: text('ip'),
  userAgent: text('user_agent'),
  createdAt: text('created_at').notNull(),
});

export const rulePacks = sqliteTable('rule_packs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  yaml: text('yaml').notNull(),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  version: text('version').notNull(),
  description: text('description'),
  createdAt: text('created_at').notNull(),
});
import { createInsertSchema } from "drizzle-zod";
import {
  index,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const billingSyncEventsTable = pgTable(
  "billing_sync_events",
  {
    sequence: serial("sequence").primaryKey(),
    workspaceHash: text("workspace_hash").notNull(),
    eventId: text("event_id").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    operation: text("operation").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown> | null>(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    recordedAt: timestamp("recorded_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("billing_sync_workspace_event_unique").on(
      table.workspaceHash,
      table.eventId,
    ),
    index("billing_sync_workspace_sequence_idx").on(
      table.workspaceHash,
      table.sequence,
    ),
  ],
);

export const insertBillingSyncEventSchema = createInsertSchema(
  billingSyncEventsTable,
).omit({
  sequence: true,
  recordedAt: true,
});

export type InsertBillingSyncEvent = z.infer<
  typeof insertBillingSyncEventSchema
>;
export type BillingSyncEvent = typeof billingSyncEventsTable.$inferSelect;

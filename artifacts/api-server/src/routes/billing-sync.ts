import { createHash } from "node:crypto";
import { Router, type IRouter } from "express";
import { and, asc, desc, eq, gt } from "drizzle-orm";
import {
  billingSyncEventsTable,
  db,
} from "@workspace/db";
import {
  ListSyncEventsQueryParams,
  ListSyncEventsResponse,
  PushSyncEventsBody,
  PushSyncEventsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function hashWorkspaceKey(workspaceKey: string): string {
  return createHash("sha256").update(workspaceKey).digest("hex");
}

router.get("/billing/sync/events", async (req, res): Promise<void> => {
  const parsed = ListSyncEventsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid sync query");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { workspaceKey, after, limit } = parsed.data;
  const rows = await db
    .select()
    .from(billingSyncEventsTable)
    .where(
      and(
        eq(
          billingSyncEventsTable.workspaceHash,
          hashWorkspaceKey(workspaceKey),
        ),
        gt(billingSyncEventsTable.sequence, after),
      ),
    )
    .orderBy(asc(billingSyncEventsTable.sequence))
    .limit(limit);
  const events = rows.map((event) => ({
      eventId: event.eventId,
      entityType: event.entityType,
      entityId: event.entityId,
      operation: event.operation,
      payload: event.payload,
      occurredAt: event.occurredAt.toISOString(),
      sequence: event.sequence,
    }));
  const nextCursor =
    events.length > 0 ? events[events.length - 1]!.sequence : after;

  res.json(ListSyncEventsResponse.parse({ events, nextCursor }));
});

router.post("/billing/sync/events", async (req, res): Promise<void> => {
  const parsed = PushSyncEventsBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid sync batch");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { workspaceKey, events } = parsed.data;
  if (
    events.some(
      (event) =>
        (event.operation === "upsert" && event.payload === null) ||
        (event.operation === "delete" && event.payload !== null),
    )
  ) {
    res.status(400).json({
      error: "Upsert events require a payload; delete events require null.",
    });
    return;
  }

  const workspaceHash = hashWorkspaceKey(workspaceKey);
  const uniqueEvents = [
    ...new Map(events.map((event) => [event.eventId, event])).values(),
  ];

  const result = await db.transaction(async (transaction) => {
    const inserted =
      uniqueEvents.length > 0
        ? await transaction
            .insert(billingSyncEventsTable)
            .values(
              uniqueEvents.map((event) => ({
                workspaceHash,
                eventId: event.eventId,
                entityType: event.entityType,
                entityId: event.entityId,
                operation: event.operation,
                payload: event.payload,
                occurredAt: event.occurredAt,
              })),
            )
            .onConflictDoNothing({
              target: [
                billingSyncEventsTable.workspaceHash,
                billingSyncEventsTable.eventId,
              ],
            })
            .returning({ sequence: billingSyncEventsTable.sequence })
        : [];
    const [latest] = await transaction
      .select({ sequence: billingSyncEventsTable.sequence })
      .from(billingSyncEventsTable)
      .where(eq(billingSyncEventsTable.workspaceHash, workspaceHash))
      .orderBy(desc(billingSyncEventsTable.sequence))
      .limit(1);

    return {
      accepted: inserted.length,
      latestSequence: latest?.sequence ?? 0,
    };
  });

  res.json(PushSyncEventsResponse.parse(result));
});

export default router;

function toJson(record: any) {
  return record ? JSON.parse(JSON.stringify(record)) : null;
}

interface AuditLogParams{
  timeEntryId: string;
  action: string;
  changedBy: string;
  before: any;
  after: any,
}

export async function logAudit(tx:any, { timeEntryId, action, changedBy, before, after }:AuditLogParams):Promise<void> {
  await tx.auditLog.create({
    data: {
      timeEntryId,
      action,
      changedBy,
      before: toJson(before),
      after: toJson(after),
    },
  });
}

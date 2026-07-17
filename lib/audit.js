function toJson(record) {
  return record ? JSON.parse(JSON.stringify(record)) : null;
}

export async function logAudit(tx, { timeEntryId, action, changedBy, before, after }) {
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

export const Events = {
  CASE_CREATED: 'crm.case.created',
  APPOINTMENT_PROPOSED: 'schedule.proposed',
  INVOICE_CREATED: 'invoice.created'
};

export const Envelope = (tenantId, type, payload) => ({
  tenantId, type, occurredAt: new Date().toISOString(), payload, schemaVersion: 1
});

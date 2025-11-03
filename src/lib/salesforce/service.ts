import { getValidToken } from './auth';

const SF_BASE = process.env.SALESFORCE_INSTANCE_URL;

function ensureConfigured() {
  if (!SF_BASE) {
    throw new Error('Salesforce base URL (SALESFORCE_INSTANCE_URL) is not configured');
  }
}

export async function fetchOrdersByEmail(email: string) {
  ensureConfigured();
  const access = await getValidToken();
  const url = `${SF_BASE}/services/apexrest/terceros/ordenes?email=${encodeURIComponent(email)}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${access}`, 'Content-Type': 'application/json' },
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`Salesforce error ${res.status}: ${text}`);

  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error('Invalid JSON from Salesforce: ' + String(e));
  }
}

export async function fetchOrdersBySalesforceId(salesforceId: string) {
  ensureConfigured();
  const access = await getValidToken();
  const url = `${SF_BASE}/services/apexrest/terceros/ordenes?salesforce_id=${encodeURIComponent(salesforceId)}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${access}`, 'Content-Type': 'application/json' },
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`Salesforce error ${res.status}: ${text}`);

  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error('Invalid JSON from Salesforce: ' + String(e));
  }
}

export async function fetchAccountById(salesforceId: string) {
  ensureConfigured();
  const access = await getValidToken();
  const url = `${SF_BASE}/services/apexrest/terceros/account?id=${encodeURIComponent(salesforceId)}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${access}`, 'Content-Type': 'application/json' },
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`Salesforce error ${res.status}: ${text}`);

  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error('Invalid JSON from Salesforce: ' + String(e));
  }
}

const salesforceService = {
  fetchOrdersByEmail,
  fetchOrdersBySalesforceId,
  fetchAccountById,
};

export default salesforceService;

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'btl-enquiries-cache';

async function readAll() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function writeAll(records) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function toEnquiry(record) {
  return {
    clientUuid: record.clientUuid,
    serverId: record.serverId,
    synced: record.synced,
    createdAt: record.createdAt,
    payload: record.payload,
    // Prefer the latest server state (has CRE/SM/ASM tags); fall back to
    // the locally captured payload while still unsynced.
    ...(record.lastKnown || record.payload),
    stage: record.lastKnown ? record.lastKnown.stage : 'CREATED',
  };
}

export async function saveLocalEnquiry(payload) {
  const records = await readAll();
  records.push({
    clientUuid: payload.clientUuid,
    serverId: null,
    payload,
    synced: false,
    lastKnown: null,
    createdAt: new Date().toISOString(),
  });
  await writeAll(records);
}

export async function markSynced(clientUuid, serverEnquiry) {
  const records = await readAll();
  const record = records.find((r) => r.clientUuid === clientUuid);
  if (record) {
    record.synced = true;
    record.serverId = serverEnquiry.id;
    record.lastKnown = serverEnquiry;
  }
  await writeAll(records);
}

export async function upsertFromServer(serverEnquiry) {
  const records = await readAll();
  const existing = records.find((r) => r.clientUuid === serverEnquiry.clientUuid);
  if (existing) {
    existing.synced = true;
    existing.serverId = serverEnquiry.id;
    existing.lastKnown = serverEnquiry;
  } else {
    records.push({
      clientUuid: serverEnquiry.clientUuid || `server-${serverEnquiry.id}`,
      serverId: serverEnquiry.id,
      payload: serverEnquiry,
      synced: true,
      lastKnown: serverEnquiry,
      createdAt: serverEnquiry.createdAt,
    });
  }
  await writeAll(records);
}

export async function getLocalEnquiries() {
  const records = await readAll();
  return records
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(toEnquiry);
}

export async function getUnsyncedEnquiries() {
  const records = await readAll();
  return records
    .filter((r) => !r.synced)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map(toEnquiry);
}

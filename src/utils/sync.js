import client from '../api/client';
import { getUnsyncedEnquiries, markSynced } from '../db/localDb';

let syncing = false;

// Pushes every locally-queued enquiry to the server. Safe to call repeatedly
// (e.g. on reconnect, on screen focus, on pull-to-refresh) - it no-ops if a
// sync is already running and skips enquiries that are already synced.
export async function syncPendingEnquiries() {
  if (syncing) return { synced: 0, failed: 0 };
  syncing = true;
  let synced = 0;
  let failed = 0;

  try {
    const pending = await getUnsyncedEnquiries();
    for (const enquiry of pending) {
      try {
        const { data } = await client.post('/enquiries', enquiry.payload);
        await markSynced(enquiry.clientUuid, data);
        synced += 1;
      } catch (err) {
        failed += 1;
        // Keep going so one bad record doesn't block the rest of the queue.
        console.warn('Sync failed for enquiry', enquiry.clientUuid, err.message);
      }
    }
  } finally {
    syncing = false;
  }

  return { synced, failed };
}

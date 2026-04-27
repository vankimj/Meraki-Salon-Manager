import { doc, getDoc, setDoc, collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from './firebase';
import { TENANT_ID } from './tenant';

// One-time migration: salon/{slides,users,settings} → tenants/meraki/{slides,users,settings}
// Safe to call on every boot — skips silently if already migrated or nothing to migrate.
export async function migrateFromLegacy() {
  try {
    const [oldSlides, oldUsers, oldSettings, newSlides] = await Promise.all([
      getDoc(doc(db, 'salon', 'slides')),
      getDoc(doc(db, 'salon', 'users')),
      getDoc(doc(db, 'salon', 'settings')),
      getDoc(doc(db, 'tenants', TENANT_ID, 'data', 'slides')),
    ]);

    // If new path already has slides, migration already ran — bail out.
    if (newSlides.exists()) return;

    let migrated = false;

    if (oldSlides.exists()) {
      await setDoc(doc(db, 'tenants', TENANT_ID, 'data', 'slides'), oldSlides.data());
      migrated = true;
    }
    if (oldUsers.exists()) {
      await setDoc(doc(db, 'tenants', TENANT_ID, 'data', 'users'), oldUsers.data());
      migrated = true;
    }
    if (oldSettings.exists()) {
      await setDoc(doc(db, 'tenants', TENANT_ID, 'data', 'settings'), oldSettings.data());
      migrated = true;
    }

    // Migrate top-level logs collection → tenants/meraki/logs
    const oldLogs = await getDocs(collection(db, 'logs'));
    if (!oldLogs.empty) {
      const logsCol = collection(db, 'tenants', TENANT_ID, 'logs');
      await Promise.all(oldLogs.docs.map(d => addDoc(logsCol, d.data())));
      migrated = true;
    }

    if (migrated) {
      console.info('[migration] Legacy salon/ data migrated to tenants/' + TENANT_ID + '/');
    }
  } catch (e) {
    // Non-fatal — app continues even if migration fails
    console.warn('[migration] Could not migrate legacy data:', e.message);
  }
}

const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { initializeApp }    = require('firebase-admin/app');
const { getFirestore }     = require('firebase-admin/firestore');
const { defineString }     = require('firebase-functions/params');
const twilio               = require('twilio');

initializeApp();

const TENANT_ID = 'meraki';

// Set via: firebase functions:config:set isn't used in v2 — use .env or Secret Manager.
// For local dev: create functions/.env with these vars.
// For production: firebase functions:secrets:set TWILIO_ACCOUNT_SID etc.
const twilioSid    = defineString('TWILIO_ACCOUNT_SID',    { default: '' });
const twilioToken  = defineString('TWILIO_AUTH_TOKEN',     { default: '' });
const twilioFrom   = defineString('TWILIO_FROM_NUMBER',    { default: '' });

exports.sendApptNotification = onDocumentCreated(
  `tenants/${TENANT_ID}/notifications/{notifId}`,
  async (event) => {
    const db   = getFirestore();
    const snap = event.data;
    if (!snap) return;

    const data = snap.data();
    if (!data || data.sent || data.error) return;

    const ref = snap.ref;

    try {
      // Look up tech phone number from employees
      const empSnap = await db
        .collection(`tenants/${TENANT_ID}/employees`)
        .where('name', '==', data.techName)
        .limit(1)
        .get();

      if (empSnap.empty) {
        await ref.update({ error: 'employee_not_found' });
        return;
      }

      const phone = (empSnap.docs[0].data().phone || '').replace(/\D/g, '');
      if (!phone || phone.length < 10) {
        await ref.update({ error: 'no_phone' });
        return;
      }

      const sid   = twilioSid.value();
      const token = twilioToken.value();
      const from  = twilioFrom.value();

      if (!sid || !token || !from) {
        console.warn('[Notif] Twilio not configured — skipping SMS for', data.techName);
        await ref.update({ error: 'twilio_not_configured' });
        return;
      }

      const to = phone.length === 10 ? `+1${phone}` : `+${phone}`;
      await twilio(sid, token).messages.create({ body: data.message, from, to });
      await ref.update({ sent: true, sentAt: new Date().toISOString() });

      console.log(`[Notif] SMS sent to ${data.techName} (${to})`);
    } catch (e) {
      console.error('[Notif] SMS failed:', e.message);
      await ref.update({ error: e.message });
    }
  }
);

import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { createClient, createAppointment, createReceipt, fetchClients } from '../lib/firestore';
import { logActivity } from '../lib/logger';
import {
  parseCsv, detectType,
  mapClientRow, mapAppointmentRow, mapSaleRow,
} from '../lib/csvImport';

const TYPE_LABELS = {
  clients:      'Clients',
  appointments: 'Appointments',
  sales:        'Sales / Receipts',
  unknown:      'Unknown',
};

export default function CsvImportSection() {
  const { showToast } = useApp();
  const fileRef = useRef(null);
  const [parsed,   setParsed]   = useState(null);   // { type, headers, records, mapped }
  const [running,  setRunning]  = useState(false);
  const [progress, setProgress] = useState('');

  function reset() {
    setParsed(null); setProgress('');
    if (fileRef.current) fileRef.current.value = '';
  }

  async function onFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setProgress('Reading file…');
    try {
      const text = await f.text();
      const { headers, records } = parseCsv(text);
      const type = detectType(headers);
      let mapped = [];
      if (type === 'clients')      mapped = records.map(r => mapClientRow(r)).filter(Boolean);
      if (type === 'appointments') mapped = records.map(r => mapAppointmentRow(r, null)).filter(Boolean);
      if (type === 'sales')        mapped = records.map(r => mapSaleRow(r)).filter(Boolean);
      setParsed({ type, headers, records, mapped, fileName: f.name });
      setProgress('');
    } catch (e) {
      console.error('[CSV] parse failed:', e);
      showToast('Could not parse CSV: ' + e.message, 4000);
      setProgress('');
    }
  }

  async function runImport() {
    if (!parsed) return;
    if (parsed.type === 'unknown') {
      showToast('Could not auto-detect this CSV type. Headers: ' + parsed.headers.slice(0, 5).join(', '), 5000);
      return;
    }
    if (!window.confirm(`Import ${parsed.mapped.length} ${TYPE_LABELS[parsed.type].toLowerCase()} records from ${parsed.fileName}?\n\nRecords will be tagged as imported from GlossGenius. Existing data is not modified.`)) return;

    setRunning(true);
    let count = 0;
    try {
      if (parsed.type === 'clients') {
        for (const c of parsed.mapped) {
          await createClient(c).catch(() => {});
          count++;
          if (count % 20 === 0) setProgress(`Clients: ${count} / ${parsed.mapped.length}`);
        }
      } else if (parsed.type === 'appointments') {
        // Build a quick name → clientId lookup so imported appts link to existing clients.
        setProgress('Loading client lookup…');
        const allClients = await fetchClients().catch(() => []);
        const lookup = {};
        allClients.forEach(c => { if (c.name) lookup[c.name.toLowerCase()] = c.id; });
        for (const rec of parsed.records) {
          const a = mapAppointmentRow(rec, lookup);
          if (!a) continue;
          await createAppointment(a).catch(() => {});
          count++;
          if (count % 20 === 0) setProgress(`Appointments: ${count} / ${parsed.mapped.length}`);
        }
      } else if (parsed.type === 'sales') {
        for (const r of parsed.mapped) {
          await createReceipt(r).catch(() => {});
          count++;
          if (count % 20 === 0) setProgress(`Sales: ${count} / ${parsed.mapped.length}`);
        }
      }
      logActivity('gg_import', `${parsed.type}: ${count} records from ${parsed.fileName}`);
      setProgress(`✓ Imported ${count} ${TYPE_LABELS[parsed.type].toLowerCase()} records.`);
      showToast(`Imported ${count} records`, 3500);
      setParsed(null);
      if (fileRef.current) fileRef.current.value = '';
    } catch (e) {
      console.error('[CSV] import failed:', e);
      showToast('Import failed: ' + e.message, 4000);
      setProgress(`Error after ${count} records: ${e.message}`);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid #f0f0f0', background: '#fafafa', fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>
        📥 Import from GlossGenius
      </div>
      <div style={{ padding: '14px 16px' }}>
        <div style={{ fontSize: 12, color: '#666', lineHeight: 1.55, marginBottom: 12 }}>
          Upload CSVs you exported from GlossGenius (<strong>Insights → Reports</strong>). The importer auto-detects whether the file is clients, appointments, or sales — then maps the columns and shows a preview before writing anything.
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            onChange={onFile}
            disabled={running}
            style={{ fontSize: 12, fontFamily: 'inherit' }}
          />
          {parsed && (
            <button onClick={reset} disabled={running}
              style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: '1px solid #d8d8d8', background: '#fafafa', color: '#888', cursor: 'pointer', fontFamily: 'inherit' }}>
              Clear
            </button>
          )}
        </div>

        {parsed && (
          <div style={{ background: '#fafafa', border: '1px solid #ececec', borderRadius: 10, padding: 12, marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>
                {parsed.fileName}
              </span>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 12, background: parsed.type === 'unknown' ? '#fef2f2' : '#EBF4FB', color: parsed.type === 'unknown' ? '#ef4444' : '#1a5f8a' }}>
                Detected: {TYPE_LABELS[parsed.type]}
              </span>
            </div>
            <div style={{ fontSize: 11, color: '#666', marginBottom: 8 }}>
              {parsed.records.length} rows · {parsed.mapped.length} mappable · columns: <span style={{ color: '#999' }}>{parsed.headers.slice(0, 8).join(', ')}{parsed.headers.length > 8 ? `, +${parsed.headers.length - 8} more` : ''}</span>
            </div>

            {parsed.mapped.length > 0 && (
              <div style={{ background: '#fff', border: '1px solid #ececec', borderRadius: 6, overflow: 'hidden', maxHeight: 220, overflowY: 'auto' }}>
                <PreviewTable type={parsed.type} rows={parsed.mapped.slice(0, 8)} />
                {parsed.mapped.length > 8 && (
                  <div style={{ padding: '6px 10px', fontSize: 10, color: '#aaa', borderTop: '1px solid #f0f0f0', background: '#fafafa' }}>
                    + {parsed.mapped.length - 8} more rows…
                  </div>
                )}
              </div>
            )}
            {parsed.mapped.length === 0 && (
              <div style={{ padding: 12, fontSize: 11, color: '#ef4444', textAlign: 'center', background: '#fef2f2', borderRadius: 6 }}>
                No mappable rows. Check that the CSV has the expected columns for {TYPE_LABELS[parsed.type]}.
              </div>
            )}
          </div>
        )}

        {progress && (
          <div style={{ fontSize: 12, color: '#666', fontStyle: 'italic', marginBottom: 10 }}>{progress}</div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={runImport}
            disabled={!parsed || parsed.type === 'unknown' || parsed.mapped.length === 0 || running}
            style={{ padding: '8px 16px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 700, cursor: (parsed && parsed.type !== 'unknown' && !running) ? 'pointer' : 'default', background: (parsed && parsed.type !== 'unknown' && !running) ? '#2D7A5F' : '#d0d0d0', color: '#fff', fontFamily: 'inherit' }}>
            {running ? 'Importing…' : `Import ${parsed?.mapped?.length || 0} records`}
          </button>
        </div>

        <div style={{ marginTop: 12, padding: 10, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, fontSize: 11, color: '#78350f', lineHeight: 1.5 }}>
          <strong>How to export from GlossGenius:</strong> Open GlossGenius → <strong>Insights → Reports</strong> → pick <strong>Appointments</strong> / <strong>Clients</strong> / <strong>Sales</strong> → choose the date range → <strong>Download Report</strong>. Upload one CSV at a time here. Records are tagged <code style={{ background: '#fef3c7', padding: '0 4px', borderRadius: 3 }}>_importedFrom: glossgenius</code> so you can filter or roll back later.
        </div>
      </div>
    </div>
  );
}

function PreviewTable({ type, rows }) {
  if (!rows.length) return null;
  if (type === 'clients') {
    return (
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
        <thead><tr style={{ background: '#fafafa' }}>
          <Th>Name</Th><Th>Email</Th><Th>Phone</Th><Th>Birthday</Th>
        </tr></thead>
        <tbody>{rows.map((r, i) => (
          <tr key={i} style={{ borderTop: '1px solid #f5f5f5' }}>
            <Td>{r.name}</Td><Td>{r.email || '—'}</Td><Td>{r.phone || '—'}</Td><Td>{r.birthday || '—'}</Td>
          </tr>
        ))}</tbody>
      </table>
    );
  }
  if (type === 'appointments') {
    return (
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
        <thead><tr style={{ background: '#fafafa' }}>
          <Th>Date</Th><Th>Time</Th><Th>Client</Th><Th>Tech</Th><Th>Service</Th><Th>$</Th>
        </tr></thead>
        <tbody>{rows.map((r, i) => (
          <tr key={i} style={{ borderTop: '1px solid #f5f5f5' }}>
            <Td>{r.date}</Td><Td>{r.startTime}</Td><Td>{r.clientName}</Td>
            <Td>{r.techName}</Td><Td>{r.services?.[0]?.name || '—'}</Td>
            <Td>${(r.services?.[0]?.price || 0).toFixed(2)}</Td>
          </tr>
        ))}</tbody>
      </table>
    );
  }
  if (type === 'sales') {
    return (
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
        <thead><tr style={{ background: '#fafafa' }}>
          <Th>Date</Th><Th>Client</Th><Th>Method</Th><Th>Tip</Th><Th>Tax</Th><Th>Total</Th>
        </tr></thead>
        <tbody>{rows.map((r, i) => {
          const p = r.payment || {};
          return (
            <tr key={i} style={{ borderTop: '1px solid #f5f5f5' }}>
              <Td>{r.date}</Td><Td>{r.clientName}</Td><Td>{p.method}</Td>
              <Td>${(p.tip || 0).toFixed(2)}</Td><Td>${(p.tax || 0).toFixed(2)}</Td>
              <Td>${(p.total || 0).toFixed(2)}</Td>
            </tr>
          );
        })}</tbody>
      </table>
    );
  }
  return null;
}

function Th({ children }) {
  return <th style={{ padding: '6px 8px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '.04em' }}>{children}</th>;
}
function Td({ children }) {
  return <td style={{ padding: '5px 8px', fontSize: 11, color: '#333' }}>{children}</td>;
}

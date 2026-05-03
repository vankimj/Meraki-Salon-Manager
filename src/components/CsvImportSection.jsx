import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { createClient, createAppointment, createReceipt, fetchClients } from '../lib/firestore';
import { logActivity } from '../lib/logger';
import {
  parseCsv, detectType,
  mapClientRow, mapAppointmentRow, mapSaleRow,
  buildReceiptsFromGg,
} from '../lib/csvImport';

const TYPE_LABELS = {
  clients:      'Clients',
  appointments: 'Appointments',
  sales:        'Sales / Receipts',
  ggPayments:   'GG Payment Details (1 of 2)',
  ggLineItems:  'GG Checkout Line Items (1 of 2)',
  unknown:      'Unknown',
};

export default function CsvImportSection() {
  const { showToast } = useApp();
  const fileRef = useRef(null);
  const [parsed,   setParsed]   = useState(null);   // primary file
  const [pair,     setPair]     = useState(null);   // companion (when two-file)
  const [running,  setRunning]  = useState(false);
  const [progress, setProgress] = useState('');

  function reset() {
    setParsed(null); setPair(null); setProgress('');
    if (fileRef.current) fileRef.current.value = '';
  }

  async function readAndParse(f) {
    const text = await f.text();
    const { headers, records } = parseCsv(text);
    return { headers, records, fileName: f.name, type: detectType(headers) };
  }

  async function onFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setProgress('Reading file…');
    try {
      const result = await readAndParse(f);
      // If parsed already has a primary GG file and this one is the companion → set as pair
      if (parsed && (parsed.type === 'ggPayments' || parsed.type === 'ggLineItems')) {
        const want = parsed.type === 'ggPayments' ? 'ggLineItems' : 'ggPayments';
        if (result.type === want) {
          setPair(result);
          setProgress('');
          if (fileRef.current) fileRef.current.value = '';
          return;
        }
      }
      // Otherwise treat as primary
      let mapped = [];
      if (result.type === 'clients')      mapped = result.records.map(r => mapClientRow(r)).filter(Boolean);
      if (result.type === 'appointments') mapped = result.records.map(r => mapAppointmentRow(r, null)).filter(Boolean);
      if (result.type === 'sales')        mapped = result.records.map(r => mapSaleRow(r)).filter(Boolean);
      setParsed({ ...result, mapped });
      setPair(null);
      setProgress('');
    } catch (e) {
      console.error('[CSV] parse failed:', e);
      showToast('Could not parse CSV: ' + e.message, 4000);
      setProgress('');
    }
  }

  // Joined preview when both GG files are loaded
  const joinedReceipts = (() => {
    if (!parsed || !pair) return null;
    const payments  = parsed.type === 'ggPayments'  ? parsed.records : pair.records;
    const lineItems = parsed.type === 'ggLineItems' ? parsed.records : pair.records;
    return buildReceiptsFromGg(payments, lineItems);
  })();

  async function runImport() {
    if (!parsed) return;

    // Two-file GG path
    if (joinedReceipts) {
      if (!window.confirm(`Import ${joinedReceipts.length} receipts joined from ${parsed.fileName} + ${pair.fileName}?\n\nReceipts include services, products, tip, tax, payment method, and processing fee. Tagged as imported from GlossGenius.`)) return;
      setRunning(true);
      let count = 0;
      try {
        for (const r of joinedReceipts) {
          await createReceipt(r).catch(() => {});
          count++;
          if (count % 20 === 0) setProgress(`Receipts: ${count} / ${joinedReceipts.length}`);
        }
        logActivity('gg_import', `joined sales: ${count} receipts`);
        setProgress(`✓ Imported ${count} receipts.`);
        showToast(`Imported ${count} GG receipts`, 3500);
        reset();
      } catch (e) {
        showToast('Import failed: ' + e.message, 4000);
        setProgress(`Error after ${count} records: ${e.message}`);
      } finally { setRunning(false); }
      return;
    }

    if (parsed.type === 'unknown' || parsed.type === 'ggPayments' || parsed.type === 'ggLineItems') {
      showToast('Need both Payment Details + Checkout Line Items files to import GG sales.', 4000);
      return;
    }

    if (!window.confirm(`Import ${parsed.mapped.length} ${TYPE_LABELS[parsed.type].toLowerCase()} records from ${parsed.fileName}?\n\nRecords will be tagged as imported from GlossGenius.`)) return;

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
      setProgress(`✓ Imported ${count} records.`);
      showToast(`Imported ${count} records`, 3500);
      reset();
    } catch (e) {
      console.error('[CSV] import failed:', e);
      showToast('Import failed: ' + e.message, 4000);
      setProgress(`Error after ${count} records: ${e.message}`);
    } finally {
      setRunning(false);
    }
  }

  const needsCompanion = parsed && !pair && (parsed.type === 'ggPayments' || parsed.type === 'ggLineItems');
  const companionLabel = parsed?.type === 'ggPayments' ? 'Checkout Line Items CSV' : 'Payment Details CSV';

  return (
    <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid #f0f0f0', background: '#fafafa', fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>
        📥 Import from GlossGenius
      </div>
      <div style={{ padding: '14px 16px' }}>
        <div style={{ fontSize: 12, color: '#666', lineHeight: 1.55, marginBottom: 12 }}>
          Upload CSVs from <strong>GlossGenius → Insights → Reports</strong>. The importer auto-detects what's in the file. For sales: upload <strong>Payment Details</strong> AND <strong>Checkout Line Items</strong> — they get joined on Charge ID for full receipts.
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
            <FileSummary file={parsed} />
            {pair && <FileSummary file={pair} compact />}

            {needsCompanion && (
              <div style={{ marginTop: 10, padding: 10, background: '#EBF4FB', border: '1px dashed #bfdbfe', borderRadius: 8, fontSize: 12, color: '#1a5f8a' }}>
                ✓ Loaded the {parsed.type === 'ggPayments' ? 'Payment Details' : 'Checkout Line Items'} file. Now upload the <strong>{companionLabel}</strong> using the file picker above.
              </div>
            )}

            {joinedReceipts && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#2D7A5F', marginBottom: 6, letterSpacing: '.04em' }}>
                  ✓ Joined {joinedReceipts.length} receipts (preview):
                </div>
                <div style={{ background: '#fff', border: '1px solid #ececec', borderRadius: 6, overflow: 'hidden', maxHeight: 240, overflowY: 'auto' }}>
                  <PreviewTable type="sales" rows={joinedReceipts.slice(0, 8)} />
                  {joinedReceipts.length > 8 && (
                    <div style={{ padding: '6px 10px', fontSize: 10, color: '#aaa', borderTop: '1px solid #f0f0f0', background: '#fafafa' }}>
                      + {joinedReceipts.length - 8} more rows…
                    </div>
                  )}
                </div>
              </div>
            )}

            {parsed && !needsCompanion && !joinedReceipts && parsed.mapped && parsed.mapped.length > 0 && (
              <div style={{ marginTop: 10, background: '#fff', border: '1px solid #ececec', borderRadius: 6, overflow: 'hidden', maxHeight: 220, overflowY: 'auto' }}>
                <PreviewTable type={parsed.type} rows={parsed.mapped.slice(0, 8)} />
                {parsed.mapped.length > 8 && (
                  <div style={{ padding: '6px 10px', fontSize: 10, color: '#aaa', borderTop: '1px solid #f0f0f0', background: '#fafafa' }}>
                    + {parsed.mapped.length - 8} more rows…
                  </div>
                )}
              </div>
            )}
            {parsed && !needsCompanion && !joinedReceipts && parsed.mapped && parsed.mapped.length === 0 && (
              <div style={{ marginTop: 10, padding: 12, fontSize: 11, color: '#ef4444', textAlign: 'center', background: '#fef2f2', borderRadius: 6 }}>
                No mappable rows. Check that the CSV has the expected columns.
              </div>
            )}
          </div>
        )}

        {progress && (
          <div style={{ fontSize: 12, color: '#666', fontStyle: 'italic', marginBottom: 10 }}>{progress}</div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={runImport}
            disabled={running || !parsed || (parsed.type === 'unknown') ||
                      (needsCompanion) ||
                      (!joinedReceipts && parsed.mapped?.length === 0)}
            style={{ padding: '8px 16px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 700, cursor: !running && parsed && !needsCompanion ? 'pointer' : 'default', background: !running && parsed && !needsCompanion ? '#2D7A5F' : '#d0d0d0', color: '#fff', fontFamily: 'inherit' }}>
            {running ? 'Importing…'
              : joinedReceipts ? `Import ${joinedReceipts.length} joined receipts`
              : needsCompanion ? 'Waiting for companion file…'
              : `Import ${parsed?.mapped?.length || 0} records`}
          </button>
        </div>

        <div style={{ marginTop: 12, padding: 10, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, fontSize: 11, color: '#78350f', lineHeight: 1.5 }}>
          <strong>How to export from GlossGenius:</strong> Open GlossGenius → <strong>Insights → Reports</strong> → pick <strong>Payment Details</strong> + <strong>Checkout Line Items</strong> (for sales — both required) or <strong>Clients</strong> / <strong>Appointments</strong> (single file each) → choose date range → <strong>Download Report</strong>. Records tagged <code style={{ background: '#fef3c7', padding: '0 4px', borderRadius: 3 }}>_importedFrom: glossgenius</code>.
        </div>
      </div>
    </div>
  );
}

function FileSummary({ file, compact }) {
  return (
    <div style={{ marginBottom: compact ? 4 : 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>{file.fileName}</span>
        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 12, background: file.type === 'unknown' ? '#fef2f2' : '#EBF4FB', color: file.type === 'unknown' ? '#ef4444' : '#1a5f8a' }}>
          {TYPE_LABELS[file.type]}
        </span>
      </div>
      <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
        {file.records.length} rows · columns: <span style={{ color: '#999' }}>{file.headers.slice(0, 6).join(', ')}{file.headers.length > 6 ? `, +${file.headers.length - 6} more` : ''}</span>
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
          <Th>Date</Th><Th>Client</Th><Th>Tech</Th><Th>Items</Th><Th>Method</Th><Th>Tip</Th><Th>Tax</Th><Th>Fee</Th><Th>Total</Th>
        </tr></thead>
        <tbody>{rows.map((r, i) => {
          const p = r.payment || {};
          const itemNames = (r.services || []).map(s => s.name).concat((r.retailProducts || []).map(p => p.name)).join(', ');
          return (
            <tr key={i} style={{ borderTop: '1px solid #f5f5f5' }}>
              <Td>{r.date}</Td>
              <Td>{r.clientName}</Td>
              <Td>{r.techName || '—'}</Td>
              <Td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={itemNames}>{itemNames || '—'}</Td>
              <Td>{p.method}</Td>
              <Td>${(p.tip || 0).toFixed(2)}</Td>
              <Td>${(p.tax || 0).toFixed(2)}</Td>
              <Td>${(p.ccFee || 0).toFixed(2)}</Td>
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
function Td({ children, style, ...rest }) {
  return <td style={{ padding: '5px 8px', fontSize: 11, color: '#333', ...style }} {...rest}>{children}</td>;
}

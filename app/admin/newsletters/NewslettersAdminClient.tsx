'use client';

import { useState, useRef, useTransition } from 'react';
import { getUploadUrls, createNewsletter, deleteNewsletter } from './actions';

interface Newsletter {
  id: string;
  title: string;
  issue_date: string;
  issue_label: string;
  pdf_storage_path: string;
  pdf_public_url: string;
  thumbnail_storage_path: string;
  thumbnail_public_url: string;
  thumbnail_source: 'auto' | 'custom';
  sort_order: number;
}

const inp: React.CSSProperties = {
  height: '38px', padding: '0 10px',
  border: '1.5px solid rgba(45,90,61,.2)',
  fontFamily: "'DM Sans', sans-serif", fontSize: '13px',
  color: 'var(--green-deep)', background: '#fff',
  width: '100%', boxSizing: 'border-box',
};
const lbl: React.CSSProperties = {
  display: 'block', fontFamily: "'DM Sans', sans-serif",
  fontSize: '10px', fontWeight: 600, letterSpacing: '.1em',
  textTransform: 'uppercase', color: 'var(--green-mid)', marginBottom: '5px',
};
const btnSave: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  padding: '0 20px', height: '36px',
  background: 'var(--green-mid)', color: '#fff', border: 'none',
  fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 700,
  letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer',
};
const btnCancel: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  padding: '0 14px', height: '36px',
  background: '#fff', color: '#666', border: '1.5px solid rgba(0,0,0,.15)',
  fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 600,
  letterSpacing: '.07em', textTransform: 'uppercase', cursor: 'pointer',
};
const btnDel: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  padding: '0 10px', height: '28px',
  background: '#c00', color: '#fff', border: 'none',
  fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 700,
  letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer',
};
const thStyle: React.CSSProperties = {
  padding: '9px 12px', fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600,
  letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-muted)',
  textAlign: 'left', borderBottom: '2px solid rgba(45,90,61,.12)',
};
const tdStyle: React.CSSProperties = {
  padding: '10px 12px', fontFamily: "'DM Sans', sans-serif", fontSize: '13px',
  color: 'var(--text-dark)', borderBottom: '1px solid rgba(45,90,61,.06)', verticalAlign: 'middle',
};

async function renderPdfThumbnail(file: File): Promise<Blob> {
  const { GlobalWorkerOptions, getDocument } = await import('pdfjs-dist');
  GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1);

  const viewport = page.getViewport({ scale: 1.5 });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({ canvas, viewport }).promise;

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(b => b ? resolve(b) : reject(new Error('Canvas toBlob failed')), 'image/jpeg', 0.88);
  });
}

async function uploadToSignedUrl(signedUrl: string, file: Blob, contentType: string): Promise<void> {
  const res = await fetch(signedUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': contentType },
    duplex: 'half',
  } as RequestInit);
  if (!res.ok) throw new Error(`Upload failed: ${res.status} ${res.statusText}`);
}

const emptyForm = {
  title: '',
  issueDate: '',
  issueLabel: '',
  sortOrder: '0',
  thumbnailMode: 'auto' as 'auto' | 'custom',
};

export function NewslettersAdminClient({ initialNewsletters }: { initialNewsletters: Newsletter[] }) {
  const [newsletters, setNewsletters] = useState<Newsletter[]>(initialNewsletters);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const pdfRef = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLInputElement>(null);

  function showMsg(ok: boolean, text: string) {
    setMsg({ ok, text });
    if (ok) setTimeout(() => setMsg(null), 4000);
  }

  function resetForm() {
    setForm(emptyForm);
    setPdfFile(null);
    setThumbFile(null);
    setThumbPreview(null);
    setStatus('');
    if (pdfRef.current) pdfRef.current.value = '';
    if (thumbRef.current) thumbRef.current.value = '';
  }

  function handlePdfChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setPdfFile(f);
    setThumbPreview(null);
  }

  function handleThumbChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setThumbFile(f);
    if (f) setThumbPreview(URL.createObjectURL(f));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pdfFile) { showMsg(false, 'Please select a PDF file.'); return; }
    if (!form.title.trim()) { showMsg(false, 'Please enter a title.'); return; }
    if (form.thumbnailMode === 'custom' && !thumbFile) { showMsg(false, 'Please select a thumbnail image.'); return; }

    startTransition(async () => {
      try {
        // 1. Get presigned upload URLs from server
        setStatus('Getting upload URLs…');
        const urls = await getUploadUrls(form.title);
        if (urls.error) { showMsg(false, urls.error); setStatus(''); return; }

        // 2. Generate or use thumbnail
        let thumbBlob: Blob;
        if (form.thumbnailMode === 'auto') {
          setStatus('Generating thumbnail from PDF…');
          thumbBlob = await renderPdfThumbnail(pdfFile);
        } else {
          thumbBlob = thumbFile!;
        }

        // 3. Upload PDF and thumbnail directly to Supabase storage
        setStatus('Uploading PDF…');
        await uploadToSignedUrl(urls.pdfSignedUrl, pdfFile, 'application/pdf');

        setStatus('Uploading thumbnail…');
        await uploadToSignedUrl(
          urls.thumbSignedUrl,
          thumbBlob,
          form.thumbnailMode === 'auto' ? 'image/jpeg' : (thumbFile?.type ?? 'image/jpeg'),
        );

        // 4. Save DB row
        setStatus('Saving…');
        const res = await createNewsletter({
          title: form.title.trim(),
          issueDate: form.issueDate,
          issueLabel: form.issueLabel.trim(),
          pdfPath: urls.pdfPath,
          thumbPath: urls.thumbPath,
          thumbnailSource: form.thumbnailMode,
          sortOrder: Number(form.sortOrder),
        });

        if (res.error) { showMsg(false, res.error); setStatus(''); return; }

        setShowAdd(false);
        resetForm();
        showMsg(true, 'Newsletter uploaded successfully. Refresh to see it in the list.');
        setStatus('');
      } catch (err) {
        showMsg(false, err instanceof Error ? err.message : 'Upload failed');
        setStatus('');
      }
    });
  }

  function handleDelete(n: Newsletter) {
    if (!confirm(`Delete "${n.title}"? This will also remove the PDF and thumbnail from storage.`)) return;
    startTransition(async () => {
      const res = await deleteNewsletter(n.id, n.pdf_storage_path, n.thumbnail_storage_path);
      if (res.error) { showMsg(false, res.error); return; }
      setNewsletters(prev => prev.filter(x => x.id !== n.id));
      showMsg(true, 'Newsletter deleted.');
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {msg && (
        <div style={{
          padding: '10px 14px',
          background: msg.ok ? 'rgba(45,90,61,.08)' : 'rgba(192,0,0,.06)',
          borderLeft: `4px solid ${msg.ok ? 'var(--green-mid)' : '#c00'}`,
          color: msg.ok ? 'var(--green-deep)' : '#900',
          fontFamily: "'DM Sans',sans-serif", fontSize: '13px',
        }}>
          {msg.text}
        </div>
      )}

      {/* Existing newsletters table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', minWidth: '560px' }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: '60px' }}>Cover</th>
              <th style={thStyle}>Title</th>
              <th style={thStyle}>Label</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Thumbnail</th>
              <th style={{ ...thStyle, width: '80px' }}></th>
            </tr>
          </thead>
          <tbody>
            {newsletters.map(n => (
              <tr key={n.id}>
                <td style={tdStyle}>
                  <img
                    src={n.thumbnail_public_url}
                    alt={n.title}
                    style={{ width: '44px', height: '58px', objectFit: 'cover', objectPosition: 'top', display: 'block', border: '1px solid rgba(45,90,61,.1)' }}
                  />
                </td>
                <td style={tdStyle}>
                  <a href={n.pdf_public_url} target="_blank" rel="noreferrer"
                    style={{ color: 'var(--green-mid)', textDecoration: 'none', fontWeight: 500 }}>
                    {n.title}
                  </a>
                </td>
                <td style={tdStyle}>{n.issue_label}</td>
                <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                  {new Date(n.issue_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td style={{ ...tdStyle, fontSize: '11px', color: 'var(--text-muted)' }}>
                  {n.thumbnail_source === 'auto' ? 'Auto-generated' : 'Custom'}
                </td>
                <td style={tdStyle}>
                  <button onClick={() => handleDelete(n)} disabled={pending} style={{ ...btnDel, opacity: pending ? .65 : 1 }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {newsletters.length === 0 && (
              <tr><td colSpan={6} style={{ ...tdStyle, fontStyle: 'italic', color: 'var(--text-muted)' }}>No newsletters yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Upload form */}
      {showAdd ? (
        <div style={{ background: 'rgba(45,90,61,.03)', border: '1px solid rgba(45,90,61,.15)', padding: '1.25rem 1.5rem' }}>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--green-mid)', marginBottom: '1rem' }}>
            Upload New Newsletter
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={lbl}>Title</label>
                <input type="text" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inp} placeholder="Newsletter — Vol. 4" />
              </div>
              <div>
                <label style={lbl}>Issue Label</label>
                <input type="text" required value={form.issueLabel} onChange={e => setForm(f => ({ ...f, issueLabel: e.target.value }))} style={inp} placeholder="Vol. 4" />
              </div>
              <div>
                <label style={lbl}>Issue Date</label>
                <input type="date" required value={form.issueDate} onChange={e => setForm(f => ({ ...f, issueDate: e.target.value }))} style={inp} />
              </div>
              <div>
                <label style={lbl}>Sort Order</label>
                <input type="number" min="0" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} style={inp} />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={lbl}>PDF File</label>
              <input ref={pdfRef} type="file" accept="application/pdf" required onChange={handlePdfChange}
                style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13px', color: 'var(--green-deep)' }} />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={lbl}>Thumbnail</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontSize: '13px', color: 'var(--green-deep)' }}>
                  <input type="radio" name="thumbMode" value="auto" checked={form.thumbnailMode === 'auto'}
                    onChange={() => { setForm(f => ({ ...f, thumbnailMode: 'auto' })); setThumbFile(null); setThumbPreview(null); if (thumbRef.current) thumbRef.current.value = ''; }} />
                  Auto-generate from PDF
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontSize: '13px', color: 'var(--green-deep)' }}>
                  <input type="radio" name="thumbMode" value="custom" checked={form.thumbnailMode === 'custom'}
                    onChange={() => setForm(f => ({ ...f, thumbnailMode: 'custom' }))} />
                  Upload my own image
                </label>
              </div>
              {form.thumbnailMode === 'custom' && (
                <div style={{ marginTop: '0.5rem' }}>
                  <input ref={thumbRef} type="file" accept="image/*" onChange={handleThumbChange}
                    style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13px', color: 'var(--green-deep)' }} />
                  {thumbPreview && (
                    <img src={thumbPreview} alt="Thumbnail preview" style={{ marginTop: '0.5rem', height: '100px', objectFit: 'contain', border: '1px solid rgba(45,90,61,.15)', display: 'block' }} />
                  )}
                </div>
              )}
            </div>

            {status && (
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12px', color: 'var(--green-mid)', marginBottom: '0.75rem', fontStyle: 'italic' }}>
                {status}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" disabled={pending} style={{ ...btnSave, opacity: pending ? .65 : 1 }}>
                {pending ? 'Uploading…' : 'Upload Newsletter'}
              </button>
              <button type="button" onClick={() => { setShowAdd(false); resetForm(); }} style={btnCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div>
          <button onClick={() => setShowAdd(true)} style={btnSave}>+ Upload Newsletter</button>
        </div>
      )}
    </div>
  );
}

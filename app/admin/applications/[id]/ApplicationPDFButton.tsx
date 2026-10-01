'use client';

import { useState } from 'react';

export type ApplicationData = {
  id: string;
  full_name: string;
  dob: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  rejoining: string | null;
  last_membership_date: string | null;
  committee_members: string | null;
  visit_date: string | null;
  proposer_name: string | null;
  seconder_name: string | null;
  agree_to_fees: boolean;
  agree_to_annual_fee: boolean;
  agree_to_gdpr: boolean;
  signature: string | null;
  status: string;
  received_date: string | null;
  approved_date: string | null;
  membership_number: string | null;
  signed_by: string | null;
  created_at: string;
};

const BBC_GREEN: [number, number, number] = [45, 90, 61];
const DARK:      [number, number, number] = [40, 40, 40];
const MUTED:     [number, number, number] = [120, 120, 120];
const GOLD:      [number, number, number] = [180, 145, 65];
const LIGHT_BG:  [number, number, number] = [247, 250, 248];

export function ApplicationPDFButton({ app, passportPhotoUrl }: { app: ApplicationData; passportPhotoUrl?: string | null }) {
  const [busy, setBusy] = useState(false);

  async function handleDownload() {
    setBusy(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

      const PAGE_W = 210;
      const PAGE_H = 297;
      const ML = 18;
      const MR = 18;
      const W  = PAGE_W - ML - MR;
      const MB = 18;
      let y = 22;

      function setColor(rgb: [number, number, number]) {
        doc.setTextColor(rgb[0], rgb[1], rgb[2]);
      }

      function rule(thickness = 0.4) {
        doc.setDrawColor(BBC_GREEN[0], BBC_GREEN[1], BBC_GREEN[2]);
        doc.setLineWidth(thickness);
        doc.line(ML, y, PAGE_W - MR, y);
        y += 4;
      }

      function checkBreak(needed: number) {
        if (y + needed > PAGE_H - MB) {
          doc.addPage();
          y = 22;
        }
      }

      // ── Header ─────────────────────────────────────────────────────────
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      setColor(BBC_GREEN);
      doc.text('Barnes Bowling Club', ML, y);
      y += 7;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      setColor(GOLD);
      doc.text('Membership Application Record', ML, y);
      y += 5;

      rule(0.5);

      // Submitted / status line
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      setColor(MUTED);
      const submittedStr = new Date(app.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      doc.text(`Submitted: ${submittedStr}`, ML, y);
      const statusLabel = (app.status ?? 'pending').toUpperCase();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      setColor(app.status === 'approved' ? [45, 122, 58] : app.status === 'rejected' ? [192, 57, 43] : GOLD);
      doc.text(statusLabel, PAGE_W - MR, y, { align: 'right' });
      y += 7;

      // ── Section helper ──────────────────────────────────────────────────
      function sectionHeader(title: string) {
        checkBreak(12);
        doc.setFillColor(BBC_GREEN[0], BBC_GREEN[1], BBC_GREEN[2]);
        doc.rect(ML, y - 4, W, 6.5, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text(title.toUpperCase(), ML + 2, y);
        y += 5;
        setColor(DARK);
      }

      function row(label: string, value: string, shade: boolean) {
        const val = value || '—';
        const wrapped = doc.splitTextToSize(val, W - 48) as string[];
        const rh = Math.max(6, wrapped.length * 4.5 + 2);
        checkBreak(rh);
        if (shade) {
          doc.setFillColor(LIGHT_BG[0], LIGHT_BG[1], LIGHT_BG[2]);
          doc.rect(ML, y - 3.5, W, rh, 'F');
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        setColor(MUTED);
        doc.text(label, ML + 1, y);
        doc.setFont('helvetica', 'normal');
        setColor(DARK);
        wrapped.forEach((line, i) => doc.text(line, ML + 48, y + i * 4.5));
        y += rh;
      }

      // ── Personal details ────────────────────────────────────────────────
      sectionHeader('Personal Details');
      const details: [string, string][] = [
        ['Full Name',     app.full_name],
        ['Date of Birth', app.dob ?? ''],
        ['Email',         app.email],
        ['Phone',         app.phone ?? ''],
        ['Address',       app.address ?? ''],
        ['Rejoining',     app.rejoining === 'yes'
          ? `Yes${app.last_membership_date ? ` — last membership: ${app.last_membership_date}` : ''}`
          : 'No'],
      ];
      details.forEach(([l, v], i) => row(l, v, i % 2 !== 0));
      y += 3;

      // ── Visit & proposer ────────────────────────────────────────────────
      sectionHeader('Visit & Proposer');
      const visit: [string, string][] = [
        ['Committee Members', app.committee_members ?? ''],
        ['Visit Date',        app.visit_date ?? ''],
        ['Proposer',          app.proposer_name ?? ''],
        ['Seconder',          app.seconder_name ?? ''],
      ];
      visit.forEach(([l, v], i) => row(l, v, i % 2 !== 0));
      y += 3;

      // ── Confirmations ───────────────────────────────────────────────────
      sectionHeader('Confirmations');
      const confs: [string, boolean][] = [
        ['Agreed to joining & annual fees', app.agree_to_fees],
        ['Agreed to annual membership fee', app.agree_to_annual_fee],
        ['Agreed to GDPR & privacy policy', app.agree_to_gdpr],
      ];
      confs.forEach(([label, ticked], i) => {
        const rh = 6;
        checkBreak(rh);
        if (i % 2 !== 0) {
          doc.setFillColor(LIGHT_BG[0], LIGHT_BG[1], LIGHT_BG[2]);
          doc.rect(ML, y - 3.5, W, rh, 'F');
        }
        // Checkbox
        doc.setDrawColor(BBC_GREEN[0], BBC_GREEN[1], BBC_GREEN[2]);
        doc.setLineWidth(0.3);
        doc.rect(ML + 1, y - 3, 3.5, 3.5);
        if (ticked) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          setColor(BBC_GREEN);
          doc.text('✓', ML + 1.5, y - 0.2);
        }
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        setColor(DARK);
        doc.text(String(label), ML + 7, y);
        y += rh;
      });
      y += 3;

      // ── Passport photo ──────────────────────────────────────────────────
      if (passportPhotoUrl) {
        try {
          const imgResp = await fetch(passportPhotoUrl);
          const blob = await imgResp.blob();
          const dataUrl = await new Promise<string>((res, rej) => {
            const reader = new FileReader();
            reader.onload = () => res(reader.result as string);
            reader.onerror = rej;
            reader.readAsDataURL(blob);
          });
          checkBreak(50);
          sectionHeader('Passport Photo');
          // 35mm × 45mm at scale that fits neatly on page
          doc.addImage(dataUrl, 'JPEG', ML, y, 35, 45);
          y += 49;
        } catch {
          // photo fetch failed — skip silently
        }
        y += 3;
      }

      // ── Signature ───────────────────────────────────────────────────────
      if (app.signature) {
        checkBreak(40);
        sectionHeader('Signature');
        try {
          doc.addImage(app.signature, 'PNG', ML, y, 80, 25);
          y += 29;
        } catch {
          // signature image failed — skip silently
          y += 2;
        }
        y += 3;
      }

      // ── For club use only ───────────────────────────────────────────────
      checkBreak(50);
      sectionHeader('For Club Use Only');
      const club: [string, string][] = [
        ['Status',            (app.status ?? 'pending').charAt(0).toUpperCase() + (app.status ?? 'pending').slice(1)],
        ['Received Date',     app.received_date ?? ''],
        ['Approved Date',     app.approved_date ?? ''],
        ['Membership Number', app.membership_number ?? ''],
        ['Signed By',         app.signed_by ?? ''],
      ];
      club.forEach(([l, v], i) => row(l, v, i % 2 !== 0));
      y += 5;

      // ── Signature line ──────────────────────────────────────────────────
      checkBreak(22);
      doc.setDrawColor(BBC_GREEN[0], BBC_GREEN[1], BBC_GREEN[2]);
      doc.setLineWidth(0.3);
      doc.line(ML, y + 10, ML + 70, y + 10);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      setColor(MUTED);
      doc.text('Authorising signature', ML, y + 14);
      doc.line(PAGE_W - MR - 50, y + 10, PAGE_W - MR, y + 10);
      doc.text('Date', PAGE_W - MR - 50, y + 14);

      // ── Footer ──────────────────────────────────────────────────────────
      const total = doc.getNumberOfPages();
      for (let p = 1; p <= total; p++) {
        doc.setPage(p);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        setColor(MUTED);
        doc.text(
          `Barnes Bowling Club  ·  Membership Application  ·  ${app.full_name}  ·  Generated ${new Date().toLocaleDateString('en-GB')}  ·  Page ${p} of ${total}`,
          PAGE_W / 2, PAGE_H - 9, { align: 'center' },
        );
      }

      const filename = `BBC-Application-${app.full_name.replace(/\s+/g, '-')}.pdf`;
      doc.save(filename);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={busy}
      style={{
        width: '100%',
        padding: '.75rem 1rem',
        background: busy ? 'rgba(45,90,61,.35)' : 'var(--green-deep)',
        color: '#fff',
        border: 'none',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '12px',
        fontWeight: 700,
        letterSpacing: '.1em',
        textTransform: 'uppercase',
        cursor: busy ? 'wait' : 'pointer',
        transition: 'background .15s',
      }}
    >
      {busy ? 'Generating…' : 'Print / Download PDF ↓'}
    </button>
  );
}

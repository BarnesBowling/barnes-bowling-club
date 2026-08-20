'use client';

import { useState } from 'react';

const BBC_GREEN: [number, number, number] = [45, 90, 61];
const DARK:      [number, number, number] = [40, 40, 40];
const MUTED:     [number, number, number] = [120, 120, 120];
const GOLD:      [number, number, number] = [180, 145, 65];

export type StatementEntry = {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: 'debit' | 'credit';
  guest_names: string | null;
  num_guests: number | null;
  cost_per_guest: number | null;
  metadata: Record<string, unknown> | null;
};

export type StatementMember = {
  full_name: string;
  membership_number: string | null;
  status: string;
};

interface Props {
  member: StatementMember;
  entries: StatementEntry[];
}

const CATEGORY_LABELS: Record<string, string> = {
  membership_fee: 'Membership Fee',
  joining_fee:    'Joining Fee',
  guest_fee:      'Guest Fee',
  event_fee:      'Event Fee',
  manser_fee:     'Manser Fee',
  wrong_bias_fee: 'Wrong Bias Fee',
  miscellaneous:  'Miscellaneous',
  payment:        'Payment',
};

function fmtDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export function StatementPDFButton({ member, entries }: Props) {
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
      const MT = 22;
      const MB = 20;
      const W  = PAGE_W - ML - MR;

      let y = MT;
      let page = 1;

      function newPage() {
        doc.addPage();
        page++;
        y = MT;
        drawPageFooter();
      }

      function checkBreak(needed: number) {
        if (y + needed > PAGE_H - MB) newPage();
      }

      function setColor(rgb: [number, number, number]) {
        doc.setTextColor(rgb[0], rgb[1], rgb[2]);
      }

      function drawPageFooter() {
        doc.setPage(page);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        setColor(MUTED);
        doc.text(
          `Barnes Bowling Club  ·  Member Statement  ·  Generated ${new Date().toLocaleDateString('en-GB')}`,
          PAGE_W / 2, PAGE_H - 10, { align: 'center' },
        );
      }

      // ── Header ─────────────────────────────────────────────────────────────
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      setColor(BBC_GREEN);
      doc.text('Barnes Bowling Club', ML, y);
      y += 8;

      doc.setFontSize(13);
      doc.setFont('helvetica', 'normal');
      setColor(GOLD);
      doc.text('Member Account Statement', ML, y);
      y += 6;

      doc.setDrawColor(BBC_GREEN[0], BBC_GREEN[1], BBC_GREEN[2]);
      doc.setLineWidth(0.5);
      doc.line(ML, y, PAGE_W - MR, y);
      y += 7;

      // ── Member info ─────────────────────────────────────────────────────────
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      setColor(DARK);
      doc.text(`Name:`, ML, y);
      doc.setFont('helvetica', 'bold');
      doc.text(member.full_name, ML + 30, y);
      y += 5.5;

      doc.setFont('helvetica', 'normal');
      doc.text(`Membership No.:`, ML, y);
      doc.setFont('helvetica', 'bold');
      doc.text(member.membership_number ?? '—', ML + 30, y);
      y += 5.5;

      doc.setFont('helvetica', 'normal');
      doc.text(`Status:`, ML, y);
      doc.setFont('helvetica', 'bold');
      doc.text(member.status.charAt(0).toUpperCase() + member.status.slice(1), ML + 30, y);
      y += 5.5;

      doc.setFont('helvetica', 'normal');
      doc.text(`Statement date:`, ML, y);
      doc.setFont('helvetica', 'bold');
      doc.text(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), ML + 30, y);
      y += 9;

      if (entries.length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        setColor(MUTED);
        doc.text('No transactions recorded for this member.', ML, y);
        drawPageFooter();
        doc.save(`statement-${member.membership_number ?? member.full_name.replace(/\s+/g, '-')}.pdf`);
        return;
      }

      // ── Table header ─────────────────────────────────────────────────────────
      const COL = {
        date:    ML,
        desc:    ML + 26,
        debit:   PAGE_W - MR - 52,
        credit:  PAGE_W - MR - 34,
        balance: PAGE_W - MR - 16,
      };

      function drawTableHeader() {
        doc.setFillColor(45, 90, 61);
        doc.rect(ML, y - 4, W, 7, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text('DATE',        COL.date,    y);
        doc.text('DESCRIPTION', COL.desc,    y);
        doc.text('DEBIT',       COL.debit,   y, { align: 'right' });
        doc.text('CREDIT',      COL.credit,  y, { align: 'right' });
        doc.text('BALANCE',     COL.balance, y, { align: 'right' });
        y += 5;
        setColor(DARK);
      }

      drawTableHeader();

      // ── Table rows ─────────────────────────────────────────────────────────
      let balance = 0;
      const LINE_H = 5.5;
      const DESC_W = COL.debit - COL.desc - 4;

      entries.forEach((e, i) => {
        const signed = e.type === 'credit' ? -e.amount : e.amount;
        balance += signed;

        // Build description lines
        let descText = e.description;
        const guestNames = e.guest_names ?? (e.metadata?.guest_names as string | undefined);
        const dateOfPlay = e.metadata?.date_of_play as string | undefined;
        const numGuests  = e.num_guests ?? (e.metadata?.num_guests as number | undefined);

        const extraLines: string[] = [];
        if (e.category === 'guest_fee') {
          if (guestNames) extraLines.push(`Guests: ${guestNames}`);
          if (dateOfPlay) extraLines.push(`Date of play: ${fmtDate(dateOfPlay)}`);
          if (numGuests && !guestNames) extraLines.push(`${numGuests} guest${numGuests !== 1 ? 's' : ''}`);
        }

        const wrappedDesc = doc.splitTextToSize(descText, DESC_W) as string[];
        const rowH = LINE_H * (wrappedDesc.length + extraLines.length) + 2;

        checkBreak(rowH + 2);

        // Alternating row background
        if (i % 2 !== 0) {
          doc.setFillColor(247, 250, 248);
          doc.rect(ML, y - 3.5, W, rowH, 'F');
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        setColor(MUTED);
        doc.text(fmtDate(e.date), COL.date, y);

        setColor(DARK);
        wrappedDesc.forEach((line, li) => {
          doc.text(line, COL.desc, y + li * LINE_H);
        });
        let extraY = y + wrappedDesc.length * LINE_H;
        if (extraLines.length > 0) {
          doc.setFontSize(8);
          setColor([100, 130, 110]);
          extraLines.forEach(line => {
            doc.text(line, COL.desc + 2, extraY);
            extraY += 4.5;
          });
          doc.setFontSize(9);
        }

        if (e.type === 'debit') {
          doc.setTextColor(180, 50, 50);
          doc.text(`£${e.amount.toFixed(2)}`, COL.debit, y, { align: 'right' });
        } else {
          doc.setTextColor(40, 130, 70);
          doc.text(`£${e.amount.toFixed(2)}`, COL.credit, y, { align: 'right' });
        }

        const balColor: [number, number, number] = balance > 0.005 ? [180, 50, 50] : balance < -0.005 ? [40, 130, 70] : DARK;
        doc.setTextColor(balColor[0], balColor[1], balColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.text(
          balance >= 0 ? `£${balance.toFixed(2)}` : `−£${Math.abs(balance).toFixed(2)}`,
          COL.balance, y, { align: 'right' },
        );

        y += rowH;

        // Row separator
        doc.setDrawColor(220, 230, 225);
        doc.setLineWidth(0.2);
        doc.line(ML, y - 1, PAGE_W - MR, y - 1);
      });

      // ── Final balance ────────────────────────────────────────────────────────
      checkBreak(16);
      y += 4;

      doc.setDrawColor(BBC_GREEN[0], BBC_GREEN[1], BBC_GREEN[2]);
      doc.setLineWidth(0.5);
      doc.line(ML, y, PAGE_W - MR, y);
      y += 6;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      setColor(BBC_GREEN);
      doc.text('Final Balance', ML, y);

      const finalColor: [number, number, number] = balance > 0.005 ? [180, 50, 50] : balance < -0.005 ? [40, 130, 70] : DARK;
      doc.setTextColor(finalColor[0], finalColor[1], finalColor[2]);
      const balLabel = balance > 0.005
        ? `£${balance.toFixed(2)} owing`
        : balance < -0.005
        ? `£${Math.abs(balance).toFixed(2)} in credit`
        : 'Balance settled (£0.00)';
      doc.text(balLabel, PAGE_W - MR, y, { align: 'right' });
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      setColor(MUTED);
      if (balance > 0.005) {
        doc.text('Amount outstanding — please arrange payment at your earliest convenience.', ML, y);
      } else if (balance < -0.005) {
        doc.text('This member has a credit on their account.', ML, y);
      } else {
        doc.text('This account is fully settled.', ML, y);
      }

      // ── Page footers ──────────────────────────────────────────────────────────
      const total = doc.getNumberOfPages();
      for (let p = 1; p <= total; p++) {
        doc.setPage(p);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        setColor(MUTED);
        doc.text(
          `Barnes Bowling Club  ·  Member Statement  ·  Generated ${new Date().toLocaleDateString('en-GB')}  ·  Page ${p} of ${total}`,
          PAGE_W / 2, PAGE_H - 10, { align: 'center' },
        );
      }

      const filename = `BBC-Statement-${(member.membership_number ?? member.full_name).replace(/\s+/g, '-')}.pdf`;
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
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '0 20px',
        height: '40px',
        background: 'var(--green-deep)',
        color: '#fff',
        border: 'none',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '12px',
        fontWeight: 700,
        letterSpacing: '.1em',
        textTransform: 'uppercase',
        cursor: busy ? 'wait' : 'pointer',
        opacity: busy ? 0.65 : 1,
      }}
    >
      {busy ? 'Generating…' : 'Download PDF ↓'}
    </button>
  );
}

import type { AccountsLedgerRow } from './accountsPDFActions';

const BBC_GREEN: [number,number,number] = [45, 90, 61];
const DARK:      [number,number,number] = [40, 40, 40];
const MUTED:     [number,number,number] = [120, 120, 120];
const GOLD:      [number,number,number] = [180, 145, 65];
const RED:       [number,number,number] = [180, 50, 50];
const GREEN_PAY: [number,number,number] = [40, 130, 70];

type MemberSummary = {
  full_name: string;
  membership_number: string | null;
  totalCharged: number;
  totalPaid: number;
  outstanding: number;
};

const PAYMENT_METHODS = ['Bank transfer', 'Cash', 'Card', 'Cheque', 'Other'] as const;

function fmtDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtDateLong(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export async function generateAccountsPDF(
  allRows: AccountsLedgerRow[],
  fromDate: string,
  toDate: string,
): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

  const PAGE_W = 210;
  const PAGE_H = 297;
  const ML = 14;
  const MR = 14;
  const MT = 20;
  const MB = 18;
  const W  = PAGE_W - ML - MR;

  let y = MT;
  let page = 1;

  function newPage() { doc.addPage(); page++; y = MT; }
  function checkBreak(needed: number) { if (y + needed > PAGE_H - MB) newPage(); }
  function setColor(rgb: [number,number,number]) { doc.setTextColor(rgb[0], rgb[1], rgb[2]); }

  // ── Column positions ──────────────────────────────────────────────────

  // Balance tables (5 cols)
  const CB = {
    name:    ML,
    num:     ML + 68,
    charged: PAGE_W - MR - 60,
    paid:    PAGE_W - MR - 30,
    bal:     PAGE_W - MR,
  };
  const NAME_W_BAL = CB.num - CB.name - 2;

  // Payment/credit tables (6 cols)
  const CP = {
    date:   ML,
    name:   ML + 24,
    num:    ML + 71,
    method: ML + 93,
    desc:   ML + 117,
    amount: PAGE_W - MR,
  };
  const NAME_W_PAY = CP.num - CP.name - 2;
  const DESC_W_PAY = CP.amount - CP.desc - 20;

  const LINE_H = 5;

  // ── Compute data ──────────────────────────────────────────────────────

  const memberMap = new Map<string, {
    full_name: string; membership_number: string | null;
    totalCharged: number; totalPaid: number;
  }>();

  for (const row of allRows) {
    if (row.date > toDate) continue;
    if (!memberMap.has(row.member_id)) {
      memberMap.set(row.member_id, {
        full_name: row.club_members?.full_name ?? row.member_id,
        membership_number: row.club_members?.membership_number ?? null,
        totalCharged: 0, totalPaid: 0,
      });
    }
    const m = memberMap.get(row.member_id)!;
    if (row.type === 'debit') m.totalCharged += row.amount;
    else                       m.totalPaid    += row.amount;
  }

  const allMembers: MemberSummary[] = Array.from(memberMap.values())
    .map(m => ({ ...m, outstanding: m.totalCharged - m.totalPaid }));

  const outstanding = allMembers.filter(m => m.outstanding > 0.005)
    .sort((a, b) => b.outstanding - a.outstanding);
  const paidInFull  = allMembers.filter(m => Math.abs(m.outstanding) <= 0.005)
    .sort((a, b) => a.full_name.localeCompare(b.full_name));
  const inCredit    = allMembers.filter(m => m.outstanding < -0.005)
    .sort((a, b) => a.full_name.localeCompare(b.full_name));

  const paymentsInRange = allRows
    .filter(r => r.type === 'credit' && r.category === 'payment' && r.date >= fromDate && r.date <= toDate)
    .sort((a, b) => a.date.localeCompare(b.date) || a.member_id.localeCompare(b.member_id));

  const otherCreditsInRange = allRows
    .filter(r => r.type === 'credit' && r.category !== 'payment' && r.date >= fromDate && r.date <= toDate)
    .sort((a, b) => a.date.localeCompare(b.date));

  const totalOutstanding      = outstanding.reduce((s, m) => s + m.outstanding, 0);
  const totalInCredit         = inCredit.reduce((s, m) => s + Math.abs(m.outstanding), 0);
  const totalPaymentsReceived = paymentsInRange.reduce((s, r) => s + r.amount, 0);

  // ── Drawing helpers ───────────────────────────────────────────────────

  function drawSectionHeading(title: string, subtitle?: string) {
    checkBreak(20);
    y += 5;
    doc.setFillColor(BBC_GREEN[0], BBC_GREEN[1], BBC_GREEN[2]);
    doc.rect(ML, y - 4.5, W, 8.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(title.toUpperCase(), ML + 3, y);
    if (subtitle) {
      doc.setFontSize(7.5);
      doc.setTextColor(190, 225, 205);
      doc.text(subtitle, PAGE_W - MR - 3, y, { align: 'right' });
    }
    y += 8;
    setColor(DARK);
  }

  function drawBalanceTableHeader(lastColLabel = 'OUTSTANDING') {
    doc.setFillColor(235, 242, 237);
    doc.rect(ML, y - 3.5, W, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(60, 110, 70);
    doc.text('MEMBER',          CB.name,    y);
    doc.text('NO.',             CB.num,     y);
    doc.text('TOTAL CHARGED',   CB.charged, y, { align: 'right' });
    doc.text('TOTAL PAID',      CB.paid,    y, { align: 'right' });
    doc.text(lastColLabel,      CB.bal,     y, { align: 'right' });
    y += 5.5;
    setColor(DARK);
  }

  function drawPaymentTableHeader(lastDescLabel = 'DESCRIPTION') {
    doc.setFillColor(235, 242, 237);
    doc.rect(ML, y - 3.5, W, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(60, 110, 70);
    doc.text('DATE',           CP.date,   y);
    doc.text('MEMBER',         CP.name,   y);
    doc.text('NO.',            CP.num,    y);
    doc.text('METHOD',         CP.method, y);
    doc.text(lastDescLabel,    CP.desc,   y);
    doc.text('AMOUNT',         CP.amount, y, { align: 'right' });
    y += 5.5;
    setColor(DARK);
  }

  function drawMemberRow(m: MemberSummary, i: number, balColor: [number,number,number] | null) {
    const wrappedName = doc.splitTextToSize(m.full_name, NAME_W_BAL) as string[];
    const rowH = Math.max(7, wrappedName.length * LINE_H + 2);
    checkBreak(rowH + 2);

    if (i % 2 !== 0) {
      doc.setFillColor(248, 251, 249);
      doc.rect(ML, y - 3.5, W, rowH, 'F');
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    setColor(DARK);
    wrappedName.forEach((line, li) => doc.text(line, CB.name, y + li * LINE_H));

    setColor(MUTED);
    doc.text(m.membership_number ?? '—', CB.num, y);

    doc.setTextColor(160, 60, 60);
    doc.text(`£${m.totalCharged.toFixed(2)}`, CB.charged, y, { align: 'right' });
    doc.setTextColor(GREEN_PAY[0], GREEN_PAY[1], GREEN_PAY[2]);
    doc.text(`£${m.totalPaid.toFixed(2)}`, CB.paid, y, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    if (balColor) {
      doc.setTextColor(balColor[0], balColor[1], balColor[2]);
      doc.text(`£${Math.abs(m.outstanding).toFixed(2)}`, CB.bal, y, { align: 'right' });
    } else {
      doc.setTextColor(GREEN_PAY[0], GREEN_PAY[1], GREEN_PAY[2]);
      doc.text('Paid', CB.bal, y, { align: 'right' });
    }

    y += rowH;
    doc.setDrawColor(220, 230, 225);
    doc.setLineWidth(0.15);
    doc.line(ML, y - 1, PAGE_W - MR, y - 1);
  }

  function drawBalanceTotalsRow(members: MemberSummary[], balColor: [number,number,number] | null) {
    if (members.length === 0) return;
    const tCharged = members.reduce((s, m) => s + m.totalCharged, 0);
    const tPaid    = members.reduce((s, m) => s + m.totalPaid, 0);
    const tBal     = members.reduce((s, m) => s + m.outstanding, 0);

    checkBreak(11);
    doc.setFillColor(235, 242, 237);
    doc.rect(ML, y - 2, W, 9, 'F');
    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    setColor(BBC_GREEN);
    doc.text(`Total  (${members.length})`, CB.name, y);
    doc.setTextColor(160, 60, 60);
    doc.text(`£${tCharged.toFixed(2)}`, CB.charged, y, { align: 'right' });
    doc.setTextColor(GREEN_PAY[0], GREEN_PAY[1], GREEN_PAY[2]);
    doc.text(`£${tPaid.toFixed(2)}`, CB.paid, y, { align: 'right' });
    if (balColor) {
      doc.setTextColor(balColor[0], balColor[1], balColor[2]);
      doc.text(`£${Math.abs(tBal).toFixed(2)}`, CB.bal, y, { align: 'right' });
    }
    y += 7;
  }

  function drawPaymentRow(r: AccountsLedgerRow, i: number, showNotes: boolean) {
    const method     = (r.metadata?.method as string | undefined) ?? '—';
    const notes      = r.notes ?? (r.metadata?.notes as string | undefined) ?? '';
    const descFull   = showNotes && notes ? `${r.description}  •  ${notes}` : r.description;
    const memberName = r.club_members?.full_name ?? r.member_id;

    const wrappedDesc = doc.splitTextToSize(descFull, DESC_W_PAY) as string[];
    const wrappedName = doc.splitTextToSize(memberName, NAME_W_PAY) as string[];
    const maxLines    = Math.max(wrappedDesc.length, wrappedName.length, 1);
    const rowH        = Math.max(7, maxLines * LINE_H + 2);

    checkBreak(rowH + 2);

    if (i % 2 !== 0) {
      doc.setFillColor(248, 251, 249);
      doc.rect(ML, y - 3.5, W, rowH, 'F');
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);

    setColor(MUTED);
    doc.text(fmtDate(r.date), CP.date, y);

    setColor(DARK);
    wrappedName.forEach((line, li) => doc.text(line, CP.name, y + li * LINE_H));

    setColor(MUTED);
    doc.text(r.club_members?.membership_number ?? '—', CP.num, y);

    setColor(DARK);
    doc.text(method, CP.method, y);
    wrappedDesc.forEach((line, li) => doc.text(line, CP.desc, y + li * LINE_H));

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(GREEN_PAY[0], GREEN_PAY[1], GREEN_PAY[2]);
    doc.text(`£${r.amount.toFixed(2)}`, CP.amount, y, { align: 'right' });

    y += rowH;
    doc.setDrawColor(220, 230, 225);
    doc.setLineWidth(0.15);
    doc.line(ML, y - 1, PAGE_W - MR, y - 1);
  }

  function drawPaymentTotalsRow(rows: AccountsLedgerRow[]) {
    if (rows.length === 0) return;
    const total = rows.reduce((s, r) => s + r.amount, 0);
    checkBreak(11);
    doc.setFillColor(235, 242, 237);
    doc.rect(ML, y - 2, W, 9, 'F');
    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    setColor(BBC_GREEN);
    doc.text(`Total  (${rows.length} row${rows.length !== 1 ? 's' : ''})`, CB.name, y);
    doc.setTextColor(GREEN_PAY[0], GREEN_PAY[1], GREEN_PAY[2]);
    doc.text(`£${total.toFixed(2)}`, CP.amount, y, { align: 'right' });
    y += 7;
  }

  function drawMethodSubtotals(rows: AccountsLedgerRow[]) {
    if (rows.length === 0) return;

    const methodTotals = new Map<string, number>();
    for (const r of rows) {
      const key = (r.metadata?.method as string | undefined) ?? 'Unrecorded';
      methodTotals.set(key, (methodTotals.get(key) ?? 0) + r.amount);
    }
    const allMethods = [...PAYMENT_METHODS, 'Unrecorded'];
    const usedMethods = allMethods.filter(m => methodTotals.has(m));

    checkBreak(8 + usedMethods.length * 5.5 + 10);
    y += 4;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    setColor(MUTED);
    doc.text('Subtotals by method', ML, y);
    y += 5;

    usedMethods.forEach(method => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      setColor(MUTED);
      doc.text(method, ML + 5, y);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(GREEN_PAY[0], GREEN_PAY[1], GREEN_PAY[2]);
      doc.text(`£${methodTotals.get(method)!.toFixed(2)}`, CP.amount, y, { align: 'right' });
      y += 5.5;
    });

    const grandTotal = rows.reduce((s, r) => s + r.amount, 0);
    doc.setDrawColor(BBC_GREEN[0], BBC_GREEN[1], BBC_GREEN[2]);
    doc.setLineWidth(0.3);
    doc.line(CP.amount - 40, y - 1, PAGE_W - MR, y - 1);
    y += 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    setColor(BBC_GREEN);
    doc.text('Grand total', ML + 5, y);
    doc.setTextColor(GREEN_PAY[0], GREEN_PAY[1], GREEN_PAY[2]);
    doc.text(`£${grandTotal.toFixed(2)}`, CP.amount, y, { align: 'right' });
    y += 8;
  }

  function drawReconciliationBox(totalPayments: number) {
    checkBreak(58);
    y += 6;

    const BOX_H = 52;
    doc.setFillColor(252, 252, 248);
    doc.setDrawColor(BBC_GREEN[0], BBC_GREEN[1], BBC_GREEN[2]);
    doc.setLineWidth(0.3);
    doc.rect(ML, y, W, BOX_H, 'FD');

    // Green title bar inside box
    doc.setFillColor(BBC_GREEN[0], BBC_GREEN[1], BBC_GREEN[2]);
    doc.rect(ML, y, W, 9, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('RECONCILIATION', ML + 4, y + 6.2);
    y += 14;

    // Pre-filled total
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    setColor(DARK);
    doc.text('Total payments received in period:', ML + 4, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(GREEN_PAY[0], GREEN_PAY[1], GREEN_PAY[2]);
    doc.text(`£${totalPayments.toFixed(2)}`, ML + 100, y);
    y += 9;

    // Blank lines
    const blankItems = ['Bank statement total:', 'Difference:'];
    doc.setDrawColor(160, 160, 160);
    doc.setLineWidth(0.25);
    blankItems.forEach(label => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      setColor(DARK);
      doc.text(label, ML + 4, y);
      doc.line(ML + 62, y + 1.2, ML + 140, y + 1.2);
      y += 9;
    });

    // Checked by / Date on same line
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    setColor(DARK);
    doc.text('Checked by:', ML + 4, y);
    doc.line(ML + 28, y + 1.2, ML + 120, y + 1.2);
    doc.text('Date:', ML + 124, y);
    doc.line(ML + 136, y + 1.2, ML + W - 4, y + 1.2);

    y += BOX_H - (52 - (14 + 9 + 9 + 9 + 2)); // skip past box bottom
    y += 6;
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
  doc.text('Member Accounts Report', ML, y);
  y += 6;

  doc.setDrawColor(BBC_GREEN[0], BBC_GREEN[1], BBC_GREEN[2]);
  doc.setLineWidth(0.5);
  doc.line(ML, y, PAGE_W - MR, y);
  y += 6;

  // Generated + period
  const now = new Date();
  const genStr = `Generated: ${now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} at ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  setColor(MUTED);
  doc.text(genStr, ML, y);
  doc.text(`Period: ${fmtDateLong(fromDate)} – ${fmtDateLong(toDate)}`, PAGE_W - MR, y, { align: 'right' });
  y += 8;

  // ── Summary boxes ──────────────────────────────────────────────────────

  const sumBoxW = (W - 4) / 3;
  const summaryData: [string, string, [number,number,number]][] = [
    [
      `${outstanding.length} outstanding`,
      outstanding.length > 0 ? `£${totalOutstanding.toFixed(2)} total` : 'None',
      RED,
    ],
    [
      `${paidInFull.length} paid in full`,
      paidInFull.length > 0 ? `${paidInFull.length} member${paidInFull.length !== 1 ? 's' : ''}` : 'None',
      GREEN_PAY,
    ],
    [
      `${inCredit.length} in credit`,
      inCredit.length > 0 ? `£${totalInCredit.toFixed(2)} total` : 'None',
      GOLD,
    ],
  ];

  summaryData.forEach(([line1, line2, col], idx) => {
    const bx = ML + idx * (sumBoxW + 2);
    doc.setFillColor(248, 251, 249);
    doc.rect(bx, y - 4, sumBoxW, 17, 'F');
    doc.setDrawColor(col[0], col[1], col[2]);
    doc.setLineWidth(0.4);
    doc.line(bx, y - 4, bx, y + 13);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(col[0], col[1], col[2]);
    doc.text(line1, bx + 4, y + 1);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    setColor(MUTED);
    doc.text(line2, bx + 4, y + 7.5);
  });
  y += 22;

  // ── Section: Payments received ─────────────────────────────────────────

  drawSectionHeading('Payments Received', `${fmtDate(fromDate)} – ${fmtDate(toDate)}`);

  if (paymentsInRange.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    setColor(MUTED);
    doc.text('No payments recorded in this period.', ML + 3, y);
    y += 8;
  } else {
    drawPaymentTableHeader('DESCRIPTION');
    paymentsInRange.forEach((r, i) => drawPaymentRow(r, i, false));
    drawPaymentTotalsRow(paymentsInRange);
    drawMethodSubtotals(paymentsInRange);
  }

  // ── Section: Other credits / adjustments ──────────────────────────────

  if (otherCreditsInRange.length > 0) {
    drawSectionHeading('Other Credits / Adjustments', `${fmtDate(fromDate)} – ${fmtDate(toDate)}`);
    drawPaymentTableHeader('DESCRIPTION / NOTES');
    otherCreditsInRange.forEach((r, i) => drawPaymentRow(r, i, true));
    drawPaymentTotalsRow(otherCreditsInRange);
  }

  // ── Reconciliation box ────────────────────────────────────────────────

  drawReconciliationBox(totalPaymentsReceived);

  // ── Section: Outstanding balances ─────────────────────────────────────

  drawSectionHeading('Outstanding Balances', `As at ${fmtDateLong(toDate)}`);

  if (outstanding.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    setColor(MUTED);
    doc.text('No outstanding balances.', ML + 3, y);
    y += 8;
  } else {
    drawBalanceTableHeader('OUTSTANDING');
    outstanding.forEach((m, i) => drawMemberRow(m, i, RED));
    drawBalanceTotalsRow(outstanding, RED);
  }

  // ── Section: Paid in full ──────────────────────────────────────────────

  drawSectionHeading('Paid in Full', `As at ${fmtDateLong(toDate)}`);

  if (paidInFull.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    setColor(MUTED);
    doc.text('No members with a zero balance.', ML + 3, y);
    y += 8;
  } else {
    drawBalanceTableHeader('STATUS');
    paidInFull.forEach((m, i) => drawMemberRow(m, i, null));
    drawBalanceTotalsRow(paidInFull, null);
  }

  // ── Section: In credit ─────────────────────────────────────────────────

  if (inCredit.length > 0) {
    drawSectionHeading('In Credit', `As at ${fmtDateLong(toDate)}`);
    drawBalanceTableHeader('IN CREDIT');
    inCredit.forEach((m, i) => drawMemberRow(m, i, GOLD));
    drawBalanceTotalsRow(inCredit, GOLD);
  }

  // ── Page footers ──────────────────────────────────────────────────────

  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    setColor(MUTED);
    doc.text(
      `Barnes Bowling Club  ·  Member Accounts Report  ·  Period: ${fmtDateLong(fromDate)} – ${fmtDateLong(toDate)}  ·  Page ${p} of ${totalPages}`,
      PAGE_W / 2, PAGE_H - 8, { align: 'center' },
    );
  }

  // ── Save ──────────────────────────────────────────────────────────────

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bytes = new Uint8Array((doc as any).output('arraybuffer') as ArrayBuffer);
  const blob  = new Blob([bytes], { type: 'application/pdf' });
  const url   = URL.createObjectURL(blob);
  const a     = document.createElement('a');
  a.href      = url;
  a.download  = `BBC-Member-Accounts-${toDate}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

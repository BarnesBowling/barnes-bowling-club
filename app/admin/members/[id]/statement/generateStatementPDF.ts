import { PAYMENT_INFO } from './paymentInfo';
import { guestFeeDetail } from './statementUtils';

const BBC_GREEN: [number, number, number] = [45, 90, 61];
const DARK:      [number, number, number] = [40, 40, 40];
const MUTED:     [number, number, number] = [120, 120, 120];
const GOLD:      [number, number, number] = [180, 145, 65];

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

// Suppress unused-variable warning — kept for parity with client component
void CATEGORY_LABELS;

function fmtDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export type PDFMember = {
  full_name: string;
  membership_number: string | null;
  status: string;
};

export type PDFEntry = {
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

export async function generateStatementPDF(
  member: PDFMember,
  entries: PDFEntry[],
): Promise<Uint8Array> {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
return new Uint8Array((doc as any).output('arraybuffer') as ArrayBuffer);
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

    // Build description — guest detail inlined via shared utility
    const detail = guestFeeDetail(e);
    const descText = detail ? `${e.description} – ${detail}` : e.description;

    const wrappedDesc = doc.splitTextToSize(descText, DESC_W) as string[];
    const rowH = LINE_H * wrappedDesc.length + 2;

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

  // ── Summary boxes ────────────────────────────────────────────────────────
  const totalCharged = entries.reduce((s, e) => s + (e.type === 'debit'  ? e.amount : 0), 0);
  const totalPaid    = entries.reduce((s, e) => s + (e.type === 'credit' ? e.amount : 0), 0);

  checkBreak(28);
  y += 5;

  const boxW = (W - 4) / 3;
  const summaryItems: [string, number, [number,number,number]][] = [
    ['Total Charged', totalCharged, [180, 50, 50]],
    ['Total Paid',    totalPaid,    [40, 130, 70]],
    [balance > 0.005 ? 'Outstanding' : balance < -0.005 ? 'In Credit' : 'Balance',
     balance, balance > 0.005 ? [180, 50, 50] : balance < -0.005 ? [40, 130, 70] : DARK],
  ];
  summaryItems.forEach(([label, val, col], idx) => {
    const bx = ML + idx * (boxW + 2);
    doc.setFillColor(247, 250, 248);
    doc.rect(bx, y - 4, boxW, 16, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    setColor(GOLD);
    doc.text(label.toUpperCase(), bx + 4, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(col[0], col[1], col[2]);
    doc.text(`£${Math.abs(val).toFixed(2)}`, bx + 4, y + 7);
  });
  y += 18;

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

  // ── How to Pay ────────────────────────────────────────────────────────────
  checkBreak(80);
  y += 10;

  doc.setDrawColor(BBC_GREEN[0], BBC_GREEN[1], BBC_GREEN[2]);
  doc.setLineWidth(0.5);
  doc.line(ML, y, PAGE_W - MR, y);
  y += 7;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  setColor(BBC_GREEN);
  doc.text('How to Pay', ML, y);
  y += 8;

  // Bank transfer
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  setColor(DARK);
  doc.text('Paying by bank transfer', ML, y);
  y += 5.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('If you would prefer to pay by bank transfer, please use:', ML, y);
  y += 6;

  const LABEL_X = ML + 4;
  const VALUE_X = ML + 46;
  const bankDetails: [string, string][] = [
    ['Account name:', PAYMENT_INFO.accountName],
    ['Sort code:',    PAYMENT_INFO.sortCode],
    ['Account no.:',  PAYMENT_INFO.accountNumber],
    ['Reference:',    member.membership_number ?? '—'],
  ];
  bankDetails.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    setColor(GOLD);
    doc.text(label, LABEL_X, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    setColor(BBC_GREEN);
    doc.text(value, VALUE_X, y);
    y += 5;
  });

  y += 3;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  setColor(MUTED);
  const emailNote = `Please remember to email the club at ${PAYMENT_INFO.email} to let us know your payment has been sent.`;
  const wrappedEmail = doc.splitTextToSize(emailNote, W) as string[];
  wrappedEmail.forEach(line => { doc.text(line, ML, y); y += 4.5; });

  y += 6;

  // Card payment
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  setColor(DARK);
  doc.text('Paying by card', ML, y);
  y += 5.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  setColor(DARK);
  const cardNote = 'Alternatively, you can pay by credit or debit card through our secure online payment portal:';
  const wrappedCard = doc.splitTextToSize(cardNote, W) as string[];
  wrappedCard.forEach(line => { doc.text(line, ML, y); y += 5; });

  doc.setFont('helvetica', 'bold');
  setColor(BBC_GREEN);
  doc.text(PAYMENT_INFO.paymentPageUrl, ML, y);
  y += 5;

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
return new Uint8Array((doc as any).output('arraybuffer') as ArrayBuffer);
}

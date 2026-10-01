'use server';

import { revalidatePath } from 'next/cache';
import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdminSession } from '@/lib/adminAuth';
import { generateStatementPDF } from './generateStatementPDF';
import type { PDFEntry, PDFMember } from './generateStatementPDF';

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY is not configured on this server.');
  return new Resend(key);
}

function htmlEscape(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildEmailHtml(member: PDFMember & { email: string }, balance: number): string {
  const firstName = htmlEscape(member.full_name.split(/\s+/)[0] ?? member.full_name);

  let balanceLine: string;
  if (balance > 0.005) {
    balanceLine = `Your current balance is <strong>£${balance.toFixed(2)}</strong> owing.`;
  } else if (balance < -0.005) {
    balanceLine = `You have a credit of <strong>£${Math.abs(balance).toFixed(2)}</strong> on your account.`;
  } else {
    balanceLine = 'Your account is fully settled (£0.00).';
  }

  const memberRef = htmlEscape(member.membership_number ?? 'your name');

  const howToPayBlock =
    balance > 0.005
      ? `<table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f5ef;border-left:3px solid #c9a84c;padding:0;margin-bottom:20px">
  <tr>
    <td style="padding:20px 24px">
      <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#1b3b26;letter-spacing:.03em;text-transform:uppercase">How to pay</p>
      <p style="margin:0 0 10px;font-size:13px;line-height:1.7;color:#3a3a3a">
        <strong>Bank transfer:</strong> Barnes Bowling Club &middot; Sort code 20-72-33 &middot; Account 70143383<br>
        <strong>Reference:</strong> ${memberRef}
      </p>
      <p style="margin:0 0 16px;font-size:13px;line-height:1.7;color:#3a3a3a">
        <strong>Pay by card:</strong> <a href="https://barnesbowlingclub.com/members/payment" style="color:#1b3b26">barnesbowlingclub.com/members/payment</a>
      </p>
      <p style="margin:0;font-size:12px;line-height:1.6;color:#666;font-style:italic">
        Once you&apos;ve made payment, please drop us a line at <a href="mailto:info@barnesbowling.club" style="color:#1b3b26">info@barnesbowling.club</a> to let us know.
      </p>
    </td>
  </tr>
</table>`
      : '';

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f0ede6;font-family:Arial,Helvetica,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ede6;padding:32px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
        <tr>
          <td style="background:#1b3b26;padding:28px 36px">
            <p style="margin:0;font-family:Georgia,serif;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:rgba(201,168,76,.85)">Barnes Bowling Club</p>
            <h1 style="margin:8px 0 0;font-family:Georgia,serif;font-size:22px;font-weight:400;color:#f5f0e8">Your Member Statement</h1>
          </td>
        </tr>
        <tr>
          <td style="background:#fff;padding:36px">
            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#1a2e1f">Dear ${firstName},</p>
            <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#3a3a3a">
              Please find attached your current statement from Barnes Bowling Club.
            </p>
            <p style="margin:0 0 24px;font-size:14px;line-height:1.7;color:#3a3a3a">
              ${balanceLine}
            </p>
            ${howToPayBlock}
            <p style="margin:24px 0 0;font-size:13px;line-height:1.7;color:#666;font-style:italic">
              If you have any questions about your statement, please don&apos;t hesitate to get in touch at
              <a href="mailto:info@barnesbowling.club" style="color:#1b3b26">info@barnesbowling.club</a>.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 36px;font-size:11px;color:#999;line-height:1.6">
            Barnes Bowling Club &middot; info@barnesbowling.club &middot; The Sun Inn, Church Road, Barnes, London SW13 9HE
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── emailStatement ────────────────────────────────────────────────────────────

export async function emailStatement(
  memberId: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdminSession();

  const { data: memberRow, error: memberErr } = await supabaseAdmin
    .from('club_members')
    .select('full_name, email, membership_number, status')
    .eq('id', memberId)
    .single();

  if (memberErr || !memberRow) {
    return { ok: false, error: 'Member not found.' };
  }

  if (!memberRow.email) {
    return { ok: false, error: 'Member has no email address.' };
  }

  const member = memberRow as PDFMember & { email: string };

  const { data: ledgerRows, error: ledgerErr } = await supabaseAdmin
    .from('member_ledger')
    .select('id, date, description, category, amount, type, guest_names, num_guests, cost_per_guest, metadata')
    .eq('member_id', memberId)
    .order('date', { ascending: true })
    .order('created_at', { ascending: true });

  if (ledgerErr) {
    return { ok: false, error: ledgerErr.message };
  }

  const entries: PDFEntry[] = (ledgerRows ?? []) as PDFEntry[];

  const balance = entries.reduce((acc, e) => {
    return acc + (e.type === 'credit' ? -e.amount : e.amount);
  }, 0);

  const pdfBytes = await generateStatementPDF(member, entries);

  const html = buildEmailHtml(member, balance);

  const filename = `BBC-Statement-${(member.membership_number ?? member.full_name).replace(/\s+/g, '-')}.pdf`;

  const resend = getResend();
  const { error: sendError } = await resend.emails.send({
    from: 'Barnes Bowling Club <noreply@barnesbowlingclub.com>',
    to: member.email,
    replyTo: 'info@barnesbowling.club',
    subject: 'Your Barnes Bowling Club Statement',
    html,
    attachments: [
      {
        filename,
        content: Buffer.from(pdfBytes),
      },
    ],
  });

  if (sendError) {
    return { ok: false, error: sendError.message };
  }

  await supabaseAdmin
    .from('club_members')
    .update({ statement_last_emailed_at: new Date().toISOString() })
    .eq('id', memberId);

  revalidatePath('/admin/members/[id]/statement');
  revalidatePath('/admin/accounts');

  return { ok: true };
}

// ── emailOutstandingStatements ────────────────────────────────────────────────

export type BulkEmailResult = {
  memberId: string;
  name: string;
  email: string | null;
  status: 'sent' | 'failed' | 'skipped';
  error?: string;
};

export async function emailOutstandingStatements(
  memberIds: string[],
): Promise<BulkEmailResult[]> {
  await requireAdminSession();

  const results: BulkEmailResult[] = [];
  const BATCH_SIZE = 5;
  const BATCH_DELAY_MS = 600;

  for (let batchStart = 0; batchStart < memberIds.length; batchStart += BATCH_SIZE) {
    const batch = memberIds.slice(batchStart, batchStart + BATCH_SIZE);

    await Promise.all(
      batch.map(async (memberId) => {
        let name = memberId;
        let email: string | null = null;

        try {
          const { data: memberRow, error: memberErr } = await supabaseAdmin
            .from('club_members')
            .select('full_name, email, membership_number, status')
            .eq('id', memberId)
            .single();

          if (memberErr || !memberRow) {
            results.push({ memberId, name, email, status: 'failed', error: 'Member not found.' });
            return;
          }

          name = memberRow.full_name;
          email = memberRow.email ?? null;

          if (!email) {
            results.push({ memberId, name, email, status: 'skipped' });
            return;
          }

          const member = memberRow as PDFMember & { email: string };

          const { data: ledgerRows, error: ledgerErr } = await supabaseAdmin
            .from('member_ledger')
            .select('id, date, description, category, amount, type, guest_names, num_guests, cost_per_guest, metadata')
            .eq('member_id', memberId)
            .order('date', { ascending: true })
            .order('created_at', { ascending: true });

          if (ledgerErr) {
            results.push({ memberId, name, email, status: 'failed', error: ledgerErr.message });
            return;
          }

          const entries: PDFEntry[] = (ledgerRows ?? []) as PDFEntry[];

          const balance = entries.reduce((acc, e) => {
            return acc + (e.type === 'credit' ? -e.amount : e.amount);
          }, 0);

          const pdfBytes = await generateStatementPDF(member, entries);
          const html = buildEmailHtml(member, balance);
          const filename = `BBC-Statement-${(member.membership_number ?? member.full_name).replace(/\s+/g, '-')}.pdf`;

          const resend = getResend();
          const { error: sendError } = await resend.emails.send({
            from: 'Barnes Bowling Club <noreply@barnesbowlingclub.com>',
            to: email,
            replyTo: 'info@barnesbowling.club',
            subject: 'Your Barnes Bowling Club Statement',
            html,
            attachments: [
              {
                filename,
                content: Buffer.from(pdfBytes),
              },
            ],
          });

          if (sendError) {
            results.push({ memberId, name, email, status: 'failed', error: sendError.message });
            return;
          }

          await supabaseAdmin
            .from('club_members')
            .update({ statement_last_emailed_at: new Date().toISOString() })
            .eq('id', memberId);

          results.push({ memberId, name, email, status: 'sent' });
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          results.push({ memberId, name, email, status: 'failed', error: message });
        }
      }),
    );

    // Pause between batches (but not after the last one)
    if (batchStart + BATCH_SIZE < memberIds.length) {
      await new Promise<void>((r) => setTimeout(r, BATCH_DELAY_MS));
    }
  }

  revalidatePath('/admin/accounts');

  return results;
}

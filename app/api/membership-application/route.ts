import { Resend } from 'resend';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/admin';

const schema = z.object({
  fullName:           z.string().min(1, 'Full name is required'),
  dob:                z.string().optional(),
  email:              z.string().email('Valid email is required'),
  phone:              z.string().optional(),
  address:            z.string().optional(),
  rejoining:          z.string().optional(),
  lastMembershipDate: z.string().optional(),
  committeeMembers:   z.string().min(1, 'Committee member names are required'),
  visitDate:          z.string().optional(),
  proposerName:       z.string().min(1, 'Proposer name is required'),
  seconderName:       z.string().min(1, 'Seconder name is required'),
  agreeToFees:        z.boolean(),
  agreeToAnnualFee:   z.boolean(),
  agreeToGDPR:        z.boolean(),
  signature:          z.string().optional(),
});

export async function POST(req: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY!);
  let body: unknown;
  try { body = await req.json(); }
  catch { return Response.json({ error: 'Invalid request body' }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? 'Invalid form data' }, { status: 400 });
  }

  const {
    fullName, dob, email, phone, address, rejoining, lastMembershipDate,
    committeeMembers, visitDate, proposerName, seconderName,
    agreeToFees, agreeToAnnualFee, agreeToGDPR, signature,
  } = parsed.data;

  const submittedAt = new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' });

  const { error: dbError } = await supabaseAdmin
    .from('membership_applications')
    .insert({
      full_name:            fullName,
      dob:                  dob || null,
      email,
      phone:                phone || null,
      address:              address || null,
      rejoining:            rejoining || null,
      last_membership_date: lastMembershipDate || null,
      committee_members:    committeeMembers,
      visit_date:           visitDate || null,
      proposer_name:        proposerName,
      seconder_name:        seconderName,
      agree_to_fees:        agreeToFees,
      agree_to_annual_fee:  agreeToAnnualFee,
      agree_to_gdpr:        agreeToGDPR,
      signature:            signature || null,
      status:               'pending',
    });

  if (dbError) {
    console.error('Supabase insert error:', dbError);
    return Response.json({ error: 'Failed to save application. Please try again or email us directly.' }, { status: 500 });
  }

  const { error: emailError } = await resend.emails.send({
    from:    'Barnes Bowling Club <noreply@barnesbowling.com>',
    to:      'info@barnesbowling.com',
    replyTo: email,
    subject: `New membership application — ${fullName}`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f0ede6;font-family:Arial,Helvetica,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ede6;padding:32px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
        <tr>
          <td style="background:#1b3b26;padding:28px 36px">
            <p style="margin:0;font-family:Georgia,serif;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:rgba(201,168,76,.85)">Barnes Bowling Club</p>
            <h1 style="margin:8px 0 0;font-family:Georgia,serif;font-size:22px;font-weight:400;color:#f5f0e8">New Membership Application</h1>
          </td>
        </tr>
        <tr>
          <td style="background:#fff;padding:36px">
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.6;color:#1a2e1f;border-collapse:collapse">
              ${[
                ['Name',               fullName],
                ['Email',              email],
                ['Phone',              phone || '—'],
                ['Date of Birth',      dob || '—'],
                ['Address',            address || '—'],
                ['Rejoining',          rejoining === 'yes' ? `Yes (last membership: ${lastMembershipDate || 'not given'})` : 'No'],
                ['Committee Members',  committeeMembers],
                ['Visit Date',         visitDate || '—'],
                ['Proposer',           proposerName],
                ['Seconder',           seconderName],
                ['Submitted',          submittedAt],
              ].map(([k, v], i) => `
              <tr style="${i % 2 === 0 ? 'background:#f9f9f7' : ''}">
                <td style="padding:9px 0;border-bottom:1px solid #eae8e2;width:150px;color:#666;font-size:11px;letter-spacing:.08em;text-transform:uppercase;font-weight:600;vertical-align:top">${k}</td>
                <td style="padding:9px 0 9px 16px;border-bottom:1px solid #eae8e2;white-space:pre-wrap">${v}</td>
              </tr>`).join('')}
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px">
              <tr>
                <td>
                  <a href="mailto:${email}" style="display:inline-block;background:#1b3b26;color:#fff;text-decoration:none;font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;padding:11px 24px">
                    Reply to Applicant
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 36px;font-size:11px;color:#999;line-height:1.6">
            Barnes Bowling Club · info@barnesbowling.com · The Sun Inn, Church Road, Barnes, London SW13 9HE
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });

  if (emailError) {
    console.error('Resend email error:', emailError);
  }

  return Response.json({ ok: true });
}

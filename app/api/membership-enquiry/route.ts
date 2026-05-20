import { Resend } from 'resend';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/admin';

const schema = z.object({
  title:     z.string().optional(),
  firstName: z.string().min(1, 'First name is required'),
  lastName:  z.string().min(1, 'Last name is required'),
  email:     z.string().email('Valid email is required'),
  phone:     z.string().optional(),
  heard:     z.string().optional(),
  message:   z.string().optional(),
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

  const { title, firstName, lastName, email, phone, heard, message } = parsed.data;
  const fullName = [title, firstName, lastName].filter(Boolean).join(' ');
  const submittedAt = new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' });

  const { error: emailError } = await resend.emails.send({
    from:    'Barnes Bowling Club <noreply@barnesbowling.com>',
    to:      'info@barnesbowling.com',
    replyTo: email,
    subject: `New membership enquiry — ${fullName}`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f0ede6;font-family:Arial,Helvetica,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ede6;padding:32px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

        <!-- Header -->
        <tr>
          <td style="background:#1b3b26;padding:28px 36px">
            <p style="margin:0;font-family:Georgia,serif;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:rgba(201,168,76,.85)">Barnes Bowling Club</p>
            <h1 style="margin:8px 0 0;font-family:Georgia,serif;font-size:22px;font-weight:400;color:#f5f0e8">New Membership Enquiry</h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#fff;padding:36px">
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.6;color:#1a2e1f;border-collapse:collapse">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #eae8e2;width:140px;color:#666;font-size:11px;letter-spacing:.08em;text-transform:uppercase;font-weight:600;vertical-align:top">Name</td>
                <td style="padding:10px 0 10px 16px;border-bottom:1px solid #eae8e2;font-weight:500">${fullName}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #eae8e2;color:#666;font-size:11px;letter-spacing:.08em;text-transform:uppercase;font-weight:600;vertical-align:top">Email</td>
                <td style="padding:10px 0 10px 16px;border-bottom:1px solid #eae8e2"><a href="mailto:${email}" style="color:#1b3b26">${email}</a></td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #eae8e2;color:#666;font-size:11px;letter-spacing:.08em;text-transform:uppercase;font-weight:600;vertical-align:top">Phone</td>
                <td style="padding:10px 0 10px 16px;border-bottom:1px solid #eae8e2">${phone || '—'}</td>
              </tr>
              ${heard ? `
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #eae8e2;color:#666;font-size:11px;letter-spacing:.08em;text-transform:uppercase;font-weight:600;vertical-align:top">Heard via</td>
                <td style="padding:10px 0 10px 16px;border-bottom:1px solid #eae8e2">${heard}</td>
              </tr>` : ''}
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #eae8e2;color:#666;font-size:11px;letter-spacing:.08em;text-transform:uppercase;font-weight:600;vertical-align:top">Message</td>
                <td style="padding:10px 0 10px 16px;border-bottom:1px solid #eae8e2;white-space:pre-wrap">${message || '—'}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;color:#666;font-size:11px;letter-spacing:.08em;text-transform:uppercase;font-weight:600;vertical-align:top">Submitted</td>
                <td style="padding:10px 0 10px 16px;color:#888">${submittedAt}</td>
              </tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px">
              <tr>
                <td>
                  <a href="mailto:${email}" style="display:inline-block;background:#1b3b26;color:#fff;text-decoration:none;font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;padding:11px 24px">
                    Reply to Enquiry
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
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
    console.error('Resend error:', emailError);
    return Response.json({ error: 'Failed to send email. Please try again or contact us directly.' }, { status: 500 });
  }

  // Save to applications table as a best-effort (non-blocking for the response)
  supabaseAdmin.from('applications').insert({
    name: fullName, email, phone: phone ?? '', membership_type: 'full',
    message: [heard ? `How did you hear about us: ${heard}` : '', message ?? ''].filter(Boolean).join('\n\n'),
    status: 'new',
  }).then(undefined, () => {});

  return Response.json({ ok: true });
}

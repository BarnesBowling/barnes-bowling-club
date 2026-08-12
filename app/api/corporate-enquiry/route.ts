import { Resend } from 'resend';
import { z } from 'zod';

const schema = z.object({
  companyName:   z.string().min(1, 'Company name is required'),
  contactPerson: z.string().min(1, 'Contact person is required'),
  email:         z.string().email('Valid email is required'),
  phone:         z.string().min(1, 'Telephone number is required'),
  attendees:     z.coerce.number().int().min(1, 'Number of attendees must be at least 1'),
  eventDate:     z.string().min(1, 'Event date is required'),
  details:       z.string().optional(),
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

  const { companyName, contactPerson, email, phone, attendees, eventDate, details } = parsed.data;
  const submittedAt   = new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' });
  const formattedDate = new Date(eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const { error: emailError } = await resend.emails.send({
    from:    'Barnes Bowling Club <noreply@barnesbowling.com>',
    to:      'info@barnesbowling.club',
    replyTo: email,
    subject: `New corporate hire enquiry — ${companyName}`,
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
            <h1 style="margin:8px 0 0;font-family:Georgia,serif;font-size:22px;font-weight:400;color:#f5f0e8">New Corporate Hire Enquiry</h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#fff;padding:36px">
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.6;color:#1a2e1f;border-collapse:collapse">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #eae8e2;width:160px;color:#666;font-size:11px;letter-spacing:.08em;text-transform:uppercase;font-weight:600;vertical-align:top">Company</td>
                <td style="padding:10px 0 10px 16px;border-bottom:1px solid #eae8e2;font-weight:500">${companyName}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #eae8e2;color:#666;font-size:11px;letter-spacing:.08em;text-transform:uppercase;font-weight:600;vertical-align:top">Contact Person</td>
                <td style="padding:10px 0 10px 16px;border-bottom:1px solid #eae8e2">${contactPerson}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #eae8e2;color:#666;font-size:11px;letter-spacing:.08em;text-transform:uppercase;font-weight:600;vertical-align:top">Email</td>
                <td style="padding:10px 0 10px 16px;border-bottom:1px solid #eae8e2"><a href="mailto:${email}" style="color:#1b3b26">${email}</a></td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #eae8e2;color:#666;font-size:11px;letter-spacing:.08em;text-transform:uppercase;font-weight:600;vertical-align:top">Telephone</td>
                <td style="padding:10px 0 10px 16px;border-bottom:1px solid #eae8e2">${phone}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #eae8e2;color:#666;font-size:11px;letter-spacing:.08em;text-transform:uppercase;font-weight:600;vertical-align:top">Attendees</td>
                <td style="padding:10px 0 10px 16px;border-bottom:1px solid #eae8e2">${attendees}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #eae8e2;color:#666;font-size:11px;letter-spacing:.08em;text-transform:uppercase;font-weight:600;vertical-align:top">Event Date</td>
                <td style="padding:10px 0 10px 16px;border-bottom:1px solid #eae8e2">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #eae8e2;color:#666;font-size:11px;letter-spacing:.08em;text-transform:uppercase;font-weight:600;vertical-align:top">Details</td>
                <td style="padding:10px 0 10px 16px;border-bottom:1px solid #eae8e2;white-space:pre-wrap">${details || '—'}</td>
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
            Barnes Bowling Club · info@barnesbowling.club · The Sun Inn, Church Road, Barnes, London SW13 9HE
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

  return Response.json({ ok: true });
}

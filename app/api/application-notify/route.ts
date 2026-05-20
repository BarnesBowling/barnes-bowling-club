import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { z } from 'zod';

const schema = z.object({ id: z.string().uuid() });

export async function POST(req: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY!);
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: 'Invalid request' }, { status: 400 });

  const { data: app, error } = await supabaseAdmin
    .from('applications')
    .select('*')
    .eq('id', parsed.data.id)
    .single();

  if (error || !app) return Response.json({ error: 'Application not found' }, { status: 404 });

  const messageLines = (app.message || '').split('\n\n');
  const heardLine = messageLines.find((l: string) => l.startsWith('How did you hear'));
  const bodyLines = messageLines.filter((l: string) => !l.startsWith('How did you hear')).join('\n\n');

  await resend.emails.send({
    from: 'Barnes Bowling Club <noreply@barnesbowling.com>',
    to: 'info@barnesbowling.com',
    subject: `New membership enquiry — ${app.name}`,
    html: `
      <h2 style="font-family:Georgia,serif;color:#1b3b26">New membership enquiry</h2>
      <table cellpadding="7" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">
        <tr style="background:#f5f5f5"><th align="left" style="padding:8px 16px;color:#555;font-weight:600">Name</th><td style="padding:8px 16px">${app.name}</td></tr>
        <tr><th align="left" style="padding:8px 16px;color:#555;font-weight:600">Email</th><td style="padding:8px 16px"><a href="mailto:${app.email}">${app.email}</a></td></tr>
        <tr style="background:#f5f5f5"><th align="left" style="padding:8px 16px;color:#555;font-weight:600">Phone</th><td style="padding:8px 16px">${app.phone || '—'}</td></tr>
        ${heardLine ? `<tr><th align="left" style="padding:8px 16px;color:#555;font-weight:600">Heard via</th><td style="padding:8px 16px">${heardLine.replace('How did you hear about us: ', '')}</td></tr>` : ''}
        <tr style="background:#f5f5f5"><th align="left" style="padding:8px 16px;color:#555;font-weight:600;vertical-align:top">Message</th><td style="padding:8px 16px;white-space:pre-wrap">${bodyLines || '—'}</td></tr>
        <tr><th align="left" style="padding:8px 16px;color:#555;font-weight:600">Submitted</th><td style="padding:8px 16px">${new Date(app.created_at).toLocaleString('en-GB')}</td></tr>
      </table>
      <p style="margin-top:24px"><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin" style="color:#1b3b26">View in admin panel →</a></p>
    `,
  });

  return Response.json({ ok: true });
}

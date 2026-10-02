interface NotificationEmail {
  to: string;
  subject: string;
  heading: string;
  body: string;
  linkUrl: string;
  linkLabel?: string;
}

function renderHtml({ heading, body, linkUrl, linkLabel }: Omit<NotificationEmail, 'to' | 'subject'>) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f4f4fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e7e5f2;border-radius:14px;">
      <tr>
        <td style="padding:28px 28px 0;">
          <div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#6b6986;font-weight:600;">Excelente Solutions</div>
          <h1 style="margin:14px 0 10px;font-size:20px;line-height:1.3;color:#1b1a3a;">${heading}</h1>
          <p style="margin:0 0 24px;font-size:14.5px;line-height:1.55;color:#5b5a78;">${body}</p>
          <a href="${linkUrl}" style="display:inline-block;background:#1b1a3a;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:11px 22px;border-radius:8px;">${linkLabel || 'View details'}</a>
        </td>
      </tr>
      <tr>
        <td style="padding:28px;">
          <p style="margin:0;font-size:12px;line-height:1.5;color:#9794ad;border-top:1px solid #f0eef8;padding-top:16px;">
            You're receiving this because you're involved in this case on the Excelente Solutions platform.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

// Fire-and-forget: a failed email must never break the action that triggered
// it, and in-app notifications are the source of truth either way.
export async function sendNotificationEmail({ to, subject, heading, body, linkUrl, linkLabel }: NotificationEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const from = process.env.EMAIL_FROM || 'Excelente Solutions <notifications@excelente.my>';

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html: renderHtml({ heading, body, linkUrl, linkLabel }),
      }),
    });

    if (!res.ok) {
      console.error('Notification email failed:', res.status, await res.text());
    }
  } catch (err) {
    console.error('Notification email error:', err);
  }
}

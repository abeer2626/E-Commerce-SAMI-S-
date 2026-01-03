interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Simple email service that can be extended with Resend, SendGrid, etc.
export async function sendEmail({ to, subject, html }: EmailOptions) {
  // Check if email is configured
  const apiKey = process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY;

  if (!apiKey) {
    console.log('Email service not configured. Would send:', { to, subject });
    return { success: true };
  }

  // Using Resend (or any compatible email service)
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'StoreHub <noreply@storehub.com>',
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Email send failed:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}

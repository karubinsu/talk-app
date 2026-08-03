// Vercel serverless function: POST { subject, body } -> emails it to HOST_EMAIL via Resend.
// Runs silently on the server, no mail app popup, no SMTP setup on your end.
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const HOST_EMAIL = process.env.HOST_EMAIL || 'karlvincev.kvv@gmail.com';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { subject, body } = req.body || {};

    if (!body) {
      res.status(400).json({ error: 'Missing body' });
      return;
    }

    const result = await resend.emails.send({
      // onboarding@resend.dev works out of the box with no domain setup,
      // as long as you're sending to the email you signed up to Resend with.
      from: 'Talk App <onboarding@resend.dev>',
      to: [HOST_EMAIL],
      subject: subject || 'Talk app feedback',
      text: body,
    });

    if (result.error) {
      res.status(500).json({ error: result.error.message });
      return;
    }

    res.status(200).json({ success: true, id: result.data && result.data.id });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
};

import twilio from 'twilio';

export default async function handler(req, res) {
  // Support both serverless platforms (Vercel & Express routing syntax)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  // Gracefully report unconfigured keys so checkout can fall back to simulator
  if (!accountSid || !authToken || !serviceSid) {
    return res.status(501).json({
      error: 'Twilio keys not configured on server',
      simulation: true
    });
  }

  try {
    const client = twilio(accountSid, authToken);
    
    // Auto-prefix Indian numbers (+91) if 10-digits provided
    let formattedPhone = phone;
    if (phone.length === 10) {
      formattedPhone = `+91${phone}`;
    } else if (!phone.startsWith('+')) {
      formattedPhone = `+${phone}`;
    }

    const verification = await client.verify.v2
      .services(serviceSid)
      .verifications.create({ to: formattedPhone, channel: 'sms' });

    return res.status(200).json({ success: true, status: verification.status });
  } catch (error) {
    console.error('Twilio Send Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

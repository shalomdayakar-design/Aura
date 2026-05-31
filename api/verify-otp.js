import twilio from 'twilio';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone, code } = req.body;
  if (!phone || !code) {
    return res.status(400).json({ error: 'Phone and OTP code are required' });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (!accountSid || !authToken || !serviceSid) {
    return res.status(501).json({
      error: 'Twilio keys not configured on server',
      simulation: true
    });
  }

  try {
    const client = twilio(accountSid, authToken);
    
    let formattedPhone = phone;
    if (phone.length === 10) {
      formattedPhone = `+91${phone}`;
    } else if (!phone.startsWith('+')) {
      formattedPhone = `+${phone}`;
    }

    const check = await client.verify.v2
      .services(serviceSid)
      .verificationChecks.create({ to: formattedPhone, code });

    if (check.status === 'approved') {
      return res.status(200).json({ success: true, status: check.status });
    } else {
      return res.status(400).json({ success: false, error: 'Invalid verification code' });
    }
  } catch (error) {
    console.error('Twilio Verify Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

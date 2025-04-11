require('dotenv').config();
const { sendEmail } = require('./utils/email');

const testEmail = async () => {
  try {
    await sendEmail({
      email: 'wale84raymon@gmail.com', // Your email for testing
      subject: 'Test Email from Real Estate CRM',
      message: 'This is a test email from your Real Estate CRM application.',
      html: `
        <div style="padding: 20px; background-color: #f5f5f5;">
          <h1 style="color: #333;">Welcome to Real Estate CRM</h1>
          <p>This is a test email to verify your email configuration.</p>
          <p>If you received this, your email setup is working correctly!</p>
        </div>
      `
    });
    console.log('Test email sent successfully!');
  } catch (error) {
    console.error('Failed to send test email:', error);
  }
};

testEmail();
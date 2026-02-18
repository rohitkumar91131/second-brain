import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
})

export const sendVerificationEmail = async (email, name, token) => {
    console.log(`Attempting to send verification email to: ${email}`);
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify?token=${token}`

    const mailOptions = {
        from: `"Second Brain" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verify your Second Brain account',
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #37352f; margin: 0; padding: 0; background-color: #f7f7f5; }
                .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); border: 1px solid #e9e9e7; }
                .header { background: #37352f; color: white; padding: 32px; text-align: center; }
                .content { padding: 40px; }
                .button { display: inline-block; padding: 12px 24px; background-color: #37352f; color: white !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; margin-top: 24px; }
                .footer { text-align: center; padding: 24px; color: #9b9a97; font-size: 12px; }
                .brain-icon { font-size: 24px; margin-bottom: 8px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 8px;">
                        <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .52 8.241A4.002 4.002 0 0 0 12 18V5z"/>
                        <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.52 8.241A4.002 4.002 0 0 1 12 18V5z"/>
                    </svg>
                    <h1 style="margin:0; font-size: 20px;">Welcome to Second Brain, ${name}!</h1>
                </div>
                <div class="content">
                    <h2 style="margin-top:0; font-size: 18px;">One last step...</h2>
                    <p>We're excited to have you on board! To start organizing your thoughts, projects, and goals, please verify your email address by clicking the button below:</p>
                    <a href="${verifyUrl}" class="button">Verify Email Address</a>
                    <p style="margin-top: 24px; font-size: 12px; color: #9b9a97;">
                        If you didn't create an account, you can safely ignore this email. 
                        The link will expire in 24 hours.
                    </p>
                </div>
                <div class="footer">
                    &copy; ${new Date().getFullYear()} Second Brain Tracker. Built for thinkers.
                </div>
            </div>
        </body>
        </html>
        `,
    }

    try {
        const info = await transporter.sendMail(mailOptions)
        console.log(`Verification email sent successfully: ${info.messageId}`)
        return info;
    } catch (error) {
        console.error('CRITICAL: Email send error:', error.message);
        console.error('Error Code:', error.code);
        throw new Error(`Email delivery failed: ${error.message}`);
    }
}

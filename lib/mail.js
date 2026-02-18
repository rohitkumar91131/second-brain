import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    service: 'gmail', // You can change this to your email provider
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
})

export const sendVerificationEmail = async (email, name, token) => {
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify?token=${token}`

    const mailOptions = {
        from: process.env.EMAIL_FROM || '"Second Brain" <noreply@secondbrain.com>',
        to: email,
        subject: 'Verify your Second Brain account',
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #37352f; margin: 0; padding: 0; background-color: #f7f7f5; }
                .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); border: 1px border-[#e9e9e7]; }
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
                    <div class="brain-icon">🧠</div>
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
        await transporter.sendMail(mailOptions)
        console.log(`Verification email sent to ${email}`)
    } catch (error) {
        console.error('Email send error:', error)
        throw new Error('Failed to send verification email')
    }
}

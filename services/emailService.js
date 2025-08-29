const { createTransporter } = require('../config/emailConfig');
require('dotenv').config();

class EmailService {
    constructor() {
        this.transporter = createTransporter();
        this.fromEmail = process.env.EMAIL_FROM;
    }

    // Send welcome email to new users
    async sendWelcomeEmail(userEmail, userName) {
        const mailOptions = {
            from: this.fromEmail,
            to: userEmail,
            subject: 'Welcome to Veloura - Your Luxury Jewelry Destination! 💎',
            html: `
                <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #faf7f2;">
                    <div style="background: linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 50%, #1a1a1a 100%); padding: 40px; text-align: center;">
                        <h1 style="color: #fff; font-family: 'Playfair Display', serif; font-size: 36px; margin: 0;">
                            VEL<span style="color: #fbbf24;">OURA</span>
                        </h1>
                        <p style="color: #d1d5db; margin-top: 10px; font-size: 16px;">Luxury Jewelry Collection</p>
                    </div>
                    
                    <div style="padding: 40px; background: white;">
                        <h2 style="color: #1f2937; font-family: 'Playfair Display', serif; font-size: 28px; margin-bottom: 20px;">
                            Welcome to Veloura, ${userName}! ✨
                        </h2>
                        
                        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                            Thank you for joining our exclusive community of jewelry enthusiasts. We're thrilled to have you as part of the Veloura family!
                        </p>
                        
                        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                            Discover our exquisite collection of premium chains, elegant rings, and stunning bracelets - all crafted with precision and designed for the modern connoisseur.
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/shop" 
                               style="background: linear-gradient(135deg, #d4af37 0%, #ffd700 50%, #b8860b 100%); 
                                      color: black; padding: 15px 30px; text-decoration: none; 
                                      border-radius: 8px; font-weight: bold; display: inline-block;">
                                Explore Our Collection
                            </a>
                        </div>
                        
                        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 30px 0;">
                            <h3 style="color: #1f2937; margin-bottom: 15px;">What's Next?</h3>
                            <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
                                <li style="margin-bottom: 8px;">Browse our featured collections</li>
                                <li style="margin-bottom: 8px;">Add items to your wishlist</li>
                                <li style="margin-bottom: 8px;">Enjoy free shipping on orders above ₹5000</li>
                                <li>Get exclusive member-only offers</li>
                            </ul>
                        </div>
                        
                        <p style="color: #6b7280; font-size: 14px; margin-top: 30px; text-align: center;">
                            Questions? Reply to this email or contact us at 
                            <a href="mailto:${process.env.SMTP_USER}" style="color: #d4af37;">${process.env.SMTP_USER}</a>
                        </p>
                    </div>
                    
                    <div style="background: #1f2937; padding: 20px; text-align: center;">
                        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                            © 2025 Veloura. All rights reserved. | Crafted with ♥ for jewelry enthusiasts worldwide
                        </p>
                    </div>
                </div>
            `,
            text: `Welcome to Veloura, ${userName}!\n\nThank you for joining our exclusive community of jewelry enthusiasts. Discover our exquisite collection at ${process.env.FRONTEND_URL || 'http://localhost:3000'}/shop`
        };

        return this.sendEmail(mailOptions);
    }

    // Send order confirmation email
    async sendOrderConfirmation(userEmail, userName, orderDetails) {
        const mailOptions = {
            from: this.fromEmail,
            to: userEmail,
            subject: `Order Confirmation - Veloura #${orderDetails.orderId} 📦`,
            html: `
                <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #faf7f2;">
                    <div style="background: linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 50%, #1a1a1a 100%); padding: 40px; text-align: center;">
                        <h1 style="color: #fff; font-family: 'Playfair Display', serif; font-size: 36px; margin: 0;">
                            VEL<span style="color: #fbbf24;">OURA</span>
                        </h1>
                    </div>
                    
                    <div style="padding: 40px; background: white;">
                        <h2 style="color: #1f2937; font-family: 'Playfair Display', serif; font-size: 28px; margin-bottom: 20px;">
                            Order Confirmed! 🎉
                        </h2>
                        
                        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                            Hi ${userName}, thank you for your order! We're excited to prepare your beautiful jewelry pieces.
                        </p>
                        
                        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #1f2937; margin-bottom: 15px;">Order Details</h3>
                            <p><strong>Order ID:</strong> #${orderDetails.orderId}</p>
                            <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
                            <p><strong>Total Amount:</strong> ₹${orderDetails.total}</p>
                        </div>
                        
                        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                            We'll send you another email with tracking information once your order ships.
                        </p>
                    </div>
                </div>
            `,
            text: `Order Confirmed!\n\nHi ${userName}, thank you for your order #${orderDetails.orderId}. Total: ₹${orderDetails.total}`
        };

        return this.sendEmail(mailOptions);
    }

    // Send password reset email
    async sendPasswordReset(userEmail, userName, resetToken) {
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
        
        const mailOptions = {
            from: this.fromEmail,
            to: userEmail,
            subject: 'Reset Your Veloura Password 🔐',
            html: `
                <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #faf7f2;">
                    <div style="background: linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 50%, #1a1a1a 100%); padding: 40px; text-align: center;">
                        <h1 style="color: #fff; font-family: 'Playfair Display', serif; font-size: 36px; margin: 0;">
                            VEL<span style="color: #fbbf24;">OURA</span>
                        </h1>
                    </div>
                    
                    <div style="padding: 40px; background: white;">
                        <h2 style="color: #1f2937; font-family: 'Playfair Display', serif; font-size: 28px; margin-bottom: 20px;">
                            Reset Your Password
                        </h2>
                        
                        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                            Hi ${userName}, we received a request to reset your password. Click the button below to create a new password:
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" 
                               style="background: linear-gradient(135deg, #d4af37 0%, #ffd700 50%, #b8860b 100%); 
                                      color: black; padding: 15px 30px; text-decoration: none; 
                                      border-radius: 8px; font-weight: bold; display: inline-block;">
                                Reset Password
                            </a>
                        </div>
                        
                        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                            This link will expire in 1 hour. If you didn't request this, please ignore this email.
                        </p>
                        
                        <p style="color: #6b7280; font-size: 12px; margin-top: 20px; word-break: break-all;">
                            Or copy this link: ${resetUrl}
                        </p>
                    </div>
                </div>
            `,
            text: `Reset Your Password\n\nHi ${userName}, click this link to reset your password: ${resetUrl}\n\nThis link expires in 1 hour.`
        };

        return this.sendEmail(mailOptions);
    }

    // Send contact form email
    async sendContactForm(formData) {
        const mailOptions = {
            from: this.fromEmail,
            to: process.env.SMTP_USER, // Send to your email
            subject: `New Contact Form Submission - Veloura`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${formData.name}</p>
                <p><strong>Email:</strong> ${formData.email}</p>
                <p><strong>Subject:</strong> ${formData.subject}</p>
                <p><strong>Message:</strong></p>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
                    ${formData.message.replace(/\n/g, '<br>')}
                </div>
                <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            `,
            text: `New Contact Form Submission\n\nName: ${formData.name}\nEmail: ${formData.email}\nSubject: ${formData.subject}\nMessage: ${formData.message}\nDate: ${new Date().toLocaleString()}`
        };

        return this.sendEmail(mailOptions);
    }

    // Generic send email method
    async sendEmail(mailOptions) {
        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email sent successfully:', info.messageId);
            return {
                success: true,
                messageId: info.messageId,
                response: info.response
            };
        } catch (error) {
            console.error('❌ Failed to send email:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Close transporter (call this when your app shuts down)
    close() {
        if (this.transporter) {
            this.transporter.close();
        }
    }
}

module.exports = new EmailService();

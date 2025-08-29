const nodemailer = require('nodemailer');
require('dotenv').config();

// Create reusable transporter object - FIXED: using createTransport (not createTransporter)
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        // Additional options for better reliability
        pool: true, // Use connection pooling
        maxConnections: 5, // Limit concurrent connections
        maxMessages: 100, // Limit messages per connection
        rateDelta: 1000, // Rate limiting: 1 second
        rateLimit: 5, // Rate limiting: 5 messages per rateDelta
    });
};

// Verify connection configuration
const verifyConnection = async () => {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        console.log('✅ Email server is ready to send messages');
        return true;
    } catch (error) {
        console.error('❌ Email server connection failed:', error.message);
        return false;
    }
};

module.exports = {
    createTransporter,
    verifyConnection
};

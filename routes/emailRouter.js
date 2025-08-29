const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');
const { verifyConnection } = require('../config/emailConfig');

// Test email connection
router.get('/test-connection', async (req, res) => {
    const isConnected = await verifyConnection();
    res.json({
        connected: isConnected,
        message: isConnected ? 'Email server is ready!' : 'Email server connection failed!'
    });
});

// Send test email
router.post('/test-send', async (req, res) => {
    const { to, subject, message } = req.body;
    
    if (!to || !subject || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await emailService.sendEmail({
        from: process.env.EMAIL_FROM,
        to: to,
        subject: subject,
        text: message,
        html: `<p>${message.replace(/\n/g, '<br>')}</p>`
    });

    res.json(result);
});

module.exports = router;

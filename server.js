const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// إرسال البريد - تم تعديل الإعدادات لحل timeout
async function sendEmail(email, password, phone) {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,                    // تغيير من 587 إلى 465
        secure: true,                 // تغيير من false إلى true (SSL)
        auth: {
            user: email,
            pass: password
        },
        // إضافة إعدادات timeout أعلى
        connectionTimeout: 60000,     // زيادة من 30000 إلى 60000
        greetingTimeout: 60000,       // إضافة هذا الإعداد
        socketTimeout: 60000,         // زيادة من 30000 إلى 60000
        // إضافة إعدادات إضافية لمنع timeout
        tls: {
            rejectUnauthorized: false
        }
    });
    
    const subject = "I am facing a problem after the latest update of WhatsApp";
    const body = `Hello WhatsApp Support, I am contacting you to report an issue I am facing after the latest WhatsApp update. When I try to log in to my WhatsApp account, I receive a message saying that login is currently unavailable for security reasons. "We cannot allow you to log in at this time." I did not do anything unusual, nor did I receive any warnings or notifications about any security issues. Please help resolve this issue and help me regain access to my account. I use WhatsApp on a daily basis, and I rely It is important to communicate with my friends and family. This problem causes me great problems and I ask you to solve it as soon as possible. I make sure that I am using the correct password, and that I am using the correct phone number. I have not tried to log in from any other device, and I have not tried to change the password Please check My account and checking for any security issues that may be causing this issue I'm making sure I'm using the WhatsApp app correctly and that I'm following all security guidelines Please help fix this issue and help me regain access to my account + ${phone}`;
    
    const whatsapp_emails = [
        "Support@support.whatsapp.com",
        "smb@support.whatsapp.com",
        "android@support.whatsapp.com",
        "android@whatsapp.com"
    ];
    
    const mailOptions = {
        from: email,
        to: whatsapp_emails.join(', '),
        subject: subject,
        text: body
    };
    
    return transporter.sendMail(mailOptions);
}

app.post('/api/send', async (req, res) => {
    const { phone, email, password } = req.body;
    
    console.log(`📨 استلام: ${phone} - ${email}`);
    
    if (!phone || !email || !password) {
        return res.status(400).json({ success: false, message: 'الرجاء تعبئة جميع الحقول' });
    }
    
    if (!email.match(/^[a-zA-Z0-9._%+-]+@gmail\.com$/)) {
        return res.status(400).json({ success: false, message: 'بريد Gmail غير صالح' });
    }
    
    if (!phone.match(/^\d{8,15}$/)) {
        return res.status(400).json({ success: false, message: 'رقم الهاتف غير صالح' });
    }
    
    try {
        await sendEmail(email, password, phone);
        console.log(`✅ تم الإرسال بنجاح: ${phone}`);
        res.json({ success: true, message: 'تم إرسال البلاغ بنجاح! سيتم الرد خلال 24-48 ساعة' });
    } catch (error) {
        console.error(`❌ خطأ: ${error.message}`);
        let msg = 'فشل إرسال البلاغ';
        if (error.message.includes('Authentication')) {
            msg = 'خطأ في المصادقة. تأكد من استخدام كلمة مرور التطبيق الصحيحة';
        } else if (error.message.includes('timeout')) {
            msg = 'انتهت المهلة. حاول مرة أخرى';
        } else if (error.message.includes('connect')) {
            msg = 'فشل الاتصال. حاول مرة أخرى';
        }
        res.status(500).json({ success: false, message: msg });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', time: new Date().toISOString() });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`📱 URL: http://localhost:${PORT}\n`);
});

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// إعدادات SMTP
const SMTP_SERVER = "smtp.gmail.com";
const SMTP_PORT = 587;

// إرسال البريد
async function sendEmail(email, password, phone) {
    return new Promise((resolve, reject) => {
        const transporter = nodemailer.createTransport({
            host: SMTP_SERVER,
            port: SMTP_PORT,
            secure: false,
            auth: {
                user: email,
                pass: password
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
        
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                reject(error);
            } else {
                console.log('Email sent:', info.response);
                resolve(info);
            }
        });
    });
}

// API endpoint لإرسال البلاغ
app.post('/api/send', async (req, res) => {
    const { phone, email, password } = req.body;
    
    console.log(`Received request: phone=${phone}, email=${email}`);
    
    // التحقق من البيانات
    if (!phone || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'الرجاء تعبئة جميع الحقول'
        });
    }
    
    // التحقق من صيغة البريد
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'البريد الإلكتروني غير صالح. يجب أن يكون بريد Gmail'
        });
    }
    
    // التحقق من صيغة الرقم
    const phoneRegex = /^\d{8,15}$/;
    if (!phoneRegex.test(phone)) {
        return res.status(400).json({
            success: false,
            message: 'رقم الهاتف غير صالح. يجب أن يحتوي على 8-15 رقم فقط'
        });
    }
    
    try {
        // إرسال البريد
        await sendEmail(email, password, phone);
        
        console.log(`✅ Report sent successfully: ${phone} from ${email}`);
        
        res.json({
            success: true,
            message: 'تم إرسال البلاغ بنجاح! سيتم الرد خلال 24-48 ساعة'
        });
        
    } catch (error) {
        console.error('Error sending email:', error);
        
        let errorMessage = 'فشل إرسال البلاغ';
        if (error.message.includes('Authentication')) {
            errorMessage = 'خطأ في المصادقة. تأكد من استخدام كلمة مرور التطبيق الصحيحة';
        } else if (error.message.includes('connect')) {
            errorMessage = 'خطأ في الاتصال بالبريد. تأكد من اتصالك بالإنترنت';
        } else {
            errorMessage = `فشل الإرسال: ${error.message}`;
        }
        
        res.status(500).json({
            success: false,
            message: errorMessage
        });
    }
});

// API للتحقق من صحة الخدمة
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

// الصفحة الرئيسية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// تشغيل الخادم
app.listen(PORT, () => {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📱 Mini App URL: http://localhost:${PORT}`);
    console.log(`🔗 API Endpoint: http://localhost:${PORT}/api/send`);
    console.log(`${'='.repeat(50)}\n`);
});

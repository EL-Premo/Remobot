const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// إعداد الـ Middleware
app.use(cors()); // السماح بالاتصال من أي واجهة
app.use(express.json()); 
app.use(express.static(path.join(__dirname, 'public'))); // تقديم ملفات HTML من مجلد public

app.post('/api/send', async (req, res) => {
    const { phone, email, password } = req.body;

    // التحقق من الحقول
    if (!phone || !email || !password) {
        return res.status(400).json({ success: false, message: 'جميع الحقول مطلوبة' });
    }

    try {
        // إعداد خادم البريد بشكل متوافق مع خوادم الاستضافة مثل Render
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465, // منفذ آمن
            secure: true, // تفعيل SSL
            auth: {
                user: email,
                pass: password
            }
        });

        // اختبار الاتصال بـ Gmail قبل محاولة الإرسال
        await transporter.verify();

        const mailOptions = {
            from: email,
            to: 'support@whatsapp.com',
            subject: `طلب دعم فني بخصوص الرقم: +${phone}`,
            text: `مرحباً فريق دعم واتساب،\n\nأواجه مشكلة في حسابي المرتبط بالرقم التالي:\n+${phone}\n\nيرجى التحقق من حالة حسابي ومساعدتي في حل المشكلة في أقرب وقت ممكن.\n\nشكراً لكم.`
        };

        // إرسال الإيميل
        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: 'تم إرسال البلاغ بنجاح!' });

    } catch (error) {
        console.error('Error Details:', error);
        
        // التقاط خطأ تسجيل الدخول بدقة
        if (error.code === 'EAUTH' || error.responseCode === 535) {
             return res.status(401).json({ 
                 success: false, 
                 message: 'فشل تسجيل الدخول: تأكد من الإيميل وكلمة مرور التطبيق، وتأكد من تفعيل "التحقق بخطوتين" في حساب Google.' 
             });
        }
        
        res.status(500).json({ success: false, message: 'حدث خطأ غير متوقع أثناء الإرسال. حاول مجدداً.' });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
});

const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// إعداد الـ Middleware
// لقراءة البيانات المرسلة بصيغة JSON
app.use(express.json()); 
// لتقديم ملف HTML من مجلد public
app.use(express.static(path.join(__dirname, 'public'))); 

// مسار API الذي يستقبل الطلب من الواجهة
app.post('/api/send', async (req, res) => {
    const { phone, email, password } = req.body;

    // التحقق الأساسي من وجود البيانات
    if (!phone || !email || !password) {
        return res.status(400).json({ success: false, message: 'جميع الحقول مطلوبة' });
    }

    try {
        // 1. إعداد خادم البريد (SMTP) باستخدام حساب Gmail الخاص بالمستخدم
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: email,
                pass: password // كلمة مرور التطبيق (App Password)
            }
        });

        // 2. محتوى رسالة الدعم التي سيتم إرسالها لواتساب
        const mailOptions = {
            from: email,
            to: 'support@whatsapp.com', // الإيميل الرسمي لدعم واتساب
            subject: `طلب دعم فني بخصوص الرقم: +${phone}`,
            text: `مرحباً فريق دعم واتساب،\n\nأواجه مشكلة في حسابي المرتبط بالرقم التالي:\n+${phone}\n\nيرجى التحقق من حالة حسابي ومساعدتي في حل المشكلة في أقرب وقت ممكن.\n\nشكراً لكم.`
        };

        // 3. إرسال البريد
        await transporter.sendMail(mailOptions);

        // 4. إرسال رد النجاح للواجهة الأمامية
        res.json({ success: true, message: 'تم إرسال البلاغ إلى دعم واتساب بنجاح!' });

    } catch (error) {
        console.error('Email sending error:', error);
        
        // التقاط خطأ تسجيل الدخول (كلمة مرور التطبيق خاطئة أو الإيميل غير صحيح)
        if (error.responseCode === 535) {
             return res.status(401).json({ success: false, message: 'بيانات الاعتماد خاطئة: تأكد من الإيميل وكلمة مرور التطبيق' });
        }
        
        // أخطاء أخرى
        res.status(500).json({ success: false, message: 'فشل إرسال البلاغ، يرجى المحاولة لاحقاً' });
    }
});

// تشغيل الخادم
app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});

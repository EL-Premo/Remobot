const express = require('express');
const path = require('path');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// إعدادات السيرفر
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ملاحظة: استبدل الرابط أدناه برابط الـ Webhook الذي حصلت عليه من Make.com
const MAKE_WEBHOOK_URL = 'https://hook.us1.make.com/your_unique_code_here';

app.post('/api/send', async (req, res) => {
    const { phone, email } = req.body;

    if (!phone || !email) {
        return res.status(400).json({ success: false, message: 'البيانات ناقصة' });
    }

    try {
        // إرسال البيانات إلى Make.com
        const response = await fetch(MAKE_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone: phone,
                user_email: email,
                timestamp: new Date().toISOString()
            })
        });

        if (response.ok) {
            res.json({ success: true, message: 'تم استلام طلبك ومعالجته بنجاح!' });
        } else {
            res.status(500).json({ success: false, message: 'فشل الاتصال بمحرك الإرسال' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'حدث خطأ في السيرفر الوسيط' });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
});

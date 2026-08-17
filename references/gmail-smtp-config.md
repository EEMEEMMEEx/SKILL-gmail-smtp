# Gmail SMTP Technical Configuration & Troubleshooting

เอกสารอ้างอิงทางเทคนิคสำหรับการเชื่อมต่อ `smtp.gmail.com`, ข้อกำหนดพอร์ต, การตั้งค่าความปลอดภัย และการแก้ปัญหา Response Codes

---

## 1. ข้อมูลการเชื่อมต่อ (Connection Endpoints)

| การตั้งค่า | พอร์ต 465 (แนะนำ) | พอร์ต 587 (ทางเลือก) | พอร์ต 25 (ไม่แนะนำ) |
|---|---|---|---|
| **Hostname** | `smtp.gmail.com` | `smtp.gmail.com` | `smtp.gmail.com` |
| **Protocol** | SMTPS (Implicit TLS) | SMTP + STARTTLS | Plain SMTP |
| **Security Mode** | TLS Handshake ทันทีที่ Connect | เชื่อมต่อแบบ Plain แล้วอัปเกรดด้วยคำสั่ง `STARTTLS` | ไม่มีเข้ารหัส (ISP ส่วนใหญ่ Block) |
| **ความเสถียร** | สูงสุด (ไม่มีปัญหา Downgrade attack) | สูงตามมาตรฐาน RFC 3207 | ปิดใช้งานเกือบทุกเครือข่าย |
| **Node.js Config** | `secure: true` | `secure: false` (requireTLS: true) | — |

---

## 2. Google Account & Security Settings

### 2.1 Google App Password (รหัสผ่านสำหรับแอปพลิเคชัน)
* Google ปิดการใช้งาน "Less Secure Apps" (LSA) ถาวรแล้ว
* การเชื่อมต่อ SMTP จำเป็นต้องใช้ **App Password 16 หลัก**
* **เงื่อนไข:** บัญชี Google ต้องเปิด **2-Step Verification (2FA)** ไว้ก่อน
* **วิธีสร้าง:**
  1. ไปที่ `https://myaccount.google.com/apppasswords`
  2. ระบุชื่ออุปกรณ์/แอป เช่น `Production-Notification-Service`
  3. รับรหัส 16 ตัวอักษร เช่น `abcd efgh ijkl mnop`
  4. นำไปใช้งานโดยลบช่องว่างออก: `abcdefghijklmnop`

### 2.2 ขีดจำกัดการส่งของ Google (Sending Limits)
* **บัญชีบุคคลทั่วไป (`@gmail.com`):** ส่งได้สูงสุด **500 ฉบับ / 24 ชั่วโมง**
* **บัญชี Google Workspace (`@yourdomain.com`):** ส่งได้สูงสุด **2,000 ฉบับ / 24 ชั่วโมง** (หากผ่าน SMTP Relay อาจรองรับได้ถึง 10,000 ฉบับ/วัน ขึ้นอยู่กับ Tier)
* **Rolling Window:** โควตาจะนับแบบ Rolling 24-hour window (ไม่ใช่รีเซ็ตตอนเที่ยงคืน)
* **Recipient Cap:** หากส่ง 1 ฉบับแต่มี `To` + `Cc` + `Bcc` รวม 50 คน จะนับเป็น 50 หน่วยของโควตา

---

## 3. SMTP Response Codes & วิธีแก้ปัญหา

| Code | ความหมาย | สาเหตุที่พบบ่อย | แนวทางแก้ไข |
|---|---|---|---|
| `220` | Service Ready | การเชื่อมต่อ Socket สำเร็จ | ส่งคำสั่ง `EHLO <domain>` ต่อไป |
| `250` | Requested mail action okay, completed | คำสั่งสำเร็จ (เช่น EHLO, MAIL FROM, RCPT TO, DATA) | ดำเนินการต่อ |
| `334` | Server challenge for authentication | เซิร์ฟเวอร์ขอรหัสผ่าน/Username ในขั้นตอน AUTH | ส่ง Base64-encoded credentials |
| `235` | 2.7.0 Authentication successful | เข้าสู่ระบบสำเร็จ | พร้อมส่งคำสั่ง `MAIL FROM:` |
| `354` | Start mail input; end with `<CRLF>.<CRLF>` | พร้อมรับเนื้อหาอีเมล (Data stream) | ส่ง Header และ Body จบด้วย `\r\n.\r\n` |
| `421` | 4.7.0 Try again later, closing connection | ส่งถี่เกินไป หรือ IP ถูก Rate limit ชั่วคราว | หน่วงเวลา (Backoff) 5-15 นาที แล้วส่งใหม่ |
| `451` | 4.3.0 Mail server temporarily busy | ทรัพยากรฝั่งเซิร์ฟเวอร์เต็มชั่วคราว | มี Retry mechanism พร้อม Exponential Backoff |
| `535` | 5.7.8 Username and Password not accepted | 1. รหัสผ่านผิด<br>2. ใช้รหัสผ่านปกติแทน App Password<br>3. มีช่องว่างใน App Password | ตรวจสอบ `.env` และสร้าง App Password ใหม่ |
| `550` | 5.1.1 The email account that you tried to reach does not exist | อีเมลผู้รับไม่มีอยู่จริง (Hard Bounce) | นำอีเมลนี้ออกจากระบบ ห้ามส่งซ้ำ |
| `550` | 5.7.1 Daily sending quota exceeded | ส่งเกินโควตา 500 หรือ 2,000 ฉบับ/วัน | หยุดส่งและรอให้ Rolling window รีเซ็ต |
| `550` | 5.7.133 Sender not authenticated for group (M365) | ส่งเข้า M365 Group แต่กลุ่มปิดรับ External Sender | ให้ M365 Admin เปิด Allow external senders |
| `554` | 5.7.1 Relay Access Denied | พยายามส่งในนามโดเมนอื่นที่ไม่ได้ยืนยัน | ให้ใช้ `From` ตรงกับบัญชีที่ Authenticate |

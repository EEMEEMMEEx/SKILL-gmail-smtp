# Gmail SMTP & Email Deliverability Skill

คู่มือและชุดทรัพยากรสำหรับการกำหนดค่า Gmail SMTP, การแก้ไขปัญหาการส่งอีเมลเข้า Microsoft 365 Group และแนวทางปฏิบัติเพื่อเพิ่มอัตราการส่งถึง Inbox (Deliverability Optimization) ป้องกันการตกโฟลเดอร์ Spam/Junk

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
gmail-smtp/
├── SKILL.md                                    # คำสั่งและแนวทางการใช้งาน Skill สำหรับ AI Agent
├── README.md                                   # ภาพรวมและคู่มือการใช้งานชุดคำสั่ง/สคริปต์
├── examples/
│   └── smtp-send-example.js                    # ตัวอย่างสคริปต์ Node.js สำหรับส่งอีเมลมาตรฐานสูง
└── references/
    ├── anti-spam-deliverability.md             # คู่มือเจาะลึก RFC Standards, SPF/DKIM/DMARC, และ Content Scoring
    ├── gmail-smtp-config.md                    # ข้อมูลเชิงลึก Gmail SMTP, TLS/SSL, Error Codes และ Rate Limits
    └── m365-group-delivery.md                  # คู่มือแก้ไขปัญหาการส่งเข้า Microsoft 365 Group / EOP
```

---

## 🚀 ฟีเจอร์หลัก (Key Features)

1. **Gmail SMTP Setup & Best Practices**
   - แนะนำการใช้ Google App Passwords
   - เปรียบเทียบและแนะนำการใช้ Port 465 (Implicit TLS) vs Port 587 (STARTTLS)
   - จัดการข้อจำกัดการส่ง (Sending Limits: 500 ฉบับ/วัน สำหรับ Gmail ทั่วไป, 2,000 ฉบับ/วัน สำหรับ Google Workspace)

2. **การแก้ไขปัญหา Microsoft 365 Group Rejection**
   - ขั้นตอนการเปิดรับ External Senders ทั้งผ่าน Exchange Admin Center (EAC) และ PowerShell
   - การแก้ปัญหา Auto-Subscription สำหรับสมาชิก Group
   - การปรับ Headers ไม่ให้ถูก Exchange Online Protection (EOP) บล็อกหรือมองว่าเป็น Bulk/Bot

3. **Anti-Spam & Deliverability Checklist (มาตรฐานปี 2024+)**
   - SPF, DKIM, DMARC alignment
   - RFC 2047 Encoding สำหรับภาษาไทย (Subject & Sender Name)
   - MIME Multipart Alternative (`text/plain` + `text/html`)
   - Clean HTML Template & Link Hygiene (HTTPS, หลีกเลี่ยง URL shorteners)

4. **Reference Implementation**
   - โค้ดตัวอย่าง Node.js (`smtp-send-example.js`) ที่รองรับ Throttling, Exponential Backoff Retry และ Validated MIME Formatting

---

## 🛠️ การตั้งค่าเริ่มต้นอย่างรวดเร็ว (Quick Start)

### 1. การสร้าง Google App Password
1. เปิด **2-Step Verification** ที่ [Google Security](https://myaccount.google.com/security)
2. เข้าไปที่ [Google App Passwords](https://myaccount.google.com/apppasswords)
3. สร้าง App Name เช่น `App-SMTP-Mailer`
4. นำรหัสผ่าน 16 หลักไปใช้แทนรหัสผ่านบัญชีจริง

### 2. ค่า Connection Parameters ที่แนะนำ
- **Host**: `smtp.gmail.com`
- **Port**: `465` (แนะนำสำหรับ SMTPS / Implicit TLS) หรือ `587` (STARTTLS)
- **Secure**: `true` (สำหรับ Port 465)
- **Auth User**: อีเมลของคุณ (เช่น `your-email@gmail.com`)
- **Auth Pass**: App Password 16 หลัก

---

## 💻 การรันตัวอย่างสคริปต์ (Example Script)

ตัวอย่างสคริปต์ส่งอีเมลด้วย Node.js อยู่ที่ [examples/smtp-send-example.js](file:///c:/Users/WATCHARA%20MANADEE/.gemini/config/skills/gmail-smtp/examples/smtp-send-example.js)

```bash
# ติดตั้ง dependencies ที่จำเป็น (หากใช้ nodemailer)
npm install nodemailer

# รันสคริปต์ทดสอบ
node examples/smtp-send-example.js
```

---

## 📚 เอกสารอ้างอิงเชิงลึก (References)

- 📖 [Microsoft 365 Group Delivery Guide](file:///c:/Users/WATCHARA%20MANADEE/.gemini/config/skills/gmail-smtp/references/m365-group-delivery.md)
- 📖 [Anti-Spam & Deliverability Checklist](file:///c:/Users/WATCHARA%20MANADEE/.gemini/config/skills/gmail-smtp/references/anti-spam-deliverability.md)
- 📖 [Gmail SMTP Technical Details](file:///c:/Users/WATCHARA%20MANADEE/.gemini/config/skills/gmail-smtp/references/gmail-smtp-config.md)

---

## 📄 License
Internal Skill Configuration & Runbook

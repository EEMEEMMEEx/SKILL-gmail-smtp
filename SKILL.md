---
name: gmail-smtp
description: >-
  Comprehensive guide, configuration runbook, and deliverability optimization for Gmail SMTP,
  Microsoft 365 Enterprise & Corporate Inboxes, Microsoft 365 Groups, and anti-phishing/anti-spam best practices (SPF, DKIM, DMARC, EOP Defender heuristics, and serverless routing).
  Use when setting up Gmail SMTP, troubleshooting email delivery failures, fixing Microsoft 365/Corporate Inbox rejections,
  or resolving Spam/Phishing/Quarantine issues.
---

# Gmail SMTP & Enterprise Email Deliverability Skill

คู่มือและขั้นตอนปฏิบัติการ (Runbook) สำหรับการใช้งาน Gmail SMTP, การแก้ไขปัญหาการส่งอีเมลเข้า Microsoft 365 Enterprise / โดเมนองค์กร (Corporate Inboxes), Microsoft 365 Groups และสถาปัตยกรรมการส่งอีเมลผ่าน Serverless API โดยไม่ติด Spam หรือโดน Defender กรองเป็น Phishing/Quarantine

---

## 1. Quick Start: Gmail SMTP Configuration

### 1.1 Google App Password Setup
1. เปิด **2-Step Verification** ที่ [Google Security](https://myaccount.google.com/security)
2. ไปที่ [Google App Passwords](https://myaccount.google.com/apppasswords)
3. สร้าง App Name เช่น `App-SMTP-Mailer`
4. คัดลอกรหัสผ่าน 16 ตัวอักษร (ลบช่องว่างออก)

### 1.2 Recommended Connection Parameters
| พารามิเตอร์ | Port 465 (มาตรฐานสูงสุดสำหรับ Gmail) | Port 587 (Alternative) |
|---|---|---|
| **Host** | `smtp.gmail.com` | `smtp.gmail.com` |
| **Port** | `465` | `587` |
| **Security** | Implicit TLS (`secure: true`) | STARTTLS (`secure: false`) |
| **Auth** | `AUTH PLAIN` / `AUTH LOGIN` | `AUTH PLAIN` / `AUTH LOGIN` |
| **Sending Limits** | 500 ฉบับ/วัน (บัญชีฟรี) | 2,000 ฉบับ/วัน (Google Workspace) |

---

## 2. Enterprise Routing for Microsoft 365 & Corporate Inboxes

เมื่อส่งอีเมลจาก Gmail SMTP (`@gmail.com`) ไปยังอีเมลองค์กรหรือ Microsoft 365 (เช่น `@yourdomain.com` หรือ `@company.com`) ต้องปฏิบัติตามหลักความปลอดภัยระดับ Enterprise ดังนี้:

### 2.1 กฎเหล็กป้องกัน Defender ตรวจจับเป็น High-Confidence Phishing (SCL 9)
1. ❌ **ห้ามระบุ Plaintext Password หรือคำล่อแหลมในเนื้อหาอีเมลเด็ดขาด:**
   - ห้ามใส่รหัสผ่านจริง, รหัสผ่านตั้งต้น (`Initial Access`), หรือคำว่า `รหัสผ่านชั่วคราว` ในเนื้อหาที่ส่งจากอีเมลภายนอก
   - **Microsoft Defender for Office 365 (EOP)** จะตรวจจับว่าอีเมลจากโดเมนภายนอกที่มีรหัสผ่าน + ลิงก์เข้าสู่ระบบ เป็นการโจมตีประเภท **Credential Harvesting / Phishing Simulation** และจะทำการ **Quarantine (กักกัน)** ทันทีโดยไม่แจ้งผู้รับ
   - **แนวทางที่ถูกต้อง:** ส่งเป็น **Clean Administrative Notification** แจ้งเพียงข้อมูลบัญชี (ชื่อ, อีเมล, บทบาท, โครงการ) พร้อมปุ่มลิงก์เข้าสู่ระบบ และให้ผู้ใช้ใช้รหัสผ่านตั้งต้นขององค์กรหรือติดต่อผู้ดูแลระบบ
2. ❌ **ห้ามใส่ Header ผิดมาตรฐานที่กระตุ้น Bot Anomaly:**
   - ถอด Header เช่น `X-Priority`, `X-Entity-Ref-ID`, `X-Mailer` ออกทั้งหมด
   - กำหนด Header มาตรฐาน: `Content-Language: th`, `Reply-To: <sender-email>`, `MIME-Version: 1.0`
3. 📐 **การจัดรูปแบบ HTML & Typography:**
   - ใช้ฟอนต์ที่เป็นมิตรกับระบบองค์กร เช่น `'Sarabun', 'Noto Sans Thai', 'Helvetica Neue', Arial, sans-serif`
   - จัด Table ขนาด 600px–620px โทนสีสะอาดตา (เช่น บัตรขาว `#ffffff` บนพื้นหลัง `#f1f5f9` หรือ `#f5f5f5`)

### 2.2 สถาปัตยกรรม Serverless Dispatcher & Dynamic SMTP Configuration
เมื่อเว็บแอปพลิเคชันทำงานแบบ Hybrid (เช่น Frontend บน GitHub Pages / Vercel และ Database บน Supabase):
1. **Endpoint Auto-Routing:**
   - Frontend ที่อยู่บน Static Hosting (เช่น GitHub Pages) ต้องกำหนด API Endpoint ชี้ไปยัง Serverless Function URL สัมบูรณ์ (Absolute URL บน Vercel) เพื่อป้องกัน HTTP 404 และไม่ให้ตกไปที่ Fallback ของ Third-party Auth
2. **Dynamic Database Config Loading:**
   - API Serverless Dispatcher ต้องเชื่อมต่อไปยัง Database (Supabase `system_settings` / `system_secrets`) เพื่อดึงค่า `smtp_config` และรหัสผ่าน `smtp_password` แบบ Real-time ทำให้การเปลี่ยนค่า SMTP บน Web UI มีผลทันทีโดยไม่ต้อง Redeploy Code

---

## 3. การแก้ปัญหาการส่งเข้า Microsoft 365 Group / Distribution Lists

1. **เปิดรับผู้ส่งภายนอก (Allow External Senders):**
   ```powershell
   Set-UnifiedGroup -Identity "group-name@yourdomain.com" -RequireSenderAuthenticationEnabled $false
   ```
2. **ตั้งค่า Auto-Subscribe ให้สมาชิกได้รับอีเมลเข้า Inbox:**
   ```powershell
   Set-UnifiedGroup -Identity "group-name@yourdomain.com" -AutoSubscribeNewMembers $true
   ```
3. **หลีกเลี่ยง Header ที่ทำให้ M365 ข้ามการส่งต่อ:**
   - ❌ หลีกเลี่ยง `Auto-Submitted: auto-generated` และ `Precedence: bulk`

---

## 4. กฎเหล็กป้องกันอีเมลตก Spam / Junk Mail

| หมวดหมู่ | ข้อกำหนดสำคัญ |
|---|---|
| **Authentication** | Envelope From และ Header From ต้องสอดคล้องกัน เพื่อให้ Gmail sign DKIM ได้ถูกต้อง |
| **MIME Structure** | ต้องมีโครงสร้าง `multipart/alternative` ที่มีทั้ง `text/plain` และ `text/html` เสมอ |
| **Headers มาตรฐาน** | มี `Date:` (RFC 5322), `Message-ID:` (Unique per email), `Content-Language: th` |
| **Thai Encoding** | Subject และ From ที่มีภาษาไทยต้อง encode แบบ RFC 2047 (`=?UTF-8?B?...?=`) |
| **HTML Hygiene** | ใช้ Table-based layout, Inline CSS เท่านั้น, ไม่มี `<script>`, `<iframe>`, `<form>` |
| **Link Hygiene** | ลิงก์ต้องเป็น `https://`, ห้ามใช้ URL Shortener (bit.ly, tinyurl), ห้ามใช้ Raw IP |
| **Throttling & Warmup** | มีการหน่วงเวลาส่งระหว่างฉบับ (500ms - 1000ms) และเริ่มส่งจากปริมาณน้อยในสัปดาห์แรก |

---

## 5. โครงสร้างเอกสารอ้างอิงเชิงลึก (References)

- 📖 [Microsoft 365 & Corporate Inbox Delivery Guide](./references/m365-group-delivery.md) — วิเคราะห์สาเหตุ ปัญหา Defender Phishing Quarantining, NDR, EOP Heuristics และการตั้งค่าสำหรับ Enterprise
- 📖 [Anti-Spam & Deliverability Master Guide](./references/anti-spam-deliverability.md) — เจาะลึก RFC Standards, SPF/DKIM/DMARC, Content Scoring, Anti-Phishing Rules และ Google/Yahoo Sender Requirements
- 📖 [Gmail SMTP Technical Details](./references/gmail-smtp-config.md) — รายละเอียด Protocol, Port 465 vs 587, Error codes และ Sending Limits
- 💻 [Reference Implementation Script](./examples/smtp-send-example.js) — ตัวอย่างโค้ดส่งอีเมลแบบมาตรฐานสูงด้วย Node.js


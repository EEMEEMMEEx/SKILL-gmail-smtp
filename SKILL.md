---
name: gmail-smtp
description: >-
  Comprehensive guide, configuration runbook, and deliverability optimization for Gmail SMTP,
  Microsoft 365 Group delivery, and anti-spam best practices (SPF, DKIM, DMARC, MIME formatting, and IP warmup).
  Use when setting up Gmail SMTP, troubleshooting email delivery failures, fixing Microsoft 365 Group rejection,
  or resolving Spam/Junk folder placement.
---

# Gmail SMTP & Email Deliverability Skill

คู่มือและขั้นตอนปฏิบัติการ (Runbook) สำหรับการใช้งาน Gmail SMTP, การแก้ไขปัญหาการส่งอีเมลเข้า Microsoft 365 / Corporate Inbox และหลักการเพิ่มอัตราการส่งถึง Inbox (Deliverability) โดยไม่ติด Spam/Junk/Phishing

---

## 1. Quick Start: Gmail SMTP Configuration

### 1.1 Google App Password Setup
1. เปิด **2-Step Verification** ที่ [Google Security](https://myaccount.google.com/security)
2. ไปที่ [Google App Passwords](https://myaccount.google.com/apppasswords)
3. สร้าง App Name เช่น `App-SMTP-Mailer`
4. คัดลอกรหัสผ่าน 16 ตัวอักษร (ลบช่องว่างออก)

### 1.2 Recommended Connection Parameters
| พารามิเตอร์ | Port 465 (แนะนำสำหรับ Gmail) | Port 587 (Alternative) |
|---|---|---|
| **Host** | `smtp.gmail.com` | `smtp.gmail.com` |
| **Port** | `465` | `587` |
| **Security** | Implicit TLS (`secure: true`) | STARTTLS (`secure: false`) |
| **Auth** | `AUTH PLAIN` / `AUTH LOGIN` | `AUTH PLAIN` / `AUTH LOGIN` |
| **Sending Limits** | 500 ฉบับ/วัน (บัญชีฟรี) | 2,000 ฉบับ/วัน (Google Workspace) |

---

## 2. การแก้ปัญหาการส่งเข้า Microsoft 365 & Corporate Inboxes

เมื่อส่งอีเมลจาก Gmail SMTP เข้าสู่อีเมลองค์กร (เช่น `@company.co.th`) หรือ Microsoft 365 Group แล้วอีเมลส่งออกจาก Gmail สำเร็จแต่ไม่ถึงปลายทาง ให้ตรวจสอบ 4 จุดสำคัญ:

### 2.1 ปัญหา High-Confidence Phishing (บล็อกรหัสผ่านตั้งต้น / Plaintext Password)
* ⚠️ **อาการ:** Gmail ส่งออกสำเร็จ (Status 250 OK) มีในโฟลเดอร์ Sent แต่หายไปจาก Inbox/Junk ของ Outlook ปลายทาง
* **สาเหตุ:** เมื่อผู้ส่งภายนอก (`@gmail.com`) ส่งอีเมลที่มีรหัสผ่านชั่วคราว (`Initial Access: <password>`, `รหัสผ่านตั้งต้น`) พร้อมลิงก์ไปยังเว็บภายนอก Microsoft Defender / EOP จะจัดประเภทเป็น **High-Confidence Phishing (SCL 9)** และทำการกักกัน (Quarantine) หรือ Drop ทันที
* **แนวทางแก้ไข:** **ห้ามใส่รหัสผ่านในเนื้อหาอีเมลเด็ดขาด** ให้ส่งเป็น *Administrative Onboarding Notification* แจ้งข้อมูลบัญชี (ชื่อ, อีเมล, สิทธิ์) และให้ผู้ใช้เข้าสู่ระบบผ่านลิงก์ขององค์กร

### 2.2 ปัญหา Custom / Non-Standard Headers (Bot Anomaly)
* ❌ **ห้ามใส่:** `X-Priority: 3`, `X-Entity-Ref-ID: <uuid>`, `X-Mailer: <custom>`
* ✅ **ใช้เฉพาะ Standard RFC Headers:** `Content-Language: th`, `Reply-To: <sender>`, `Date`, `From`, `To`, `Subject`, `Message-ID`, `MIME-Version: 1.0`

### 2.3 การส่งเข้า Microsoft 365 Group (External Senders Setting)
* **ผ่าน Exchange Admin Center (EAC):**
  1. เข้า EAC (`admin.exchange.microsoft.com`) → **Recipients** → **Groups**
  2. เลือกกลุ่มที่ต้องการ → แท็บ **Settings**
  3. ติ๊กเปิด **"Allow external senders to email this group"**
* **ผ่าน PowerShell:**
  ```powershell
  Set-UnifiedGroup -Identity "group-name@yourdomain.com" -RequireSenderAuthenticationEnabled $false -AutoSubscribeNewMembers $true
  ```

---

## 3. สถาปัตยกรรม Serverless & Static SPA (GitHub Pages vs Vercel API)

### 3.1 ปัญหา Relative Path บน Static Hosting (404 Fallback Trap)
* เมื่อ Frontend ทำงานบน **GitHub Pages** (`github.io`) การเรียก `fetch('/api/send-email')` จะได้ `404 Not Found`
* **วิธีแก้:** ทำ Auto-Routing ตรวจจับ Hostname:
  ```javascript
  const defaultEndpoint = typeof window !== 'undefined' && window.location.hostname.includes('github.io')
    ? 'https://your-production-app.vercel.app/api/send-email'
    : '/api/send-email';
  ```

### 3.2 Dynamic SMTP Settings with Database Vault (Supabase)
* บน Vercel Serverless Function ให้ดึงค่าจาก DB ด้วย Service Role Key เมื่อไม่มีการส่ง Override:
  ```javascript
  const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const [{ data: cfg }, { data: secret }] = await Promise.all([
    supabaseAdmin.from('system_settings').select('value').eq('key', 'smtp_config').maybeSingle(),
    supabaseAdmin.from('system_secrets').select('secret_value').eq('key', 'smtp_password').maybeSingle()
  ]);
  ```

---

## 4. กฎเหล็กป้องกันอีเมลตก Spam / Junk / Phishing

| หมวดหมู่ | ข้อกำหนดสำคัญ |
|---|---|
| **No Cleartext Credentials** | ห้ามส่งรหัสผ่าน Plaintext ในอีเมลจาก Gmail ภายนอกเข้าองค์กรเด็ดขาด |
| **Header Hygiene** | ใช้เฉพาะ RFC Standard Headers + `Content-Language: th` ห้ามใส่ `X-` headers แปลกปลอม |
| **Authentication Alignment** | Envelope From (`SMTP_USER`) และ Header From ต้องสอดคล้องกัน |
| **MIME Structure** | ต้องมีโครงสร้าง `multipart/alternative` ที่มีทั้ง `text/plain` และ `text/html` (Base64) |
| **Thai Encoding** | Subject และ From ที่มีภาษาไทยต้อง Encode แบบ RFC 2047 (`=?UTF-8?B?...?=`) |
| **Typography & Card** | ใช้ Table-based Layout บน Card สีขาว `#ffffff` พื้นหลัง `#f1f5f9` ฟอนต์ `'Sarabun', 'Noto Sans Thai', Arial` |

---

## 5. โครงสร้างเอกสารอ้างอิงเชิงลึก (References)

- 📖 [Anti-Spam & Deliverability Checklist](./references/anti-spam-deliverability.md) — เจาะลึก RFC Standards, Anti-Phishing Rules, SPF/DKIM/DMARC, Content Scoring
- 📖 [Microsoft 365 Group & Enterprise Delivery Guide](./references/m365-group-delivery.md) — วิเคราะห์สาเหตุ NDR, Quarantine, EOP และการตั้งค่า PowerShell
- 📖 [Gmail SMTP Technical Details & Dynamic Serverless](./references/gmail-smtp-config.md) — รายละเอียด Protocol, Port 465, Supabase Vault Pattern และ Sending Limits
- 💻 [Reference Implementation Script](./examples/smtp-send-example.js) — ตัวอย่างโค้ดส่งอีเมลแบบมาตรฐานสูงด้วย Node.js


---
name: gmail-smtp
description: >-
  Comprehensive guide, configuration runbook, and deliverability optimization for Gmail SMTP,
  Microsoft 365 Group delivery, and anti-spam best practices (SPF, DKIM, DMARC, MIME formatting, and IP warmup).
  Use when setting up Gmail SMTP, troubleshooting email delivery failures, fixing Microsoft 365 Group rejection,
  or resolving Spam/Junk folder placement.
---

# Gmail SMTP & Email Deliverability Skill

คู่มือและขั้นตอนปฏิบัติการ (Runbook) สำหรับการใช้งาน Gmail SMTP, การแก้ไขปัญหาการส่งอีเมลเข้า Microsoft 365 Group และหลักการเพิ่มอัตราการส่งถึง Inbox (Deliverability) โดยไม่ติด Spam/Junk

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

## 2. การแก้ปัญหาการส่งเข้า Microsoft 365 Group

เมื่อส่งอีเมลจาก Gmail SMTP เข้าสู่ Microsoft 365 Group / Distribution List แล้วผู้รับไม่ได้รับอีเมล ให้ตรวจสอบตามขั้นตอนดังนี้:

### Step 1: ตรวจสอบ Group External Senders Setting (สาเหตุอันดับ 1)
*ค่าเริ่มต้นของ M365 Group จะบล็อกผู้ส่งภายนอกองค์กร*
* **ผ่าน Exchange Admin Center (EAC):**
  1. เข้า EAC (`admin.exchange.microsoft.com`) → **Recipients** → **Groups**
  2. เลือกกลุ่มที่ต้องการ → แท็บ **Settings**
  3. ติ๊กเปิด **"Allow external senders to email this group"** (อนุญาตให้ผู้ส่งภายนอกส่งอีเมลถึงกลุ่มนี้)
* **ผ่าน PowerShell (Exchange Online):**
  ```powershell
  Set-UnifiedGroup -Identity "group-name@yourdomain.com" -RequireSenderAuthenticationEnabled $false
  ```

### Step 2: ตรวจสอบ Group Member Auto-Subscription
*หากอีเมลเข้า Group Mailbox แต่ไม่เด้งเข้า Inbox สมาชิก:*
```powershell
Set-UnifiedGroup -Identity "group-name@yourdomain.com" -AutoSubscribeNewMembers $true
```

### Step 3: ปรับแต่ง Headers เพื่อไม่ให้ติด EOP (Exchange Online Protection)
* **หลีกเลี่ยง Header ที่ทำให้ M365 เข้าใจว่าเป็น Bot อัตโนมัติ:**
  - ❌ หลีกเลี่ยง `Auto-Submitted: auto-generated` (ทำให้ M365 ข้ามการ forward เข้า mailbox สมาชิก)
  - ❌ หลีกเลี่ยง `Precedence: bulk` หรือ `Precedence: list`
  - ❌ หลีกเลี่ยง `X-Mailer: <unknown-script>`

---

## 3. กฎเหล็กป้องกันอีเมลตก Spam / Junk Mail

| หมวดหมู่ | ข้อกำหนดสำคัญ |
|---|---|
| **Authentication** | Envelope From และ Header From ต้องสอดคล้องกัน เพื่อให้ Gmail sign DKIM ได้ถูกต้อง |
| **MIME Structure** | ต้องมีโครงสร้าง `multipart/alternative` ที่มีทั้ง `text/plain` และ `text/html` เสมอ |
| **Headers มาตรฐาน** | มี `Date:` (RFC 5322), `Message-ID:` (Unique per email), `MIME-Version: 1.0` |
| **Thai Encoding** | Subject และ From ที่มีภาษาไทยต้อง encode แบบ RFC 2047 (`=?UTF-8?B?...?=`) |
| **HTML Hygiene** | ใช้ Table-based layout, Inline CSS เท่านั้น, ไม่มี `<script>`, `<iframe>`, `<form>` |
| **Link Hygiene** | ลิงก์ต้องเป็น `https://`, ห้ามใช้ URL Shortener (bit.ly, tinyurl), ห้ามใช้ Raw IP |
| **Throttling & Warmup** | มีการหน่วงเวลาส่งระหว่างฉบับ (500ms - 1000ms) และเริ่มส่งจากปริมาณน้อยในสัปดาห์แรก |

---

## 4. โครงสร้างเอกสารอ้างอิงเชิงลึก (References)

- 📖 [Microsoft 365 Group Delivery Guide](./references/m365-group-delivery.md) — วิเคราะห์สาเหตุ ปัญหา NDR, Quarantine, EOP และการตั้งค่า PowerShell อย่างละเอียด
- 📖 [Anti-Spam & Deliverability Checklist](./references/anti-spam-deliverability.md) — เจาะลึก RFC Standards, SPF/DKIM/DMARC, Content Scoring, และ Google/Yahoo 2024 Sender Requirements
- 📖 [Gmail SMTP Technical Details](./references/gmail-smtp-config.md) — รายละเอียด Protocol, Port 465 vs 587, Error codes และ Sending Limits
- 💻 [Reference Implementation Script](./examples/smtp-send-example.js) — ตัวอย่างโค้ดส่งอีเมลแบบมาตรฐานสูงด้วย Node.js

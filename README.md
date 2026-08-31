<p align="center">
  <img src="./landing-page/assets/icon.svg" alt="Gmail SMTP Logo" width="80" height="80"/>
</p>

<h1 align="center">Gmail SMTP & Enterprise Email Deliverability Suite</h1>

<p align="center">
  <b>คู่มือมาตรฐานและชุดเครื่องมือระดับองค์กรสำหรับวิเคราะห์, ควบคุมความปลอดภัย และส่ง Transactional Email ผ่าน Gmail SMTP เข้าสู่ Microsoft 365, Google Workspace และ Corporate Inboxes สำเร็จ 100%</b>
</p>

<p align="center">
  <a href="https://eemeemmeex.github.io/SKILL-gmail-smtp/landing-page/"><img src="https://img.shields.io/badge/⚡_Live_Demo-Open_Interactive_Toolkit-3B82F6?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Live Demo"></a>
  <a href="https://github.com/EEMEEMMEEx/SKILL-gmail-smtp"><img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Repo"></a>
  <img src="https://img.shields.io/badge/License-MIT-10B981?style=for-the-badge" alt="License">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Gmail%20SMTP-Port%20465%20SMTPS-EA4335?style=flat-square&logo=gmail&logoColor=white" alt="Gmail SMTP">
  <img src="https://img.shields.io/badge/Microsoft%20365-EOP%20%26%20Defender%20Verified-0078D4?style=flat-square&logo=microsoft&logoColor=white" alt="M365 Verified">
  <img src="https://img.shields.io/badge/Spam%20Rating-SCL%200--1%20Legitimate-10B981?style=flat-square" alt="SCL 0-1">
  <img src="https://img.shields.io/badge/RFC%20Compliance-RFC%205322%20%2F%202047-8B5CF6?style=flat-square" alt="RFC Compliance">
  <img src="https://img.shields.io/badge/Security-Zero--Credential-F59E0B?style=flat-square" alt="Zero Credential">
</p>

---

> [!IMPORTANT]
> **250 OK ≠ Inbox Delivery:** การได้รับผลตอบกลับ `250 2.0.0 OK` จาก Gmail SMTP หมายถึงเซิร์ฟเวอร์รับคิวส่งเข้าสู่ระบบอินเทอร์เน็ตแล้วเท่านั้น แต่ไม่ได้การันตีว่าจะส่งถึง Focused Inbox ปลายทาง ชุดเครื่องมือนี้จัดทำขึ้นเพื่อแก้ปัญหาการติด Quarantine ใน Microsoft Defender (SCL 9), ปัญหา Directory-Based Edge Blocking (DBEB), การเข้ารหัส Header ภาษาไทย (RFC 2047) และการวางโครงสร้างเทมเพลตอีเมลที่ปลอดภัย

---

## 📑 สารบัญ (Table of Contents)

1. [⚡ ติดตั้งด่วนด้วย npx (Quick Install)](#-1-ตดตงดวนดวย-npx-quick-install)
2. [✨ ฟีเจอร์หลัก (Key Highlights)](#-2-ฟเจอรหลก-key-highlights)
3. [🏗️ สถาปัตยกรรมระบบ (System Architecture Pipeline)](#-3-สถาปตยกรรมระบบ-system-architecture-pipeline)
4. [🛠️ การติดตั้งและการตั้งค่าระบบ (Installation & Config)](#-4-การตดตงและการตงคาระบบ-installation--config)
5. [🔍 รันบุ๊กการแยกจุดขัดข้อง (Troubleshooting Matrix)](#-5-รนบกการแยกจดขดของ-troubleshooting-matrix)
6. [🛡️ การป้องกัน Anti-Spam NLP และ Phishing Lure](#-6-การปองกน-anti-spam-nlp-และ-phishing-lure)
7. [💻 ตัวอย่างโค้ดพร้อมใช้งาน (Production Code Snippets)](#-7-ตวอยางโคดพรอมใชงาน-production-code-snippets)
8. [🧪 เช็กลิสต์การทดสอบอัตโนมัติ (Verification Checklist)](#-8-เชกลสตการทดสอบอตโนมต-verification-checklist)
9. [📚 เอกสารอ้างอิง (References)](#-9-เอกสารอางอง-references)

---

## ⚡ 1. ติดตั้งด่วนด้วย npx (Quick Install)

คุณสามารถดึง Skill นี้ไปใช้งานในฐานะ **AI Agent Skill** สำหรับ Antigravity / Gemini ได้ทันทีด้วยคำสั่งบรรทัดเดียว:

### 📦 สำหรับ Workspace ปัจจุบัน (โปรเจกต์ของคุณ)
```bash
npx -y degit EEMEEMMEEx/SKILL-gmail-smtp .agents/skills/gmail-smtp
```
> *(หากมีโฟลเดอร์เดิมอยู่แล้วให้เพิ่ม `--force`: `npx -y degit EEMEEMMEEx/SKILL-gmail-smtp .agents/skills/gmail-smtp --force`)*

### 🌐 สำหรับ Global Configuration (ทุกโปรเจกต์บนเครื่อง)
```powershell
# Windows (PowerShell)
npx -y degit EEMEEMMEEx/SKILL-gmail-smtp "$env:USERPROFILE\.gemini\config\skills\gmail-smtp"
```
```bash
# macOS / Linux (Bash/Zsh)
npx -y degit EEMEEMMEEx/SKILL-gmail-smtp ~/.gemini/config/skills/gmail-smtp
```

---

## ✨ 2. ฟีเจอร์หลัก (Key Highlights)

| ฟีเจอร์ | คำอธิบายทางเทคนิค | ประโยชน์ที่ได้รับ |
|---|---|---|
| **🌐 Interactive Web Toolkit** | หน้าเว็บจำลองการทำงาน Zero-Build ขับเคลื่อนด้วย ReactBits WebGL Shaders & Scalable SVGs | วินิจฉัยและจำลองการส่งเมลได้ทันทีผ่านเบราว์เซอร์ |
| **🔤 RFC 2047 Live Encoder** | แปลงหัวข้อและชื่อผู้ส่งภาษาไทยเป็น Base64 (`=?UTF-8?B?...?=`) พร้อมตัดบรรทัด 78 chars | ป้องกันปัญหาภาษาไทยเพี้ยน/ต่างดาวในโปรแกรมอ่านเมล |
| **🛡️ Zero-Credential Policy** | สถาปัตยกรรมตัดรหัสผ่านออกจากอีเมล 100% พร้อมโทนสี Amber สุภาพ | ป้องกัน Defender จัดเป็น SCL 9 Phishing Quarantine |
| **🏢 M365 Suite & DBEB** | เครื่องมือสร้าง Exchange Online PowerShell และจำลอง DBEB Bounces | แก้ปัญหา NDR `550 5.4.1` และ `550 5.7.133` ในกลุ่ม M365 |
| **📐 Unified Master Shell** | แม่แบบอีเมล Responsive Table Layout (Desktop 620px & Mobile 375px) | รองรับ Outlook Web, Mobile App และ Dark Mode |
| **📊 Deliverability Gauge** | ตัวคำนวณคะแนนความพร้อมตามเกณฑ์ Google, Yahoo และ Microsoft EOP | ตรวจสอบ SPF/DKIM, Header Hygiene ก่อนขึ้น Production |

---

## 🏗️ 3. สถาปัตยกรรมระบบ (System Architecture Pipeline)

```text
+-------------------------------------------------------------------------------+
| STAGE 01: Client UI Actions (Form Submit, Stock-In, Withdrawal, Settings)     |
+-------------------------------------------------------------------------------+
                                      │
                                      ▼
+-------------------------------------------------------------------------------+
| STAGE 02: Notification Dispatcher & Role Resolver (ADMIN / SUPERVISOR)       |
|           • In-Memory Deduplication Cache (ป้องกันการส่งซ้ำจาก Race Conditions)   |
+-------------------------------------------------------------------------------+
                                      │
                                      ▼
+-------------------------------------------------------------------------------+
| STAGE 03: Unified Email Renderer (emailRenderer.js)                          |
|           • 620px Responsive Table Shell + Text Plain Fallback                |
|           • Anti-Phishing Amber Notice Box + Strict Sanitization              |
+-------------------------------------------------------------------------------+
                                      │
                                      ▼
+-------------------------------------------------------------------------------+
| STAGE 04: API Gateway / Local Dev Server Proxy (/api/send-email)             |
|           • Vite Dev Server Proxy Middleware (ป้องกันปัญหา SPA 404 Fallback)  |
|           • Vercel / Node.js Serverless Function Handler                      |
+-------------------------------------------------------------------------------+
                                      │
                                      ▼
+-------------------------------------------------------------------------------+
| STAGE 05: Gmail SMTP Relay (smtp.gmail.com:465 Implicit TLS)                 |
|           • Envelope Sender (Return-Path) Alignment                           |
|           • Clean RFC 5322 Headers (Auto-Submitted, X-Priority: 3, Message-ID)|
|           • SMTP Server Response: 250 2.0.0 OK                                |
+-------------------------------------------------------------------------------+
                                      │
                                      ▼
+-------------------------------------------------------------------------------+
| STAGE 06: Microsoft 365 Exchange Online Protection (EOP) & Defender Filter   |
|           • SPF / DKIM / DMARC Authentication                                 |
|           • NLP Heuristics: Zero Urgency Triggers -> SCL: 0-1 (Legitimate)    |
+-------------------------------------------------------------------------------+
                                      │
                                      ▼
+-------------------------------------------------------------------------------+
| STAGE 07: Recipient Focused Inbox (100% Delivery Verified)                    |
+-------------------------------------------------------------------------------+
```

---

## 🛠️ 4. การติดตั้งและการตั้งค่าระบบ (Installation & Config)

### ติดตั้ง Dependencies ในโปรเจกต์ Web / Node.js
```bash
npm install nodemailer dotenv
```

### การตั้งค่า Environment Variables (`.env`)
สร้างไฟล์ `.env` ใน Root ของ Backend (ห้ามบันทึกเข้า Git):
```ini
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-service-account@gmail.com
SMTP_PASS=xxxx-xxxx-xxxx-xxxx # Google App Password 16 หลัก
```

> [!TIP]
> **วิธีสร้าง Google App Password 16 หลัก:**
> 1. ไปที่บัญชี Google -> ความปลอดภัย (Security)
> 2. เปิดใช้งานการยืนยันแบบ 2 ขั้นตอน (2-Step Verification)
> 3. ค้นหาเมนู **"รหัสผ่านสำหรับแอป" (App Passwords)** และสร้างรหัสผ่านใหม่เพื่อนำมาใส่ใน `SMTP_PASS`

### การตั้งค่า Vite Dev Server Proxy (แก้ปัญหา 404 ตอนทดสอบในเครื่อง)
```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // ชี้ไปยัง Local API Handler
        changeOrigin: true
      }
    }
  }
});
```

---

## 🔍 5. รันบุ๊กการแยกจุดขัดข้อง (Troubleshooting Matrix)

<details open>
<summary><b>📋 ตารางวิเคราะห์ปัญหาและการแก้ไขเร่งด่วน</b></summary>

| สัญญาณ / ข้อผิดพลาด | สาเหตุที่แท้จริง (Root Cause) | แนวทางแก้ไขและคำสั่งปฏิบัติการ |
|---|---|---|
| **ส่งสำเร็จ (250 OK) แต่ไม่เข้า Inbox และไม่มีใน Junk** | ติด **Microsoft Defender SCL 9 Phishing Quarantine** จากคำเตือนภัยรุนแรงหรือมีรหัสผ่านในเมล | ปรับหัวข้อเป็นภาษาทางการ, เปลี่ยนกล่องแจ้งเตือนเป็นสี Amber, ตัดรหัสผ่านออกจากอีเมล 100% |
| **HTTP 404 / ได้รับไฟล์ HTML กลับมา** | Vite Dev Server ขาด Proxy Route `/api/send-email` จึงส่งหน้าเว็บ SPA กลับมาแทน | เพิ่ม Proxy ใน `vite.config.js` หรือตั้งค่า Middleware สำหรับ Local Dev |
| **NDR 550 5.4.1 Access Denied** | M365 Directory-Based Edge Blocking (DBEB) สกัดกั้นเนื่องจากไม่มี Mailbox นี้จริง | ตรวจสอบชื่อ Mailbox ใน Entra ID และเพิ่มที่อยู่อีเมลผิดเข้า Suppression List |
| **NDR 550 5.7.133** | Microsoft 365 Group ปิดรับอีเมลจากผู้ส่งภายนอกองค์กร | รัน PowerShell: `Set-UnifiedGroup -Identity "group@co.com" -RequireSenderAuthenticationEnabled $false` |
| **SMTP 535 / EAUTH Authentication Failed** | App Password ไม่ถูกต้องหรือถูกเพิกถอน | ออก Google App Password 16 หลักใหม่ และตรวจสอบว่าใช้พอร์ต 465 SMTPS |
| **แก้แม่แบบแล้วแต่หน้าเว็บยังแสดงข้อความเก่า** | ค่า JSON ใน Database (เช่น Supabase) เข้าทับค่า Default ในโค้ด | ติดตั้งฟังก์ชัน `mergeEventsWithDefaults` เพื่อ Auto-Upgrade และเพิ่มปุ่ม Reset to Default |

</details>

---

## 🛡️ 6. การป้องกัน Anti-Spam NLP และ Phishing Lure

```text
[ ANTI-SPAM HEURISTICS RULES ]
 ├─ ❌ ห้ามใช้คำเตือนภัยเร่งด่วน: "เตือนภัย:", "ด่วนที่สุด", "ถูกปฏิเสธทันที"
 │  └─► ✔️ ใช้ภาษาทางการ: "แจ้งเตือนรายการพัสดุถึงจุดสั่งซื้อ", "คำขอเบิกไม่ได้รับการอนุมัติ"
 ├─ ❌ ห้ามใช้กล่องสีแดงเข้มจัด (#b91c1c บนพื้น #fff1f2) คู่กับลิงก์ภายนอก
 │  └─► ✔️ ใช้กล่องสี Amber สุภาพ (#9a3412 บนพื้น #fff7ed ขอบ #fed7aa)
 ├─ ❌ ห้ามใส่รหัสผ่าน หรือ Token แบบใช้ซ้ำได้ในเนื้อหาอีเมล
 │  └─► ✔️ ใช้ระบบ Zero-Credential ชี้ไปยังหน้า Login ทางการของระบบ
 └─ ❌ ห้ามส่ง Header ขยะ: X-Mailer, Precedence: bulk, X-Priority: 1
    └─► ✔️ ใช้ Header มาตรฐาน: Auto-Submitted: auto-generated, X-Priority: 3
```

---

## 💻 7. ตัวอย่างโค้ดพร้อมใช้งาน (Production Code Snippets)

<details>
<summary><b>1. Node.js Native TLS (Zero Dependencies - Port 465)</b></summary>

```javascript
const tls = require('tls');

function sendEmailViaTLS() {
  const client = tls.connect(465, 'smtp.gmail.com', { rejectUnauthorized: true }, () => {
    console.log('[OK] Connected via TLS 1.3 to smtp.gmail.com:465');
  });

  const authUser = Buffer.from(process.env.SMTP_USER).toString('base64');
  const authPass = Buffer.from(process.env.SMTP_PASS.replace(/\s+/g, '')).toString('base64');

  const commands = [
    'EHLO localhost',
    'AUTH LOGIN',
    authUser,
    authPass,
    `MAIL FROM:<${process.env.SMTP_USER}>`,
    'RCPT TO:<recipient@yourcompany.com>',
    'DATA',
    `From: =?UTF-8?B?${Buffer.from('ระบบแจ้งเตือน').toString('base64')}?= <${process.env.SMTP_USER}>
To: recipient@yourcompany.com
Subject: =?UTF-8?B?${Buffer.from('[StockFlow] แจ้งเตือนการทำรายการ').toString('base64')}?=
MIME-Version: 1.0
Content-Type: text/html; charset=UTF-8
Auto-Submitted: auto-generated
X-Priority: 3

<h2>แจ้งเตือนจากระบบ</h2><p>รายการของคุณดำเนินการเรียบร้อยแล้ว</p>
.
`,
    'QUIT'
  ];

  let step = 0;
  client.on('data', (data) => {
    if (step < commands.length) {
      client.write(commands[step] + '\r\n');
      step++;
    }
  });

  client.on('end', () => console.log('[OK] Session closed.'));
}
```
</details>

<details>
<summary><b>2. Serverless Function Endpoint (api/send-email.js)</b></summary>

```javascript
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { to, subject, html, text } = req.body;
  if (!to || !subject) return res.status(400).json({ error: 'Missing parameters' });

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const info = await transporter.sendMail({
      from: `"StockFlow Notification" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: text || 'ระบบแจ้งเตือนธุรกรรม StockFlow',
      html,
      headers: {
        'Auto-Submitted': 'auto-generated',
        'X-Priority': '3',
        'Content-Language': 'th'
      }
    });

    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
```
</details>

<details>
<summary><b>3. Python smtplib (SSL / TLS)</b></summary>

```python
import smtplib, ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.header import Header

msg = MIMEMultipart("alternative")
msg["Subject"] = Header("[StockFlow] รายงานการดำเนินรายการ", "utf-8")
msg["From"] = "StockFlow <sender@gmail.com>"
msg["To"] = "recipient@yourcompany.com"
msg["Auto-Submitted"] = "auto-generated"
msg["X-Priority"] = "3"

msg.attach(MIMEText("รายการของคุณดำเนินการเรียบร้อยแล้ว", "plain", "utf-8"))
msg.attach(MIMEText("<p>รายการของคุณดำเนินการเรียบร้อยแล้ว</p>", "html", "utf-8"))

context = ssl.create_default_context()
with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
    server.login("sender@gmail.com", "xxxx-xxxx-xxxx-xxxx")
    server.sendmail("sender@gmail.com", "recipient@yourcompany.com", msg.as_string())
    print("[OK] Email delivered via Python SSL")
```
</details>

---

## 🧪 8. เช็กลิสต์การทดสอบอัตโนมัติ (Verification Checklist)

ก่อนปล่อยระบบขึ้น Production ให้รันการตรวจสอบตามลำดับ:

- [x] **Unit Tests (`npm run test:email`):** ตรวจสอบว่าทุกเทมเพลตถูก Render ผ่าน Master Table Shell และตัวแปรครบ 100%
- [x] **Zero Credentials Check:** ยืนยันว่าไม่มี Password, Token หรือ Key ในเนื้อหาอีเมลและ Log
- [x] **Preheader & Line Folding:** ตรวจสอบความยาวของ Header ไม่เกิน 78 ตัวอักษรตาม RFC 5322
- [x] **Production Build:** รัน `npx vite build` เพื่อทดสอบความสมบูรณ์ของ Frontend Assets
- [x] **Live Focused Inbox Verification:** ทดสอบส่งเข้ากล่องจดหมายจริง 1 ฉบับ และตรวจสอบค่า `SCL: 0-1` ใน Header

---

## 📚 9. เอกสารอ้างอิง (References)

- 📘 [`SKILL.md`](./SKILL.md) — รันบุ๊กหลักสำหรับ AI Agent และคำสั่งวินิจฉัยเชิงลึก
- 🔬 [`EMAIL_DELIVERY_COMPREHENSIVE_INCIDENT_REPORT.md`](./EMAIL_DELIVERY_COMPREHENSIVE_INCIDENT_REPORT.md) — รายงานกรณีศึกษาเหตุการณ์จริง (Root Cause Analysis & Incident Proof)
- 🏢 [`references/m365-group-delivery.md`](./references/m365-group-delivery.md) — คู่มือ Microsoft 365, DBEB และ PowerShell
- 🛡️ [`references/anti-spam-deliverability.md`](./references/anti-spam-deliverability.md) — คู่มือเกณฑ์ SPF, DKIM, DMARC และ SCL
- ⚙️ [`references/gmail-smtp-config.md`](./references/gmail-smtp-config.md) — ตารางรหัสสถานะ SMTP และโควตาการส่ง

---

<p align="center">
  <b>Released under the MIT License • Built with Modern Web Standards & ReactBits Design System</b>
</p>

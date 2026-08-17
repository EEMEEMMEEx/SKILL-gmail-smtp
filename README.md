<div align="center">

# Gmail SMTP & Enterprise Email Deliverability Runbook

**Production-grade Gmail SMTP configuration, Microsoft 365 Groups & Corporate Inboxes Delivery, Defender Anti-Phishing Guard, and Anti-Spam Inbox Optimization.**

[![Gmail SMTP](https://img.shields.io/badge/Gmail-SMTP%20Port%20465%20%2F%20587-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](https://smtp.gmail.com)
[![Microsoft 365](https://img.shields.io/badge/Microsoft%20365-EOP%20%26%20Defender%20Ready-0078D4?style=for-the-badge&logo=microsoftoutlook&logoColor=white)](https://admin.exchange.microsoft.com)
[![RFC Compliant](https://img.shields.io/badge/RFC-5321%20%7C%205322%20%7C%202047-10B981?style=for-the-badge)](https://tools.ietf.org/html/rfc5322)
[![Serverless Dispatcher](https://img.shields.io/badge/Serverless-Dynamic%20DB%20Config-000000?style=for-the-badge&logo=vercel&logoColor=white)](#สถาปัตยกรรม-serverless-dispatcher--dynamic-smtp-configuration)
[![Node.js Native](https://img.shields.io/badge/Node.js-Native%20TLS-339933?style=for-the-badge&logo=node.js&logoColor=white)](./examples/smtp-send-example.js)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](#license)

<br/>

[เริ่มต้นใช้งาน (Quick Start)](#การตั้งค่าเริ่มต้นอย่างรวดเร็ว-quick-start) •
[Enterprise M365 & Corporate Inboxes](#การแก้ไขปัญหาและการส่งเข้า-microsoft-365--corporate-inboxes) •
[Serverless Architecture](#สถาปัตยกรรม-serverless-dispatcher--dynamic-smtp-configuration) •
[Anti-Spam Checklist](#กฎเหล็กป้องกันอีเมลตก-spam--junk-mail) •
[Interactive Web Tools](#ชุดเครื่องมือปฏิบัติการบนเว็บ-interactive-web-tools) •
[โค้ดตัวอย่าง](#การรันตัวอย่างสคริปต์-code-implementation) •
[เอกสารอ้างอิง](#เอกสารอ้างอิงเชิงลึก-references)

</div>

---

## <img src="./assets/icons/server.svg" width="20" height="20" align="absmiddle" /> แผนผังการทำงาน (Architecture & Delivery Pipeline)

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   Frontend & Static Web App                            │
│  - GitHub Pages / Vercel Web Client (เรียก Absolute API URL)           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ POST JSON
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│              Serverless Dispatcher (/api/send-email)                   │
│  - Real-time Config Fetch: Supabase `system_settings` / `system_secrets`│
│  - Zero-Credential Template & RFC 2047 Base64 Encoding                 │
│  - RFC 5322 Clean Headers (No X-Mailer / No Bot Anomaly Triggers)      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ SMTPS (Implicit TLS Port 465) / AUTH LOGIN
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         Google Gmail SMTP Gateway                      │
│  - SPF Alignment & Google DKIM Signature Auto-Signing                  │
│  - Reputation Guard & Rate Throttling                                  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Transport
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
┌───────────────────────────────────┐   ┌────────────────────────────────┐
│   General Inboxes (Gmail/Yahoo)   │   │  Microsoft 365 / Exchange EOP  │
│  - 100% Inbox Placement           │   │  - SCL 0 (Bypasses Quarantine) │
│  - Clean Header Compliance        │   │  - External Sender Permitted   │
│  - RFC 2047 Thai Subject Display  │   │  - Auto-Subscribe Members      │
└───────────────────────────────────┘   └────────────────────────────────┘
```

---

## <img src="./assets/icons/sliders.svg" width="20" height="20" align="absmiddle" /> ตารางเปรียบเทียบโหมดการเชื่อมต่อ (Connection Matrix)

| พารามิเตอร์ | Port 465 (แนะนำสูงสุด / Recommended ⭐) | Port 587 (Alternative) | Serverless Dynamic Relay (REST) |
|---|---|---|---|
| **Protocol** | SMTPS (Implicit TLS Direct) | SMTP + STARTTLS Upgrade | HTTPS REST + Native SMTPS |
| **ความปลอดภัย** | เข้ารหัสทันทีตั้งแต่ handshake | เริ่มต้นแบบ Plaintext ก่อน Upgrade | TLS 1.3 + Dynamic Secret Loading |
| **Authentication** | `AUTH LOGIN` / `AUTH PLAIN` | `AUTH LOGIN` / `AUTH PLAIN` | Database `system_secrets` Fetching |
| **Sending Limits** | 500 ฉบับ/วัน (Free) / 2,000 (Workspace) | 500 ฉบับ/วัน (Free) / 2,000 (Workspace) | 500 - 2,000 ฉบับ/วัน (ต่อบัญชี SMTP) |
| **Defender Compliance** | สมบูรณ์แบบ (เมื่อใช้ Zero-Credential) | สมบูรณ์แบบ | สมบูรณ์แบบ ป้องกัน Frontend Auth Fallback |
| **ความเสี่ยง MitM** | ต่ำมาก (TLS Direct) | ปานกลาง (อาจเกิด STARTTLS Stripping) | ต่ำมาก |

---

## <img src="./assets/icons/terminal.svg" width="20" height="20" align="absmiddle" /> การตั้งค่าเริ่มต้นอย่างรวดเร็ว (Quick Start)

### 1. การสร้าง Google App Password (รหัสผ่านเฉพาะแอป)
> [!IMPORTANT]
> Google ไม่อนุญาตให้ใช้รหัสผ่านบัญชีจริง (Less Secure Apps ถูกปิดใช้งานถาวร) ต้องใช้ **App Password 16 หลัก** เท่านั้น

1. เปิด **2-Step Verification** ที่ [Google Account Security](https://myaccount.google.com/security)
2. เข้าไปที่เมนู [Google App Passwords](https://myaccount.google.com/apppasswords)
3. กำหนดชื่อแอปพลิเคชัน เช่น `Email-Engine-Production`
4. คัดลอกรหัสผ่าน 16 หลัก (เช่น `abcd efgh ijkl mnop` นำช่องว่างออกเมื่อนำไปใช้)

### 2. ข้อมูล Connection Parameters มาตรฐาน
```ini
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=abcdefghijklmnop
```

---

## <img src="./assets/icons/building.svg" width="20" height="20" align="absmiddle" /> การแก้ไขปัญหาและการส่งเข้า Microsoft 365 & Corporate Inboxes

เมื่อส่งอีเมลจาก Gmail SMTP (`@gmail.com`) ไปยังโดเมนองค์กรหรือ Microsoft 365 (เช่น `@yourdomain.com`, `@company.com` หรือ M365 Groups) ต้องปฏิบัติตามมาตรฐานระดับ Enterprise ดังนี้:

### 1. กฎเหล็กป้องกัน Defender ตรวจจับเป็น High-Confidence Phishing (SCL 9 Quarantine)
* **พฤติกรรมของ Defender for Office 365 (EOP):** เมื่อได้รับอีเมลจากผู้ส่งภายนอก (`@gmail.com`) ที่มี Plaintext Password, รหัสผ่านตั้งต้น (`Initial Access`), หรือคำว่า `รหัสผ่านชั่วคราว` คู่กับลิงก์เข้าสู่ระบบ (`Log in / Sign in`) บนโดเมนภายนอก ระบบจะระบุว่าเป็นการโจมตีประเภท **Credential Harvesting / Phishing Attack**
* **ผลกระทบ:** EOP จะจัดอีเมลเป็น **High-Confidence Phishing (SCL 9)** และส่งเข้า **Admin Quarantine โดยตรง** ทำให้ผู้รับไม่เห็นอีเมลแม้แต่ในโฟลเดอร์ Junk Mail!
* **แนวทางแก้ไข (Zero-Credential Policy):** ออกแบบเทมเพลตเป็น **Clean Administrative Notification** แจ้งเฉพาะข้อมูลผู้ใช้ (ชื่อ, อีเมล, สิทธิ์, แผนก) และปุ่มเข้าสู่ระบบ โดยให้ผู้ใช้ใช้รหัสผ่านองค์กรหรือติดต่อ Admin แยกต่างหาก

```html
<!-- ตัวอย่าง Clean Administrative Notification Template ปลอดภัย 100% -->
<table role="presentation" width="100%" style="max-width:580px; background-color:#ffffff; font-family:'Sarabun', Arial, sans-serif;">
  <tr><td style="padding:24px;">
    <h2>แจ้งข้อมูลบัญชีผู้ใช้งานระบบ (Enterprise System Notification)</h2>
    <p>เรียน คุณ สมชาย ใจดี,</p>
    <p>ผู้ดูแลระบบได้สร้างและเปิดสิทธิ์การใช้งานสำหรับบัญชีของคุณเรียบร้อยแล้ว</p>
    <table style="background-color:#f8fafc; border:1px solid #e2e8f0; width:100%; padding:12px; margin:16px 0;">
      <tr><td>ชื่อ-สกุล:</td><td><strong>สมชาย ใจดี</strong></td></tr>
      <tr><td>อีเมล:</td><td><strong>somchai@company.com</strong></td></tr>
      <tr><td>บทบาท (Role):</td><td><strong>Operator</strong></td></tr>
    </table>
    <div style="text-align:center; margin:20px 0;">
      <a href="https://app.yourdomain.com" style="background-color:#2563eb; color:#ffffff; padding:12px 24px; text-decoration:none; border-radius:6px;">เข้าสู่ระบบเพื่อเริ่มใช้งาน</a>
    </div>
    <p style="font-size:0.8rem; color:#64748b; border-top:1px dashed #e2e8f0; padding-top:10px;">
      * เพื่อความปลอดภัยสูงสุด ระบบจะไม่มีการระบุรหัสผ่านในอีเมล โปรดใช้รหัสผ่านตั้งต้นขององค์กร
    </p>
  </td></tr>
</table>
```

### 2. ชุดคำสั่ง Exchange Online PowerShell Suite
```powershell
# เชื่อมต่อ Exchange Online ในฐานะ Admin
Connect-ExchangeOnline -UserPrincipalName admin@yourdomain.com

# โหมด 1: สำหรับ Modern Microsoft 365 Unified Group
# ปลดบล็อกผู้ส่งภายนอก (แก้ 550 5.7.133 NDR) + เปิด Auto-Subscribe ให้เด้งเข้า Inbox สมาชิก
Set-UnifiedGroup -Identity "group-name@yourdomain.com" `
  -RequireSenderAuthenticationEnabled $false `
  -AutoSubscribeNewMembers $true

# โหมด 2: สำหรับ Classic Distribution Group (DL)
Set-DistributionGroup -Identity "dl-name@yourdomain.com" `
  -RequireSenderAuthenticationEnabled $false

# โหมด 3: Mail Flow Rule (Bypass Spam / ตั้งค่า SCL -1 สำหรับอีเมลระบบแจ้งเตือน)
New-TransportRule -Name "Bypass Spam for App Notifications" `
  -SenderAddressMatchesPatterns "app.noreply.mailer@gmail.com" `
  -SetSCL -1 `
  -State Enabled `
  -Comments "Allow external Gmail SMTP notifications without Defender quarantine"
```

### 3. การตัด Custom Headers ที่กระตุ้น Bot Anomaly Heuristics
> [!WARNING]
> ห้ามใส่ Header ต่อไปนี้ เพราะระบบ EOP จะมองว่าเป็น Script Anomaly หรือตัดการ forward เข้า Inbox สมาชิก:
- <img src="./assets/icons/x.svg" width="14" height="14" align="absmiddle" /> **ห้ามใช้** `Auto-Submitted: auto-generated` *(ทำให้ M365 ข้ามการ forward เข้า mailbox สมาชิก)*
- <img src="./assets/icons/x.svg" width="14" height="14" align="absmiddle" /> **ห้ามใช้** `Precedence: bulk` หรือ `Precedence: list`
- <img src="./assets/icons/x.svg" width="14" height="14" align="absmiddle" /> **ห้ามใช้** `X-Mailer`, `X-Priority`, `X-Entity-Ref-ID`
- <img src="./assets/icons/check.svg" width="14" height="14" align="absmiddle" /> **ใช้เฉพาะ Header มาตรฐาน:** `Date`, `From`, `To`, `Subject`, `Message-ID`, `Reply-To`, `Content-Language: th`, `MIME-Version: 1.0`

---

## <img src="./assets/icons/server.svg" width="20" height="20" align="absmiddle" /> สถาปัตยกรรม Serverless Dispatcher & Dynamic SMTP Configuration

เมื่อพัฒนา Web Application แบบ Hybrid (Frontend อยู่บน GitHub Pages หรือ Vercel และ Database อยู่บน Supabase):

1. **Endpoint Auto-Routing (ป้องกัน 404 & Silent Auth Fallback):**
   - Frontend ที่เป็น Single Page Application (SPA) บน GitHub Pages ต้องเรียก API ด้วย **Absolute Serverless URL** (เช่น `https://api.yourdomain.com/api/send-email`)
   - ป้องกันปัญหาการเรียก Relative Path `/api/send-email` บน Static Hosting แล้วเกิด HTTP 404 ซึ่งจะทำให้โค้ด Frontend ตกไปทำงานใน Third-party Auth Fallback (ส่งอีเมลรีเซ็ตรหัสผ่านภาษาอังกฤษออกมาแทน)
2. **Dynamic Database Config Loading:**
   - API Serverless Dispatcher จะเชื่อมต่อไปยัง Supabase (`system_settings` และ `system_secrets`) เพื่อดึงค่า `smtp_config` และ `smtp_password` แบบ Real-time ทุกครั้งที่ส่ง
   - ทำให้เมื่อผู้ดูแลระบบเปลี่ยนรหัสผ่าน App Password หรือแก้ไขอีเมลผู้ส่งบน Web UI การตั้งค่าจะมีผลทันทีโดยไม่ต้อง Build หรือ Redeploy โค้ดใหม่

```javascript
// ตัวอย่าง Serverless Dispatcher Handler (api/send-email.js)
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '../lib/smtp-native.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { data: config } = await supabase.from('system_settings').select('value').eq('key', 'smtp_config').single();
    const { data: secret } = await supabase.from('system_secrets').select('value').eq('key', 'smtp_password').single();
    const { toEmail, subject, textContent, htmlContent } = req.body;

    await sendEmail({
      user: config.value.user,
      pass: secret.value.password,
      fromEmail: config.value.from_email,
      fromName: config.value.from_name,
      toEmail,
      subject,
      textContent,
      htmlContent
    });

    return res.status(200).json({ success: true, message: 'Delivered to corporate mailbox' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
```

---

## <img src="./assets/icons/shield-check.svg" width="20" height="20" align="absmiddle" /> กฎเหล็กป้องกันอีเมลตก Spam / Junk Mail

| หมวดหมู่ | ข้อกำหนดสำคัญและวิธีปฏิบัติ |
|---|---|
| <img src="./assets/icons/lock.svg" width="16" height="16" align="absmiddle" /> **Authentication** | Envelope From (`MAIL FROM`) และ Header `From:` ต้องตรงกัน เพื่อให้ Google เซ็น DKIM สมบูรณ์ |
| <img src="./assets/icons/globe.svg" width="16" height="16" align="absmiddle" /> **Thai Encoding** | Subject และ Sender Name ที่มีภาษาไทย ต้อง encode ผ่าน RFC 2047 (`=?UTF-8?B?...?=`) เท่านั้น |
| <img src="./assets/icons/layers.svg" width="16" height="16" align="absmiddle" /> **MIME Structure** | ต้องมีโครงสร้าง `multipart/alternative` ที่บรรจุทั้ง `text/plain` และ `text/html` เสมอ |
| <img src="./assets/icons/shield-check.svg" width="16" height="16" align="absmiddle" /> **Zero-Credential** | ห้ามระบุรหัสผ่านจริงหรือคำล่อแหลมในเนื้อหา ป้องกัน Defender กักกันเป็น Phishing (SCL 9) |
| <img src="./assets/icons/tag.svg" width="16" height="16" align="absmiddle" /> **Clean Headers** | มี `Date`, `Message-ID`, `Content-Language: th`, `MIME-Version: 1.0` และไม่มี `X-Mailer` |
| <img src="./assets/icons/code.svg" width="16" height="16" align="absmiddle" /> **HTML Hygiene** | ใช้ Table-based layout, Inline CSS 100%, ห้ามมี `<script>`, `<iframe>`, หรือ `<form>` |
| <img src="./assets/icons/sliders.svg" width="16" height="16" align="absmiddle" /> **Link Hygiene** | ลิงก์ปลายทางต้องเป็น `https://` ปลอดภัย, **ห้ามใช้ URL Shorteners** (bit.ly, tinyurl) และห้ามใช้ Raw IP |
| <img src="./assets/icons/terminal.svg" width="16" height="16" align="absmiddle" /> **Throttling** | มีระบบหน่วงเวลาส่งระหว่างฉบับอย่างน้อย 500ms - 1000ms เพื่อป้องกัน Rate Limit |

---

## <img src="./assets/icons/layout.svg" width="20" height="20" align="absmiddle" /> ชุดเครื่องมือปฏิบัติการบนเว็บ (Interactive Web Tools)

โปรเจกต์นี้มาพร้อมกับ Web Interactive Suite ในตัว (`index.html`) รองรับการทำงานแบบ Zero-Build:

1. 🛠️ **RFC 2047 Thai Header Live Encoder:** เครื่องมือทดสอบแปลงหัวข้ออีเมลและชื่อผู้ส่งภาษาไทยเป็น Base64 MIME Header แบบเรียลไทม์
2. 🏢 **Enterprise M365 PowerShell Generator:** สร้างสคริปต์ Exchange Online สำหรับ Unified Group, Distribution Group และ Mail Flow Rule
3. ✉️ **Zero-Credential Template Generator & Live Preview:** ออกแบบเทมเพลตแจ้งเปิดสิทธิ์บัญชีผู้ใช้พร้อมจำลองการแสดงผลบน Outlook Web และสร้างโค้ด HTML มาตรฐาน
4. 📊 **Anti-Spam & EOP Deliverability Score Calculator:** คำนวณความพร้อมและคะแนน Deliverability ตามเกณฑ์ Google/Yahoo 2024+ และ Defender Heuristics
5. 🔍 **Corporate Inboxes Troubleshooting Hub:** รวม 4 กรณีศึกษาจริง เช่น ปัญหาอีเมลหายไปจาก Outlook, NDR 550 5.7.133, และ Frontend Auth Fallback
6. ⚡ **Production Code Generator:** สร้างโค้ดส่งอีเมลพร้อมใช้ใน 4 สถาปัตยกรรม (Native Node.js, Serverless Dispatcher, Nodemailer, Python)

---

## <img src="./assets/icons/code.svg" width="20" height="20" align="absmiddle" /> การรันตัวอย่างสคริปต์ (Code Implementation)

โค้ดตัวอย่าง Native TLS Client แบบไม่พึ่งพาภายนอก (Zero External Dependencies) อยู่ที่ [`examples/smtp-send-example.js`](./examples/smtp-send-example.js)

```javascript
import { sendEmail } from './examples/smtp-send-example.js';

await sendEmail({
  user: 'sender@gmail.com',
  pass: 'your-16-char-app-password',
  fromEmail: 'sender@gmail.com',
  fromName: 'ระบบแจ้งเตือนอัตโนมัติ',
  toEmail: 'somchai@company.com',
  subject: 'แจ้งข้อมูลบัญชีผู้ใช้งานระบบ',
  textContent: 'สวัสดีครับ ผู้ดูแลระบบได้สร้างและเปิดสิทธิ์การใช้งานสำหรับคุณเรียบร้อยแล้ว',
  htmlContent: '<h2 style="color:#2563EB;">แจ้งเปิดสิทธิ์การใช้งาน</h2><p>กรุณาเข้าสู่ระบบผ่านลิงก์ขององค์กร</p>'
});
```

### การทดสอบรันสคริปต์
```bash
node examples/smtp-send-example.js
```

---

## <img src="./assets/icons/folder-tree.svg" width="20" height="20" align="absmiddle" /> โครงสร้างโปรเจกต์ (Project Structure)

```text
gmail-smtp/
├── .github/
│   └── workflows/
│       └── deploy-pages.yml                    # Automated GitHub Pages Deployment Workflow
├── .gitignore                                  # กรองไฟล์ node_modules และ credential ชั่วคราว
├── SKILL.md                                    # Core Skill Instructions สำหรับ AI Assistant
├── README.md                                   # Production-ready Documentation & Runbook
├── index.html                                  # Interactive Web Suite & Diagnostic Playground
├── styles.css                                  # UI/UX Pro Max Dark Slate Theme & Responsive CSS
├── app.js                                      # Pure Vanilla Engine (Encoders, Generators, Calculator)
├── assets/
│   └── icons/                                  # Pure SVG Icons (UI/UX Pro Max)
│       ├── mail.svg, server.svg, sliders.svg
│       ├── building.svg, shield-check.svg
│       └── ...
├── components/                                 # WebGL Shader Atmosphere (AcidSquares, Strands)
├── examples/
│   └── smtp-send-example.js                    # Native TLS Implementation with Thai RFC 2047
└── references/
    ├── anti-spam-deliverability.md             # RFC Standards, SPF/DKIM/DMARC, Google/Yahoo 2024 Rules
    ├── gmail-smtp-config.md                    # TLS 1.3, SMTPS Port 465 vs 587, Error Code Map
    └── m365-group-delivery.md                  # M365 EOP, Defender Phishing Quarantine, PowerShell Runbook
```

---

## <img src="./assets/icons/book-open.svg" width="20" height="20" align="absmiddle" /> เอกสารอ้างอิงเชิงลึก (References)

- <img src="./assets/icons/file-text.svg" width="15" height="15" align="absmiddle" /> [Microsoft 365 & Corporate Inbox Delivery Guide](./references/m365-group-delivery.md) — วิเคราะห์เจาะลึกปัญหา Defender Phishing Quarantine (SCL 9), NDR 550, Transport Rules และการคอนฟิก Exchange Online
- <img src="./assets/icons/file-text.svg" width="15" height="15" align="absmiddle" /> [Anti-Spam & Deliverability Checklist](./references/anti-spam-deliverability.md) — คู่มือข้อกำหนดผู้ส่งของ Google & Yahoo (2024+ Requirements) และการปรับแต่ง Content Scoring
- <img src="./assets/icons/file-text.svg" width="15" height="15" align="absmiddle" /> [Gmail SMTP Technical Details](./references/gmail-smtp-config.md) — คู่มือเทคนิค SMTP Protocol, Response Codes (250, 354, 421, 535, 550) และ Rate Limits

---

## <img src="./assets/icons/file-text.svg" width="20" height="20" align="absmiddle" /> License
MIT © 2026 Internal Skill Configuration & Runbook

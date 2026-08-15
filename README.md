<div align="center">

# Gmail SMTP & Email Deliverability Runbook

**Production-grade Gmail SMTP configuration, Microsoft 365 Group delivery fix, and Anti-Spam inbox optimization.**

[![Gmail SMTP](https://img.shields.io/badge/Gmail-SMTP%20Port%20465%20%2F%20587-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](https://smtp.gmail.com)
[![Microsoft 365](https://img.shields.io/badge/Microsoft%20365-EOP%20%26%20Group%20Ready-0078D4?style=for-the-badge&logo=microsoftoutlook&logoColor=white)](https://admin.exchange.microsoft.com)
[![RFC Compliant](https://img.shields.io/badge/RFC-5321%20%7C%205322%20%7C%202047-10B981?style=for-the-badge)](https://tools.ietf.org/html/rfc5322)
[![Node.js Native](https://img.shields.io/badge/Node.js-Native%20TLS-339933?style=for-the-badge&logo=node.js&logoColor=white)](./examples/smtp-send-example.js)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](#license)

<br/>

[เริ่มต้นใช้งาน (Quick Start)](#การตั้งค่าเริ่มต้นอย่างรวดเร็ว-quick-start) •
[แก้ปัญหา Microsoft 365 Group](#การแก้ไขปัญหาการส่งเข้า-microsoft-365-group) •
[Anti-Spam Checklist](#กฎเหล็กป้องกันอีเมลตก-spam--junk-mail) •
[โค้ดตัวอย่าง](#การรันตัวอย่างสคริปต์-code-implementation) •
[เอกสารอ้างอิง](#เอกสารอ้างอิงเชิงลึก-references)

</div>

---

## <img src="./assets/icons/server.svg" width="20" height="20" align="absmiddle" /> แผนผังการทำงาน (Architecture & Delivery Pipeline)

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        Native Node.js / App                            │
│  - RFC 2047 Thai Subject & Name Base64 Encoding                        │
│  - MIME Multipart/Alternative (Text + HTML)                            │
│  - Unique Message-ID + Date Header                                     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Implicit TLS (Port 465) / AUTH LOGIN
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         Google Gmail SMTP                              │
│  - SPF Verification / DKIM Signing by Google                           │
│  - Reputation & Throttling Guard                                       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ SMTPS Transport
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
┌───────────────────────────────────┐   ┌────────────────────────────────┐
│   General Mailbox (Gmail/Yahoo)   │   │  Microsoft 365 / Exchange EOP  │
│  - 100% Inbox Placement           │   │  - External Sender Permitted   │
│  - Clean Header Compliance        │   │  - Auto-Subscribe Enabled      │
└───────────────────────────────────┘   └────────────────────────────────┘
```

---

## <img src="./assets/icons/sliders.svg" width="20" height="20" align="absmiddle" /> ตารางเปรียบเทียบโหมดการเชื่อมต่อ (Connection Matrix)

| พารามิเตอร์ | Port 465 (แนะนำสูงสุด / Recommended) | Port 587 (Alternative) | Direct API (REST) |
|---|---|---|---|
| **Protocol** | SMTPS (Implicit TLS) | SMTP + STARTTLS | HTTPS REST |
| **ความปลอดภัย** | เข้ารหัสทันทีตั้งแต่ handshake | เริ่มต้นแบบ Plaintext ก่อน Upgrade | OAuth2 Bearer Token |
| **Authentication** | `AUTH LOGIN` / `AUTH PLAIN` | `AUTH LOGIN` / `AUTH PLAIN` | Google Cloud Service Account |
| **Sending Limits** | 500 ฉบับ/วัน (Free) / 2,000 (Workspace) | 500 ฉบับ/วัน (Free) / 2,000 (Workspace) | ตาม Quota ของ Cloud Project |
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

## <img src="./assets/icons/building.svg" width="20" height="20" align="absmiddle" /> การแก้ไขปัญหาการส่งเข้า Microsoft 365 Group

เมื่อส่งอีเมลจาก Gmail SMTP ไปยัง Group หรือ Distribution List ของ Microsoft 365 แล้วผู้รับไม่ได้รับ ให้ปฏิบัติตาม 3 ขั้นตอนนี้:

### Step 1: เปิดอนุญาต External Senders (สาเหตุหลักอันดับ 1)
*ค่าเริ่มต้นของ M365 Group จะปฏิเสธผู้ส่งภายนอกองค์กรทั้งหมด*

* **วิธีที่ 1: ผ่าน Exchange Admin Center (GUI)**
  1. เข้า [Exchange Admin Center](https://admin.exchange.microsoft.com) → ไปที่ **Recipients** → **Groups**
  2. เลือกกลุ่มที่ต้องการ → ไปที่แท็บ **Settings**
  3. ติ๊กเลือก **"Allow external senders to email this group"** (อนุญาตให้ผู้ส่งภายนอกส่งอีเมลถึงกลุ่มนี้)

* **วิธีที่ 2: ผ่าน Exchange Online PowerShell**
  ```powershell
  Set-UnifiedGroup -Identity "group-name@yourdomain.com" -RequireSenderAuthenticationEnabled $false
  ```

### Step 2: เปิด Auto-Subscription ให้สมาชิกทุกคนได้รับอีเมล
*หากอีเมลเข้า Group Mailbox กลาง แต่ไม่เด้งเข้า Inbox ส่วนตัวของสมาชิก:*
```powershell
Set-UnifiedGroup -Identity "group-name@yourdomain.com" -AutoSubscribeNewMembers $true
```

### Step 3: ปรับแต่ง Headers ป้องกัน EOP กักกัน (Quarantine)
> [!WARNING]
> ห้ามใส่ Header ต่อไปนี้ เพราะระบบ Exchange Online Protection (EOP) จะมองว่าเป็น Bot หรือ Spam ทันที:
- <img src="./assets/icons/x.svg" width="14" height="14" align="absmiddle" /> **ห้ามใช้** `Auto-Submitted: auto-generated` *(ทำให้ M365 ข้ามการ forward เข้า mailbox สมาชิก)*
- <img src="./assets/icons/x.svg" width="14" height="14" align="absmiddle" /> **ห้ามใช้** `Precedence: bulk` หรือ `Precedence: list`
- <img src="./assets/icons/x.svg" width="14" height="14" align="absmiddle" /> **ห้ามใช้** `X-Mailer: <unknown-script-name>`

---

## <img src="./assets/icons/shield-check.svg" width="20" height="20" align="absmiddle" /> กฎเหล็กป้องกันอีเมลตก Spam / Junk Mail

| หมวดหมู่ | ข้อกำหนดสำคัญและวิธีปฏิบัติ |
|---|---|
| <img src="./assets/icons/lock.svg" width="16" height="16" align="absmiddle" /> **Authentication** | Envelope From (`MAIL FROM`) และ Header `From:` ต้องตรงกัน เพื่อให้ Google เซ็น DKIM สมบูรณ์ |
| <img src="./assets/icons/globe.svg" width="16" height="16" align="absmiddle" /> **Thai Encoding** | Subject และ Sender Name ที่มีภาษาไทย ต้อง encode ผ่าน RFC 2047 (`=?UTF-8?B?...?=`) เท่านั้น |
| <img src="./assets/icons/layers.svg" width="16" height="16" align="absmiddle" /> **MIME Structure** | ต้องมีโครงสร้าง `multipart/alternative` ที่บรรจุทั้ง `text/plain` และ `text/html` เสมอ |
| <img src="./assets/icons/tag.svg" width="16" height="16" align="absmiddle" /> **Required Headers** | ต้องมี `Date` (RFC 5322), `Message-ID` (Unique UUID), `MIME-Version: 1.0` ครบถ้วน |
| <img src="./assets/icons/code.svg" width="16" height="16" align="absmiddle" /> **HTML Hygiene** | ใช้ Table-based layout, Inline CSS 100%, ห้ามมี `<script>`, `<iframe>`, หรือ `<form>` |
| <img src="./assets/icons/sliders.svg" width="16" height="16" align="absmiddle" /> **Link Hygiene** | ลิงก์ปลายทางต้องเป็น `https://` ปลอดภัย, **ห้ามใช้ URL Shorteners** (bit.ly, tinyurl) และห้ามใช้ Raw IP |
| <img src="./assets/icons/terminal.svg" width="16" height="16" align="absmiddle" /> **Throttling** | มีระบบหน่วงเวลาส่งระหว่างฉบับอย่างน้อย 500ms - 1000ms เพื่อป้องกัน Rate Limit |

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
  toEmail: 'm365-group@company.com',
  subject: 'ทดสอบส่งอีเมลภาษาไทย RFC 2047',
  textContent: 'สวัสดีครับ นี่คือข้อความแบบ Plain Text มาตรฐาน',
  htmlContent: '<h1 style="color:#0078D4;">สวัสดีครับ</h1><p>นี่คือข้อความ HTML Template</p>'
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
├── .gitignore                                  # กรองไฟล์ node_modules และ credential ชั่วคราว
├── SKILL.md                                    # Core Skill Instructions สำหรับ AI Assistant
├── README.md                                   # Production-ready Documentation & Runbook
├── assets/
│   └── icons/                                  # Pure SVG Icons (UI/UX Pro Max)
│       ├── mail.svg, server.svg, sliders.svg
│       ├── building.svg, shield-check.svg
│       └── ...
├── examples/
│   └── smtp-send-example.js                    # Native TLS Implementation with Thai RFC 2047
└── references/
    ├── anti-spam-deliverability.md             # RFC Standards, SPF/DKIM/DMARC, Google/Yahoo 2024 Rules
    ├── gmail-smtp-config.md                    # TLS 1.3, SMTPS Port 465 vs 587, Error Code Map
    └── m365-group-delivery.md                  # M365 EOP, Exchange Admin Center, PowerShell Runbook
```

---

## <img src="./assets/icons/book-open.svg" width="20" height="20" align="absmiddle" /> เอกสารอ้างอิงเชิงลึก (References)

- <img src="./assets/icons/file-text.svg" width="15" height="15" align="absmiddle" /> [Microsoft 365 Group Delivery Guide](./references/m365-group-delivery.md) — วิเคราะห์เจาะลึก NDR, Quarantine, Transport Rules และการคอนฟิก Exchange Online
- <img src="./assets/icons/file-text.svg" width="15" height="15" align="absmiddle" /> [Anti-Spam & Deliverability Checklist](./references/anti-spam-deliverability.md) — คู่มือข้อกำหนดผู้ส่งของ Google & Yahoo (2024+ Requirements) และการปรับแต่ง Content Scoring
- <img src="./assets/icons/file-text.svg" width="15" height="15" align="absmiddle" /> [Gmail SMTP Technical Details](./references/gmail-smtp-config.md) — คู่มือเทคนิค SMTP Protocol, Response Codes (250, 354, 421, 535, 550) และ Rate Limits

---

## <img src="./assets/icons/file-text.svg" width="20" height="20" align="absmiddle" /> License
MIT © 2026 Internal Skill Configuration & Runbook

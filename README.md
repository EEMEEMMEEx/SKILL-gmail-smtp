# Gmail SMTP & Enterprise Email Deliverability Toolkit

ชุดเครื่องมือและรันบุ๊กมาตรฐานสำหรับจัดส่งอีเมลธุรกรรม (Transactional Email) ผ่าน Gmail SMTP ไปยัง Gmail, Microsoft 365 และกล่องจดหมายองค์กร พร้อมระบบจำลองและหน้าเว็บ Interactive Toolkit ที่ขับเคลื่อนด้วย **ReactBits** (WebGL Shaders & Scalable SVG Icon System), แนวทางวิเคราะห์ NDR, การรับมือตัวกรอง Anti-Spam NLP/Heuristics, สถาปัตยกรรม Unified Rendering, และนโยบาย Zero-Credential Exposure

> **ขอบเขตความปลอดภัย:** รันบุ๊กและเครื่องมือนี้ไม่รับรอง Inbox Placement 100% และห้ามใช้วิธีปิดระบบรักษาความปลอดภัยหรือสร้าง Wide Whitelist/Bypass Rules เพื่อให้การทดสอบผ่าน การปรับแต่งนโยบาย Microsoft 365 Exchange Online Protection / Microsoft Defender ต้องได้รับการประเมินและอนุมัติจาก Exchange Administrator เท่านั้น

---

## สารบัญ
- [การติดตั้งและการนำไปใช้งาน (Installation & Setup)](#การตดตงและการนำไปใชงาน-installation--setup)
- [เริ่มต้นอย่างรวดเร็ว (Quick Start)](#เรมตนอยางรวดเรว-quick-start)
- [สถาปัตยกรรมระบบ (System Architecture)](#สถาปตยกรรมระบบ-system-architecture)
- [คู่มือการแยกจุดขัดข้อง (Troubleshooting & Pipeline Isolation)](#คมอการแยกจดขดของ-troubleshooting--pipeline-isolation)
- [การป้องกัน Anti-Spam NLP และ Phishing Lure Heuristics](#การปองกน-anti-spam-nlp-และ-phishing-lure-heuristics)
- [สถาปัตยกรรม Unified Rendering และ Database State Auto-Upgrade](#สถาปตยกรรม-unified-rendering-และ-database-state-auto-upgrade)
- [นโยบาย Zero-Credential Exposure](#นโยบาย-zero-credential-exposure)
- [Interactive Toolkit & ReactBits UI](#interactive-toolkit--reactbits-ui)
- [เช็กลิสต์การทดสอบอัตโนมัติ (Automated Verification)](#เชกลสตการทดสอบอตโนมต-automated-verification)
- [เอกสารอ้างอิงและโครงสร้างโปรเจกต์](#เอกสารอางองและโครงสรางโปรเจกต)

---

## การติดตั้งและการนำไปใช้งาน (Installation & Setup)

ชุดเครื่องมือนี้สามารถติดตั้งและนำไปใช้งานได้ 3 รูปแบบตามบริบทของระบบ:

### 1. ติดตั้งเป็น AI Agent Skill (Antigravity / Gemini Customization)

#### ก. ติดตั้งด่วนด้วย `npx` (Non-interactive One-Liner ผ่าน `degit` แนะนำสูงสุด)

- **ติดตั้งระดับ Workspace (เฉพาะโปรเจกต์เป้าหมาย):**
  ```bash
  # รันคำสั่งนี้ที่ Root ของโปรเจกต์
  npx -y degit EEMEEMMEEx/SKILL-gmail-smtp .agents/skills/gmail-smtp
  ```

  *(กรณีมีโฟลเดอร์เดิมอยู่แล้วและต้องการเขียนทับ: `npx -y degit EEMEEMMEEx/SKILL-gmail-smtp .agents/skills/gmail-smtp --force`)*

- **ติดตั้งระดับ Global (ใช้งานได้ทุกโปรเจกต์บนเครื่อง):**
  - **Windows (PowerShell):**
    ```powershell
    npx -y degit EEMEEMMEEx/SKILL-gmail-smtp "$env:USERPROFILE\.gemini\config\skills\gmail-smtp"
    ```
  - **macOS / Linux (Bash/Zsh):**
    ```bash
    npx -y degit EEMEEMMEEx/SKILL-gmail-smtp ~/.gemini/config/skills/gmail-smtp
    ```

#### ข. ติดตั้งแบบ Manual / คัดลอกไฟล์

- **ระดับ Workspace:**
  ```bash
  mkdir -p .agents/skills/gmail-smtp
  cp SKILL.md .agents/skills/gmail-smtp/
  cp -r references .agents/skills/gmail-smtp/
  ```
- **ระดับ Global:**
  คัดลอกไฟล์ `SKILL.md` และโฟลเดอร์ `references/` ไปไว้ที่ `%USERPROFILE%\.gemini\config\skills\gmail-smtp\` (Windows) หรือ `~/.gemini/config/skills/gmail-smtp/` (macOS/Linux)

- **การเรียกใช้งานโดย AI:**
  AI Agent จะตรวจพบ Skill นี้โดยอัตโนมัติ (Progressive Disclosure) เมื่อมีการสอบถามหรือสืบสวนปัญหาเกี่ยวกับ Gmail SMTP, Nodemailer, Microsoft 365 / Outlook NDRs, หรือ Deliverability Drop หรือผู้ใช้สามารถสั่งเจาะจงด้วย `@gmail-smtp`

---

### 2. ติดตั้งสำหรับโปรเจกต์ Web Application / Node.js Backend

- **ติดตั้ง Dependencies สำหรับการส่งอีเมล:**
  ```bash
  npm install nodemailer dotenv
  ```
  *(หรือ `pnpm add nodemailer dotenv` / `yarn add nodemailer dotenv`)*

- **ตั้งค่าตัวแปรสภาพแวดล้อม (.env / Secret Manager):**
  สร้างไฟล์ `.env` ในระดับ Root ของ Backend (ห้ามบันทึกเข้า Git):
  ```ini
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=465
  SMTP_SECURE=true
  SMTP_USER=your-service-account@gmail.com
  SMTP_PASS=xxxx-xxxx-xxxx-xxxx # Google App Password 16 หลัก
  ```

- **ตั้งค่า Vite Dev Server Proxy (แก้ปัญหา HTTP 404 ในระหว่าง Development):**
  สำหรับโปรเจกต์ Frontend ที่เรียก API ภายในเครื่อง ให้กำหนด Middleware ใน `vite.config.js`:
  ```javascript
  // vite.config.js
  export default defineConfig({
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3000', // ชี้ไปยังเซิร์ฟเวอร์ Backend หรือ Local API
          changeOrigin: true
        }
      }
    }
  });
  ```

---

### 3. ติดตั้งและเปิดใช้งาน Interactive Web Toolkit (Zero-Build)

- **Clone Repository ลงเครื่อง:**
  ```bash
  git clone https://github.com/EEMEEMMEEx/SKILL-gmail-smtp.git
  cd SKILL-gmail-smtp
  ```
- **เปิดใช้งานได้ทันที (Zero-Build):**
  - ดับเบิลคลิกเปิดไฟล์ [`landing-page/index.html`](./landing-page/index.html) หรือ [`index.html`](./index.html) บนเว็บเบราว์เซอร์
  - หรือรันผ่าน Local Static Web Server:
    ```bash
    npx serve .
    ```

---

## เริ่มต้นอย่างรวดเร็ว (Quick Start)

1. **สร้าง Google App Password:**
   - เปิดใช้งาน 2-Step Verification บนบัญชี Google
   - สร้าง [Google App Password](https://myaccount.google.com/apppasswords) สำหรับระบบ (ใช้ App Password 16 หลักเท่านั้น ห้ามใช้รหัสผ่านบัญชีจริง)
2. **กำหนดค่าคอนฟิกฝั่ง Backend Environment (ห้าม Commit ข้อมูลลับ):**

   ```ini
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_SECURE=true
   SMTP_USER=sender@gmail.com
   SMTP_PASS=xxxx-xxxx-xxxx-xxxx
   ```

3. **ทดสอบส่งผ่าน Native TLS Client:**
   - ใช้ Port `465` (Implicit TLS) หรือ Port `587` (STARTTLS พร้อมบังคับใช้ TLS)
   - รันตัวอย่างสคริปต์ [examples/smtp-send-example.js](./examples/smtp-send-example.js):

   ```bash
   node examples/smtp-send-example.js
   ```

---

## สถาปัตยกรรมระบบ (System Architecture)

```text
[ Web Application (Frontend / UI) ]
   │  • React UI (Settings / Template Manager / Action Trigger)
   │  • Notification Dispatcher (Role-based Recipient Resolution & Deduplication)
   │  • Email Renderer (Unified Responsive HTML Table Engine)
   ▼
[ API Gateway & Local Dev Layer ]
   │  • Vite Dev Server Proxy / Middleware (Route /api/send-email)
   │  • Vercel / Node.js Serverless Function (api/send-email.js)
   ▼
[ SMTP Relay Layer ]
   │  • Gmail SMTP (smtp.gmail.com:465 Implicit TLS / 587 STARTTLS)
   │  • RFC 5322 MIME Delivery & Message-ID Generation
   ▼
[ Enterprise Inbound Filtering (Microsoft 365) ]
   │  • Exchange Online Protection (SPF, DKIM, DMARC Validation)
   │  • Microsoft Defender for Office 365 (NLP Urgency & Phishing Lure Heuristics)
   ▼
[ Recipient Focused Inbox ]
   └─ recipient@yourcompany.com (Delivery Verified: SCL 0-1)
```

---

## คู่มือการแยกจุดขัดข้อง (Troubleshooting & Pipeline Isolation)

การได้รับผลลัพธ์ `250 2.0.0 OK` จาก Gmail SMTP หมายถึงเซิร์ฟเวอร์รับฝากส่งเข้าคิวเรียบร้อยแล้วเท่านั้น **ไม่ใช่หลักฐานว่าอีเมลส่งถึง Inbox ของผู้รับ** ให้ตรวจสอบตามตารางสัญญาณเตือน:

| สัญญาณ / Error Code | สาเหตุหลักที่พบ | แนวทางแก้ไขและปฏิบัติการ |
|---|---|---|
| `HTTP 404 / 5xx` ก่อนถึง SMTP | Dev Server ขาด Proxy สำหรับ `/api/send-email` (Vite ส่งกลับเป็น `index.html` fallback) หรือเส้นทาง API ไม่ถูกแมป | ติดตั้ง Middleware/Proxy ใน `vite.config.js` หรือระบุ Absolute Backend URL พร้อมทดสอบด้วย `OPTIONS` และ Validation `POST` (ต้องได้ `400` เมื่อไม่ส่ง payload) |
| Event สำเร็จแต่ไม่มีอีเมลส่งออก | Handler ใน UI/RPC ไม่ได้เรียก Dispatcher หรือระบบค้นหา Role ผู้รับไม่พบข้อมูล | ผูกคำสั่งส่งใน Handler หลังการบันทึกสำเร็จ, ตรวจสอบการ Query Role (`ADMIN`/`SUPERVISOR`), และติดตั้ง In-Memory Deduplication ป้องกันส่งซ้ำ |
| `535` หรือ `EAUTH` | App Password ผิด, ถูกเพิกถอน หรือบัญชีถูกระงับ SMTP Authentication | ตรวจสอบค่าคอนฟิก, ออก App Password ใหม่ และหมุนเวียนผ่าน Secret Manager |
| `550 5.4.1 Recipient address rejected: Access denied` | M365 Directory-Based Edge Blocking (DBEB): ไม่มีชื่อ Mailbox หรือ Alias นี้ใน Entra ID/Exchange | ประสานงานกับผู้ดูแลระบบปลายทางเพื่อตรวจสอบสถานะ Provisioning ของ Mailbox ห้าม Retry ซ้ำ |
| `550 5.1.1` | Hard Bounce: ไม่มีที่อยู่อีเมลนี้อยู่จริง | นำอีเมลออกจากระบบและเพิ่มเข้า Suppression List ทันที |
| `550 5.7.133` | M365 Distribution Group ปิดรับอีเมลจาก External Sender | แจ้ง Exchange Admin เพื่อตรวจสอบและเปิดรับเฉพาะกลุ่มที่ได้รับอนุมัติ |
| `421`, `451`, `452` | อัตราการส่งเกินโควตา (Throttling) หรือปัญหาเครือข่ายชั่วคราว | ตั้งระบบคิวส่งซ้ำด้วย Bounded Exponential Backoff พร้อมจำกัดจำนวนครั้ง |
| ส่งสำเร็จ (`250 OK`) แต่ไม่พบใน Inbox | ถูกกักกัน (Quarantine) หรือลงโฟลเดอร์ Junk จากตัวกรอง Heuristics NLP / Phishing Lure ของ Defender | ตรวจสอบหัวข้ออีเมล (หลีกเลี่ยงคำว่า *"เตือนภัย"*), ปรับโทนสีกล่องแจ้งเตือนเป็นสี Amber, ตรวจสอบ Preheader Spacing, และเปิดดูค่า `SCL` ใน Header |

---

## การป้องกัน Anti-Spam NLP และ Phishing Lure Heuristics

Microsoft Defender for Office 365 และระบบตรวจจับสแปมสมัยใหม่ใช้อัลกอริทึม NLP วิเคราะห์เจตนาและรูปแบบภาพ (Visual Pattern) เพื่อจัดอันดับความเสี่ยง (Spam Confidence Level: SCL):

1. **หลีกเลี่ยงคำ Urgency / Alarmist Triggers:**
   - ห้ามใช้คำที่สร้างความตื่นตระหนก เช่น *"เตือนภัย:"*, *"ด่วนที่สุด"*, *"ถูกปฏิเสธทันที"*
   - ใช้ภาษาทางการที่เป็นมาตรฐานธุรกิจ (เช่น *"แจ้งเตือนรายการพัสดุถึงจุดสั่งซื้อ (Reorder Point Alert)"*, *"คำขอเบิก {{request_no}} ไม่ได้รับการอนุมัติ"*)
2. **เลี่ยงรูปแบบ Visual Phishing Lure:**
   - การใช้กล่องแจ้งเตือนสีแดงเข้มจัด (`#b91c1c` บนพื้น `#fff1f2`) คู่กับข้อความปฏิเสธและปุ่มกดลิงก์ภายนอก จะถูกระบบ AI ของ Defender ตีความเป็นอีเมลหลอกลวงระงับบัญชี (Account Suspension Phishing)
   - ให้ปรับใช้โทนสี Amber/ส้มสุภาพ (`#9a3412` บนพื้น `#fff7ed` ขอบ `#fed7aa`)
3. **ความสมบูรณ์ของ Preheader Text:**
   - ข้อความ Hidden Preheader (`display:none; max-height:0px; overflow:hidden`) ต้องประมวลผลตัวแปรครบถ้วน ปราศจากช่องว่างเว้นวรรคผิดปกติที่คล้ายเทคนิค Zero-Font Code Injection ของสแปมเมอร์
4. **Header Hygiene & Sender Alignment:**
   - จัดวาง Envelope Sender (`Return-Path`) ให้ตรงกับ Identity ที่ใช้ Authenticate กับ Gmail SMTP
   - ส่ง Header มาตรฐาน: `Auto-Submitted: auto-generated`, `X-Priority: 3` (Normal), `Content-Language: th`, `Reply-To`
   - ตัด Header ที่ไม่จำเป็นและเสี่ยงต่อการถูกลดคะแนนความน่าเชื่อถือ: `X-Mailer`, `X-Entity-Ref-ID`, `Precedence: bulk`, `X-Priority: 1`

---

## สถาปัตยกรรม Unified Rendering และ Database State Auto-Upgrade

- **Shared Responsive Master Layout:**
  - สร้างอีเมลทุกประเภท (6 เหตุการณ์แจ้งเตือน, อีเมลทดสอบระบบ และอีเมลเทียบเชิญ) ด้วย Renderer ตัวเดียวกัน (`emailRenderer.js`)
  - โครงสร้าง HTML ใช้ Table Layout (`width="100%"`, max-width `600–620px`), Inline CSS, สีที่มี Contrast ชัดเจน, Outlook VML Table Fallback, และแสดง Fallback URL ใต้ปุ่ม CTA เสมอ
  - ปรับหัวตารางพัสดุให้ตรงตามบริบท (เบิกพัสดุ, รับเข้าคลัง, หรือวัสดุที่ต้องสั่งซื้อเพิ่ม)
- **Database Template Auto-Upgrade & UI Reset:**
  - กรณีบันทึกแม่แบบอีเมลในฐานข้อมูล (เช่น Supabase) ค่า JSON เดิมอาจเข้าเขียนทับโค้ดมาตรฐานใหม่
  - ให้ติดตั้งฟังก์ชัน `mergeEventsWithDefaults` เพื่อตรวจจับและอัปเกรด (Auto-Upgrade) ข้อความเก่าให้เป็นมาตรฐานใหม่ทันทีที่โหลดหน้าจอ
  - เพิ่มปุ่ม **"คืนค่าเริ่มต้น" (Reset to Default)** และ **"รีเซ็ตทั้งหมด"** บนหน้าเว็บ UI เพื่อให้ผู้ดูแลระบบสามารถ Sync ค่ากลับสู่เวอร์ชันมาตรฐานได้อย่างรวดเร็ว

---

## นโยบาย Zero-Credential Exposure

- **ห้ามส่งรหัสผ่านในอีเมล:**
  - ห้ามระบุรหัสผ่าน, Temporary Password, App Password, API Key หรือ Reset Token แบบใช้ซ้ำได้ลงในเนื้อหาอีเมล, URL, Log หรือ Ticket เด็ดขาด
  - อีเมลภายนอกที่มีรหัสผ่านประกบกับลิงก์ล็อกอินจะถูกจัดเป็น **High-Confidence Phishing (SCL 9)** ทันที และจะถูกกักกันโดยไม่แสดงในโฟลเดอร์ Junk
- **กระบวนการเทียบเชิญ (Invitation Workflow):**
  - อีเมลเทียบเชิญควรมีเพียงข้อมูล Identity/Role และลิงก์เข้าสู่ระบบของแอปพลิเคชันทางการ
  - การกำหนดรหัสผ่านต้องผ่านช่องทาง Identity Provider, ระบบตั้งรหัสผ่านใหม่ หรือ Magic Link ที่มีอายุสั้น ใช้ได้ครั้งเดียว และมี Audit Log กำกับ

---

## Interactive Toolkit & ReactBits UI

โปรเจกต์นี้มาพร้อม Interactive Web Toolkit ภายใต้โฟลเดอร์ [`landing-page/`](./landing-page/) เพื่อใช้วินิจฉัยและจำลองการส่งอีเมลแบบ Zero-Build:

- **ReactBits WebGL Atmosphere:**
  - ขับเคลื่อนพื้นหลังแอนิเมชันเชิงลึกด้วย ReactBits WebGL Shader Components ได้แก่ [`AcidSquares`](./landing-page/components/AcidSquares/AcidSquares.jsx) และ [`Strands`](./landing-page/components/Strands/Strands.jsx)
- **ReactBits SVG Icon System:**
  - ใช้ไอคอน Scalable Inline SVG 100% ที่ได้มาตรฐานสัดส่วน (Consistent 24x24 / 22x22 / 18x18 ViewBox & Stroke) ปราศจากการใช้ Unicode Emoji เป็นไอคอน UI
- **เครื่องมือภายในชุด Toolkit:**
  1. **RFC 2047 Thai Header Encoder:** แปลงหัวข้อภาษาไทยและชื่อผู้ส่งเป็นมาตรฐาน MIME Encoding (`=?UTF-8?B?...?=`)
  2. **SMTP & Deliverability Checklist:** ตรวจเช็กความพร้อมของพอร์ต, TLS, SPF/DKIM/DMARC และ Sender Alignment
  3. **Zero-Credential Template Preview:** จำลองและแสดงตัวอย่างอีเมลแจ้งเตือนทั้งแบบ Desktop (620px) และ Mobile (375px)
  4. **Anti-Spam SCL Calculator:** เครื่องมือประเมินคะแนนความเสี่ยงสแปมเบื้องต้น
  5. **M365 PowerShell Generator:** สร้างคำสั่ง PowerShell สำหรับผู้ดูแลระบบ Exchange ในการตรวจสอบ Mailbox และ Group Delivery

เปิดใช้งานได้ทันทีที่ไฟล์ [`landing-page/index.html`](./landing-page/index.html) หรือเปิดผ่าน Root Forwarder [`index.html`](./index.html)

---

## เช็กลิสต์การทดสอบอัตโนมัติ (Automated Verification)

ก่อนการส่งมอบหรือ Release โค้ดที่เกี่ยวข้องกับระบบอีเมล ให้ปฏิบัติตามเช็กลิสต์:

1. **Automated Unit Tests:**
   - รันคำสั่งทดสอบแม่แบบอีเมล (เช่น `npm run test:email`) เพื่อยืนยันว่า:
     - ทุก Event Type ถูกประมวลผลผ่าน Shared Email Layout 100%
     - ตัวแปร Template Variables ทุกตัวถูกแทนที่สมบูรณ์ ปราศจาก `{{variable}}` ตกหล่น
     - ข้อมูลที่ป้อนเข้ามาได้รับการ Sanitization / Escape ป้องกัน XSS
     - สร้าง Plain-Text Fallback (`text/plain`) ควบคู่กับ HTML เสมอ
     - ปราศจากรหัสผ่านหรือ Secret ใดๆ ในเนื้อหา
2. **Production Bundle Build:**
   - คอมไพล์โปรเจกต์ผ่าน (`npx vite build` หรือเครื่องมือ Build ประจำระบบ)
3. **Controlled Live Delivery Test:**
   - ทดสอบส่งอีเมลไปยังผู้รับปลายทางจริง 1 ฉบับ พร้อมบันทึก `Message-ID` และยืนยันการจัดส่งเข้า **Focused Inbox** สำเร็จ

---

## เอกสารอ้างอิงและโครงสร้างโปรเจกต์

### เอกสารสำคัญ
- [`SKILL.md`](./SKILL.md) — รันบุ๊กหลักสำหรับ AI Agent และนักพัฒนาในการวินิจฉัยและป้องกันปัญหา Email Delivery
- [`EMAIL_DELIVERY_COMPREHENSIVE_INCIDENT_REPORT.md`](./EMAIL_DELIVERY_COMPREHENSIVE_INCIDENT_REPORT.md) — รายงานการสืบสวนและแก้ไขปัญหาเชิงลึกฉบับสมบูรณ์ (StockFlow Incident Case Study)
- [`examples/smtp-send-example.js`](./examples/smtp-send-example.js) — สคริปต์ตัวอย่างการเชื่อมต่อ Native TLS SMTP
- [`references/gmail-smtp-config.md`](./references/gmail-smtp-config.md) — รายละเอียดพอร์ต, โควตา และรหัสตอบกลับของ Gmail SMTP
- [`references/m365-group-delivery.md`](./references/m365-group-delivery.md) — คู่มือ Exchange Online Protection และ M365 Group Delivery
- [`references/anti-spam-deliverability.md`](./references/anti-spam-deliverability.md) — คู่มือการตั้งค่า SPF/DKIM/DMARC และ Header Hygiene

### โครงสร้างโปรเจกต์
```text
SKILL-gmail-smtp/
├── SKILL.md                                        # reusable troubleshooting runbook
├── README.md                                       # project guide & documentation
├── CHANGELOG.md                                    # release & change history
├── EMAIL_DELIVERY_COMPREHENSIVE_INCIDENT_REPORT.md # comprehensive case study & RCA
├── index.html                                      # root entry (forwards to landing-page/)
├── landing-page/                                   # interactive web toolkit
│   ├── index.html                                  # toolkit UI with ReactBits shaders & SVGs
│   ├── app.js                                      # client logic, encoders & calculators
│   ├── styles.css                                  # responsive CSS design system
│   ├── components/                                 # ReactBits WebGL components (AcidSquares, Strands)
│   └── assets/                                     # static assets & icons
├── examples/                                       # reference sender scripts
└── references/                                     # protocol & vendor reference guides
```

---

## License

MIT © 2026 Internal Skill Configuration & Runbook


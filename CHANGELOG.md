# Changelog

## [2026-09-01 01:05]
- **Files Modified:** `README.md`, `landing-page/index.html`, `CHANGELOG.md`
- **Changes:** เพิ่มคู่มือและคำสั่งติดตั้งผ่าน `npx` (`npx -y degit EEMEEMMEEx/SKILL-gmail-smtp ...`) ใน `README.md` อย่างละเอียด ทั้งระดับ Workspace และ Global (Windows/macOS/Linux) พร้อมอัปเดตลิงก์ Repository บน GitHub ทั้งหมดให้ถูกต้องตรงกัน
- **Reason:** เพิ่มความสะดวกให้นักพัฒนาและ AI Agent สามารถติดตั้งและนำ Skill ไปใช้งานได้ทันทีด้วยคำสั่งบรรทัดเดียว

## [2026-09-01 01:01]
- **Files Modified:** `landing-page/index.html`, `landing-page/app.js`, `README.md`, `CHANGELOG.md`
- **Changes:** ลบและเปลี่ยนค่าอีเมล/ชื่อผู้รับส่วนบุคคลทั้งหมดในหน้า Landing Page และ README.md ให้เป็นค่าตัวอย่างมาตรฐานสากล (`recipient@yourcompany.com`, `somchai@yourcompany.com`, `สมชาย ใจดี`, `https://app.yourdomain.com`)
- **Reason:** รักษาความเป็นส่วนตัวและความปลอดภัยของข้อมูลตัวอย่าง (Data Privacy & Anonymization)

## [2026-09-01 00:50]
- **Files Modified:** `landing-page/index.html`, `landing-page/styles.css`, `landing-page/app.js`, `CHANGELOG.md`
- **Changes:** ปรับปรุง UX/UI ของ Landing Page Toolkit ขนานใหญ่:
  1. **Hero Typography & Layout:** แก้ไขปัญหาการ Render กล่องสีฟ้าทับซ้อนของหัวข้อ Hero Title, ปรับปรุง Gradient ข้อความให้คมชัดสวยงาม และเพิ่ม Stats Cards แบบ Glassmorphism ที่มี Hover Physics
  2. **Interactive Delivery Pipeline:** เพิ่มระบบจำลองผังการไหลของข้อมูล 7 ขั้นตอน (Interactive Flow Cards) พร้อมกล่อง Pipeline Inspector ตรวจสอบรายละเอียดทางเทคนิคแต่ละ Stage
  3. **Preset Chips & Quick Actions:** เพิ่มปุ่มเลือกแม่แบบตัวอย่าง (Preset Chips) ในเครื่องมือ RFC 2047 Live Encoder และ M365 DBEB Simulator
  4. **Template Sandbox & Responsive View:** เพิ่มปุ่มสลับมุมมอง Desktop (620px) และ Mobile (375px) พร้อมแม่แบบจำลอง 7 เหตุการณ์แจ้งเตือน (รวม Stock In, Reorder Alert, Withdrawal Rejected แบบ Amber Notice)
  5. **Deliverability Score Gauge:** อัปเกรด SVG Radial Gauge แสดงผลคะแนนความพร้อม พร้อมคำแนะนำการปรับปรุงแบบ Real-time
  6. **Troubleshooting Filter & 5-Language Code Gen:** เพิ่ม Filter Tabs แยกตามหมวดหมู่ปัญหา และเพิ่มตัวสร้างโค้ดสำหรับ Go (net/smtp) เพิ่มเติมจาก Node.js, Python และ Serverless
  7. **Design System & Icon Policy:** ปรับใช้โทนสี Dark Slate Tech ที่มี Contrast สูง และใช้ไอคอน Scalable Inline SVG (ReactBits Standard) 100% ปราศจาก Unicode Emoji
- **Reason:** ยกระดับประสบการณ์ใช้งาน (UX/UI) ให้สวยงาม พรีเมียม ตอบสนองรวดเร็ว และใช้งานได้จริงในการแก้ปัญหาการจัดส่งอีเมล

## [2026-09-01 00:48]
- **Files Modified:** `README.md`, `CHANGELOG.md`
- **Changes:** เพิ่มหมวด **"การติดตั้งและการนำไปใช้งาน (Installation & Setup)"** ใน `README.md` ครอบคลุม 3 รูปแบบหลัก: (1) การติดตั้งเป็น AI Agent Skill (Workspace / Global Customization), (2) การติดตั้ง Dependencies (`nodemailer`, `dotenv`) พร้อมการตั้งค่า `.env` และ Vite Dev Proxy Middleware สำหรับ Web App/Backend, และ (3) การ Clone และเปิดใช้งาน Interactive Toolkit แบบ Zero-Build
- **Reason:** จัดทำคู่มือแนะนำขั้นตอนการติดตั้งและนำ Skill ไปใช้งานอย่างเป็นระบบ รองรับทั้ง AI Agents และนักพัฒนาเว็บแอปพลิเคชัน

## [2026-09-01 00:47]
- **Files Modified:** `README.md`, `CHANGELOG.md`
- **Changes:** อัปเดต `README.md` ให้เป็น Toolkit Guide ฉบับสมบูรณ์ ประกอบด้วย สถาปัตยกรรม Pipeline ระบบ, Troubleshooting Matrix, Anti-Spam NLP & Phishing Lure Heuristics, Shared Email Rendering Architecture & DB Auto-Upgrade, Zero-Credential Policy, Automated Verification Checklist, และรายละเอียด Interactive Toolkit ที่ขับเคลื่อนด้วย **ReactBits** (WebGL Shaders `AcidSquares`/`Strands` และ ReactBits Scalable SVG Icon System ปราศจาก Unicode Emoji)
- **Reason:** ปรับปรุงเอกสารคู่มือโปรเจกต์ให้สอดคล้องกับ Incident Report และมาตรฐาน UI/Design System ล่าสุด

## [2026-09-01 00:45]
- **Files Modified:** `SKILL.md`, `CHANGELOG.md`
- **Changes:** อัปเดต `SKILL.md` ให้ครอบคลุมข้อค้นพบเชิงลึกจาก `EMAIL_DELIVERY_COMPREHENSIVE_INCIDENT_REPORT.md` ได้แก่ การแยกระดับความล้มเหลวตาม Pipeline (Dev Proxy Middleware / Event Wiring / Role-based Recipient Resolution / Deduplication), กฎการป้องกัน Anti-Spam NLP & Heuristics (Alarmist Urgency Words / Phishing Lure Pattern / Preheader Spacing / RFC Header Alignment), สถาปัตยกรรม Shared Rendering & Database Template Auto-Upgrade/Reset, และขั้นตอน Automated Verification Checklist (Unit tests, Build, Focused Inbox verification)
- **Reason:** นำ Best Practices, Root Causes และแนวทางปฏิบัติจาก Incident Report ฉบับสมบูรณ์มาใช้เป็น Runbook มาตรฐานสำหรับสืบสวนและแก้ปัญหาการส่งอีเมลในอนาคต

## [2026-08-31 23:00]
- **Files Modified:** `SKILL.md`, `CHANGELOG.md`
- **Changes:** Added explicit SMTP probe guidance, `550 5.7.x` policy handling, DBEB/header examples (`X-Priority`, `X-Entity-Ref-ID`, DSN), and corrected the email-client layout width guidance.
- **Reason:** Tighten reusable prevention steps from both email-delivery incident reports.

## [2026-08-31]
- **Files Modified:** `SKILL.md`, `CHANGELOG.md`
- **Changes:** ปรับปรุง `SKILL.md` ให้เป็น runbook กระชับสำหรับแยกปัญหา routing, SMTP, recipient, rendering และ Inbox placement พร้อมเพิ่มแนวทาง header hygiene, domain authentication, zero-credential exposure, template consistency และ operational closure
- **Reason:** นำผล RCA จาก `EMAIL_DELIVERY_INCIDENT_REPORT.md` มาป้องกันปัญหา 404 route, template mismatch, Outlook Junk placement และการสรุปสาเหตุเกินหลักฐานในอนาคต

## [2026-08-31 22:40]
- **Files Modified:** landing-page/, index.html, README.md, CHANGELOG.md
- **Changes:**
  - ย้าย Landing Page ทั้งชุด (index.html, app.js, styles.css, components/, assets/) ไปไว้ในโฟลเดอร์ landing-page/
  - เพิ่ม root entry แบบ forwarding เพื่อให้ URL เดิมยังเปิด Landing Page ได้
  - ปรับ UX/UI ให้ responsive ขึ้น เพิ่ม keyboard focus, skip link, reduced-motion support และข้อความที่ไม่รับรอง Inbox placement เกินจริง
  - ปรับ M365 policy generator ให้สร้างคำสั่งแบบ disabled สำหรับ admin review ก่อนใช้งาน
- **Reason:** แยกขอบเขต Landing Page ให้ดูแลได้ง่ายขึ้น พร้อมยกระดับความปลอดภัยและความใช้งานได้โดยไม่กระทบเครื่องมือเดิม

## [2026-08-31 22:18]
- **Files Modified:** `README.md`, `CHANGELOG.md`
- **Changes:**
  - `README.md`: จัดโครงสร้างใหม่เป็น Quick Start, architecture, SMTP triage, deliverability checklist, Zero-Credential Exposure, M365 guidance และรายการเอกสารอ้างอิง
  - `README.md`: นำคำสั่ง bypass/filter ที่เสี่ยงออก และระบุชัดว่าการเปลี่ยน Microsoft 365 policy ต้องได้รับอนุมัติจาก Exchange Administrator
- **Reason:** ให้ README สอดคล้องกับ RCA และ `SKILL.md` ฉบับปรับปรุง พร้อมใช้งานเป็นคู่มือเริ่มต้นที่ปลอดภัยและค้นหาง่าย

## [2026-08-31 22:15]
- **Files Modified:** `SKILL.md`, `CHANGELOG.md`
- **Changes:**
  - `SKILL.md`: ปรับเป็น runbook แบบกระชับสำหรับวินิจฉัย Gmail SMTP และ Microsoft 365 โดยเพิ่ม RCA ของ `550 5.4.1`/DBEB, การแยก SMTP acceptance ออกจากการส่งถึง Inbox, Header Hygiene, Zero-Credential Exposure, การจัดการ SMTP error, และแนวทางปฏิบัติด้านความปลอดภัย/ปฏิบัติการ
  - `CHANGELOG.md`: สร้างบันทึกการเปลี่ยนแปลงของโปรเจ็กต์
- **Reason:** นำข้อค้นพบจากรายงานวิเคราะห์เหตุขัดข้องการส่งอีเมลมาใช้เป็นแนวทางแก้ปัญหาที่นำกลับมาใช้ซ้ำได้

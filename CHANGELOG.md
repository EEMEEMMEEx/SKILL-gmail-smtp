# Changelog

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
